
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
async def validate_project(project_key: str, auth: tuple = Depends(get_jira_auth)):
    url = f"{settings.JIRA_SERVER}/rest/api/2/projectvalidate/key"
    
    try:
        response = requests.get(
            url,
            params={"key": project_key},
            auth=auth,
            headers={"Accept": "application/json"}
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=response.status_code if hasattr(response, 'status_code') else 500,
            detail=str(e)
        )
