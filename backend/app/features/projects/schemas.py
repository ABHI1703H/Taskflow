from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import Optional


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectOut(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    owner_id: uuid.UUID
    created_at: datetime
    role: Optional[str] = None  # caller's role in the project


class ProjectDetail(ProjectOut):
    member_count: int = 0
