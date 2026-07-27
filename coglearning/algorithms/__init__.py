"""Catalog search/sort algorithms used by assessment APIs.

Logic mirrors silver_project/algorithms (pytest + mutation suite lives there).
Django imports this package as ``algorithms``.
"""

from .catalog import (
    SEARCH_ALGORITHMS,
    SORT_ALGORITHMS,
    VALID_SORT_FIELDS,
    process_catalog,
)
from .searching import binary_search, linear_search
from .sorting import bubble_sort, merge_sort
from .utils import get_item_value

__all__ = [
    "process_catalog",
    "bubble_sort",
    "merge_sort",
    "linear_search",
    "binary_search",
    "get_item_value",
    "SORT_ALGORITHMS",
    "SEARCH_ALGORITHMS",
    "VALID_SORT_FIELDS",
]
