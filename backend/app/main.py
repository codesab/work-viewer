
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from jira import JIRA
from .config import settings
from typing import Dict

app = FastAPI(title="JIRA Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://0.0.0.0:3000"],
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
                "name": user.displayName,
                "email": user.emailAddress
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
