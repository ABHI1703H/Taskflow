from pydantic import BaseModel, EmailStr
import uuid
from datetime import datetime


class AddMemberRequest(BaseModel):
    email: EmailStr
    role: str = "member"


class MemberOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    project_id: uuid.UUID
    name: str
    email: str
    role: str
    joined_at: datetime
