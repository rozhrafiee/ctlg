# -*- coding: utf-8 -*-
"""Export CFG diagrams as PNG for PowerPoint."""
from pathlib import Path
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, Polygon, FancyArrowPatch

ASSETS = Path(__file__).resolve().parents[1] / "cognitive-frontend" / "public" / "pptx_assets"
ASSETS.mkdir(parents=True, exist_ok=True)

# Pastel palette
C_PINK = "#f9a8d4"
C_PURPLE = "#c4b5fd"
C_LAV = "#ede9fe"
C_GREEN = "#bbf7d0"
C_BLUE = "#bfdbfe"
C_YELLOW = "#fef08a"
C_RET = "#e9d5ff"
C_TEXT = "#581c87"
C_EDGE_T = "#16a34a"
C_EDGE_F = "#dc2626"


def _save(fig, name):
    path = ASSETS / name
    fig.savefig(path, dpi=160, bbox_inches="tight", facecolor="#fdf2f8", edgecolor="none")
    plt.close(fig)
    return path


def draw_box(ax, x, y, w, h, text, color, fs=8):
    box = FancyBboxPatch((x - w / 2, y - h / 2), w, h, boxstyle="round,pad=0.02",
                         facecolor=color, edgecolor="#a855f7", linewidth=1.2)
    ax.add_patch(box)
    ax.text(x, y, text, ha="center", va="center", fontsize=fs, color=C_TEXT, wrap=True)


def draw_diamond(ax, x, y, w, h, text, fs=7):
    pts = [(x, y + h / 2), (x + w / 2, y), (x, y - h / 2), (x - w / 2, y)]
    ax.add_patch(Polygon(pts, facecolor=C_YELLOW, edgecolor="#f59e0b", linewidth=1.2))
    ax.text(x, y, text, ha="center", va="center", fontsize=fs, color=C_TEXT)


def arrow(ax, x1, y1, x2, y2, color="#7c3aed", label=None):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="-|>", color=color, lw=1.5))
    if label:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        ax.text(mx, my + 0.08, label, fontsize=7, ha="center", color=color, fontweight="bold")


def export_bubble_sort():
    fig, ax = plt.subplots(figsize=(8, 6))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis("off")
    ax.set_facecolor("#fdf2f8")
    fig.patch.set_facecolor("#fdf2f8")
    draw_box(ax, 5, 9.2, 2.2, 0.5, "BS1: start", C_GREEN, 9)
    draw_diamond(ax, 5, 8.2, 1.8, 0.7, "BS2\nn<=1?", 8)
    draw_box(ax, 5, 7.0, 2.0, 0.5, "BS3: return", C_RET, 8)
    draw_box(ax, 5, 5.8, 2.4, 0.5, "BS4: for i", C_BLUE, 8)
    draw_diamond(ax, 5, 4.7, 1.8, 0.7, "BS6\nj<n-i-1?", 7)
    draw_diamond(ax, 5, 3.5, 1.8, 0.7, "BS7\nswap?", 7)
    draw_diamond(ax, 5, 2.2, 1.8, 0.7, "BS9\n!swapped?", 7)
    draw_box(ax, 5, 1.0, 2.0, 0.5, "BS10: return", C_RET, 8)
    arrow(ax, 5, 8.95, 5, 8.55)
    arrow(ax, 5, 7.85, 5, 7.25, C_EDGE_T, "T")
    arrow(ax, 4.1, 8.2, 2.5, 8.2, C_EDGE_F, "F")
    arrow(ax, 2.5, 8.2, 2.5, 6.1)
    arrow(ax, 2.5, 6.1, 3.8, 6.1)
    arrow(ax, 5, 7.75, 5, 6.05)
    arrow(ax, 5, 5.55, 5, 5.05)
    arrow(ax, 5, 4.35, 5, 3.85)
    arrow(ax, 5, 3.15, 5, 2.55)
    arrow(ax, 5, 1.85, 5, 1.25)
    ax.text(5, 0.3, "bubble_sort — sorting.py", ha="center", fontsize=10, color="#be185d", fontweight="bold")
    return _save(fig, "cfg_bubble_sort.png")


def export_linear_search():
    fig, ax = plt.subplots(figsize=(8, 7))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 11)
    ax.axis("off")
    ax.set_facecolor("#fdf2f8")
    fig.patch.set_facecolor("#fdf2f8")
    draw_diamond(ax, 5, 10, 1.8, 0.7, "LS1\nnot query?", 8)
    draw_box(ax, 2, 10, 2.2, 0.5, "LS2: return all", C_RET, 7)
    draw_box(ax, 5, 8.6, 2.4, 0.5, "LS3: query_lower", C_BLUE, 7)
    draw_diamond(ax, 5, 7.4, 1.8, 0.7, "LS4\ni<len?", 8)
    draw_box(ax, 2, 7.4, 2.0, 0.5, "LS8: return", C_RET, 7)
    draw_diamond(ax, 5, 6.0, 1.8, 0.7, "LS5\nfield loop", 7)
    draw_diamond(ax, 5, 4.6, 1.8, 0.7, "LS6\nin value?", 7)
    draw_box(ax, 8, 4.6, 2.0, 0.5, "LS7: append", C_BLUE, 7)
    arrow(ax, 5, 9.65, 5, 8.85)
    arrow(ax, 4.1, 10, 3.1, 10, C_EDGE_T, "T")
    arrow(ax, 5, 9.65, 5, 8.85, C_EDGE_F)
    arrow(ax, 5, 8.35, 5, 7.75)
    arrow(ax, 5, 7.05, 5, 6.35)
    arrow(ax, 4.1, 7.4, 3.0, 7.4, C_EDGE_F, "F")
    arrow(ax, 5, 5.65, 5, 4.95)
    arrow(ax, 5, 4.25, 5, 3.55)
    arrow(ax, 5.9, 4.6, 7.0, 4.6, C_EDGE_T, "T")
    ax.text(5, 0.4, "linear_search — searching.py", ha="center", fontsize=10, color="#be185d", fontweight="bold")
    return _save(fig, "cfg_linear_search.png")


