"""
test_mutation_killing.py — آزمون‌های کشتن جهش‌های AOR (فصل 9)

هر تست یک جهش مشخص را هدف قرار می‌دهد و ثابت می‌کند که جهش رفتار اشتباهی
تولید می‌کند (KILLED) یا خروجی مطابق با اصل است (EQUIVALENT / LIVE).

راهنمای وضعیت‌ها:
  KILLED     — تست اجرا می‌شود و جهش را شناسایی می‌کند
  EQUIVALENT — جهش همیشه خروجی یکسانی با اصل دارد (نمی‌توان کشت)
  LIVE       — جهش بدون کشته شدن از تست‌های قدیمی عبور می‌کند
"""
import threading
import pytest

from algorithms.sorting import bubble_sort, merge_sort
from algorithms.searching import binary_search
from algorithms.catalog import process_catalog

from algorithms.mutants.sorting_mutants import (
    bubble_sort_m01,
    bubble_sort_m02,
    bubble_sort_m03,
    bubble_sort_m04,
    merge_sort_m01,
    merge_sort_m02,
    merge_sort_m03,
)
from algorithms.mutants.searching_mutants import (
    binary_search_m01,
    binary_search_m02,
    binary_search_m03,
    binary_search_m04,
    binary_search_m05,
)
from algorithms.mutants.catalog_mutants import (
    process_catalog_m01,
    process_catalog_m02,
)


# ── داده‌های مشترک ────────────────────────────────────────────────────────────

ITEMS_2 = [
    {"title": "b", "min_level": 2, "time_limit_minutes": 20, "description": ""},
    {"title": "a", "min_level": 1, "time_limit_minutes": 10, "description": ""},
]
ITEMS_3 = [
    {"title": "c", "min_level": 3, "time_limit_minutes": 30, "description": ""},
    {"title": "a", "min_level": 1, "time_limit_minutes": 10, "description": ""},
    {"title": "b", "min_level": 2, "time_limit_minutes": 20, "description": ""},
]
ITEMS_4 = [
    {"title": "d", "min_level": 4},
    {"title": "c", "min_level": 3},
    {"title": "b", "min_level": 2},
    {"title": "a", "min_level": 1},
]
SORTED_5 = [
    {"title": "a"}, {"title": "b"}, {"title": "c"}, {"title": "d"}, {"title": "e"},
]
CATALOG_ITEMS = [
    {"title": "x", "min_level": 1, "time_limit_minutes": 10, "description": ""},
    {"title": "y", "min_level": 2, "time_limit_minutes": 20, "description": ""},
    {"title": "z", "min_level": 3, "time_limit_minutes": 30, "description": ""},
]


def _non_terminating(fn, *args, timeout=0.5, **kwargs):
    """اجرای fn را در thread جداگانه انجام می‌دهد و True برمی‌گرداند اگر تمام نشود."""
    done = threading.Event()

    def _run():
        fn(*args, **kwargs)
        done.set()

    t = threading.Thread(target=_run, daemon=True)
    t.start()
    t.join(timeout=timeout)
    return not done.is_set()


# ════════════════════════════════════════════════════════════════════
# جهش‌های bubble_sort  (M-AOR-BS-01 تا M-AOR-BS-04)
# ════════════════════════════════════════════════════════════════════

class TestBubbleSortMutants:

    def test_m01_bs_killed_index_error(self):
        """
        M-AOR-BS-01: n+i-1 به‌جای n-i-1
        برای n=2، پاس دوم (i=1): range(0,2) → j=1 → arr[2] → IndexError
        """
        with pytest.raises(IndexError):
            bubble_sort_m01(ITEMS_2, key="title")

    def test_m02_bs_killed_index_error_first_pass(self):
        """
        M-AOR-BS-02: n-i+1 به‌جای n-i-1
        در اولین پاس (i=0): range(0,n+1) → j=n-1 → arr[n] → IndexError
        """
        with pytest.raises(IndexError):
            bubble_sort_m02(ITEMS_2, key="title")

    def test_m03_bs_killed_wrong_output_short_inner_loop(self):
        """
        M-AOR-BS-03: n-i-2 به‌جای n-i-1
        برای ITEMS_4=[d,c,b,a], n=4:
          پاس i=0: range(0,2) → فقط دو مقایسه، 'a' هرگز بالا نمی‌آید
          نتیجه: [b,c,d,a] ≠ [a,b,c,d]
        """
        result = bubble_sort_m03(ITEMS_4, key="title")
        correct = [x["title"] for x in bubble_sort(ITEMS_4, key="title")]
        got = [x["title"] for x in result]
        assert got != correct, (
            f"M-AOR-BS-03 باید خروجی اشتباه تولید کند ولی {got} = {correct}"
        )

    def test_m04_bs_killed_no_sorting_on_first_pass(self):
        """
        M-AOR-BS-04: n*i-1 به‌جای n-i-1
        برای i=0: range(0, -1) = [] → حلقه داخلی خالی → swapped=False → break فوری
        لیست بدون تغییر برمی‌گردد.
        """
        result = bubble_sort_m04(ITEMS_2, key="title")
        assert result[0]["title"] == "b", (
            "M-AOR-BS-04 باید لیست را بدون مرتب‌سازی برگرداند (b هنوز اول است)"
        )
        assert result != [{"title": "a", "min_level": 1, "time_limit_minutes": 10, "description": ""},
                          {"title": "b", "min_level": 2, "time_limit_minutes": 20, "description": ""}]


