#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
demo.py — Cognitive Test Catalog

Receives sorting and searching preferences from the user
and performs the requested operations.

Usage:
    cd coglearning
    python -m algorithms.demo              # Interactive mode
    python -m algorithms.demo -q memory -s merge -r linear -f min_level
    python -m algorithms.demo --list       # Display all tests
    python -m algorithms.demo --help
"""

import sys
import os
import argparse
import io

# Set UTF-8 encoding for the Windows console
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# Support both execution modes:
#   python demo.py               (from the algorithms directory)
#   python -m algorithms.demo    (from the coglearning directory)
_pkg_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _pkg_root not in sys.path:
    sys.path.insert(0, _pkg_root)

from algorithms.catalog import process_catalog  # noqa: E402

# ── Sample Data (Cognitive Test Catalog) ─────────────────────────────────────

SAMPLE_CATALOG = [
    {
        "title": "Memory Test",
        "min_level": 10,
        "time_limit_minutes": 30,
        "description": "Measures short-term and working memory",
    },
    {
        "title": "Attention Test",
        "min_level": 5,
        "time_limit_minutes": 20,
        "description": "Focus, attention, and processing speed",
    },
    {
        "title": "Logic Test",
        "min_level": 15,
        "time_limit_minutes": 45,
        "description": "Logical reasoning and problem solving",
    },
    {
        "title": "Placement Test",
        "min_level": 1,
        "time_limit_minutes": 60,
        "description": "Initial placement assessment",
    },
    {
        "title": "Language Test",
        "min_level": 8,
        "time_limit_minutes": 25,
        "description": "Reading comprehension and verbal reasoning",
    },
    {
        "title": "Mathematics Test",
        "min_level": 12,
        "time_limit_minutes": 35,
        "description": "Quantitative and mathematical reasoning",
    },
]

# ── Display Utilities ────────────────────────────────────────────────────────

W = 60


def _hr(ch="─"):
    print(ch * W)


def _show_catalog(items):
    print()
    _hr()
    print(f"  {'#':>2}  {'Title':<20} {'Level':>5}  {'Time':>6}  Description")
    _hr("·")
    for i, item in enumerate(items, 1):
        print(
            f"  {i:>2}. {item['title']:<20} {item['min_level']:>5}"
            f"  {item['time_limit_minutes']:>5} min  {item['description']}"
        )
    _hr()


def _show_result(result):
    items = result["items"]
    meta = result["meta"]

    print()
    _hr()
    print(f"  Results: {meta['total_after']} of {meta['total_before']} items")
    print(
        f"  Sorting: {meta['sort_algorithm']}  |  "
        f"Searching: {meta['search_algorithm']}  |  "
        f"Field: {meta['sort_field']}  |  "
        f"Descending: {'Yes' if meta['reverse'] else 'No'}"
    )

    if meta["query"]:
        print(f"  Search query: \"{meta['query']}\"")

    _hr("·")

    if not items:
        print("  No matching results found.")
    else:
        print(f"  {'#':>2}  {'Title':<20} {'Level':>5}  {'Time':>6}")
        _hr("·")
        for i, item in enumerate(items, 1):
            print(
                f"  {i:>2}. {item['title']:<20} {item['min_level']:>5}"
                f"  {item['time_limit_minutes']:>5} min"
            )
    _hr()


# ── User Input ───────────────────────────────────────────────────────────────

def _ask(prompt, choices=None, default=None):
    choices_hint = f" [{'/'.join(choices)}]" if choices else ""
    default_hint = f" (default: {default})" if default is not None else ""

    while True:
        raw = input(f"  {prompt}{choices_hint}{default_hint}: ").strip()

        if not raw and default is not None:
            return default

        if choices and raw not in choices:
            print(f"    ⚠ Please enter one of the following values: {choices}")
            continue

        return raw


# ── Interactive Mode ─────────────────────────────────────────────────────────

def interactive_mode():
    print()
    print("=" * W)
    print("   Cognitive Test Catalog — User Preference Input")
    print("=" * W)

    print("\nAvailable tests:")
    _show_catalog(SAMPLE_CATALOG)

    print("\nPlease enter your preferences:\n")

    query = _ask(
        "Search text (leave empty to display all; exact match required for binary search)",
        default="",
    )

    sort_algo = _ask(
        "Sorting algorithm",
        choices=["bubble", "merge"],
        default="bubble",
    )

    search_algo = _ask(
        "Search algorithm (binary requires an exact match)",
        choices=["linear", "binary"],
        default="linear",
    )

    sort_field = _ask(
        "Sort field",
        choices=["title", "min_level", "time_limit_minutes"],
        default="title",
    )

    rev_str = _ask(
        "Sort in descending order?",
        choices=["y", "n"],
        default="n",
    )

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


# ── Command-Line Mode ────────────────────────────────────────────────────────

def cli_mode():
    parser = argparse.ArgumentParser(
        prog="python -m algorithms.demo",
        description="Cognitive Test Catalog — Command-line interface",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  python -m algorithms.demo\n"
            "  python -m algorithms.demo --list\n"
            "  python -m algorithms.demo -q memory\n"
            "  python -m algorithms.demo -q test -s merge -f min_level -d\n"
            "  python -m algorithms.demo -q 'Placement Test' -r binary -f title\n"
        ),
    )

    parser.add_argument(
        "-q", "--query",
        default="",
        metavar="TEXT",
        help="Search text (default: empty = show all items)",
    )

    parser.add_argument(
        "-s", "--sort-algo",
        default="bubble",
        choices=["bubble", "merge"],
        help="Sorting algorithm (default: bubble)",
    )

    parser.add_argument(
        "-r", "--search-algo",
        default="linear",
        choices=["linear", "binary"],
        help="Search algorithm (default: linear)",
    )

    parser.add_argument(
        "-f", "--sort-field",
        default="title",
        choices=["title", "min_level", "time_limit_minutes"],
        help="Sort field (default: title)",
    )

    parser.add_argument(
        "-d", "--reverse",
        action="store_true",
        help="Sort in descending order",
    )

    parser.add_argument(
        "--list",
        action="store_true",
        help="Display all tests without filtering",
    )

    args = parser.parse_args()

    if args.list:
        print("\nAvailable Tests:")
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


# ── Entry Point ──────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) == 1:
        interactive_mode()
    else:
        cli_mode()


if __name__ == "__main__":
    main()