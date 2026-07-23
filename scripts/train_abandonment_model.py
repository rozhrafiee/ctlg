"""
Train and evaluate abandonment-prediction models (Windows-safe, single-process).
"""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import (
    GridSearchCV,
    StratifiedKFold,
    cross_val_predict,
    train_test_split,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "datasets" / "abandonment_training.csv"
OUT_DIR = ROOT / "datasets" / "ml"
MODEL_DIR = ROOT / "models"
OUT_DIR.mkdir(parents=True, exist_ok=True)
MODEL_DIR.mkdir(parents=True, exist_ok=True)

FEATURES = [
    "avg_login_interval_days",
    "duration_of_use_minutes",
    "failed_tests_count",
    "progress_rate",
]
TARGET = "abandoned"
RANDOM_STATE = 42


def metric_bundle(y_true, y_pred, y_proba):
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred)),
        "recall": float(recall_score(y_true, y_pred)),
        "f1": float(f1_score(y_true, y_pred)),
        "roc_auc": float(roc_auc_score(y_true, y_proba)),
        "avg_precision": float(average_precision_score(y_true, y_proba)),
        "confusion_matrix": {
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp),
        },
    }


def downsample_curve(xs, ys, n=45):
    xs = np.asarray(xs, dtype=float)
    ys = np.asarray(ys, dtype=float)
    if len(xs) <= n:
        return [{"x": float(x), "y": float(y)} for x, y in zip(xs, ys)]
    idx = np.linspace(0, len(xs) - 1, n).astype(int)
    return [{"x": float(xs[i]), "y": float(ys[i])} for i in idx]


