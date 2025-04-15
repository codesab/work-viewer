
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import requests
from .config import settings

app = FastAPI(title="JIRA Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://0.0.0.0:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_jira_auth():
    return (settings.JIRA_EMAIL, settings.JIRA_API_TOKEN)

@app.get("/")
async def root():
    return {"message": "JIRA Dashboard API"}

@app.get("/api/validate-project/{project_key}")
async def validate_project(project_key: str):
    from jira import JIRA
    
    try:
        jira = JIRA(
            server=settings.JIRA_SERVER,
            basic_auth=(settings.JIRA_EMAIL, settings.JIRA_API_TOKEN)
        )
        
        # Get project to validate it exists
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
