from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from jira import JIRA
from .config import settings
from typing import Dict, Optional
import datetime

app = FastAPI(title="JIRA Dashboard API")
visibility_custom_id = "cf[11357]"  # Replace with the actual ID

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://internal.showroom.indopus.in",
        "https://internal.bizongo.com",
        "http://localhost:3000",
        "http://localhost:7002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_jira_client() -> JIRA:
    try:
        jira = JIRA(server=settings.JIRA_SERVER,
                    basic_auth=(settings.JIRA_EMAIL, settings.JIRA_API_TOKEN))
        # Test authentication by making a simple API call
        jira.myself()
        return jira
    except Exception as e:
        raise HTTPException(status_code=401,
                            detail=f"JIRA authentication failed: {str(e)}")


@app.get("/")
async def root():
    return {"status": "healthy", "message": "JIRA Dashboard API is running"}


@app.get("/api/validate-auth")
async def validate_auth() -> Dict:
    try:
        jira = get_jira_client()
        user = jira.myself()
        return {
            "authenticated": True,
            "user": {
                "name": user.get('displayName', 'Unknown'),
                "email": user.get('emailAddress', 'Unknown')
            }
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error during authentication: {str(e)}")


@app.get("/api/validate-project/{project_key}")
async def validate_project(project_key: str):
    jira = get_jira_client()  # This will handle authentication first

    try:
        project = jira.project(project_key)
        return {
            "exists":
            True,
            "id":
            project.id,
            "name":
            project.name,
            "projectCategory":
            getattr(project, 'projectCategory', {}).get('name', None)
        }
    except Exception as e:
        raise HTTPException(
            status_code=404 if "Project not found" in str(e) else 500,
            detail=str(e))


@app.get("/api/issues/{project_key}")
async def get_issues(project_key: str,
                     # issue_type: str = "Story",
                     page: int = 1,
                     size: int = 10,
                     sort_by: str = "key",
                     sort_order: str = "asc",
                     month: Optional[str] = None):
    jira = get_jira_client()
    try:
        start_at = (page - 1) * size
        jql_parts = [
            f'project = {project_key}', f'issuetype in ("Story","Task","Bug")',
            f'{visibility_custom_id} = "Organisation"'
        ]
        if month:
            try:
                year, month_num = map(int, month.split('-'))
                first_day = datetime.datetime(year, month_num,
                                              1).strftime('%Y-%m-%d')
                next_month = datetime.datetime(year, month_num,
                                               1) + datetime.timedelta(days=32)
                last_day = next_month.replace(day=1) - datetime.timedelta(
                    days=1)
                last_day_str = last_day.strftime('%Y-%m-%d')
                jql_parts.append(
                    f'dueDate >= "{first_day}" AND dueDate <= "{last_day_str}"'
                )
            except ValueError:
                print(f"Invalid month format from client: {month}")
        # If no month is provided, no dueDate filter is applied

        jql = ' AND '.join(jql_parts) + f' ORDER BY {sort_by} {sort_order}'
        issues = jira.search_issues(jql, startAt=start_at, maxResults=size)

        return {
            "items": [{
                "key":
                issue.key,
                "title":
                issue.fields.summary,
                "description":
                issue.fields.description,
                "assignee":
                issue.fields.assignee.displayName
                if issue.fields.assignee else None,
                "reporter":
                issue.fields.reporter.displayName,
                "issue_type":
                issue.fields.issuetype.name,
                "status":
                issue.fields.status.name,
                "start_date":
                issue.fields.customfield_10015 if hasattr(
                    issue.fields, 'customfield_10015') else None,
                "due_date":
                str(issue.fields.duedate) if issue.fields.duedate else None
            } for issue in issues],
            "total":
            issues.total,
            "page":
            page,
            "size":
            size
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/statuses/{project_key}")
async def get_statuses(project_key: str):
    jira = get_jira_client()
    try:
        jql = f'project = {project_key}'
        issues = jira.search_issues(jql, maxResults=1000)
        statuses = sorted(
            list(set(issue.fields.status.name for issue in issues)))
        return {"statuses": statuses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/issue/{issue_key}")
async def get_issue_details(issue_key: str):
    jira = get_jira_client()
    try:
        # Get the main issue with expanded fields
        issue = jira.issue(issue_key, expand='subtasks,assignee,reporter')

        # Get subtasks details
        subtasks = []
        subtask_total = 0
        subtask_completed = 0
        subtask_in_progress = 0
        subtask_todo = 0

        if hasattr(issue.fields, 'subtasks') and issue.fields.subtasks:
            for subtask in issue.fields.subtasks:
                subtask_detail = jira.issue(subtask.key)
                status_name = subtask_detail.fields.status.name.lower()

                subtasks.append({
                    "key": subtask_detail.key,
                    "summary": subtask_detail.fields.summary,
                    "status": subtask_detail.fields.status.name,
                    "assignee": subtask_detail.fields.assignee.displayName if subtask_detail.fields.assignee else None,
                    "created": str(subtask_detail.fields.created),
                    "updated": str(subtask_detail.fields.updated),
                    "resolution_date": str(subtask_detail.fields.resolutiondate) if subtask_detail.fields.resolutiondate else None
                })

                subtask_total += 1

                # Categorize subtask status
                if status_name in ['done', 'closed', 'resolved', 'completed']:
                    subtask_completed += 1
                elif status_name in ['in progress', 'in review', 'testing', 'in development']:
                    subtask_in_progress += 1
                else:
                    subtask_todo += 1

        # Calculate percentages
        if subtask_total > 0:
            completed_percentage = round((subtask_completed / subtask_total) * 100, 2)
            in_progress_percentage = round((subtask_in_progress / subtask_total) * 100, 2)
            todo_percentage = round((subtask_todo / subtask_total) * 100, 2)
        else:
            completed_percentage = in_progress_percentage = todo_percentage = 0.0

        # Get all assignees (main issue + subtasks)
        assignees = set()
        if issue.fields.assignee:
            assignees.add(issue.fields.assignee.displayName)

        for subtask in subtasks:
            if subtask["assignee"]:
                assignees.add(subtask["assignee"])

        return {
            "issue": {
                "key": issue.key,
                "summary": issue.fields.summary,
                "description": issue.fields.description,
                "status": issue.fields.status.name,
                "issue_type": issue.fields.issuetype.name,
                "priority": issue.fields.priority.name if issue.fields.priority else None,
                "assignee": issue.fields.assignee.displayName if issue.fields.assignee else None,
                "reporter": issue.fields.reporter.displayName if issue.fields.reporter else None,
                "created": str(issue.fields.created),
                "updated": str(issue.fields.updated),
                "due_date": str(issue.fields.duedate) if issue.fields.duedate else None,
                "resolution_date": str(issue.fields.resolutiondate) if issue.fields.resolutiondate else None,
                "start_date": issue.fields.customfield_10015 if hasattr(issue.fields, 'customfield_10015') else None
            },
            "subtasks": subtasks,
            "assignees": list(assignees),
            "progress": {
                "total_subtasks": subtask_total,
                "completed": subtask_completed,
                "in_progress": subtask_in_progress,
                "todo": subtask_todo,
                "completed_percentage": completed_percentage,
                "in_progress_percentage": in_progress_percentage,
                "todo_percentage": todo_percentage
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching issue details: {str(e)}")


@app.post("/api/create-ticket/{project_key}")
async def create_ticket(project_key: str, request: dict):
    jira = get_jira_client()

    # Default reporter email - you can change this constant
    DEFAULT_REPORTER_EMAIL = "jira-dashboard@example.com"

    try:
        # Get current user to set as first backer
        current_user = jira.myself()
        first_backer = current_user.get('displayName', current_user.get('emailAddress'))

        # Determine issue type (default to Bug if not specified)
        issue_type = request.get('issue_type', 'Bug')
        if issue_type.lower() == 'feature':
            issue_type = 'Story'

        issue_dict = {
            'project': {'key': project_key},
            'summary': request.get('summary'),
            'description': request.get('description', ''),
            'issuetype': {'name': issue_type},
            'priority': {'name': request.get('priority', 'Medium')},
            'reporter': {'name': DEFAULT_REPORTER_EMAIL},
            visibility_custom_id: "Organisation",  # Visibility custom field
            'customfield_11421': [first_backer]  # Backers field with creator as first backer
        }

        # Add assignee if provided
        if request.get('assignee'):
            issue_dict['assignee'] = {'name': request.get('assignee')}

        # Add due date if provided
        if request.get('due_date'):
            issue_dict['duedate'] = request.get('due_date')

        # Add story points if provided (usually for Stories)
        if request.get('story_points'):
            issue_dict['customfield_10004'] = request.get('story_points')

        # Add epic link if provided (usually for Stories)
        if request.get('epic_link'):
            issue_dict['customfield_10008'] = request.get('epic_link')

        # Add components if provided
        if request.get('components'):
            issue_dict['components'] = [{'name': comp} for comp in request.get('components')]

        # Add labels if provided
        if request.get('labels'):
            issue_dict['labels'] = request.get('labels')

        new_issue = jira.create_issue(fields=issue_dict)

        return {
            "success": True,
            "issue_key": new_issue.key,
            "message": f"{issue_type} {new_issue.key} created successfully",
            "issue_url": f"{settings.JIRA_SERVER}/browse/{new_issue.key}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating ticket: {str(e)}")


@app.post("/api/issue/{issue_key}/add-backers")
async def add_backers(issue_key: str, request: dict):
    jira = get_jira_client()
    
    try:
        # Get current issue to retrieve existing backers
        issue = jira.issue(issue_key)
        
        # Get new backers from request (comma-separated string or list)
        new_backers = request.get('backers', '')
        if isinstance(new_backers, str):
            new_backers_list = [email.strip() for email in new_backers.split(',') if email.strip()]
        else:
            new_backers_list = new_backers
        
        # Get existing backers
        existing_backers = []
        if hasattr(issue.fields, 'customfield_11421') and issue.fields.customfield_11421:
            existing_backers = issue.fields.customfield_11421
        
        # Combine existing and new backers, removing duplicates
        all_backers = list(set(existing_backers + new_backers_list))
        
        # Update the issue with new backers list
        issue.update(fields={'customfield_11421': all_backers})
        
        return {
            "success": True,
            "message": f"Backers added to {issue_key}",
            "issue_key": issue_key,
            "total_backers": len(all_backers),
            "new_backers_added": len(new_backers_list),
            "all_backers": all_backers
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding backers to issue: {str(e)}")