from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class WeatherSnapshotOut(BaseModel):
    weather_id:       int
    airport_id:       int
    observation_time: datetime
    temperature:      Optional[float]
    visibility:       Optional[float]
    wind_speed:       Optional[float]
    precipitation:    Optional[float]
    cloud_cover:      Optional[float]

    model_config = {"from_attributes": True}


class LiveWeatherOut(BaseModel):
    airport_code:     str
    observation_time: datetime
    temperature:      Optional[float]
    visibility:       Optional[float]
    wind_speed:       Optional[float]
    precipitation:    Optional[float]
    cloud_cover:      Optional[float]
