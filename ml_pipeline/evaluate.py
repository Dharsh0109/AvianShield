"""
AvianShield - Step 5: Model Evaluation
Output: ml_pipeline/models/metrics.json
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    precision_score, recall_score, f1_score,
    average_precision_score, confusion_matrix,
)

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _HERE)

from features import build_features, FEATURE_COLS

INPUT_CSV    = os.path.join(_HERE, "data", "processed", "india_synthetic_strikes.csv")
MODEL_PATH   = os.path.join(_HERE, "models", "avianshield_lgbm.pkl")
METRICS_PATH = os.path.join(_HERE, "models", "metrics.json")

THRESHOLDS = {"Low": (0.00, 0.30), "Medium": (0.31, 0.60), "High": (0.61, 1.00)}


def risk_level(prob: float) -> str:
    if prob <= 0.30: return "Low"
    if prob <= 0.60: return "Medium"
    return "High"


def evaluate(model_path: str = MODEL_PATH, csv_path: str = INPUT_CSV):
    artifact = joblib.load(model_path)
    model    = artifact["model"]

    df   = pd.read_csv(csv_path)
    df   = build_features(df)
    df["time"] = pd.to_datetime(df["time"])
    test = df[df["time"].dt.year == 2023]

    X_test = test[FEATURE_COLS].fillna(0)
    y_test = test["target"]

    probs = model.predict_proba(X_test)[:, 1]
    preds = (probs >= 0.30).astype(int)

    pr_auc    = average_precision_score(y_test, probs)
    precision = precision_score(y_test, preds, zero_division=0)
    recall    = recall_score(y_test, preds, zero_division=0)
    f1        = f1_score(y_test, preds, zero_division=0)
    cm        = confusion_matrix(y_test, preds).tolist()

    metrics = {
        "model_name":       "avianshield_lgbm",
        "version":          "1.0.0",
        "threshold":        0.30,
        "precision":        round(precision, 4),
        "recall":           round(recall, 4),
        "f1_score":         round(f1, 4),
        "pr_auc":           round(pr_auc, 4),
        "confusion_matrix": cm,
        "risk_thresholds":  THRESHOLDS,
    }

    os.makedirs(os.path.dirname(METRICS_PATH), exist_ok=True)
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    print("=" * 45)
    print(f"  PR-AUC    : {pr_auc:.4f}")
    print(f"  Precision : {precision:.4f}")
    print(f"  Recall    : {recall:.4f}")
    print(f"  F1-Score  : {f1:.4f}")
    print(f"  Confusion matrix:\n    {np.array(cm)}")
    print("=" * 45)
    print(f"Metrics saved -> {METRICS_PATH}")
    return metrics


if __name__ == "__main__":
    evaluate()
