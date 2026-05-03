import asyncpg
from fastapi import APIRouter, Depends
from app.db.connection import get_pool
from app.api.v1.deps import current_user
from app.features.members import controller
from app.features.members.schemas import AddMemberRequest, MemberOut

router = APIRouter(tags=["members"])


@router.get("/projects/{project_id}/members", response_model=list[MemberOut])
async def list_members(project_id: str, user_id: str = Depends(current_user), pool: asyncpg.Pool = Depends(get_pool)):
    return await controller.list_members(project_id, user_id, pool)


@router.post("/projects/{project_id}/members", response_model=MemberOut, status_code=201)
async def add_member(project_id: str, data: AddMemberRequest, user_id: str = Depends(current_user), pool: asyncpg.Pool = Depends(get_pool)):
    return await controller.add_member(project_id, data, user_id, pool)


@router.delete("/projects/{project_id}/members/{target_user_id}", status_code=204)
async def remove_member(project_id: str, target_user_id: str, user_id: str = Depends(current_user), pool: asyncpg.Pool = Depends(get_pool)):
    await controller.remove_member(project_id, target_user_id, user_id, pool)
