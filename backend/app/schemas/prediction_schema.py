from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class PredictRequest(BaseModel):
    airport_id:      int
    temperature:     float
    visibility:      float
    wind_speed:      float
    precipitation:   float
    cloud_cover:     float
    hour:            int
    month:           int


class TopFactor(BaseModel):
    feature:    str
    shap_value: float


class PredictionOut(BaseModel):
    window_id:             Optional[int] = None
    airport_id:            int
    window_start:          datetime
    window_end:            datetime
    predicted_probability: float
    risk_level:            str
    model_version:         str
    top_factors:           List[TopFactor] = []

    model_config = {"from_attributes": True}
