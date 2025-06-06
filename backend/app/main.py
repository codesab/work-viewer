from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from jira import JIRA
from .config import settings
from typing import Dict, Optional
import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
async def get_issues(
        project_key: str,
        # issue_type: str = "Story",
        page: int = 1,
        size: int = 10,
        sort_by: str = "key",
        sort_order: str = "asc",
        month: Optional[str] = None,
        search: Optional[str] = None):
    jira = get_jira_client()
    try:
        start_at = (page - 1) * size
        jql_parts = [
            f'project = {project_key}', 'issuetype in ("Story","Task","Bug")',
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

        if search:
            # Escape quotes in search term to prevent JQL injection
            escaped_search = search.replace('"', '\\"')
            jql_parts.append(f'summary ~ "{escaped_search}"')

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
                    "key":
                    subtask_detail.key,
                    "summary":
                    subtask_detail.fields.summary,
                    "status":
                    subtask_detail.fields.status.name,
                    "assignee":
                    subtask_detail.fields.assignee.displayName
                    if subtask_detail.fields.assignee else None,
                    "created":
                    str(subtask_detail.fields.created),
                    "updated":
                    str(subtask_detail.fields.updated),
                    "resolution_date":
                    str(subtask_detail.fields.resolutiondate)
                    if subtask_detail.fields.resolutiondate else None
                })

                subtask_total += 1

                # Categorize subtask status
                if status_name in ['done', 'closed', 'resolved', 'completed']:
                    subtask_completed += 1
                elif status_name in [
                        'in progress', 'in review', 'testing', 'in development'
                ]:
                    subtask_in_progress += 1
                else:
                    subtask_todo += 1

        # Calculate percentages
        if subtask_total > 0:
            completed_percentage = round(
                (subtask_completed / subtask_total) * 100, 2)
            in_progress_percentage = round(
                (subtask_in_progress / subtask_total) * 100, 2)
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

        # Get backers from custom field
        backers = []
        if hasattr(issue.fields,
                   'customfield_11421') and issue.fields.customfield_11421:
            backers = issue.fields.customfield_11421.split('\n')

        return {
            "issue": {
                "key":
                issue.key,
                "summary":
                issue.fields.summary,
                "description":
                issue.fields.description,
                "status":
                issue.fields.status.name,
                "issue_type":
                issue.fields.issuetype.name,
                "priority":
                issue.fields.priority.name if issue.fields.priority else None,
                "assignee":
                issue.fields.assignee.displayName
                if issue.fields.assignee else None,
                "reporter":
                issue.fields.reporter.displayName
                if issue.fields.reporter else None,
                "created":
                str(issue.fields.created),
                "updated":
                str(issue.fields.updated),
                "due_date":
                str(issue.fields.duedate) if issue.fields.duedate else None,
                "resolution_date":
                str(issue.fields.resolutiondate)
                if issue.fields.resolutiondate else None,
                "start_date":
                issue.fields.customfield_10015 if hasattr(
                    issue.fields, 'customfield_10015') else None,
                "backers":
                backers
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
        raise HTTPException(status_code=500,
                            detail=f"Error fetching issue details: {str(e)}")


@app.get("/api/project/{project_key}/issue-types")
async def get_project_issue_types(project_key: str):
    jira = get_jira_client()
    try:
        project = jira.project(project_key, expand="issueTypes")
        issue_types = [{
            "id": it.id,
            "name": it.name,
            "description": getattr(it, 'description', '')
        } for it in project.issueTypes]
        return {"issue_types": issue_types}
    except Exception as e:
        raise HTTPException(status_code=500,
                            detail=f"Error fetching issue types: {str(e)}")


@app.post("/api/create-ticket/{project_key}")
async def create_ticket(project_key: str, request: dict):
    jira = get_jira_client()

    # Default reporter email - you can change this constant
    DEFAULT_REPORTER_EMAIL = "jira.automation@bizongo.com"

    try:
        # Get current user to set as first backer
        first_backer = request.get('backer')

        # Validate that required fields are present
        if not request.get('summary'):
            raise HTTPException(status_code=400, detail="Summary is required")

        # Get issue type from request - can be either a string (legacy) or an object with id/name
        issue_type_input = request.get('issue_type')
        if not issue_type_input:
            raise HTTPException(status_code=400,
                                detail="Issue type is required")

        # Handle both string and object formats for issue type
        if isinstance(issue_type_input, dict):
            # Frontend sends issue type object with id and name
            if 'id' in issue_type_input:
                issue_type_dict = {'id': issue_type_input['id']}
            elif 'name' in issue_type_input:
                issue_type_dict = {'name': issue_type_input['name']}
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Issue type object must have either 'id' or 'name'")
        else:
            # Legacy string format - use as name
            issue_type_dict = {'name': str(issue_type_input)}

        # Get the first available value for customfield_11357 (Visibility field)
        visibility_value = None
        try:
            field_config = jira._get_json("field/customfield_11357/option")
            active_values = [
                v for v in field_config.get('values', [])
                if not v.get('disabled', False)
            ]
            if active_values:
                visibility_value = {'value': active_values[0]['value']}
                logger.info(
                    f"Using first available visibility value: {active_values[0]['value']}"
                )
            else:
                # Fallback to hardcoded value if no options found
                visibility_value = {'value': "Organisation"}
                logger.warning(
                    "No active visibility options found, using fallback 'Organisation'"
                )
        except Exception as visibility_error:
            logger.warning(
                f"Could not fetch visibility field options: {visibility_error}"
            )
            # Fallback to hardcoded value
            visibility_value = {'value': "Organisation"}

        issue_dict = {
            'project': {
                'key': project_key
            },
            'summary': request.get('summary'),
            'description': request.get('description', ''),
            'issuetype': issue_type_dict,
            'priority': {
                'name': request.get('priority', 'Medium')
            },
            'reporter': {
                'name': DEFAULT_REPORTER_EMAIL
            },
            'customfield_11357':
            visibility_value,  # Visibility custom field with first available value
        }

        # Add assignee if provided
        # if request.get('assignee'):
        #     issue_dict['assignee'] = {'name': request.get('assignee')}

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
            issue_dict['components'] = [{
                'name': comp
            } for comp in request.get('components')]

        # Add labels if provided
        if request.get('labels'):
            issue_dict['labels'] = request.get('labels')

        # Log the issue creation request for debugging
        logger.info(f"Creating issue with payload: {issue_dict}")

        new_issue = jira.create_issue(fields=issue_dict)

        return {
            "success": True,
            "issue_key": new_issue.key,
            "message":
            f"{issue_type_dict.get('name', 'Issue')} {new_issue.key} created successfully",
            "issue_url": f"{settings.JIRA_SERVER}/browse/{new_issue.key}"
        }

    except Exception as e:
        logger.error(f"Error creating JIRA issue: {str(e)}")
        logger.error(f"Issue dict used: {issue_dict}")
        raise HTTPException(status_code=500,
                            detail=f"Error creating ticket: {str(e)}")


@app.get("/api/custom-field/{field_id}/values")
async def get_custom_field_values(field_id: str):
    jira = get_jira_client()

    try:
        # Get field information including possible values
        field_info = jira.fields()
        target_field = None

        # Find the specific field by ID
        for field in field_info:
            if field['id'] == field_id:
                target_field = field
                break

        if not target_field:
            raise HTTPException(status_code=404,
                                detail=f"Custom field {field_id} not found")

        # Get field configuration and possible values
        try:
            # For select/radio/checkbox fields, get the options
            field_config = jira._get_json(f"field/{field_id}/option")

            values = []
            for option in field_config.get('values', []):
                values.append({
                    "id": option.get('id'),
                    "value": option.get('value'),
                    "disabled": option.get('disabled', False)
                })

            # Filter out disabled options
            active_values = [v for v in values if not v['disabled']]

            return {
                "field_id": field_id,
                "field_name": target_field.get('name'),
                "field_type": target_field.get('schema', {}).get('type'),
                "values": active_values,
                "default_value": active_values[0] if active_values else None,
                "total_count": len(active_values)
            }

        except Exception as option_error:
            # If field doesn't have predefined options, return field info only
            logger.info(
                f"Field {field_id} doesn't have predefined options: {option_error}"
            )

            return {
                "field_id": field_id,
                "field_name": target_field.get('name'),
                "field_type": target_field.get('schema', {}).get('type'),
                "values": [],
                "default_value": None,
                "total_count": 0,
                "message": "This field doesn't have predefined options"
            }

    except Exception as e:
        logger.error(f"Error fetching custom field values: {str(e)}")
        raise HTTPException(status_code=500,
                            detail=f"Error fetching field values: {str(e)}")


@app.post("/api/issue/{issue_key}/add-backers")
async def add_backers(issue_key: str, request: dict):
    jira = get_jira_client()

    try:
        logger.info("=== ADD BACKERS REQUEST ===")
        logger.info(f"Issue Key: {issue_key}")
        logger.info(f"Request payload: {request}")

        # Get current issue to retrieve existing backers
        issue = jira.issue(issue_key)

        # Log current field value and type
        existing_backers_raw = getattr(issue.fields, 'customfield_11421', None)
        logger.info("Current backers field (customfield_11421):")
        logger.info(f"  Type: {type(existing_backers_raw)}")
        logger.info(f"  Value: {repr(existing_backers_raw)}")

        # Get new backers from request
        new_backers_input = request.get('backers', '')
        logger.info(
            f"New backers input: {repr(new_backers_input)} (type: {type(new_backers_input)})"
        )

        # Since it's a paragraph field, treat it as text
        if isinstance(new_backers_input, str):
            new_backers_text = new_backers_input.strip()
        elif isinstance(new_backers_input, list):
            # Join list items with newlines for paragraph field
            new_backers_text = '\n'.join([
                str(item).strip() for item in new_backers_input
                if str(item).strip()
            ])
        else:
            new_backers_text = str(new_backers_input).strip()

        logger.info(f"Processed new backers text: {repr(new_backers_text)}")

        # Get existing backers text
        existing_backers_text = ""
        if existing_backers_raw:
            if isinstance(existing_backers_raw, str):
                existing_backers_text = existing_backers_raw
            elif isinstance(existing_backers_raw, list):
                existing_backers_text = '\n'.join(
                    [str(item) for item in existing_backers_raw])
            else:
                existing_backers_text = str(existing_backers_raw)

        logger.info(f"Existing backers text: {repr(existing_backers_text)}")

        # Combine existing and new backers
        if existing_backers_text and new_backers_text:
            combined_backers_text = existing_backers_text + '\n' + new_backers_text
        elif new_backers_text:
            combined_backers_text = new_backers_text
        else:
            combined_backers_text = existing_backers_text

        logger.info(f"Combined backers text: {repr(combined_backers_text)}")

        # Update the issue with new backers text
        logger.info(
            f"Attempting to update issue {issue_key} with backers field...")

        try:
            # Try updating with the combined text
            update_payload = {'customfield_11421': combined_backers_text}
            logger.info(f"Update payload: {update_payload}")

            issue.update(fields=update_payload)
            logger.info("Update successful!")

        except Exception as update_error:
            logger.error(f"Update failed: {update_error}")
            logger.info("Trying alternative update methods...")

            # Try with different formats
            try:
                issue.update(update={
                    'customfield_11421': [{
                        'set': combined_backers_text
                    }]
                })
                logger.info("Alternative update method 1 successful!")
            except Exception as alt_error:
                logger.error(f"Alternative update method failed: {alt_error}")
                raise update_error

        # Refresh the issue to get the updated data
        logger.info("Refreshing issue to verify update...")
        updated_issue = jira.issue(issue_key)
        final_backers = getattr(updated_issue.fields, 'customfield_11421',
                                None)

        logger.info("Final backers field after update:")
        logger.info(f"  Type: {type(final_backers)}")
        logger.info(f"  Value: {repr(final_backers)}")

        return {
            "success": True,
            "message": f"Backers added to {issue_key}",
            "issue_key": issue_key,
            "new_backers_added": new_backers_text,
            "final_backers": final_backers,
            "debug": {
                "original_input": new_backers_input,
                "processed_text": new_backers_text,
                "existing_text": existing_backers_text,
                "combined_text": combined_backers_text,
                "field_type_before": str(type(existing_backers_raw)),
                "field_type_after": str(type(final_backers))
            }
        }

    except Exception as e:
        logger.error(f"Error in add_backers: {str(e)}")
        raise HTTPException(status_code=500,
                            detail=f"Error adding backers to issue: {str(e)}")
