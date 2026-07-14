"""
AvianShield - Step 2: Synthetic Strike Label Generator
Reads real weather CSV and generates synthetic bird-strike labels.
Output: ml_pipeline/data/processed/india_synthetic_strikes.csv
"""

import os
import numpy as np
import pandas as pd

# ml_pipeline/data_generation/ -> ml_pipeline/
_HERE      = os.path.dirname(os.path.abspath(__file__))
_ML        = os.path.abspath(os.path.join(_HERE, ".."))
INPUT_CSV  = os.path.join(_ML, "data", "raw", "weather", "india_airports_weather.csv")
OUTPUT_CSV = os.path.join(_ML, "data", "processed", "india_synthetic_strikes.csv")

np.random.seed(42)

_WINTER  = {10, 11, 12, 1, 2, 3}
_MONSOON = {6, 7, 8, 9}

_SEASON_MAP = {
    "coastal_wetland": {"winter": 2.2, "monsoon": 1.3, "other": 1.0},
    "wetland":         {"winter": 2.2, "monsoon": 1.3, "other": 1.0},
    "floodplain":      {"winter": 2.2, "monsoon": 1.3, "other": 1.0},
    "coastal":         {"winter": 2.0, "monsoon": 1.3, "other": 1.0},
    "riverine":        {"winter": 1.4, "monsoon": 2.0, "other": 1.0},
    "inland_scrub":    {"winter": 1.4, "monsoon": 2.0, "other": 1.0},
}

def _season(month: int, profile: str) -> float:
    m = _SEASON_MAP.get(profile, {"winter": 1.0, "monsoon": 1.0, "other": 1.0})
    if month in _WINTER:  return m["winter"]
    if month in _MONSOON: return m["monsoon"]
    return m["other"]

_DAWN_DUSK = {5: 3.0, 6: 3.0, 7: 3.0,
              18: 2.8, 19: 2.8, 20: 2.8,
              8: 1.5, 9: 1.5, 16: 1.5, 17: 1.5}

def _dawn_dusk(hour: int) -> float:
    if hour in _DAWN_DUSK:
        return _DAWN_DUSK[hour]
    if 22 <= hour or hour < 4:
        return 0.3
    return 1.0

def _weather(row: pd.Series) -> float:
    f = 1.0
    if row["visibility"] < 3000:
        f *= 1.6
    if row["windspeed_10m"] > 40:
        f *= 0.5
    elif 10 <= row["windspeed_10m"] <= 25:
        f *= 1.3
    if row["precipitation"] > 0:
        f *= 1.4
    return f

_BASE_RATE = {
    "coastal_wetland": 0.025,
    "wetland":         0.022,
    "floodplain":      0.020,
    "coastal":         0.018,
    "riverine":        0.015,
    "inland_scrub":    0.010,
}

def _base(profile: str) -> float:
    return _BASE_RATE.get(profile, 0.012)


def generate(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["time"]  = pd.to_datetime(df["time"])
    df["month"] = df["time"].dt.month
    df["hour"]  = df["time"].dt.hour

    df["f_season"]    = df.apply(lambda r: _season(r["month"], r["profile"]), axis=1)
    df["f_dawn_dusk"] = df["hour"].map(_dawn_dusk).fillna(1.0)
    df["f_weather"]   = df.apply(_weather, axis=1)
    df["f_base"]      = df["profile"].map(_base).fillna(0.012)

    df["strike_probability"] = (
        df["f_base"] * df["f_season"] * df["f_dawn_dusk"] * df["f_weather"]
    ).clip(upper=0.35)

    df["strike_occurred"] = np.random.binomial(1, df["strike_probability"])
    return df


if __name__ == "__main__":
    os.makedirs(os.path.dirname(OUTPUT_CSV), exist_ok=True)
    raw = pd.read_csv(INPUT_CSV)
    out = generate(raw)
    out.to_csv(OUTPUT_CSV, index=False)

    total   = len(out)
    strikes = out["strike_occurred"].sum()
    print(f"Records : {total:,}")
    print(f"Strikes : {strikes:,}  ({strikes / total * 100:.2f}%)")
    print("\nStrike rate by profile:")
    print(out.groupby("profile")["strike_occurred"].mean().sort_values(ascending=False).to_string())
    print(f"\nSaved -> {OUTPUT_CSV}")
