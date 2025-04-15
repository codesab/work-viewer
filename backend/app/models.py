
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
