"""
AvianShield - Step 3: Feature Engineering
Output: ml_pipeline/data/processed/india_features.csv
"""

import os
import numpy as np
import pandas as pd

# ml_pipeline/ -> root (but data is inside ml_pipeline now)
_HERE      = os.path.dirname(os.path.abspath(__file__))
INPUT_CSV  = os.path.join(_HERE, "data", "processed", "india_synthetic_strikes.csv")
OUTPUT_CSV = os.path.join(_HERE, "data", "processed", "india_features.csv")

PROFILE_COLS = [
    "profile_coastal", "profile_coastal_wetland", "profile_floodplain",
    "profile_inland_scrub", "profile_riverine", "profile_wetland",
]


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["time"] = pd.to_datetime(df["time"])
    df = df.sort_values(["airport_code", "time"]).reset_index(drop=True)

    # Cyclical time encoding
    df["hour_sin"]  = np.sin(2 * np.pi * df["hour"]  / 24)
    df["hour_cos"]  = np.cos(2 * np.pi * df["hour"]  / 24)
    df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
    df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)

    # One-hot encode habitat profile
    profile_dummies = pd.get_dummies(df["profile"], prefix="profile")
    for col in PROFILE_COLS:
        if col not in profile_dummies.columns:
            profile_dummies[col] = 0
    df = pd.concat([df, profile_dummies[PROFILE_COLS]], axis=1)

    # Rolling weather features (per airport, 3-hour window)
    def rolling3(series):
        return series.rolling(3, min_periods=1).mean()

    df["vis_roll3"]  = df.groupby("airport_code")["visibility"].transform(rolling3)
    df["wind_roll3"] = df.groupby("airport_code")["windspeed_10m"].transform(rolling3)

    # Historical lag strike counts
    def lag_sum(series, periods):
        return series.shift(1).rolling(periods, min_periods=1).sum()

    df["strikes_24h"] = df.groupby("airport_code")["strike_occurred"].transform(
        lambda s: lag_sum(s, 24)
    )
    df["strikes_7d"] = df.groupby("airport_code")["strike_occurred"].transform(
        lambda s: lag_sum(s, 168)
    )

    # Target: any strike in the NEXT 3-hour window
    def next3_strike(series):
        return (
            series.shift(-1).fillna(0).astype(int)
            | series.shift(-2).fillna(0).astype(int)
            | series.shift(-3).fillna(0).astype(int)
        ).clip(upper=1)

    df["target"] = df.groupby("airport_code")["strike_occurred"].transform(next3_strike)

    # Drop last 3 rows per airport (no valid future window)
    df = df.groupby("airport_code").apply(lambda g: g.iloc[:-3]).reset_index(drop=True)

    return df


FEATURE_COLS = [
    "temperature_2m", "windspeed_10m", "visibility", "precipitation", "cloudcover",
    "hour_sin", "hour_cos", "month_sin", "month_cos",
    "vis_roll3", "wind_roll3", "strikes_24h", "strikes_7d",
    "f_season", "f_dawn_dusk", "f_weather", "f_base",
] + PROFILE_COLS


if __name__ == "__main__":
    df = pd.read_csv(INPUT_CSV)
    feat = build_features(df)
    feat.to_csv(OUTPUT_CSV, index=False)
    print(f"Feature matrix shape: {feat.shape}")
    print(f"Target positive rate: {feat['target'].mean():.4f}")
    print(f"Saved -> {OUTPUT_CSV}")
