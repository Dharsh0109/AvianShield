from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class PredictionWindow(Base):
    __tablename__ = "prediction_windows"

    window_id            = Column(Integer, primary_key=True, index=True)
    airport_id           = Column(Integer, ForeignKey("airports.airport_id"), nullable=False, index=True)
    window_start         = Column(DateTime, nullable=False)
    window_end           = Column(DateTime, nullable=False)
    predicted_probability = Column(Float, nullable=False)
    risk_level           = Column(String(10), nullable=False)   # Low / Medium / High
    model_version        = Column(String(20), default="1.0.0")
    generated_at         = Column(DateTime, nullable=False)

    airport = relationship("Airport", backref="prediction_windows")
