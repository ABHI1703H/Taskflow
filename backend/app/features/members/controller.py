import asyncpg
from fastapi import HTTPException
from app.features.members.schemas import AddMemberRequest, MemberOut


async def require_admin(project_id: str, user_id: str, conn: asyncpg.Connection):
    row = await conn.fetchrow(
        "SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2",
        project_id, user_id
    )
    if not row or row["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")


async def list_members(project_id: str, user_id: str, pool: asyncpg.Pool) -> list[MemberOut]:
    async with pool.acquire() as conn:
        # Verify caller is a member
        row = await conn.fetchrow(
            "SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2",
            project_id, user_id
        )
        if not row:
            raise HTTPException(status_code=403, detail="Not a member")

        rows = await conn.fetch("""
            SELECT pm.id, pm.user_id, pm.project_id, pm.role, pm.joined_at,
                   u.name, u.email
            FROM project_members pm
            JOIN users u ON u.id = pm.user_id
            WHERE pm.project_id = $1
            ORDER BY pm.joined_at ASC
        """, project_id)
        return [MemberOut(**dict(r)) for r in rows]


async def add_member(project_id: str, data: AddMemberRequest, caller_id: str, pool: asyncpg.Pool) -> MemberOut:
    async with pool.acquire() as conn:
        await require_admin(project_id, caller_id, conn)

        user = await conn.fetchrow("SELECT id FROM users WHERE email = $1", data.email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        existing = await conn.fetchrow(
            "SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2",
            project_id, user["id"]
        )
        if existing:
            raise HTTPException(status_code=400, detail="Already a member")

        if data.role not in ("admin", "member"):
            raise HTTPException(status_code=400, detail="Role must be admin or member")

        row = await conn.fetchrow("""
            INSERT INTO project_members (project_id, user_id, role)
            VALUES ($1, $2, $3)
            RETURNING id, user_id, project_id, role, joined_at
        """, project_id, user["id"], data.role)

        user_info = await conn.fetchrow("SELECT name, email FROM users WHERE id = $1", user["id"])
        return MemberOut(**dict(row), name=user_info["name"], email=user_info["email"])


async def remove_member(project_id: str, target_user_id: str, caller_id: str, pool: asyncpg.Pool):
    async with pool.acquire() as conn:
        await require_admin(project_id, caller_id, conn)

        # Can't remove project owner
        project = await conn.fetchrow("SELECT owner_id FROM projects WHERE id = $1", project_id)
        if project and str(project["owner_id"]) == target_user_id:
            raise HTTPException(status_code=400, detail="Cannot remove project owner")

        result = await conn.execute(
            "DELETE FROM project_members WHERE project_id = $1 AND user_id = $2",
            project_id, target_user_id
        )
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Member not found")
