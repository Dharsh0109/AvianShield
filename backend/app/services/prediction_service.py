import os
import sys
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.airport import Airport
from app.models.prediction_window import PredictionWindow
from app.models.weather_snapshot import WeatherSnapshot
from app.services import weather_service, ml_service, alert_service

_ML_PIPELINE = os.path.abspath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "ml_pipeline")
)
if _ML_PIPELINE not in sys.path:
    sys.path.insert(0, _ML_PIPELINE)

# ── Prediction cache (5 min TTL) ──────────────────────────────────────────────
_pred_cache: dict[int, tuple[PredictionWindow, dict, datetime]] = {}
_PRED_TTL = timedelta(minutes=5)


def _domain_factors(hour: int, month: int, profile: str, visibility: float, wind_speed: float, precipitation: float):
    from data_generation.synthetic_strike_generator import _season, _dawn_dusk, _base

    f_season    = _season(month, profile)
    f_dawn_dusk = _dawn_dusk(hour)
    f_base      = _base(profile)

    f_weather = 1.0
    if visibility < 3000:
        f_weather *= 1.6
    if wind_speed > 40:
        f_weather *= 0.5
    elif 10 <= wind_speed <= 25:
        f_weather *= 1.3
    if precipitation > 0:
        f_weather *= 1.4

    return f_season, f_dawn_dusk, f_weather, f_base


def run_prediction(db: Session, airport: Airport):
    now = datetime.now(timezone.utc)

    # Return cached prediction if still fresh
    cached = _pred_cache.get(airport.airport_id)
    if cached and (now.replace(tzinfo=None) - cached[2].replace(tzinfo=None)) < _PRED_TTL:
        return cached[0], cached[1]

    weather = weather_service.fetch_live(airport)
    weather_service.save_snapshot(db, airport.airport_id, weather)

    obs_time      = weather["observation_time"]
    hour          = obs_time.hour
    month         = obs_time.month
    visibility    = weather["visibility"]    or 10000.0
    wind_speed    = weather["wind_speed"]    or 0.0
    precipitation = weather["precipitation"] or 0.0

    f_season, f_dawn_dusk, f_weather, f_base = _domain_factors(
        hour, month, airport.habitat_profile, visibility, wind_speed, precipitation
    )

    result = ml_service.run_inference(
        temperature=weather["temperature"] or 25.0,
        visibility=visibility,
        wind_speed=wind_speed,
        precipitation=precipitation,
        cloud_cover=weather["cloud_cover"] or 0.0,
        hour=hour,
        month=month,
        habitat_profile=airport.habitat_profile,
        strikes_24h=0.0,
        strikes_7d=0.0,
        f_season=f_season,
        f_dawn_dusk=f_dawn_dusk,
        f_weather=f_weather,
        f_base=f_base,
    )

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    window = PredictionWindow(
        airport_id=airport.airport_id,
        window_start=now,
        window_end=now + timedelta(hours=3),
        predicted_probability=result["probability"],
        risk_level=result["risk_level"],
        model_version="1.0.0",
        generated_at=now,
    )
    db.add(window)
    db.commit()
    db.refresh(window)

    alert_service.create_alert(db, airport, window, result)

    _pred_cache[airport.airport_id] = (window, result, datetime.now(timezone.utc))
    return window, result


def get_recent_predictions(db: Session, airport_id: int, limit: int = 48):
    return (
        db.query(PredictionWindow)
        .filter(PredictionWindow.airport_id == airport_id)
        .order_by(PredictionWindow.generated_at.desc())
        .limit(limit)
        .all()
    )
