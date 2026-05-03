import asyncpg
from fastapi import APIRouter, Depends
from app.db.connection import get_pool
from app.api.v1.deps import current_user
from app.features.projects import controller
from app.features.projects.schemas import ProjectCreate, ProjectOut, ProjectDetail

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/", response_model=list[ProjectOut])
async def list_projects(user_id: str = Depends(current_user), pool: asyncpg.Pool = Depends(get_pool)):
    return await controller.list_projects(user_id, pool)


@router.post("/", response_model=ProjectOut, status_code=201)
async def create_project(data: ProjectCreate, user_id: str = Depends(current_user), pool: asyncpg.Pool = Depends(get_pool)):
    return await controller.create_project(data, user_id, pool)


@router.get("/{project_id}", response_model=ProjectDetail)
async def get_project(project_id: str, user_id: str = Depends(current_user), pool: asyncpg.Pool = Depends(get_pool)):
    return await controller.get_project(project_id, user_id, pool)


@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: str, user_id: str = Depends(current_user), pool: asyncpg.Pool = Depends(get_pool)):
    await controller.delete_project(project_id, user_id, pool)