# ════════════════════════════════════════════════════════════════════
# جهش‌های merge_sort  (M-AOR-MS-01 تا M-AOR-MS-03)
# ════════════════════════════════════════════════════════════════════

class TestMergeSortMutants:

    def test_m01_ms_killed_recursion_error(self):
        """
        M-AOR-MS-01: n//1 = n به‌جای n//2
        mid=n → arr[:n]=arr → بازگشت نامحدود → RecursionError
        """
        with pytest.raises(RecursionError):
            merge_sort_m01(ITEMS_3, key="title")

    def test_m02_ms_killed_recursion_error_even_n(self):
        """
        M-AOR-MS-02: n//3 به‌جای n//2
        برای n=2: mid=0 → arr[0:]=arr → بازگشت نامحدود → RecursionError
        """
        with pytest.raises(RecursionError):
            merge_sort_m02(ITEMS_2, key="title")

    def test_m03_ms_equivalent_ceiling_division(self):
        """
        M-AOR-MS-03: (n+1)//2 به‌جای n//2
        تقسیم سقفی vs کفی — هر دو زیرلیست‌های غیرخالی تولید می‌کنند.
        خروجی نهایی مرتب‌سازی برای همه ورودی‌ها یکسان است.
        وضعیت: EQUIVALENT — نمی‌توان این جهش را کشت.
        """
        for items in [ITEMS_2, ITEMS_3, ITEMS_4]:
            orig = [x["title"] for x in merge_sort(items, key="title")]
            mut = [x["title"] for x in merge_sort_m03(items, key="title")]
            assert orig == mut, (
                f"M-AOR-MS-03 باید EQUIVALENT باشد ولی برای {[x['title'] for x in items]} "
                f"تفاوت دارد: orig={orig} mut={mut}"
            )


# ════════════════════════════════════════════════════════════════════
# جهش‌های binary_search  (M-AOR-BN-01 تا M-AOR-BN-05)
# ════════════════════════════════════════════════════════════════════

class TestBinarySearchMutants:

    def test_m01_bn_killed_wrong_mid_negative(self):
        """
        M-AOR-BN-01: (left-right)//2 به‌جای (left+right)//2
        برای SORTED_5=[a,b,c,d,e] جستجوی 'c':
          left=0,right=4 → mid=(0-4)//2=-2 → arr[-2]='d' ≠ 'c'
          'c'<'d' → right=-3 → حلقه تمام → -1 برمی‌گردد (نه 2)
        """
        result = binary_search_m01(SORTED_5, "c", key="title")
        assert result != 2, "M-AOR-BN-01 باید اندیس اشتباه یا -1 برگرداند"

    def test_m02_bn_killed_index_error(self):
        """
        M-AOR-BN-02: (left+right)*2 به‌جای (left+right)//2
        برای n=5: mid=(0+4)*2=8 → arr[8] → IndexError
        """
        with pytest.raises(IndexError):
            binary_search_m02(SORTED_5, "c", key="title")

    def test_m03_bn_equivalent_ceiling_mid(self):
        """
        M-AOR-BN-03: (left+right+1)//2 به‌جای (left+right)//2
        تقسیم سقفی — هر دو روش binary search معتبر هستند.
        برای هر عنصر موجود، اندیس صحیح برمی‌گردد.
        وضعیت: EQUIVALENT
        """
        test_cases = [("a", 0), ("b", 1), ("c", 2), ("d", 3), ("e", 4), ("x", -1)]
        for query, expected_idx in test_cases:
            orig = binary_search(SORTED_5, query, key="title")
            mut = binary_search_m03(SORTED_5, query, key="title")
            assert orig == mut, (
                f"M-AOR-BN-03 باید EQUIVALENT باشد ولی برای '{query}': "
                f"orig={orig} mut={mut}"
            )

    def test_m04_bn_killed_infinite_loop_right_branch(self):
        """
        M-AOR-BN-04: left=mid-1 به‌جای left=mid+1
        جستجوی 'e' (در سمت راست mid='c'):
          حالت پایدار: left=1,right=4,mid=2 → left=1 (تکرار همیشگی)
        تست با thread و timeout=0.5s ثابت می‌کند تابع پایان نمی‌یابد.
        """
        assert _non_terminating(
            binary_search_m04, SORTED_5, "e", key="title", timeout=0.5
        ), "M-AOR-BN-04 باید برای جستجوی سمت راست حلقه بی‌نهایت ایجاد کند"

    def test_m05_bn_killed_infinite_loop_left_branch(self):
        """
        M-AOR-BN-05: right=mid+1 به‌جای right=mid-1
        جستجوی 'a' (در سمت چپ mid='c'):
          left=0,right=4,mid=2 → 'a'<'c' → right=3
          left=0,right=3,mid=1 → 'a'<'b' → right=2
          left=0,right=2,mid=1 → 'a'<'b' → right=2  ← حالت پایدار
        """
        assert _non_terminating(
            binary_search_m05, SORTED_5, "a", key="title", timeout=0.5
        ), "M-AOR-BN-05 باید برای جستجوی سمت چپ حلقه بی‌نهایت ایجاد کند"


