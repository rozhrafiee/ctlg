"""Catalog service: apply manual search + sort to test/content lists."""

from .sorting import bubble_sort, merge_sort
from .searching import linear_search, binary_search
from .utils import get_item_value

SORT_ALGORITHMS = {
    "bubble": bubble_sort,
    "merge": merge_sort,
}

SEARCH_ALGORITHMS = {
    "linear": "linear",
    "binary": "binary",
}

VALID_SORT_FIELDS = ("title", "min_level", "time_limit_minutes", "created_at")


def _apply_search(items, query, search_algo, sort_field):
    if not query:
        return list(items)

    if search_algo == "binary":
        sorted_for_search = bubble_sort(items, key=sort_field, reverse=False)
        idx = binary_search(sorted_for_search, query, key=sort_field)
        if idx >= 0:
            return [sorted_for_search[idx]]
        return []

    indices = linear_search(items, query)
    return [items[i] for i in indices]


def _apply_sort(items, sort_algo, sort_field, reverse):
    sorter = SORT_ALGORITHMS.get(sort_algo, bubble_sort)
    return sorter(items, key=sort_field, reverse=reverse)


def process_catalog(
    items,
    query="",
    sort_algo="bubble",
    search_algo="linear",
    sort_field="title",
    reverse=False,
):
    """
    Filter then sort a catalog list using user-selected algorithms.
    Returns processed list and metadata about algorithms used.
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
            "total_after": len(sorted_items),
        },
    }
