import asyncpg
from fastapi import APIRouter, Depends
from app.db.connection import get_pool
from app.api.v1.deps import current_user
from app.features.auth import controller
from app.features.auth.schemas import SignupRequest, LoginRequest, TokenResponse, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse)
async def signup(data: SignupRequest, pool: asyncpg.Pool = Depends(get_pool)):
    return await controller.signup(data, pool)


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, pool: asyncpg.Pool = Depends(get_pool)):
    return await controller.login(data, pool)


@router.get("/me", response_model=UserOut)
async def me(user_id: str = Depends(current_user), pool: asyncpg.Pool = Depends(get_pool)):
    return await controller.get_me(user_id, pool)
