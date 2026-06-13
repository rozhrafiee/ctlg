"""
sorting_mutants.py — جهش‌های AOR برای sorting.py (فصل 9)

هر تابع یک کپی کامل از تابع اصلی است با دقیقاً یک تغییر حسابی.
خط تغییر یافته با # MUTANT علامت‌گذاری شده است.
"""
# توابع کمکی مستقیماً از ماژول اصلی import می‌شوند — کپی نمی‌شوند
from algorithms.sorting import _should_swap, _merge
from algorithms.utils import get_item_value


# ════════════════════════════════════════════════════════════════════
# bubble_sort — جهش‌های AOR روی محدوده حلقه داخلی:  n - i - 1
# ════════════════════════════════════════════════════════════════════

def bubble_sort_m01(items, key="title", reverse=False):
    """
    M-AOR-BS-01: n - i - 1  →  n + i - 1
    اثر: برای i>=1 محدوده حلقه داخلی از n-1 بزرگ‌تر می‌شود → IndexError
    وضعیت: KILLED (IndexError روی اولین پاس غیراول)
    """
    arr = list(items)
    n = len(arr)
    if n <= 1:
        return arr
    for i in range(n):
        swapped = False
        for j in range(0, n + i - 1):       # MUTANT: n + i - 1
            val_a = get_item_value(arr[j], key)
            val_b = get_item_value(arr[j + 1], key)
            if _should_swap(val_a, val_b, reverse):
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr


def bubble_sort_m02(items, key="title", reverse=False):
    """
    M-AOR-BS-02: n - i - 1  →  n - i + 1
    اثر: حلقه داخلی در اولین پاس (i=0) تا n بررسی می‌کند → arr[n] → IndexError
    وضعیت: KILLED (IndexError در اولین پاس)
    """
    arr = list(items)
    n = len(arr)
    if n <= 1:
        return arr
    for i in range(n):
        swapped = False
        for j in range(0, n - i + 1):       # MUTANT: n - i + 1
            val_a = get_item_value(arr[j], key)
            val_b = get_item_value(arr[j + 1], key)
            if _should_swap(val_a, val_b, reverse):
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr


def bubble_sort_m03(items, key="title", reverse=False):
    """
    M-AOR-BS-03: n - i - 1  →  n - i - 2
    اثر: حلقه داخلی یک مقایسه کمتر انجام می‌دهد؛ آخرین جفت هرگز مقایسه نمی‌شود
    برای n=4, i=0: range(0,2) به‌جای range(0,3)
    وضعیت: KILLED (خروجی مرتب نشده برای n>=3)
    """
    arr = list(items)
    n = len(arr)
    if n <= 1:
        return arr
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 2):       # MUTANT: n - i - 2
            val_a = get_item_value(arr[j], key)
            val_b = get_item_value(arr[j + 1], key)
            if _should_swap(val_a, val_b, reverse):
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr


def bubble_sort_m04(items, key="title", reverse=False):
    """
    M-AOR-BS-04: n - i - 1  →  n * i - 1
    اثر: برای i=0، محدوده range(0, -1) = [] → حلقه داخلی اصلاً اجرا نمی‌شود
          swapped=False → break فوری → لیست بدون مرتب‌سازی برمی‌گردد
    وضعیت: KILLED (هیچ مرتب‌سازی انجام نمی‌شود)
    """
    arr = list(items)
    n = len(arr)
    if n <= 1:
        return arr
    for i in range(n):
        swapped = False
        for j in range(0, n * i - 1):       # MUTANT: n * i - 1
            val_a = get_item_value(arr[j], key)
            val_b = get_item_value(arr[j + 1], key)
            if _should_swap(val_a, val_b, reverse):
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr


# ════════════════════════════════════════════════════════════════════
# merge_sort — جهش‌های AOR روی محاسبه mid:  n // 2
# ════════════════════════════════════════════════════════════════════

def merge_sort_m01(items, key="title", reverse=False):
    """
    M-AOR-MS-01: n // 2  →  n // 1  (= n)
    اثر: mid = n → arr[:n] = arr کل → بازگشت نامحدود (RecursionError)
    وضعیت: KILLED (RecursionError برای n>=2)
    """
    arr = list(items)
    n = len(arr)
    if n <= 1:
        return arr
    mid = n // 1                              # MUTANT: n // 1
    left = merge_sort_m01(arr[:mid], key=key, reverse=reverse)
    right = merge_sort_m01(arr[mid:], key=key, reverse=reverse)
    return _merge(left, right, key, reverse)


def merge_sort_m02(items, key="title", reverse=False):
    """
    M-AOR-MS-02: n // 2  →  n // 3
    اثر: برای n=2، mid=0 → arr[0:] = arr → بازگشت نامحدود (RecursionError)
    وضعیت: KILLED (RecursionError برای n>=2)
    """
    arr = list(items)
    n = len(arr)
    if n <= 1:
        return arr
    mid = n // 3                              # MUTANT: n // 3
    left = merge_sort_m02(arr[:mid], key=key, reverse=reverse)
    right = merge_sort_m02(arr[mid:], key=key, reverse=reverse)
    return _merge(left, right, key, reverse)


def merge_sort_m03(items, key="title", reverse=False):
    """
    M-AOR-MS-03: n // 2  →  (n + 1) // 2  (تقسیم سقفی به‌جای کفی)
    اثر: تقسیم کمی نامتعادل‌تر است اما هر دو نیمه غیرخالی باقی می‌مانند
          نتیجه نهایی مرتب‌سازی یکسان است.
    وضعیت: EQUIVALENT — خروجی برابر با تابع اصلی برای هر ورودی
    """
    arr = list(items)
    n = len(arr)
    if n <= 1:
        return arr
    mid = (n + 1) // 2                       # MUTANT: (n + 1) // 2
    left = merge_sort_m03(arr[:mid], key=key, reverse=reverse)
    right = merge_sort_m03(arr[mid:], key=key, reverse=reverse)
    return _merge(left, right, key, reverse)
