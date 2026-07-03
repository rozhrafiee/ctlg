import pytest

from algorithms.sorting import bubble_sort, merge_sort
from algorithms.searching import linear_search, binary_search
from algorithms.catalog import process_catalog, get_item_value


# --- fixtures ---

@pytest.fixture
def sample_items():
    return [
        {"title": "آزمون حافظه", "min_level": 10, "time_limit_minutes": 30, "description": "تست حافظه"},
        {"title": "آزمون تمرکز", "min_level": 5, "time_limit_minutes": 20, "description": "تست تمرکز"},
        {"title": "آزمون منطق", "min_level": 15, "time_limit_minutes": 45, "description": "تست منطق"},
        {"title": "تعیین سطح", "min_level": 1, "time_limit_minutes": 60, "description": "placement"},
    ]


# --- ACOC: All Combinations (Chapter 6) ---

SIZE_VALUES = [[], [{"title": "a", "min_level": 1}], [{"title": "b", "min_level": 2}, {"title": "a", "min_level": 1}]]
ORDER_VALUES = ["sorted", "reverse", "random"]
SORT_FIELD_VALUES = ["title", "min_level", "time_limit_minutes"]
SORT_ALGO_VALUES = ["bubble", "merge"]
QUERY_VALUES = ["", "آزمون", "ناموجود"]
SEARCH_ALGO_VALUES = ["linear", "binary"]


def _ordered_items(order, base=None):
    base = base or [
        {"title": "c", "min_level": 3, "time_limit_minutes": 30, "description": ""},
        {"title": "a", "min_level": 1, "time_limit_minutes": 10, "description": ""},
        {"title": "b", "min_level": 2, "time_limit_minutes": 20, "description": ""},
    ]
    if order == "sorted":
        return sorted(base, key=lambda x: x["title"])
    if order == "reverse":
        return sorted(base, key=lambda x: x["title"], reverse=True)
    return base


@pytest.mark.parametrize("size", SIZE_VALUES)
@pytest.mark.parametrize("order", ORDER_VALUES)
@pytest.mark.parametrize("sort_field", SORT_FIELD_VALUES)
@pytest.mark.parametrize("sort_algo", SORT_ALGO_VALUES)
@pytest.mark.parametrize("query", QUERY_VALUES)
@pytest.mark.parametrize("search_algo", SEARCH_ALGO_VALUES)
def test_acoc_catalog_combinations(size, order, sort_field, sort_algo, query, search_algo):
    """ACOC — all parameter combinations for catalog processing."""
    if size == []:
        items = []
    elif len(size) <= 2:
        items = list(size)
    else:
        items = _ordered_items(order)

    result = process_catalog(
        items,
        query=query,
        sort_algo=sort_algo,
        search_algo=search_algo,
        sort_field=sort_field,
        reverse=False,
    )
    assert "items" in result
    assert "meta" in result
    assert result["meta"]["total_after"] == len(result["items"])
    assert result["meta"]["total_after"] <= result["meta"]["total_before"]
    # این assertion جهش LIVE یعنی M-AOR-PC-01 را می‌کشد:
    assert result["meta"]["total_before"] == len(items)


@pytest.mark.parametrize("sort_algo", SORT_ALGO_VALUES)
@pytest.mark.parametrize("sort_field", SORT_FIELD_VALUES)
def test_acoc_sort_produces_ordered_output(sort_algo, sort_field, sample_items):
    result = process_catalog(sample_items, sort_algo=sort_algo, sort_field=sort_field)
    items = result["items"]
    for i in range(len(items) - 1):
        a = get_item_value(items[i], sort_field)
        b = get_item_value(items[i + 1], sort_field)
        assert a <= b


# --- CFG: Node / Edge / Prime Path targeted tests (Chapter 7) ---

