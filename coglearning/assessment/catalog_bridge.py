"""Bridge Django assessment lists to silver_project process_catalog."""

import sys
from pathlib import Path

_SILVER = Path(__file__).resolve().parents[2] / "silver_project"
if str(_SILVER) not in sys.path:
    sys.path.insert(0, str(_SILVER))

from algorithms.catalog import process_catalog  # noqa: E402

# آستانه: لیست کوچک → bubble، لیست بزرگ → merge
_SMALL_LIST_MAX = 12


def test_to_catalog_item(test):
    """Map CognitiveTest model instance to catalog dict."""
    return {
        "id": test.id,
        "title": test.title or "",
        "description": test.description or "",
        "min_level": test.min_level or 0,
        "time_limit_minutes": test.time_limit_minutes or 0,
        "test_type": test.test_type,
        "created_at": test.created_at.isoformat() if test.created_at else "",
    }


def resolve_algorithms(item_count, query=""):
    """
    انتخاب خودکار — کاربر فقط «جستجو» و «مرتب‌سازی» می‌بیند.

    جستجو: همیشه linear (زیررشته در عنوان/توضیح)
    مرتب‌سازی: bubble برای لیست کوچک آزمون‌ها، merge برای کاتالوگ بزرگ
    """
    search_algo = "linear"
    sort_algo = "bubble" if item_count <= _SMALL_LIST_MAX else "merge"
    return sort_algo, search_algo


def apply_catalog(tests_queryset, query="", sort_field="title", reverse=False,
                  sort_algo=None, search_algo=None):
    items = [test_to_catalog_item(t) for t in tests_queryset]
    if sort_algo is None or search_algo is None:
        auto_sort, auto_search = resolve_algorithms(len(items), query)
        sort_algo = sort_algo or auto_sort
        search_algo = search_algo or auto_search

    result = process_catalog(
        items,
        query=query,
        sort_algo=sort_algo,
        search_algo=search_algo,
        sort_field=sort_field,
        reverse=reverse,
    )
    result["meta"]["auto_selected"] = True
    return result
