import hashlib
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt

from .settings import settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_token(*, sub: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_access_expires_minutes)
    return jwt.encode({"sub": sub, "exp": exp}, settings.jwt_secret, algorithm="HS256")


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
