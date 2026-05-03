import asyncpg
from fastapi import APIRouter, Depends
from app.db.connection import get_pool
from app.api.v1.deps import current_user
from app.features.tasks import controller
from app.features.tasks.schemas import TaskCreate, TaskUpdate, TaskOut

router = APIRouter(tags=["tasks"])


@router.get("/projects/{project_id}/tasks", response_model=list[TaskOut])
async def list_tasks(project_id: str, user_id: str = Depends(current_user), pool: asyncpg.Pool = Depends(get_pool)):
    return await controller.list_tasks(project_id, user_id, pool)


@router.post("/projects/{project_id}/tasks", response_model=TaskOut, status_code=201)
async def create_task(project_id: str, data: TaskCreate, user_id: str = Depends(current_user), pool: asyncpg.Pool = Depends(get_pool)):
    return await controller.create_task(project_id, data, user_id, pool)


@router.patch("/projects/{project_id}/tasks/{task_id}", response_model=TaskOut)
async def update_task(project_id: str, task_id: str, data: TaskUpdate, user_id: str = Depends(current_user), pool: asyncpg.Pool = Depends(get_pool)):
    return await controller.update_task(project_id, task_id, data, user_id, pool)


@router.delete("/projects/{project_id}/tasks/{task_id}", status_code=204)
async def delete_task(project_id: str, task_id: str, user_id: str = Depends(current_user), pool: asyncpg.Pool = Depends(get_pool)):
    await controller.delete_task(project_id, task_id, user_id, pool)