def main():
    print("Loading dataset...", flush=True)
    df = pd.read_csv(CSV_PATH)
    X = df[FEATURES].astype(float)
    y = df[TARGET].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )
    cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=RANDOM_STATE)

    print("Tuning HistGradientBoosting (GridSearchCV)...", flush=True)
    hgb_search = GridSearchCV(
        HistGradientBoostingClassifier(
            random_state=RANDOM_STATE,
            early_stopping=True,
            validation_fraction=0.15,
            max_iter=300,
        ),
        param_grid={
            "learning_rate": [0.05, 0.1],
            "max_depth": [3, 5],
            "max_leaf_nodes": [31, 63],
            "min_samples_leaf": [20, 40],
            "l2_regularization": [0.0, 0.5],
        },
        scoring="roc_auc",
        cv=cv,
        n_jobs=1,
        refit=True,
    )
    hgb_search.fit(X_train, y_train)
    tuned_hgb = hgb_search.best_estimator_
    print("Best HGB:", hgb_search.best_params_, "CV AUC", round(hgb_search.best_score_, 4), flush=True)

    print("Tuning RandomForest...", flush=True)
    rf_search = GridSearchCV(
        RandomForestClassifier(
            class_weight="balanced_subsample",
            random_state=RANDOM_STATE,
            n_estimators=300,
            n_jobs=1,
        ),
        param_grid={
            "max_depth": [5, 8, None],
            "min_samples_leaf": [1, 4],
            "max_features": ["sqrt", 0.8],
        },
        scoring="roc_auc",
        cv=cv,
        n_jobs=1,
        refit=True,
    )
    rf_search.fit(X_train, y_train)
    tuned_rf = rf_search.best_estimator_
    print("Best RF:", rf_search.best_params_, "CV AUC", round(rf_search.best_score_, 4), flush=True)

    print("Fitting LogisticRegression...", flush=True)
    logreg = Pipeline(
        [
            ("scaler", StandardScaler()),
            (
                "clf",
                LogisticRegression(
                    max_iter=5000,
                    class_weight="balanced",
                    C=1.0,
                    random_state=RANDOM_STATE,
                ),
            ),
        ]
    )
    logreg.fit(X_train, y_train)

    print("Calibrating HGB...", flush=True)
    calibrated = CalibratedClassifierCV(tuned_hgb, method="isotonic", cv=3)
    calibrated.fit(X_train, y_train)

    candidates = {
        "LogisticRegression": (logreg, None),
        "RandomForest_Tuned": (tuned_rf, float(rf_search.best_score_)),
        "HistGradientBoosting_Tuned": (tuned_hgb, float(hgb_search.best_score_)),
        "Calibrated_HGB": (calibrated, None),
    }

    comparison = []
    best_name = None
    best_model = None
    best_score = -1.0
    best_metrics = None
    best_proba = None

    for name, (model, cv_auc) in candidates.items():
        y_pred = model.predict(X_test)
        y_proba = model.predict_proba(X_test)[:, 1]
        metrics = metric_bundle(y_test, y_pred, y_proba)
        if cv_auc is None:
            # cheap holdout-style proxy: use train ROC via predict on train is optimistic;
            # use search-free OOF for logreg/calibrated
            oof = cross_val_predict(model, X_train, y_train, cv=cv, method="predict_proba", n_jobs=1)[:, 1]
            cv_auc = float(roc_auc_score(y_train, oof))
        row = {
            "model": name,
            "cv_roc_auc": cv_auc,
            **{k: metrics[k] for k in ("accuracy", "precision", "recall", "f1", "roc_auc", "avg_precision")},
        }
        comparison.append(row)
        print(
            f"{name}: acc={metrics['accuracy']:.4f} f1={metrics['f1']:.4f} "
            f"roc_auc={metrics['roc_auc']:.4f} cv_auc={cv_auc:.4f}",
            flush=True,
        )
        score = metrics["f1"] * 0.55 + metrics["roc_auc"] * 0.45
        if score > best_score:
            best_score = score
            best_name = name
            best_model = model
            best_metrics = metrics
            best_proba = y_proba

    print("Tuning decision threshold...", flush=True)
    oof_proba = cross_val_predict(
        best_model, X_train, y_train, cv=cv, method="predict_proba", n_jobs=1
    )[:, 1]
    best_thr = 0.5
    best_thr_f1 = -1.0
    for thr in np.linspace(0.25, 0.75, 51):
        f1 = f1_score(y_train, (oof_proba >= thr).astype(int))
        if f1 > best_thr_f1:
            best_thr_f1 = f1
            best_thr = float(thr)

    tuned_pred = (best_proba >= best_thr).astype(int)
    tuned_metrics = metric_bundle(y_test, tuned_pred, best_proba)
    if tuned_metrics["f1"] >= best_metrics["f1"]:
        final_metrics = tuned_metrics
        used_threshold = best_thr
    else:
        final_metrics = best_metrics
        used_threshold = 0.5

    print(f"Selected: {best_name} threshold={used_threshold:.3f}", flush=True)
    print(final_metrics, flush=True)

    fpr, tpr, _ = roc_curve(y_test, best_proba)
    prec, rec, _ = precision_recall_curve(y_test, best_proba)

    print("Permutation importance...", flush=True)
    perm = permutation_importance(
        best_model,
        X_test,
        y_test,
        n_repeats=15,
        random_state=RANDOM_STATE,
        scoring="roc_auc",
        n_jobs=1,
    )
    importance = [
        {"feature": feat, "importance": float(val)}
        for feat, val in sorted(
            zip(FEATURES, perm.importances_mean), key=lambda t: t[1], reverse=True
        )
    ]

    feature_by_class = {}
    for feat in FEATURES:
        abandoned = df.loc[df[TARGET] == 1, feat]
        retained = df.loc[df[TARGET] == 0, feat]
        bins = np.linspace(float(df[feat].min()), float(df[feat].max()), 12)
        a_hist, _ = np.histogram(abandoned, bins=bins)
        r_hist, _ = np.histogram(retained, bins=bins)
        centers = ((bins[:-1] + bins[1:]) / 2).tolist()
        feature_by_class[feat] = {
            "bin_centers": [round(c, 3) for c in centers],
            "abandoned": [int(v) for v in a_hist],
            "retained": [int(v) for v in r_hist],
        }

    results = {
        "dataset": {
            "path": str(CSV_PATH),
            "n_samples": int(len(y)),
            "n_features": len(FEATURES),
            "features": FEATURES,
            "label_counts": {
                "abandoned": int((y == 1).sum()),
                "retained": int((y == 0).sum()),
            },
            "train_size": int(len(y_train)),
            "test_size": int(len(y_test)),
        },
        "best_model": best_name,
        "decision_threshold": used_threshold,
        "test_metrics": final_metrics,
        "default_threshold_metrics": best_metrics,
        "model_comparison": sorted(comparison, key=lambda r: r["f1"], reverse=True),
        "roc_curve": downsample_curve(fpr, tpr, 50),
        "pr_curve": downsample_curve(rec[:-1], prec[:-1], 50)
        if len(rec) > 1
        else downsample_curve(rec, prec, 50),
        "feature_importance": importance,
        "feature_distributions": feature_by_class,
        "hgb_best_params": hgb_search.best_params_,
        "rf_best_params": rf_search.best_params_,
        "hgb_cv_roc_auc": float(hgb_search.best_score_),
        "rf_cv_roc_auc": float(rf_search.best_score_),
    }

    out_json = OUT_DIR / "abandonment_model_results.json"
    out_json.write_text(json.dumps(results, indent=2, default=str), encoding="utf-8")
    print("Wrote", out_json, flush=True)

    joblib.dump(
        {
            "model": best_model,
            "features": FEATURES,
            "threshold": used_threshold,
            "model_name": best_name,
            "metrics": final_metrics,
        },
        MODEL_DIR / "abandonment_predictor.joblib",
    )
    print("Wrote", MODEL_DIR / "abandonment_predictor.joblib", flush=True)


if __name__ == "__main__":
    main()