def export_process_catalog():
    fig, ax = plt.subplots(figsize=(9, 7))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 10)
    ax.axis("off")
    ax.set_facecolor("#fdf2f8")
    fig.patch.set_facecolor("#fdf2f8")
    rect = mpatches.FancyBboxPatch((0.5, 2.8), 11, 4.2, boxstyle="round,pad=0.02",
                                   facecolor="none", edgecolor="#94a3b8", linestyle="--", linewidth=1.5)
    ax.add_patch(rect)
    ax.text(0.7, 6.85, "_apply_search", fontsize=8, color="#475569", fontweight="bold")
    draw_box(ax, 6, 9.2, 4.5, 0.55, "PC1: validate params", C_GREEN, 8)
    draw_box(ax, 6, 8.2, 4.5, 0.5, "PC2: filtered = _apply_search", C_BLUE, 8)
    draw_diamond(ax, 6, 7.1, 2.0, 0.75, "AS1\nnot query?", 7)
    draw_box(ax, 2.2, 7.1, 2.5, 0.5, "AS2: return all", C_RET, 7)
    draw_diamond(ax, 6, 5.8, 2.2, 0.8, "AS3\nbinary?", 7)
    draw_box(ax, 9.5, 5.8, 2.8, 0.9, "AS4: binary path\nbubble+binary", C_BLUE, 7)
    draw_box(ax, 2.2, 4.5, 2.8, 0.9, "AS5: linear path", C_BLUE, 7)
    draw_box(ax, 6, 3.5, 1.2, 0.4, "AS6", "#37474f", 7)
    ax.text(6, 3.5, "join", ha="center", va="center", fontsize=7, color="white")
    draw_box(ax, 6, 2.0, 4.5, 0.5, "PC3: _apply_sort", C_BLUE, 8)
    draw_box(ax, 6, 1.0, 4.5, 0.55, "PC4: return {items, meta}", C_RET, 8)
    arrow(ax, 6, 8.95, 6, 8.45)
    arrow(ax, 6, 7.95, 6, 7.45)
    arrow(ax, 5.0, 7.1, 3.45, 7.1, C_EDGE_T, "T")
    arrow(ax, 6, 6.75, 6, 6.15, C_EDGE_F)
    arrow(ax, 7.1, 5.8, 8.1, 5.8, C_EDGE_T, "T")
    arrow(ax, 5.0, 5.8, 3.5, 5.8, C_EDGE_F, "F")
    arrow(ax, 6, 3.1, 6, 2.25)
    arrow(ax, 6, 1.75, 6, 1.28)
    ax.text(6, 0.35, "process_catalog — catalog.py (UUT)", ha="center", fontsize=10, color="#be185d", fontweight="bold")
    return _save(fig, "cfg_process_catalog.png")


def export_mutation_summary():
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.set_facecolor("#fdf2f8")
    fig.patch.set_facecolor("#fdf2f8")
    cats = ["bubble\n4/4", "merge\n2/2*", "binary\n3/3*", "catalog\n2/2"]
    killed = [4, 2, 3, 2]
    colors = ["#f9a8d4", "#c4b5fd", "#a5b4fc", "#fbcfe8"]
    bars = ax.bar(cats, killed, color=colors, edgecolor="#a855f7", linewidth=1.2)
    ax.set_ylim(0, 5)
    ax.set_ylabel("Killed mutants", color=C_TEXT)
    ax.set_title("Mutation Score: 11/12 = 91.7%", color="#be185d", fontsize=14, fontweight="bold", pad=12)
    for b, v in zip(bars, killed):
        ax.text(b.get_x() + b.get_width() / 2, v + 0.1, str(v), ha="center", fontweight="bold", color=C_TEXT)
    ax.text(0.5, -0.15, "* EQUIVALENT excluded from denominator", transform=ax.transAxes, fontsize=8, color="#7c3aed")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    return _save(fig, "mutation_score_chart.png")


def export_acoc_chart():
    fig, ax = plt.subplots(figsize=(8, 4.5))
    ax.set_facecolor("#fdf2f8")
    fig.patch.set_facecolor("#fdf2f8")
    labels = ["ACOC", "CFG", "Mutation\n tests", "Total"]
    vals = [330, 29, 17, 376]
    colors = ["#f9a8d4", "#c4b5fd", "#ddd6fe", "#ec4899"]
    bars = ax.barh(labels, vals, color=colors, edgecolor="#a855f7")
    ax.set_xlim(0, 420)
    ax.set_title("Test Suite Overview (pytest)", color="#be185d", fontsize=14, fontweight="bold")
    for b, v in zip(bars, vals):
        ax.text(v + 5, b.get_y() + b.get_height() / 2, str(v), va="center", fontweight="bold", color=C_TEXT)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    return _save(fig, "test_overview_chart.png")


def export_all():
    paths = [
        export_bubble_sort(),
        export_linear_search(),
        export_process_catalog(),
        export_mutation_summary(),
        export_acoc_chart(),
    ]
    for p in paths:
        print(p)
    return paths


if __name__ == "__main__":
    export_all()
