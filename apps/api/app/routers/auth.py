from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select

from ..db import get_session
from ..models import AdminUser
from ..rate_limit import client_ip, limiter
from ..security import create_token, hash_password, verify_password
from ..settings import settings

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SetupIn(BaseModel):
    email: EmailStr
    password: str
    setup_token: str


@router.post("/setup")
def setup_admin(body: SetupIn, request: Request, session: Session = Depends(get_session)):
    """One-time admin creation when Render Shell is unavailable. Requires SETUP_TOKEN env."""
    if not settings.setup_token:
        raise HTTPException(404, "Not found")
    if body.setup_token != settings.setup_token:
        raise HTTPException(403, "Invalid setup token")
    if session.exec(select(AdminUser)).first():
        raise HTTPException(409, "Admin already exists — use login or reset via bootstrap env")

    limiter.check(
        f"setup:{client_ip(request)}",
        limit=5,
        window_seconds=3600,
    )

    if len(body.password) < 10:
        raise HTTPException(400, "Password must be at least 10 characters")

    session.add(
        AdminUser(
            email=body.email.strip().lower(),
            password_hash=hash_password(body.password),
        )
    )
    session.commit()
    return {
        "ok": True,
        "message": "Admin created. Remove SETUP_TOKEN from Render env and redeploy.",
    }


@router.post("/login", response_model=TokenOut)
def login(body: LoginIn, request: Request, session: Session = Depends(get_session)):
    limiter.check(
        f"login:{client_ip(request)}",
        limit=settings.login_rate_limit,
        window_seconds=settings.login_rate_window_seconds,
    )
    user = session.exec(select(AdminUser).where(AdminUser.email == body.email)).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    return TokenOut(access_token=create_token(sub=str(user.id)))
