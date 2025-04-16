
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from jira import JIRA
from .config import settings
from typing import Dict

app = FastAPI(title="JIRA Dashboard API")

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
        jira = JIRA(
            server=settings.JIRA_SERVER,
            basic_auth=(settings.JIRA_EMAIL, settings.JIRA_API_TOKEN)
        )
        # Test authentication by making a simple API call
        jira.myself()
        return jira
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"JIRA authentication failed: {str(e)}"
        )

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
            detail=f"Unexpected error during authentication: {str(e)}"
        )

@app.get("/api/validate-project/{project_key}")
async def validate_project(project_key: str):
    jira = get_jira_client()  # This will handle authentication first
    
    try:
        project = jira.project(project_key)
        return {
            "exists": True,
            "id": project.id,
            "name": project.name,
            "projectCategory": getattr(project, 'projectCategory', {}).get('name', None)
        }
    except Exception as e:
        raise HTTPException(
            status_code=404 if "Project not found" in str(e) else 500,
            detail=str(e)
        )

@app.get("/api/issues/{project_key}")
async def get_issues(
    project_key: str,
    issue_type: str = "Story",
    page: int = 1,
    size: int = 10,
    sort_by: str = "key",
    sort_order: str = "asc"
):
    jira = get_jira_client()
    try:
        start_at = (page - 1) * size
        jql = f'project = {project_key} AND issuetype = "{issue_type}" ORDER BY {sort_by} {sort_order}'
        issues = jira.search_issues(jql, startAt=start_at, maxResults=size)
        
        return {
            "items": [
                {
                    "key": issue.key,
                    "title": issue.fields.summary,
                    "assignee": issue.fields.assignee.displayName if issue.fields.assignee else None,
                    "reporter": issue.fields.reporter.displayName,
                    "issue_type": issue.fields.issuetype.name,
                    "status": issue.fields.status.name,
                    "start_date": issue.fields.customfield_10015 if hasattr(issue.fields, 'customfield_10015') else None,
                    "due_date": str(issue.fields.duedate) if issue.fields.duedate else None
                }
                for issue in issues
            ],
            "total": issues.total,
            "page": page,
            "size": size
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
