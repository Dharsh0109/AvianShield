import os
import sys
import numpy as np

# ml_pipeline/ is at the project root, one level above backend/
_ML_PIPELINE = os.path.abspath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "ml_pipeline")
)
if _ML_PIPELINE not in sys.path:
    sys.path.insert(0, _ML_PIPELINE)

from predict import predict as _predict  # noqa: E402

_PROFILE_COLS = [
    "profile_coastal", "profile_coastal_wetland", "profile_floodplain",
    "profile_inland_scrub", "profile_riverine", "profile_wetland",
]


def _profile_onehot(profile: str) -> dict:
    return {col: int(col == f"profile_{profile}") for col in _PROFILE_COLS}


def run_inference(
    temperature: float,
    visibility: float,
    wind_speed: float,
    precipitation: float,
    cloud_cover: float,
    hour: int,
    month: int,
    habitat_profile: str,
    strikes_24h: float = 0.0,
    strikes_7d: float = 0.0,
    vis_roll3: float = None,
    wind_roll3: float = None,
    f_season: float = 1.0,
    f_dawn_dusk: float = 1.0,
    f_weather: float = 1.0,
    f_base: float = 0.015,
) -> dict:
    features = {
        "temperature_2m": temperature,
        "windspeed_10m":  wind_speed,
        "visibility":     visibility,
        "precipitation":  precipitation,
        "cloudcover":     cloud_cover,
        "hour_sin":  np.sin(2 * np.pi * hour  / 24),
        "hour_cos":  np.cos(2 * np.pi * hour  / 24),
        "month_sin": np.sin(2 * np.pi * month / 12),
        "month_cos": np.cos(2 * np.pi * month / 12),
        "vis_roll3":    vis_roll3  if vis_roll3  is not None else visibility,
        "wind_roll3":   wind_roll3 if wind_roll3 is not None else wind_speed,
        "strikes_24h":  strikes_24h,
        "strikes_7d":   strikes_7d,
        "f_season":     f_season,
        "f_dawn_dusk":  f_dawn_dusk,
        "f_weather":    f_weather,
        "f_base":       f_base,
        **_profile_onehot(habitat_profile),
    }
    return _predict(features)
