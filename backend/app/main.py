from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.connection import init_db, close_db
from app.api.v1 import auth, projects, tasks, members


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(title="TaskFlow API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(tasks.router, prefix="/api/v1")
app.include_router(members.router, prefix="/api/v1")


# Dashboard endpoint
from fastapi import Depends
import asyncpg
from app.db.connection import get_pool
from app.api.v1.deps import current_user
from datetime import date


@app.get("/api/v1/dashboard")
async def dashboard(user_id: str = Depends(current_user), pool: asyncpg.Pool = Depends(get_pool)):
    async with pool.acquire() as conn:
        project_count = await conn.fetchval(
            "SELECT COUNT(*) FROM project_members WHERE user_id = $1", user_id
        )
        status_rows = await conn.fetch("""
            SELECT t.status, COUNT(*) as count
            FROM tasks t
            WHERE t.assigned_to = $1
            GROUP BY t.status
        """, user_id)

        tasks_by_status = {"todo": 0, "in_progress": 0, "done": 0}
        for r in status_rows:
            tasks_by_status[r["status"]] = r["count"]

        overdue = await conn.fetch("""
            SELECT t.id, t.title, t.status, t.due_date, p.name AS project_name
            FROM tasks t
            JOIN projects p ON p.id = t.project_id
            WHERE t.assigned_to = $1
              AND t.due_date < $2
              AND t.status != 'done'
            ORDER BY t.due_date ASC
        """, user_id, date.today())

        return {
            "project_count": project_count,
            "tasks_by_status": tasks_by_status,
            "overdue_tasks": [dict(r) for r in overdue],
        }
