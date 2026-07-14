from sqlalchemy import Column, Integer, String, Float
from app.database import Base


class Airport(Base):
    __tablename__ = "airports"

    airport_id    = Column(Integer, primary_key=True, index=True)
    airport_code  = Column(String(10), unique=True, nullable=False, index=True)
    airport_name  = Column(String(100), nullable=False)
    latitude      = Column(Float, nullable=False)
    longitude     = Column(Float, nullable=False)
    habitat_profile = Column(String(50), nullable=False)
    elevation     = Column(Float, nullable=True)
