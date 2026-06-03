from __future__ import annotations

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


class AdminUser(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Profile(SQLModel, table=True):
    id: str = Field(primary_key=True, default="profile")
    full_name: str = ""
    headline: str = ""
    summary: str = ""
    location: str = ""
    email: str = ""
    avatar_url: str = ""
    linkedin_url: str = ""
    github_url: str = ""
    website_url: str = ""
    hero_tagline: str = ""
    floating_images: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Experience(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    company: str
    title: str
    location: str = ""
    start_date: str = ""
    end_date: str | None = None
    description: str = ""
    order: int = 0


class Education(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school: str
    degree: str = ""
    field: str = ""
    start_date: str = ""
    end_date: str | None = None
    description: str = ""
    order: int = 0


class Skill(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    order: int = 0


class Project(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str
    description: str = ""
    url: str = ""
    image_url: str = ""
    tags: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    featured: bool = False
    order: int = 0


class BlogPost(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str
    excerpt: str = ""
    body: str = ""
    cover_image_url: str = ""
    tags: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    published_date: str = ""
    published: bool = False
    order: int = 0


class Certification(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str
    issuer: str = ""
    issue_date: str = ""
    expiry_date: str | None = None
    credential_id: str = ""
    credential_url: str = ""
    order: int = 0


class Language(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    proficiency: str = ""
    order: int = 0


class Volunteer(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    organization: str
    role: str = ""
    cause: str = ""
    start_date: str = ""
    end_date: str | None = None
    description: str = ""
    order: int = 0


class Honor(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str
    issuer: str = ""
    issue_date: str = ""
    description: str = ""
    order: int = 0


class Publication(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str
    publisher: str = ""
    publication_date: str = ""
    url: str = ""
    description: str = ""
    order: int = 0


class Course(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    number: str = ""
    associated_with: str = ""
    order: int = 0


class Recommendation(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    recommender_name: str
    recommender_title: str = ""
    relationship: str = ""
    text: str = ""
    date: str = ""
    order: int = 0


class ContactMessage(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    email: str
    subject: str = ""
    message: str
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
