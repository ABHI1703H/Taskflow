import asyncpg
from app.core.config import settings

pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    return pool


async def init_db():
    global pool
    pool = await asyncpg.create_pool(
        dsn=settings.database_url,
        min_size=2,
        max_size=10,
    )
    # Run migrations
    async with pool.acquire() as conn:
        with open("app/db/migrations/init.sql") as f:
            await conn.execute(f.read())


async def close_db():
    global pool
    if pool:
        await pool.close()