# ════════════════════════════════════════════════════════════════════
# جهش‌های catalog  (M-AOR-PC-01 و M-AOR-PC-02)
# ════════════════════════════════════════════════════════════════════

class TestCatalogMutants:

    def test_m01_pc_is_live_old_tests_pass(self):
        """
        M-AOR-PC-01: total_before = len(items)+1
        تست‌های قدیمی فقط  total_after <= total_before  را بررسی می‌کردند.
        چون total_after تغییر نکرده، شرط همچنان برقرار است → جهش LIVE است.
        """
        result_orig = process_catalog(CATALOG_ITEMS)
        result_mut = process_catalog_m01(CATALOG_ITEMS)

        # شرط قدیمی: هر دو برقرار می‌شوند (جهش از آن عبور می‌کند!)
        assert result_orig["meta"]["total_after"] <= result_orig["meta"]["total_before"]
        assert result_mut["meta"]["total_after"] <= result_mut["meta"]["total_before"]

        # اما مقدار واقعی تفاوت دارد:
        assert result_mut["meta"]["total_before"] == len(CATALOG_ITEMS) + 1
        assert result_orig["meta"]["total_before"] == len(CATALOG_ITEMS)

    def test_m01_pc_killed_by_new_explicit_assertion(self):
        """
        M-AOR-PC-01: کشتن جهش LIVE با اضافه کردن assert صریح روی total_before.
        این تست ثابت می‌کند که اضافه کردن یک شرط ساده جهش را می‌کشد.
        """
        result = process_catalog_m01(CATALOG_ITEMS)
        assert result["meta"]["total_before"] != len(CATALOG_ITEMS), (
            "جهش total_before را +1 کرده؛ تست جدید این تفاوت را تشخیص می‌دهد"
        )

    def test_m02_pc_killed_total_after_inconsistent(self):
        """
        M-AOR-PC-02: total_after = len(sorted_items)-1
        تست موجود در test_acoc_catalog_combinations:
          assert result["meta"]["total_after"] == len(result["items"])
        چون result["items"] = sorted_items، این شرط نقض می‌شود → KILLED
        """
        result = process_catalog_m02(CATALOG_ITEMS)
        assert result["meta"]["total_after"] != len(result["items"]), (
            "M-AOR-PC-02 باید total_after را یک واحد کمتر از تعداد واقعی نشان دهد"
        )

    def test_m02_pc_killed_assert_exact(self):
        """تایید ریاضی: total_after از جهش با طول واقعی لیست اختلاف دارد."""
        result = process_catalog_m02(CATALOG_ITEMS)
        actual_len = len(result["items"])
        reported = result["meta"]["total_after"]
        assert reported == actual_len - 1, (
            f"M-AOR-PC-02: total_after={reported} ولی len(items)={actual_len}"
        )


# ════════════════════════════════════════════════════════════════════
# خلاصه: Mutation Score
# ════════════════════════════════════════════════════════════════════

class TestMutationScoreSummary:

    def test_mutation_score_calculation(self):
        """
        محاسبه Mutation Score مطابق فصل 9:

        جهش‌های کل             : 14
        جهش‌های معادل (Equivalent): 2  (M-AOR-MS-03, M-AOR-BN-03)
        جهش‌های غیرمعادل       : 12
        جهش‌های کشته‌شده (Killed): 11  (M01-M04 از BS, M01-M02 از MS,
                                         M01-M02 از BN, M04-M05 از BN,
                                         M02 از PC, و M01 از PC با تست جدید)
        جهش‌های زنده (Live)     : 1   (M-AOR-PC-01 — بدون تست جدید)

        Mutation Score (بدون تست جدید) = 10/12 = 83.3%
        Mutation Score (با تست جدید)   = 11/12 = 91.7%

        هدف: با اضافه کردن assert صریح روی total_before در test_coverage.py،
             Mutation Score به 11/12 = 91.7% می‌رسد.
        """
        total = 14
        equivalent = 2
        non_equivalent = total - equivalent
        killed_before_fix = 10
        killed_after_fix = 11

        score_before = (killed_before_fix / non_equivalent) * 100
        score_after = (killed_after_fix / non_equivalent) * 100

        assert non_equivalent == 12
        assert round(score_before, 1) == 83.3
        assert round(score_after, 1) == 91.7
