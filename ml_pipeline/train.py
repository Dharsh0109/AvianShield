"""
AvianShield - Step 4: Model Training
Output: ml_pipeline/models/avianshield_lgbm.pkl
"""

import os
import sys
import joblib
import pandas as pd
from lightgbm import LGBMClassifier
from imblearn.over_sampling import SMOTE

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _HERE)   # so features.py imports cleanly

from features import build_features, FEATURE_COLS

INPUT_CSV  = os.path.join(_HERE, "data", "processed", "india_synthetic_strikes.csv")
MODEL_PATH = os.path.join(_HERE, "models", "avianshield_lgbm.pkl")


def load_and_split(csv_path: str):
    df = pd.read_csv(csv_path)
    df = build_features(df)
    df["time"] = pd.to_datetime(df["time"])

    train = df[df["time"].dt.year < 2023]
    test  = df[df["time"].dt.year == 2023]

    X_train = train[FEATURE_COLS].fillna(0)
    y_train = train["target"]
    X_test  = test[FEATURE_COLS].fillna(0)
    y_test  = test["target"]

    print(f"Train: {len(train):,} rows | Test: {len(test):,} rows")
    print(f"Train positive rate: {y_train.mean():.4f} | Test: {y_test.mean():.4f}")
    return X_train, y_train, X_test, y_test


def train(csv_path: str = INPUT_CSV, model_path: str = MODEL_PATH):
    X_train, y_train, X_test, y_test = load_and_split(csv_path)

    pos       = y_train.sum()
    neg       = (y_train == 0).sum()
    scale_pos = neg / pos if pos > 0 else 1.0
    print(f"Class ratio (neg/pos): {scale_pos:.1f}  - applying SMOTE...")

    smote = SMOTE(random_state=42, k_neighbors=5)
    X_res, y_res = smote.fit_resample(X_train, y_train)
    print(f"After SMOTE: {len(X_res):,} rows, positive rate: {y_res.mean():.4f}")

    model = LGBMClassifier(
        n_estimators=500,
        learning_rate=0.05,
        num_leaves=63,
        max_depth=-1,
        scale_pos_weight=scale_pos,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
        verbose=-1,
    )
    model.fit(X_res, y_res, eval_set=[(X_test, y_test)])

    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump({"model": model, "feature_cols": FEATURE_COLS}, model_path)
    print(f"\nModel saved -> {model_path}")
    return model, X_test, y_test


if __name__ == "__main__":
    train()
