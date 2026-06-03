from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, field_validator
from sqlmodel import Session, select

from ..crud import attach_crud
from ..db import get_session
from ..deps import get_admin
from ..models import (
    AdminUser,
    BlogPost,
    Certification,
    ContactMessage,
    Course,
    Education,
    Experience,
    Honor,
    Language,
    Profile,
    Project,
    Publication,
    Recommendation,
    Skill,
    Volunteer,
)
from ..services.content import public_bundle
from ..validators import safe_http_url, safe_model_urls

router = APIRouter(prefix="/admin", tags=["admin"])


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    headline: str | None = None
    summary: str | None = None
    location: str | None = None
    email: EmailStr | None = None
    avatar_url: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None
    website_url: str | None = None
    hero_tagline: str | None = None
    floating_images: list[str] | None = None

    @field_validator("email", mode="before")
    @classmethod
    def empty_email(cls, v: str | None) -> str | None:
        if v is None or (isinstance(v, str) and not v.strip()):
            return None
        return v

    @field_validator("avatar_url", "linkedin_url", "github_url", "website_url", mode="before")
    @classmethod
    def validate_urls(cls, v: str | None) -> str | None:
        if v is None or (isinstance(v, str) and not v.strip()):
            return v if v is not None else None
        return safe_http_url(str(v), allow_empty=True)

    @field_validator("floating_images", mode="before")
    @classmethod
    def validate_models(cls, v: list[str] | None) -> list[str] | None:
        return safe_model_urls(v)


@router.get("/content")
def admin_content(session: Session = Depends(get_session), _: AdminUser = Depends(get_admin)):
    return public_bundle(session)


@router.put("/profile")
def update_profile(
    body: ProfileUpdate,
    session: Session = Depends(get_session),
    _: AdminUser = Depends(get_admin),
):
    p = session.get(Profile, "profile") or Profile(id="profile")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    session.add(p)
    session.commit()
    session.refresh(p)
    return p


attach_crud(router, "experience", Experience)
attach_crud(router, "education", Education)
attach_crud(router, "skills", Skill)
attach_crud(router, "projects", Project)
attach_crud(router, "blog-posts", BlogPost)
attach_crud(router, "certifications", Certification)
attach_crud(router, "languages", Language)
attach_crud(router, "volunteer", Volunteer)
attach_crud(router, "honors", Honor)
attach_crud(router, "publications", Publication)
attach_crud(router, "courses", Course)
attach_crud(router, "recommendations", Recommendation)


class MessageReadUpdate(BaseModel):
    read: bool


@router.get("/messages")
def list_messages(session: Session = Depends(get_session), _: AdminUser = Depends(get_admin)):
    return session.exec(select(ContactMessage).order_by(ContactMessage.created_at.desc())).all()


@router.patch("/messages/{message_id}")
def update_message(
    message_id: UUID,
    body: MessageReadUpdate,
    session: Session = Depends(get_session),
    _: AdminUser = Depends(get_admin),
):
    row = session.get(ContactMessage, message_id)
    if not row:
        raise HTTPException(404, "Not found")
    row.read = body.read
    session.add(row)
    session.commit()
    session.refresh(row)
    return row


@router.delete("/messages/{message_id}")
def delete_message(
    message_id: UUID,
    session: Session = Depends(get_session),
    _: AdminUser = Depends(get_admin),
):
    row = session.get(ContactMessage, message_id)
    if row:
        session.delete(row)
        session.commit()
    return {"ok": True}
