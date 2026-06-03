"""Export and import CMS content (excludes admin credentials)."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Type
from uuid import UUID

from sqlmodel import Session, SQLModel, select

from ..models import (
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

BACKUP_VERSION = 1

CONTENT_MODELS: list[tuple[str, Type[SQLModel]]] = [
    ("experience", Experience),
    ("education", Education),
    ("skills", Skill),
    ("projects", Project),
    ("blog_posts", BlogPost),
    ("certifications", Certification),
    ("languages", Language),
    ("volunteer", Volunteer),
    ("honors", Honor),
    ("publications", Publication),
    ("courses", Course),
    ("recommendations", Recommendation),
    ("contact_messages", ContactMessage),
]


def _serialize(value: Any) -> Any:
    if isinstance(value, UUID):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, SQLModel):
        return _serialize(value.model_dump())
    if isinstance(value, dict):
        return {k: _serialize(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_serialize(v) for v in value]
    return value


def _ordered_rows(session: Session, model: Type[SQLModel]) -> list[SQLModel]:
    q = select(model)
    if hasattr(model, "order"):
        q = q.order_by(model.order)  # type: ignore[attr-defined]
    elif hasattr(model, "created_at"):
        q = q.order_by(model.created_at)  # type: ignore[attr-defined]
    return list(session.exec(q).all())


def export_content(session: Session) -> dict[str, Any]:
    profile = session.get(Profile, "profile")
    payload: dict[str, Any] = {
        "version": BACKUP_VERSION,
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "profile": _serialize(profile) if profile else None,
    }
    for key, model in CONTENT_MODELS:
        payload[key] = [_serialize(row) for row in _ordered_rows(session, model)]
    return payload


def export_content_to_file(session: Session, path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    data = export_content(session)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return path


def _clear_content(session: Session) -> None:
    for _, model in reversed(CONTENT_MODELS):
        for row in session.exec(select(model)).all():
            session.delete(row)
    profile = session.get(Profile, "profile")
    if profile:
        session.delete(profile)
    session.commit()


def import_content(session: Session, data: dict[str, Any], *, replace: bool = True) -> None:
    if data.get("version") != BACKUP_VERSION:
        raise ValueError(f"Unsupported backup version: {data.get('version')}")

    if replace:
        _clear_content(session)

    profile_data = data.get("profile")
    if profile_data:
        session.add(Profile.model_validate(profile_data))

    for key, model in CONTENT_MODELS:
        for row_data in data.get(key, []):
            session.add(model.model_validate(row_data))

    session.commit()


def import_content_from_file(session: Session, path: Path, *, replace: bool = True) -> None:
    raw = json.loads(path.read_text(encoding="utf-8"))
    import_content(session, raw, replace=replace)
