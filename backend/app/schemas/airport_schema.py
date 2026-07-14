from pydantic import BaseModel
from typing import Optional


class AirportBase(BaseModel):
    airport_code:    str
    airport_name:    str
    latitude:        float
    longitude:       float
    habitat_profile: str
    elevation:       Optional[float] = None


class AirportCreate(AirportBase):
    pass


class AirportOut(AirportBase):
    airport_id: int

    model_config = {"from_attributes": True}
