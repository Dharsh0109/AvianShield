from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class WeatherSnapshot(Base):
    __tablename__ = "weather_snapshots"

    weather_id       = Column(Integer, primary_key=True, index=True)
    airport_id       = Column(Integer, ForeignKey("airports.airport_id"), nullable=False, index=True)
    observation_time = Column(DateTime, nullable=False, index=True)
    temperature      = Column(Float)
    visibility       = Column(Float)
    wind_speed       = Column(Float)
    precipitation    = Column(Float)
    cloud_cover      = Column(Float)

    airport = relationship("Airport", backref="weather_snapshots")
