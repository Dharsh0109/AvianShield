from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class StrikeEvent(Base):
    __tablename__ = "synthetic_strike_events"

    event_id          = Column(Integer, primary_key=True, index=True)
    airport_id        = Column(Integer, ForeignKey("airports.airport_id"), nullable=False, index=True)
    event_time        = Column(DateTime, nullable=False, index=True)
    strike_occurred   = Column(Integer, nullable=False)   # 0 or 1
    strike_probability = Column(Float)
    f_season          = Column(Float)
    f_dawn_dusk       = Column(Float)
    f_weather         = Column(Float)
    f_base            = Column(Float)

    airport = relationship("Airport", backref="strike_events")
