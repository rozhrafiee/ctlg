"""
searching_mutants.py — جهش‌های AOR برای searching.py (فصل 9)

هر تابع یک کپی کامل از binary_search است با دقیقاً یک تغییر حسابی.
خط تغییر یافته با # MUTANT علامت‌گذاری شده است.
"""
# get_item_value مستقیماً از ماژول اصلی import می‌شود — کپی نمی‌شود
from algorithms.utils import get_item_value


# ════════════════════════════════════════════════════════════════════
# binary_search — جهش‌های AOR روی محاسبه mid و حرکت left/right
# ════════════════════════════════════════════════════════════════════

def binary_search_m01(items, query, key="title"):
    """
    M-AOR-BN-01: (left + right) // 2  →  (left - right) // 2
    اثر: mid منفی می‌شود → ایندکس منفی پایتون → عنصر اشتباه یا -1 برمی‌گردد
    وضعیت: KILLED (خروجی اشتباه)
    """
    if not query or not items:
        return -1
    left, right = 0, len(items) - 1
    while left <= right:
        mid = (left - right) // 2            # MUTANT: - به‌جای +
        val = get_item_value(items[mid], key)
        if val == query:
            return mid
        if val < query:
            left = mid + 1
        else:
            right = mid - 1
    return -1


def binary_search_m02(items, query, key="title"):
    """
    M-AOR-BN-02: (left + right) // 2  →  (left + right) * 2
    اثر: mid = (0 + n-1)*2 بسیار بزرگ‌تر از اندیس مجاز → IndexError
    وضعیت: KILLED (IndexError)
    """
    if not query or not items:
        return -1
    left, right = 0, len(items) - 1
    while left <= right:
        mid = (left + right) * 2             # MUTANT: * به‌جای //
        val = get_item_value(items[mid], key)
        if val == query:
            return mid
        if val < query:
            left = mid + 1
        else:
            right = mid - 1
    return -1


def binary_search_m03(items, query, key="title"):
    """
    M-AOR-BN-03: (left + right) // 2  →  (left + right + 1) // 2  (تقسیم سقفی)
    اثر: تقسیم سقفی به‌جای کفی — هر دو پیاده‌سازی معتبر binary search هستند
          نتیجه نهایی برای هر جستجو یکسان است.
    وضعیت: EQUIVALENT — خروجی برابر با تابع اصلی
    """
    if not query or not items:
        return -1
    left, right = 0, len(items) - 1
    while left <= right:
        mid = (left + right + 1) // 2       # MUTANT: +1 اضافه
        val = get_item_value(items[mid], key)
        if val == query:
            return mid
        if val < query:
            left = mid + 1
        else:
            right = mid - 1
    return -1


def binary_search_m04(items, query, key="title"):
    """
    M-AOR-BN-04: left = mid + 1  →  left = mid - 1
    اثر: وقتی عنصر هدف در سمت راست mid است، جهش left را به چپ می‌برد.
          حالت پایدار: left=1,right=n-1,mid=1 → left=0 → تکرار بی‌نهایت
    وضعیت: KILLED (حلقه بی‌نهایت برای جستجوی عناصر سمت راست)
    """
    if not query or not items:
        return -1
    left, right = 0, len(items) - 1
    while left <= right:
        mid = (left + right) // 2
        val = get_item_value(items[mid], key)
        if val == query:
            return mid
        if val < query:
            left = mid - 1                   # MUTANT: - به‌جای +
        else:
            right = mid - 1
    return -1


def binary_search_m05(items, query, key="title"):
    """
    M-AOR-BN-05: right = mid - 1  →  right = mid + 1
    اثر: وقتی عنصر هدف در سمت چپ mid است، جهش right را به راست می‌برد.
          حالت پایدار: left=0,right=mid+1,mid=... → تکرار بی‌نهایت
    وضعیت: KILLED (حلقه بی‌نهایت برای جستجوی عناصر سمت چپ)
    """
    if not query or not items:
        return -1
    left, right = 0, len(items) - 1
    while left <= right:
        mid = (left + right) // 2
        val = get_item_value(items[mid], key)
        if val == query:
            return mid
        if val < query:
            left = mid + 1
        else:
            right = mid + 1                  # MUTANT: + به‌جای -
    return -1
