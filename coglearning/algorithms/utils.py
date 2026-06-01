"""Shared helpers for algorithm modules."""


def get_item_value(item, key):
    """Extract a comparable value from a dict or model instance."""
    if isinstance(item, dict):
        return item.get(key, "")
    return getattr(item, key, "")
