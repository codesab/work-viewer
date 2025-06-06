from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from jira import JIRA
from .config import settings
from typing import Dict, Optional
import datetime
from mangum import Mangum

app = FastAPI(title="JIRA Dashboard API")
visibility_custom_id = "cf[11357]"  # Replace with the actual ID

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://0.0.0.0:3000",
        "https://416cf27b-b0f0-4827-ba72-6c4f26038c96-00-2z1igbk4vduc7.pike.replit.dev",
        "https://416cf27b-b0f0-4827-ba72-6c4f26038c96-00-2z1igbk4vduc7.pike.replit.dev:3000"
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
    return {"message": "JIRA Dashboard API"}


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
                     issue_type: str = "Story",
                     page: int = 1,
                     size: int = 10,
                     sort_by: str = "key",
                     sort_order: str = "asc",
                     month: Optional[str] = None):
    jira = get_jira_client()
    try:
        start_at = (page - 1) * size
        jql_parts = [
            f'project = {project_key}', f'issuetype = "{issue_type}"',
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

handler = Mangum(app)