from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class DispatchAlert(Base):
    __tablename__ = "dispatch_alerts"

    alert_id           = Column(Integer, primary_key=True, index=True)
    airport_id         = Column(Integer, ForeignKey("airports.airport_id"), nullable=False, index=True)
    window_id          = Column(Integer, ForeignKey("prediction_windows.window_id"), nullable=False)
    alert_message      = Column(String(500), nullable=False)
    alert_level        = Column(String(10), nullable=False)   # Low / Medium / High
    recommended_action = Column(String(300), nullable=False)
    status             = Column(String(20), default="active")  # active / acknowledged / resolved
    created_at         = Column(DateTime, nullable=False)

    airport = relationship("Airport", backref="alerts")
    window  = relationship("PredictionWindow", backref="alerts")
