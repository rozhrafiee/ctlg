"""Manual search algorithms for the cognitive test catalog."""

from .utils import get_item_value


def linear_search(items, query, fields=("title", "description")):
    """
    Linear Search — returns indices of items whose fields contain query.
    Empty query returns all indices.
    """
    if not query:
        return list(range(len(items)))

    query_lower = str(query).lower()
    matches = []
    for i in range(len(items)):
        for field in fields:
            value = str(get_item_value(items[i], field)).lower()
            if query_lower in value:
                matches.append(i)
                break
    return matches


def binary_search(items, query, key="title"):
    """
    Binary Search — exact match on a sorted list by key.
    Returns index or -1 if not found.
    """
    if not query or len(items) == 0:
        return -1

    query_lower = str(query).lower()
    left = 0
    right = len(items) - 1

    while left <= right:
        mid = (left + right) // 2
        mid_val = str(get_item_value(items[mid], key)).lower()
        if mid_val == query_lower:
            return mid
        if mid_val < query_lower:
            left = mid + 1
        else:
            right = mid - 1
    return -1
