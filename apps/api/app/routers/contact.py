from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from sqlmodel import Session

from ..db import get_session
from ..models import ContactMessage
from ..rate_limit import client_ip, limiter
from ..settings import settings

router = APIRouter(prefix="/public", tags=["public"])


class ContactIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    subject: str = Field(default="", max_length=200)
    message: str = Field(min_length=1, max_length=5000)
    website: str = Field(default="", max_length=200, description="Honeypot — must stay empty")


@router.post("/contact")
def submit_contact(body: ContactIn, request: Request, session: Session = Depends(get_session)):
    if body.website.strip():
        raise HTTPException(400, "Invalid submission")

    limiter.check(
        f"contact:{client_ip(request)}",
        limit=settings.contact_rate_limit,
        window_seconds=settings.contact_rate_window_seconds,
    )

    row = ContactMessage(
        name=body.name.strip(),
        email=str(body.email).strip(),
        subject=body.subject.strip(),
        message=body.message.strip(),
    )
    session.add(row)
    session.commit()
    return {"ok": True}
