from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DispatchAlertOut(BaseModel):
    alert_id:           int
    airport_id:         int
    window_id:          int
    alert_message:      str
    alert_level:        str
    recommended_action: str
    status:             str
    created_at:         datetime

    model_config = {"from_attributes": True}


class AlertStatusUpdate(BaseModel):
    status: str   # acknowledged / resolved
