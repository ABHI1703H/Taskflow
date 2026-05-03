import asyncpg
from fastapi import HTTPException
from app.features.projects.schemas import ProjectCreate, ProjectOut, ProjectDetail


async def list_projects(user_id: str, pool: asyncpg.Pool) -> list[ProjectOut]:
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT p.id, p.name, p.description, p.owner_id, p.created_at, pm.role
            FROM projects p
            JOIN project_members pm ON pm.project_id = p.id
            WHERE pm.user_id = $1
            ORDER BY p.created_at DESC
        """, user_id)
        return [ProjectOut(**dict(r)) for r in rows]


async def create_project(data: ProjectCreate, user_id: str, pool: asyncpg.Pool) -> ProjectOut:
    async with pool.acquire() as conn:
        async with conn.transaction():
            project = await conn.fetchrow(
                "INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *",
                data.name, data.description, user_id
            )
            # Owner is always admin
            await conn.execute(
                "INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'admin')",
                project["id"], user_id
            )
            return ProjectOut(**dict(project), role="admin")


async def get_project(project_id: str, user_id: str, pool: asyncpg.Pool) -> ProjectDetail:
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            SELECT p.id, p.name, p.description, p.owner_id, p.created_at, pm.role,
                   (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) AS member_count
            FROM projects p
            JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $2
            WHERE p.id = $1
        """, project_id, user_id)
        if not row:
            raise HTTPException(status_code=404, detail="Project not found")
        return ProjectDetail(**dict(row))


async def delete_project(project_id: str, user_id: str, pool: asyncpg.Pool):
    async with pool.acquire() as conn:
        member = await conn.fetchrow(
            "SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2",
            project_id, user_id
        )
        if not member or member["role"] != "admin":
            raise HTTPException(status_code=403, detail="Admin only")
        result = await conn.execute("DELETE FROM projects WHERE id = $1", project_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Project not found")
