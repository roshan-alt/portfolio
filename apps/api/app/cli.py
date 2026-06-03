"""Management CLI: create admin, export/import content."""

from __future__ import annotations

import argparse
import getpass
import secrets
import sys
from pathlib import Path

from sqlmodel import Session, select

from .db import engine
from .models import AdminUser
from .security import hash_password
from .services.backup import export_content_to_file, import_content_from_file
from .settings import settings


def _create_admin(email: str, password: str) -> None:
    if len(password) < 10:
        print("Error: password must be at least 10 characters.", file=sys.stderr)
        sys.exit(1)

    with Session(engine) as session:
        existing = session.exec(select(AdminUser).where(AdminUser.email == email)).first()
        if existing:
            existing.password_hash = hash_password(password)
            session.add(existing)
            session.commit()
            print(f"Updated password for admin: {email}")
            return

        session.add(AdminUser(email=email, password_hash=hash_password(password)))
        session.commit()
        print(f"Created admin: {email}")


def _export_content(out: Path) -> None:
    with Session(engine) as session:
        path = export_content_to_file(session, out)
    print(f"Exported content to {path}")


def _import_content(src: Path, *, replace: bool) -> None:
    with Session(engine) as session:
        import_content_from_file(session, src, replace=replace)
    print(f"Imported content from {src}")


def _gen_secret() -> None:
    print(secrets.token_hex(32))


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(prog="portfolio-cli", description="Portfolio CMS management")
    sub = parser.add_subparsers(dest="command", required=True)

    create = sub.add_parser("create-admin", help="Create or reset an admin account")
    create.add_argument("--email", required=True)
    create.add_argument("--password", help="Password (prompted if omitted)")

    export = sub.add_parser("export-content", help="Export CMS content to JSON")
    export.add_argument(
        "--out",
        type=Path,
        default=Path("data/portfolio-content.json"),
        help="Output JSON path",
    )

    imp = sub.add_parser("import-content", help="Import CMS content from JSON")
    imp.add_argument("file", type=Path)
    imp.add_argument(
        "--replace",
        action="store_true",
        default=True,
        help="Replace existing content (default)",
    )
    imp.add_argument(
        "--merge",
        action="store_true",
        help="Merge without clearing existing rows",
    )

    sub.add_parser("gen-secret", help="Print a random JWT secret")

    args = parser.parse_args(argv)

    if args.command == "create-admin":
        password = args.password
        if password:
            if len(password) < 10:
                print("Error: password must be at least 10 characters.", file=sys.stderr)
                sys.exit(1)
        else:
            password = getpass.getpass("Admin password: ")
            confirm = getpass.getpass("Confirm password: ")
            if password != confirm:
                print("Error: passwords do not match.", file=sys.stderr)
                sys.exit(1)
        _create_admin(args.email.strip().lower(), password)
    elif args.command == "export-content":
        _export_content(args.out)
    elif args.command == "import-content":
        _import_content(args.file, replace=not args.merge)
    elif args.command == "gen-secret":
        _gen_secret()


if __name__ == "__main__":
    main()
