"""
catalog_mutants.py — جهش‌های AOR برای catalog.py (فصل 9)

هر تابع یک کپی از process_catalog با یک تغییر حسابی در متادیتا است.
خط تغییر یافته با # MUTANT علامت‌گذاری شده است.
"""
from algorithms.catalog import (  # noqa: F401
    _apply_search,
    _apply_sort,
    SORT_ALGORITHMS,
    SEARCH_ALGORITHMS,
    VALID_SORT_FIELDS,
)


def process_catalog_m01(items, query="", sort_algo="bubble", search_algo="linear",
                         sort_field="title", reverse=False):
    """
    M-AOR-PC-01: total_before = len(items)  →  len(items) + 1
    اثر: تعداد آیتم‌های اولیه یک واحد بیشتر گزارش می‌شود.
    وضعیت: LIVE — تست‌های قبلی فقط  total_after <= total_before را بررسی می‌کردند
            این شرط همچنان برقرار است زیرا total_after اصلاً تغییر نکرده.
    کشتن: اضافه کردن  assert result["meta"]["total_before"] == len(items)
    """
    if sort_field not in VALID_SORT_FIELDS:
        sort_field = "title"
    if sort_algo not in SORT_ALGORITHMS:
        sort_algo = "bubble"
    if search_algo not in SEARCH_ALGORITHMS:
        search_algo = "linear"
    filtered = _apply_search(items, query.strip(), search_algo, sort_field)
    sorted_items = _apply_sort(filtered, sort_algo, sort_field, reverse)
    return {
        "items": sorted_items,
        "meta": {
            "query": query,
            "sort_algorithm": sort_algo,
            "search_algorithm": search_algo,
            "sort_field": sort_field,
            "reverse": reverse,
            "total_before": len(items) + 1,  # MUTANT: + 1
            "total_after": len(sorted_items),
        },
    }


def process_catalog_m02(items, query="", sort_algo="bubble", search_algo="linear",
                         sort_field="title", reverse=False):
    """
    M-AOR-PC-02: total_after = len(sorted_items)  →  len(sorted_items) - 1
    اثر: تعداد نتایج یک واحد کمتر از تعداد واقعی گزارش می‌شود.
    وضعیت: KILLED — test_acoc_catalog_combinations بررسی می‌کند:
            assert result["meta"]["total_after"] == len(result["items"])
            چون result["items"] = sorted_items است، این شرط نقض می‌شود.
    """
    if sort_field not in VALID_SORT_FIELDS:
        sort_field = "title"
    if sort_algo not in SORT_ALGORITHMS:
        sort_algo = "bubble"
    if search_algo not in SEARCH_ALGORITHMS:
        search_algo = "linear"
    filtered = _apply_search(items, query.strip(), search_algo, sort_field)
    sorted_items = _apply_sort(filtered, sort_algo, sort_field, reverse)
    return {
        "items": sorted_items,
        "meta": {
            "query": query,
            "sort_algorithm": sort_algo,
            "search_algorithm": search_algo,
            "sort_field": sort_field,
            "reverse": reverse,
            "total_before": len(items),
            "total_after": len(sorted_items) - 1,  # MUTANT: - 1
        },
    }
