import re
from urllib.parse import urlparse

ALLOWED_SCHEMES = frozenset({"http", "https"})
BLOCKED_SCHEMES = frozenset({"javascript", "data", "vbscript", "file"})


def safe_http_url(value: str | None, *, allow_empty: bool = True) -> str | None:
    if value is None:
        return None
    raw = value.strip()
    if not raw:
        return "" if not allow_empty else None
    parsed = urlparse(raw)
    scheme = (parsed.scheme or "").lower()
    if scheme in BLOCKED_SCHEMES:
        raise ValueError("URL scheme not allowed")
    if scheme and scheme not in ALLOWED_SCHEMES:
        raise ValueError("Only http and https URLs are allowed")
    if not scheme:
        raise ValueError("URL must include http:// or https://")
    if not parsed.netloc:
        raise ValueError("Invalid URL")
    return raw


def safe_model_url(value: str | None) -> str | None:
    """Allow same-origin model paths or https URLs ending in .glb/.gltf/.dae."""
    if value is None:
        return None
    raw = value.strip()
    if not raw:
        return None
    if raw.startswith("/") and ".." not in raw:
        if re.search(r"\.(glb|gltf|dae)(\?|$)", raw, re.I):
            return raw
        raise ValueError("Model path must end with .glb, .gltf, or .dae")
    return safe_http_url(raw, allow_empty=False)


def safe_model_urls(values: list[str] | None) -> list[str] | None:
    if values is None:
        return None
    return [safe_model_url(v) or "" for v in values]
