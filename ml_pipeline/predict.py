"""
AvianShield - Step 6: Inference
Loads the trained model once and exposes predict() for FastAPI use.
"""

import os
import joblib
import numpy as np
import pandas as pd

_HERE      = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(_HERE, "models", "avianshield_lgbm.pkl")

_artifact = None


def _load():
    global _artifact
    if _artifact is None:
        _artifact = joblib.load(MODEL_PATH)
    return _artifact


def risk_level(prob: float) -> str:
    if prob <= 0.30: return "Low"
    if prob <= 0.60: return "Medium"
    return "High"


def predict(features: dict) -> dict:
    """
    Args:
        features: dict with keys matching FEATURE_COLS from features.py
    Returns:
        {"probability": float, "risk_level": str, "top_factors": list}
    """
    artifact     = _load()
    model        = artifact["model"]
    feature_cols = artifact["feature_cols"]

    row  = pd.DataFrame([features])[feature_cols].fillna(0)
    prob = float(model.predict_proba(row)[0, 1])

    top_factors = []
    try:
        import shap
        explainer   = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(row)
        vals  = shap_values[0] if isinstance(shap_values, list) else shap_values[0]
        pairs = sorted(zip(feature_cols, vals), key=lambda x: abs(x[1]), reverse=True)
        top_factors = [{"feature": k, "shap_value": round(float(v), 5)} for k, v in pairs[:5]]
    except Exception:
        pass

    return {
        "probability": round(prob, 6),
        "risk_level":  risk_level(prob),
        "top_factors": top_factors,
    }


if __name__ == "__main__":
    sample = {
        "temperature_2m": 28.0, "windspeed_10m": 15.0, "visibility": 2000.0,
        "precipitation": 1.5,   "cloudcover": 80.0,
        "hour_sin": np.sin(2 * np.pi * 6 / 24),
        "hour_cos": np.cos(2 * np.pi * 6 / 24),
        "month_sin": np.sin(2 * np.pi * 11 / 12),
        "month_cos": np.cos(2 * np.pi * 11 / 12),
        "vis_roll3": 2200.0, "wind_roll3": 14.0,
        "strikes_24h": 2.0,  "strikes_7d": 5.0,
        "f_season": 2.2, "f_dawn_dusk": 3.0, "f_weather": 1.6, "f_base": 0.025,
        "profile_coastal": 0, "profile_coastal_wetland": 1, "profile_floodplain": 0,
        "profile_inland_scrub": 0, "profile_riverine": 0, "profile_wetland": 0,
    }
    result = predict(sample)
    print(f"Probability : {result['probability']}")
    print(f"Risk Level  : {result['risk_level']}")
    print(f"Top Factors : {result['top_factors']}")
