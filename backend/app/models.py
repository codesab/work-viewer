from pydantic import BaseModel
from typing import Optional, List, Union

class TicketBase(BaseModel):
    key: str
    summary: str
    status: str
    priority: str
    assignee: Optional[str] = None

class EngineerTickets(BaseModel):
    engineer: str
    tickets: List[TicketBase]

class User(BaseModel):
    username: str
    email: str
class JiraIssue(BaseModel):
    key: str
    title: str
    assignee: Optional[str] = None
    reporter: str
    issue_type: str
    status: str
    start_date: Optional[str] = None
    due_date: Optional[str] = None

class PaginatedResponse(BaseModel):
    items: List[JiraIssue]
    total: int
    page: int
    size: int

class SubtaskDetail(BaseModel):
    key: str
    summary: str
    status: str
    assignee: Optional[str] = None
    created: str
    updated: str
    resolution_date: Optional[str] = None

class ProgressStats(BaseModel):
    total_subtasks: int
    completed: int
    in_progress: int
    todo: int
    completed_percentage: float
    in_progress_percentage: float
    todo_percentage: float

class IssueDetail(BaseModel):
    key: str
    summary: str
    description: Optional[str] = None
    status: str
    issue_type: str
    priority: Optional[str] = None
    assignee: Optional[str] = None
    reporter: Optional[str] = None
    created: str
    updated: str
    due_date: Optional[str] = None
    resolution_date: Optional[str] = None
    start_date: Optional[str] = None
    backers: Optional[List[str]] = None

class IssueDetailsResponse(BaseModel):
    issue: IssueDetail
    subtasks: List[SubtaskDetail]
    assignees: List[str]
    progress: ProgressStats

class CreateTicketRequest(BaseModel):
    summary: str
    description: Optional[str] = ""
    issue_type: Optional[str] = "Bug"  # Bug, Story, or Feature
    priority: Optional[str] = "Medium"
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    story_points: Optional[int] = None
    epic_link: Optional[str] = None
    components: Optional[List[str]] = None
    labels: Optional[List[str]] = None

class CreateTicketResponse(BaseModel):
    success: bool
    issue_key: str
    message: str
    issue_url: str
    attached_files: Optional[List[str]] = []

class AddBackersRequest(BaseModel):
    backers: Union[str, List[str]]  # Single email, comma-separated emails, or list of emails

class AddBackersResponse(BaseModel):
    success: bool
    message: str
    issue_key: str
    total_backers: int
    new_backers_added: int
    all_backers: List[str]

class CustomFieldValue(BaseModel):
    id: str
    value: str
    disabled: bool

class CustomFieldValuesResponse(BaseModel):
    field_id: str
    field_name: str
    field_type: Optional[str] = None
    values: List[CustomFieldValue]
    default_value: Optional[CustomFieldValue] = None
    total_count: int
    message: Optional[str] = None