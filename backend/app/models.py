
from pydantic import BaseModel
from typing import Optional, List

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
