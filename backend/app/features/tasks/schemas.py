from pydantic import BaseModel
import uuid
from datetime import datetime, date
from typing import Optional


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: Optional[uuid.UUID] = None
    status: str = "todo"
    due_date: Optional[date] = None


class TaskStatusUpdate(BaseModel):
    status: str


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[uuid.UUID] = None
    status: Optional[str] = None
    due_date: Optional[date] = None


class TaskOut(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str]
    project_id: uuid.UUID
    assigned_to: Optional[uuid.UUID]
    assigned_name: Optional[str]
    status: str
    due_date: Optional[date]
    created_by: uuid.UUID
    created_at: datetime
