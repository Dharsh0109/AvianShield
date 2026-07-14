from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.airport import Airport
from app.models.prediction_window import PredictionWindow
from app.models.dispatch_alert import DispatchAlert

_ACTIONS = {
    "Low":    "Continue standard monitoring. No immediate action required.",
    "Medium": "Increase patrol frequency. Alert safety team and log observation.",
    "High":   "Immediate runway wildlife response required. Operational caution advised. Contact ATC.",
}

_MESSAGES = {
    "Low":    "Bird-strike risk is LOW for the next 3-hour window.",
    "Medium": "Elevated bird-strike risk detected for the next 3-hour window.",
    "High":   "HIGH bird-strike risk detected. Immediate action required.",
}


def create_alert(
    db: Session,
    airport: Airport,
    window: PredictionWindow,
    inference_result: dict,
) -> DispatchAlert:
    level = inference_result["risk_level"]
    now   = datetime.now(timezone.utc).replace(tzinfo=None)

    alert = DispatchAlert(
        airport_id=airport.airport_id,
        window_id=window.window_id,
        alert_message=_MESSAGES[level],
        alert_level=level,
        recommended_action=_ACTIONS[level],
        status="active",
        created_at=now,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def get_all_alerts(db: Session, limit: int = 100):
    return (
        db.query(DispatchAlert)
        .order_by(DispatchAlert.created_at.desc())
        .limit(limit)
        .all()
    )


def get_alerts_for_airport(db: Session, airport_id: int, limit: int = 50):
    return (
        db.query(DispatchAlert)
        .filter(DispatchAlert.airport_id == airport_id)
        .order_by(DispatchAlert.created_at.desc())
        .limit(limit)
        .all()
    )


def update_status(db: Session, alert_id: int, status: str):
    alert = db.query(DispatchAlert).filter(DispatchAlert.alert_id == alert_id).first()
    if alert:
        alert.status = status
        db.commit()
        db.refresh(alert)
    return alert
