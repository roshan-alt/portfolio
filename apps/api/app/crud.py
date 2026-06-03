from typing import Type
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, SQLModel, select

from .db import get_session
from .deps import get_admin
from .models import AdminUser


def attach_crud(router: APIRouter, path: str, model: Type[SQLModel]) -> None:
    order_col = getattr(model, "order", None)

    @router.get(f"/{path}")
    def list_items(
        session: Session = Depends(get_session),
        _: AdminUser = Depends(get_admin),
    ):
        q = select(model)
        if order_col is not None:
            q = q.order_by(model.order)  # type: ignore[attr-defined]
        return session.exec(q).all()

    @router.post(f"/{path}")
    def create_item(
        row: model,  # type: ignore[valid-type]
        session: Session = Depends(get_session),
        _: AdminUser = Depends(get_admin),
    ):
        session.add(row)
        session.commit()
        session.refresh(row)
        return row

    @router.patch(f"/{path}/{{item_id}}")
    def update_item(
        item_id: UUID,
        row: model,  # type: ignore[valid-type]
        session: Session = Depends(get_session),
        _: AdminUser = Depends(get_admin),
    ):
        existing = session.get(model, item_id)
        if not existing:
            raise HTTPException(404, "Not found")
        for k, v in row.model_dump(exclude_unset=True, exclude={"id"}).items():  # type: ignore[union-attr]
            setattr(existing, k, v)
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing

    @router.delete(f"/{path}/{{item_id}}")
    def delete_item(
        item_id: UUID,
        session: Session = Depends(get_session),
        _: AdminUser = Depends(get_admin),
    ):
        existing = session.get(model, item_id)
        if existing:
            session.delete(existing)
            session.commit()
        return {"ok": True}
