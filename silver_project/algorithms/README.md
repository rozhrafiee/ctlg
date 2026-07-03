# Algorithms package — Silver Project (Software Testing)

This module implements manual sorting and search algorithms for the cognitive test catalog.

## Algorithms

| File | Contents |
|------|----------|
| `sorting.py` | Bubble Sort, Merge Sort |
| `searching.py` | Linear Search, Binary Search |
| `catalog.py` | Combines search + sort for test lists |

## Running Tests

```bash
cd coglearning
pip install -r requirements.txt
python -m pytest algorithms/tests/ -v
python -m pytest algorithms/tests/ --cov=algorithms --cov-report=term-missing
```

## Mutation Testing (Chapter 9)

```bash
cd coglearning
mutmut run
mutmut results
mutmut html
```

## API Usage

```
GET /api/assessment/tests/?q=حافظه&sort_algo=bubble&search_algo=linear&sort_by=title&sort_order=asc
```

Response includes `results` (test list) and `catalog_meta` (algorithms used).

## Report Sections

- **ACOC** (Ch. 6): `test_coverage.py::test_acoc_*`
- **CFG Node/Edge/Prime Path** (Ch. 7): `TestNodeCoverage`, `TestEdgeCoverage`, `TestPrimePathCoverage`
- **Mutation** (Ch. 9): run `mutmut` on `sorting.py`, `searching.py`, `catalog.py`
