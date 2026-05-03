import asyncpg
from fastapi import HTTPException
from app.features.tasks.schemas import TaskCreate, TaskUpdate, TaskOut
from datetime import date


async def get_member_role(project_id: str, user_id: str, conn: asyncpg.Connection) -> str:
    row = await conn.fetchrow(
        "SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2",
        project_id, user_id
    )
    if not row:
        raise HTTPException(status_code=403, detail="Not a project member")
    return row["role"]


def row_to_task(row) -> TaskOut:
    d = dict(row)
    return TaskOut(**d)


async def list_tasks(project_id: str, user_id: str, pool: asyncpg.Pool) -> list[TaskOut]:
    async with pool.acquire() as conn:
        await get_member_role(project_id, user_id, conn)
        rows = await conn.fetch("""
            SELECT t.id, t.title, t.description, t.project_id, t.assigned_to,
                   u.name AS assigned_name, t.status, t.due_date, t.created_by, t.created_at
            FROM tasks t
            LEFT JOIN users u ON u.id = t.assigned_to
            WHERE t.project_id = $1
            ORDER BY t.created_at DESC
        """, project_id)
        return [row_to_task(r) for r in rows]


async def create_task(project_id: str, data: TaskCreate, user_id: str, pool: asyncpg.Pool) -> TaskOut:
    async with pool.acquire() as conn:
        role = await get_member_role(project_id, user_id, conn)
        if role != "admin":
            raise HTTPException(status_code=403, detail="Admin only")

        if data.status not in ("todo", "in_progress", "done"):
            raise HTTPException(status_code=400, detail="Invalid status")

        row = await conn.fetchrow("""
            INSERT INTO tasks (title, description, project_id, assigned_to, status, due_date, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, title, description, project_id, assigned_to, status, due_date, created_by, created_at
        """, data.title, data.description, project_id,
            str(data.assigned_to) if data.assigned_to else None,
            data.status, data.due_date, user_id)

        assigned_name = None
        if row["assigned_to"]:
            u = await conn.fetchrow("SELECT name FROM users WHERE id = $1", row["assigned_to"])
            assigned_name = u["name"] if u else None

        return TaskOut(**dict(row), assigned_name=assigned_name)


async def update_task(project_id: str, task_id: str, data: TaskUpdate, user_id: str, pool: asyncpg.Pool) -> TaskOut:
    async with pool.acquire() as conn:
        role = await get_member_role(project_id, user_id, conn)

        task = await conn.fetchrow(
            "SELECT * FROM tasks WHERE id = $1 AND project_id = $2",
            task_id, project_id
        )
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        # Members can only update status on tasks assigned to them
        if role != "admin":
            if str(task["assigned_to"]) != user_id:
                raise HTTPException(status_code=403, detail="Can only update your own tasks")
            if any(v is not None for k, v in data.model_dump().items() if k != "status"):
                raise HTTPException(status_code=403, detail="Members can only update status")

        if data.status and data.status not in ("todo", "in_progress", "done"):
            raise HTTPException(status_code=400, detail="Invalid status")

        # Build dynamic update
        updates = {}
        if role == "admin":
            if data.title is not None:
                updates["title"] = data.title
            if data.description is not None:
                updates["description"] = data.description
            if data.assigned_to is not None:
                updates["assigned_to"] = str(data.assigned_to)
            if data.due_date is not None:
                updates["due_date"] = data.due_date
        if data.status is not None:
            updates["status"] = data.status

        if not updates:
            raise HTTPException(status_code=400, detail="Nothing to update")

        set_clause = ", ".join(f"{k} = ${i+2}" for i, k in enumerate(updates))
        values = list(updates.values())

        row = await conn.fetchrow(
            f"UPDATE tasks SET {set_clause} WHERE id = $1 RETURNING *",
            task_id, *values
        )

        assigned_name = None
        if row["assigned_to"]:
            u = await conn.fetchrow("SELECT name FROM users WHERE id = $1", row["assigned_to"])
            assigned_name = u["name"] if u else None

        return TaskOut(**dict(row), assigned_name=assigned_name)


async def delete_task(project_id: str, task_id: str, user_id: str, pool: asyncpg.Pool):
    async with pool.acquire() as conn:
        role = await get_member_role(project_id, user_id, conn)
        if role != "admin":
            raise HTTPException(status_code=403, detail="Admin only")

        result = await conn.execute(
            "DELETE FROM tasks WHERE id = $1 AND project_id = $2",
            task_id, project_id
        )
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Task not found")
