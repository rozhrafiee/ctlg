#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
demo.py — کاتالوگ آزمون‌های شناختی
دریافت ترجیحات مرتب‌سازی و جستجو از ورودی کاربر و اجرای عملیات مربوطه

اجرا:
    cd coglearning
    python -m algorithms.demo              # حالت تعاملی (interactive)
    python -m algorithms.demo -q حافظه -s merge -r linear -f min_level
    python -m algorithms.demo --list       # نمایش همه آزمون‌ها
    python -m algorithms.demo --help
"""
import sys
import os
import argparse
import io

# تنظیم کدگذاری UTF-8 برای کنسول ویندوز
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# پشتیبانی از هر دو حالت اجرا:
#   python demo.py         (از دایرکتوری algorithms)
#   python -m algorithms.demo  (از دایرکتوری coglearning)
_pkg_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _pkg_root not in sys.path:
    sys.path.insert(0, _pkg_root)

from algorithms.catalog import process_catalog  # noqa: E402

# ── داده‌های نمونه (کاتالوگ آزمون‌های شناختی) ────────────────────────────────

SAMPLE_CATALOG = [
    {
        "title": "آزمون حافظه",
        "min_level": 10,
        "time_limit_minutes": 30,
        "description": "سنجش حافظه کوتاه‌مدت و کاری",
    },
    {
        "title": "آزمون تمرکز",
        "min_level": 5,
        "time_limit_minutes": 20,
        "description": "تمرکز، توجه و پردازش سریع",
    },
    {
        "title": "آزمون منطق",
        "min_level": 15,
        "time_limit_minutes": 45,
        "description": "استدلال منطقی و حل مسئله",
    },
    {
        "title": "تعیین سطح",
        "min_level": 1,
        "time_limit_minutes": 60,
        "description": "آزمون تعیین سطح اولیه (placement test)",
    },
    {
        "title": "آزمون زبان",
        "min_level": 8,
        "time_limit_minutes": 25,
        "description": "درک مطلب و استدلال زبانی",
    },
    {
        "title": "آزمون ریاضی",
        "min_level": 12,
        "time_limit_minutes": 35,
        "description": "استدلال کمی و ریاضی",
    },
]

# ── ابزارهای نمایش ────────────────────────────────────────────────────────────

W = 60


def _hr(ch="─"):
    print(ch * W)


def _show_catalog(items):
    print()
    _hr()
    print(f"  {'#':>2}  {'عنوان':<20} {'سطح':>5}  {'زمان':>6}  توضیح")
    _hr("·")
    for i, item in enumerate(items, 1):
        print(
            f"  {i:>2}. {item['title']:<20} {item['min_level']:>5}"
            f"  {item['time_limit_minutes']:>5}د  {item['description']}"
        )
    _hr()


def _show_result(result):
    items = result["items"]
    meta = result["meta"]
    print()
    _hr()
    print(f"  نتایج: {meta['total_after']} مورد از {meta['total_before']} مورد")
    print(f"  مرتب‌سازی : {meta['sort_algorithm']}  |  "
          f"جستجو: {meta['search_algorithm']}  |  "
          f"فیلد: {meta['sort_field']}  |  "
          f"نزولی: {'بله' if meta['reverse'] else 'خیر'}")
    if meta["query"]:
        print(f"  عبارت جستجو: «{meta['query']}»")
    _hr("·")
    if not items:
        print("  هیچ نتیجه‌ای یافت نشد.")
    else:
        print(f"  {'#':>2}  {'عنوان':<20} {'سطح':>5}  {'زمان':>6}")
        _hr("·")
        for i, item in enumerate(items, 1):
            print(f"  {i:>2}. {item['title']:<20} {item['min_level']:>5}"
                  f"  {item['time_limit_minutes']:>5}د")
    _hr()


# ── دریافت ورودی از کاربر ─────────────────────────────────────────────────────

def _ask(prompt, choices=None, default=None):
    choices_hint = f" [{'/'.join(choices)}]" if choices else ""
    default_hint = f"  (پیش‌فرض: {default})" if default is not None else ""
    while True:
        raw = input(f"  {prompt}{choices_hint}{default_hint}: ").strip()
        if not raw and default is not None:
            return default
        if choices and raw not in choices:
            print(f"    ⚠  لطفاً یکی از مقادیر {choices} را وارد کنید.")
            continue
        return raw


# ── حالت تعاملی ──────────────────────────────────────────────────────────────

def interactive_mode():
    print()
    print("=" * W)
    print("   کاتالوگ آزمون‌های شناختی — دریافت ترجیحات از ورودی")
    print("=" * W)
    print("\nآزمون‌های موجود در سامانه:")
    _show_catalog(SAMPLE_CATALOG)

    print("\nلطفاً ترجیحات خود را وارد کنید:\n")
    query = _ask(
        "متن جستجو (خالی برای نمایش همه — برای binary search دقیق وارد کنید)",
        default="",
    )
    sort_algo = _ask(
        "الگوریتم مرتب‌سازی",
        choices=["bubble", "merge"],
        default="bubble",
    )
    search_algo = _ask(
        "الگوریتم جستجو (binary نیازمند تطابق دقیق است)",
        choices=["linear", "binary"],
        default="linear",
    )
    sort_field = _ask(
        "فیلد مرتب‌سازی",
        choices=["title", "min_level", "time_limit_minutes"],
        default="title",
    )
    rev_str = _ask("ترتیب نزولی؟", choices=["y", "n"], default="n")
    reverse = rev_str == "y"

    result = process_catalog(
        SAMPLE_CATALOG,
        query=query,
        sort_algo=sort_algo,
        search_algo=search_algo,
        sort_field=sort_field,
        reverse=reverse,
    )
    _show_result(result)


# ── حالت خط فرمان ────────────────────────────────────────────────────────────

def cli_mode():
    parser = argparse.ArgumentParser(
        prog="python -m algorithms.demo",
        description="کاتالوگ آزمون‌های شناختی — دریافت ترجیحات از خط فرمان",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "مثال‌ها:\n"
            "  python -m algorithms.demo\n"
            "  python -m algorithms.demo --list\n"
            "  python -m algorithms.demo -q حافظه\n"
            "  python -m algorithms.demo -q آزمون -s merge -f min_level -d\n"
            "  python -m algorithms.demo -q 'تعیین سطح' -r binary -f title\n"
        ),
    )
    parser.add_argument(
        "-q", "--query", default="", metavar="TEXT",
        help="متن جستجو (پیش‌فرض: خالی = همه موارد)",
    )
    parser.add_argument(
        "-s", "--sort-algo", default="bubble", choices=["bubble", "merge"],
        help="الگوریتم مرتب‌سازی (پیش‌فرض: bubble)",
    )
    parser.add_argument(
        "-r", "--search-algo", default="linear", choices=["linear", "binary"],
        help="الگوریتم جستجو (پیش‌فرض: linear)",
    )
    parser.add_argument(
        "-f", "--sort-field", default="title",
        choices=["title", "min_level", "time_limit_minutes"],
        help="فیلد مرتب‌سازی (پیش‌فرض: title)",
    )
    parser.add_argument(
        "-d", "--reverse", action="store_true",
        help="مرتب‌سازی نزولی",
    )
    parser.add_argument(
        "--list", action="store_true",
        help="نمایش همه آزمون‌ها بدون فیلتر",
    )
    args = parser.parse_args()

    if args.list:
        print("\nهمه آزمون‌های موجود:")
        _show_catalog(SAMPLE_CATALOG)
        return

    result = process_catalog(
        SAMPLE_CATALOG,
        query=args.query,
        sort_algo=args.sort_algo,
        search_algo=args.search_algo,
        sort_field=args.sort_field,
        reverse=args.reverse,
    )
    _show_result(result)


# ── نقطه ورود ────────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) == 1:
        interactive_mode()
    else:
        cli_mode()


if __name__ == "__main__":
    main()
