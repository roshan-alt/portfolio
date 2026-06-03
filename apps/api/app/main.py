from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, SQLModel, select

from .db import engine
from .middleware import SecurityHeadersMiddleware
from .models import AdminUser, Profile
from .routers import admin, auth, contact, public
from .security import hash_password
from .services.backup import import_content_from_file
from .settings import settings

SEED_PATH = Path(__file__).resolve().parent.parent / "seed" / "portfolio-content.json"

app = FastAPI(
    title="portfolio-api",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    openapi_url="/openapi.json" if settings.debug else None,
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

uploads = Path(settings.uploads_dir)
uploads.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads)), name="uploads")

app.include_router(auth.router)
app.include_router(public.router)
app.include_router(contact.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"ok": True}


@app.on_event("startup")
def startup():
    settings.validate_production()
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        if settings.admin_bootstrap_email and settings.admin_bootstrap_password:
            if not session.exec(select(AdminUser).where(AdminUser.email == settings.admin_bootstrap_email)).first():
                session.add(
                    AdminUser(
                        email=settings.admin_bootstrap_email,
                        password_hash=hash_password(settings.admin_bootstrap_password),
                    )
                )
                session.commit()
        if not session.get(Profile, "profile"):
            if settings.import_seed_on_startup and SEED_PATH.is_file():
                import_content_from_file(session, SEED_PATH, replace=True)
            else:
                session.add(
                    Profile(
                        id="profile",
                        full_name="Your Name",
                        headline="IoT · AI/ML · Software Engineer",
                        hero_tagline="Building interactive systems that ship.",
                        floating_images=[],
                    )
                )
                session.commit()
