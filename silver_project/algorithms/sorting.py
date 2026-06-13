"""Manual sorting algorithms for the cognitive test catalog (no built-in sort)."""

from .utils import get_item_value


def _should_swap(a, b, reverse):
    if reverse:
        return a < b
    return a > b


def bubble_sort(items, key="title", reverse=False):
    """Bubble Sort — O(n²) comparison-based sort."""
    arr = list(items)
    n = len(arr)
    if n <= 1:
        return arr

    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            val_a = get_item_value(arr[j], key)
            val_b = get_item_value(arr[j + 1], key)
            if _should_swap(val_a, val_b, reverse):
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr


def _merge(left, right, key, reverse):
    result = []
    i = 0
    j = 0
    while i < len(left) and j < len(right):
        val_left = get_item_value(left[i], key)
        val_right = get_item_value(right[j], key)
        if reverse:
            take_left = val_left >= val_right
        else:
            take_left = val_left <= val_right
        if take_left:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result


def merge_sort(items, key="title", reverse=False):
    """Merge Sort — divide-and-conquer recursive sort."""
    arr = list(items)
    n = len(arr)
    if n <= 1:
        return arr

    mid = n // 2
    left = merge_sort(arr[:mid], key=key, reverse=reverse)
    right = merge_sort(arr[mid:], key=key, reverse=reverse)
    return _merge(left, right, key, reverse)
