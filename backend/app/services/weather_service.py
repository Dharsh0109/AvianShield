from datetime import datetime, timezone, timedelta
import requests
from sqlalchemy.orm import Session
from app.models.airport import Airport
from app.models.weather_snapshot import WeatherSnapshot

_BASE_URL = "https://api.open-meteo.com/v1/forecast"

# ── Server-side weather cache (30 min TTL) ────────────────────────────────────
_weather_cache: dict[int, tuple[dict, datetime]] = {}
_WEATHER_TTL = timedelta(minutes=30)


def fetch_live(airport: Airport) -> dict:
    """Return cached weather if fresh, otherwise fetch from Open-Meteo."""
    now = datetime.now(timezone.utc)

    cached = _weather_cache.get(airport.airport_id)
    if cached and (now - cached[1]) < _WEATHER_TTL:
        return cached[0]

    params = {
        "latitude":      airport.latitude,
        "longitude":     airport.longitude,
        "hourly":        "temperature_2m,windspeed_10m,visibility,precipitation,cloudcover",
        "timezone":      "Asia/Kolkata",
        "forecast_days": 1,
    }
    r = requests.get(_BASE_URL, params=params, timeout=10)
    r.raise_for_status()
    data = r.json()["hourly"]

    idx = -1
    result = {
        "observation_time": datetime.fromisoformat(data["time"][idx]),
        "temperature":      data["temperature_2m"][idx],
        "visibility":       data["visibility"][idx],
        "wind_speed":       data["windspeed_10m"][idx],
        "precipitation":    data["precipitation"][idx],
        "cloud_cover":      data["cloudcover"][idx],
    }

    _weather_cache[airport.airport_id] = (result, now)
    return result


def get_latest_snapshot(db: Session, airport_id: int):
    return (
        db.query(WeatherSnapshot)
        .filter(WeatherSnapshot.airport_id == airport_id)
        .order_by(WeatherSnapshot.observation_time.desc())
        .first()
    )


def save_snapshot(db: Session, airport_id: int, weather: dict) -> WeatherSnapshot:
    snap = WeatherSnapshot(airport_id=airport_id, **weather)
    db.add(snap)
    db.commit()
    db.refresh(snap)
    return snap


def get_recent_snapshots(db: Session, airport_id: int, limit: int = 24):
    return (
        db.query(WeatherSnapshot)
        .filter(WeatherSnapshot.airport_id == airport_id)
        .order_by(WeatherSnapshot.observation_time.desc())
        .limit(limit)
        .all()
    )
