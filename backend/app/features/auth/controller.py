import asyncpg
from fastapi import HTTPException, status
from app.core.security import hash_password, verify_password, create_access_token
from app.features.auth.schemas import SignupRequest, LoginRequest, TokenResponse, UserOut


async def signup(data: SignupRequest, pool: asyncpg.Pool) -> TokenResponse:
    async with pool.acquire() as conn:
        existing = await conn.fetchrow("SELECT id FROM users WHERE email = $1", data.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        user = await conn.fetchrow(
            "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
            data.name, data.email, hash_password(data.password)
        )
        token = create_access_token(str(user["id"]))
        return TokenResponse(access_token=token)


async def login(data: LoginRequest, pool: asyncpg.Pool) -> TokenResponse:
    async with pool.acquire() as conn:
        user = await conn.fetchrow("SELECT id, password_hash FROM users WHERE email = $1", data.email)
        if not user or not verify_password(data.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_access_token(str(user["id"]))
        return TokenResponse(access_token=token)


async def get_me(user_id: str, pool: asyncpg.Pool) -> UserOut:
    async with pool.acquire() as conn:
        user = await conn.fetchrow(
            "SELECT id, name, email, created_at FROM users WHERE id = $1",
            user_id
        )
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return UserOut(**dict(user))
