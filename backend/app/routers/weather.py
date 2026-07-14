from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.services import airport_service, weather_service
from app.schemas.weather_schema import WeatherSnapshotOut, LiveWeatherOut
from datetime import datetime, timezone

router = APIRouter(prefix="/airports", tags=["weather"])


@router.get("/{airport_id}/weather", response_model=List[WeatherSnapshotOut])
def get_weather(airport_id: int, limit: int = 24, db: Session = Depends(get_db)):
    airport = airport_service.get_by_id(db, airport_id)
    if not airport:
        raise HTTPException(status_code=404, detail="Airport not found")
    return weather_service.get_recent_snapshots(db, airport_id, limit)


@router.get("/{airport_id}/weather/live", response_model=LiveWeatherOut)
def get_live_weather(airport_id: int, db: Session = Depends(get_db)):
    airport = airport_service.get_by_id(db, airport_id)
    if not airport:
        raise HTTPException(status_code=404, detail="Airport not found")
    data = weather_service.fetch_live(airport)
    return LiveWeatherOut(airport_code=airport.airport_code, **data)
