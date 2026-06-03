from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./portfolio.db"
    jwt_secret: str = "dev_secret"
    jwt_access_expires_minutes: int = 60 * 24
    admin_bootstrap_email: str | None = None
    admin_bootstrap_password: str | None = None
    app_origins: str = "http://localhost:5173"
    uploads_dir: str = "uploads"
    public_base_url: str = "http://localhost:8000"
    debug: bool = True
    login_rate_limit: int = 10
    login_rate_window_seconds: int = 60
    contact_rate_limit: int = 5
    contact_rate_window_seconds: int = 3600
    import_seed_on_startup: bool = False
    setup_token: str | None = None

    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.app_origins.split(",") if o.strip()]

    def validate_production(self) -> None:
        if self.debug:
            return
        weak_secrets = {"dev_secret", "change_me", "secret", "changeme"}
        if self.jwt_secret.strip().lower() in weak_secrets or len(self.jwt_secret) < 32:
            raise RuntimeError("Set a strong JWT_SECRET (32+ chars) when DEBUG=false")


settings = Settings()
