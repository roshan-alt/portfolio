from fastapi import APIRouter, Depends
from sqlmodel import Session

from ..db import get_session
from ..services.content import public_bundle

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/content")
def get_content(session: Session = Depends(get_session)):
    return public_bundle(session)