class TestNodeCoverage:
    """Tests targeting each major node in sorting/searching/catalog."""

    def test_bubble_empty_list(self):
        assert bubble_sort([]) == []

    def test_bubble_single_element(self):
        assert bubble_sort([{"title": "x", "min_level": 1}]) == [{"title": "x", "min_level": 1}]

    def test_bubble_already_sorted(self):
        items = [{"title": "a"}, {"title": "b"}, {"title": "c"}]
        assert bubble_sort(items, key="title") == items

    def test_bubble_reverse_sorted(self):
        items = [{"title": "c"}, {"title": "b"}, {"title": "a"}]
        assert bubble_sort(items, key="title")[0]["title"] == "a"

    def test_merge_empty(self):
        assert merge_sort([]) == []

    def test_merge_single(self):
        assert merge_sort([{"title": "z"}]) == [{"title": "z"}]

    def test_merge_multiple(self):
        items = [{"title": "c"}, {"title": "a"}, {"title": "b"}]
        sorted_items = merge_sort(items, key="title")
        assert [x["title"] for x in sorted_items] == ["a", "b", "c"]

    def test_linear_empty_query(self, sample_items):
        assert linear_search(sample_items, "") == list(range(len(sample_items)))

    def test_linear_match_found(self, sample_items):
        indices = linear_search(sample_items, "حافظه")
        assert len(indices) >= 1

    def test_linear_no_match(self, sample_items):
        assert linear_search(sample_items, "xyz_not_found") == []

    def test_binary_found(self):
        items = [{"title": "a"}, {"title": "b"}, {"title": "c"}]
        assert binary_search(items, "b", key="title") == 1

    def test_binary_not_found(self):
        items = [{"title": "a"}, {"title": "c"}]
        assert binary_search(items, "b", key="title") == -1

    def test_binary_empty_query(self, sample_items):
        assert binary_search(sample_items, "") == -1

    def test_catalog_invalid_algo_defaults(self, sample_items):
        result = process_catalog(sample_items, sort_algo="invalid", search_algo="invalid")
        assert result["meta"]["sort_algorithm"] == "bubble"
        assert result["meta"]["search_algorithm"] == "linear"


class TestEdgeCoverage:
    """Tests targeting each edge (branch transition) in control flow."""

    def test_bubble_swap_branch_taken(self):
        items = [{"title": "b"}, {"title": "a"}]
        result = bubble_sort(items, key="title")
        assert result[0]["title"] == "a"

    def test_bubble_swap_branch_not_taken(self):
        items = [{"title": "a"}, {"title": "b"}]
        result = bubble_sort(items, key="title")
        assert result == items

    def test_bubble_early_exit_no_swaps(self):
        items = [{"title": "a"}, {"title": "b"}, {"title": "c"}]
        result = bubble_sort(items, key="title")
        assert result == items

    def test_bubble_reverse_true_branch(self):
        items = [{"title": "a"}, {"title": "c"}, {"title": "b"}]
        result = bubble_sort(items, key="title", reverse=True)
        assert result[0]["title"] == "c"

    def test_binary_left_branch(self):
        items = [{"title": "a"}, {"title": "c"}, {"title": "e"}]
        assert binary_search(items, "a", key="title") == 0

    def test_binary_right_branch(self):
        items = [{"title": "a"}, {"title": "c"}, {"title": "e"}]
        assert binary_search(items, "e", key="title") == 2

    def test_binary_mid_branch(self):
        items = [{"title": "a"}, {"title": "c"}, {"title": "e"}]
        assert binary_search(items, "c", key="title") == 1

    def test_catalog_binary_search_path(self, sample_items):
        result = process_catalog(sample_items, query="آزمون منطق", search_algo="binary", sort_field="title")
        assert result["meta"]["search_algorithm"] == "binary"

    def test_catalog_linear_search_path(self, sample_items):
        result = process_catalog(sample_items, query="آزمون", search_algo="linear")
        assert result["meta"]["total_after"] >= 1


class TestPrimePathCoverage:
    """Tests for prime paths through nested loops and recursion."""

    def test_bubble_full_outer_inner_loop(self):
        items = [{"title": "d"}, {"title": "c"}, {"title": "b"}, {"title": "a"}]
        result = bubble_sort(items, key="title")
        assert [x["title"] for x in result] == ["a", "b", "c", "d"]

    def test_merge_recursive_divide(self):
        items = [{"title": f"t{i}"} for i in [5, 3, 1, 4, 2]]
        result = merge_sort(items, key="title")
        titles = [x["title"] for x in result]
        assert titles == sorted(titles)

    def test_merge_left_and_right_remainders(self):
        items = [{"title": "m"}, {"title": "a"}, {"title": "z"}]
        result = merge_sort(items, key="title")
        assert [x["title"] for x in result] == ["a", "m", "z"]

    def test_binary_search_loop_multiple_iterations(self):
        items = [{"title": chr(c)} for c in range(ord("a"), ord("z") + 1)]
        idx = binary_search(items, "m", key="title")
        assert idx == ord("m") - ord("a")

    def test_catalog_full_pipeline_search_then_sort(self, sample_items):
        result = process_catalog(
            sample_items,
            query="آزمون",
            sort_algo="merge",
            search_algo="linear",
            sort_field="min_level",
            reverse=True,
        )
        items = result["items"]
        for i in range(len(items) - 1):
            assert get_item_value(items[i], "min_level") >= get_item_value(items[i + 1], "min_level")

    def test_linear_search_multiple_fields(self):
        items = [{"title": "x", "description": "حافظه"}, {"title": "y", "description": "other"}]
        assert linear_search(items, "حافظه") == [0]
