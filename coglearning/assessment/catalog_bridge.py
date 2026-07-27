"""Bridge to silver_project catalog algorithms for student test listing."""
from __future__ import annotations

import sys
from pathlib import Path

_SILVER_ROOT = Path(__file__).resolve().parents[2] / "silver_project"
if _SILVER_ROOT.is_dir() and str(_SILVER_ROOT) not in sys.path:
    sys.path.insert(0, str(_SILVER_ROOT))

from algorithms.catalog import process_catalog  # noqa: E402


def apply_catalog(items, request):
    """Apply search/sort from query params; return (items, meta)."""
    params = request.query_params
    result = process_catalog(
        items,
        query=params.get("q", "") or params.get("query", ""),
        sort_algo=params.get("sort_algo", "bubble"),
        search_algo=params.get("search_algo", "linear"),
        sort_field=params.get("sort_field", "title"),
        reverse=params.get("reverse", "").lower() in ("1", "true", "yes"),
    )
    return result["items"], result["meta"]
