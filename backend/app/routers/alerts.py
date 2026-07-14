from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.services import alert_service, airport_service
from app.schemas.alert_schema import DispatchAlertOut, AlertStatusUpdate

router = APIRouter(tags=["alerts"])


@router.get("/alerts", response_model=List[DispatchAlertOut])
def list_alerts(limit: int = 100, db: Session = Depends(get_db)):
    return alert_service.get_all_alerts(db, limit)


@router.get("/airports/{airport_id}/alerts", response_model=List[DispatchAlertOut])
def airport_alerts(airport_id: int, db: Session = Depends(get_db)):
    airport = airport_service.get_by_id(db, airport_id)
    if not airport:
        raise HTTPException(status_code=404, detail="Airport not found")
    return alert_service.get_alerts_for_airport(db, airport_id)


@router.patch("/alerts/{alert_id}", response_model=DispatchAlertOut)
def update_alert_status(alert_id: int, body: AlertStatusUpdate, db: Session = Depends(get_db)):
    alert = alert_service.update_status(db, alert_id, body.status)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert
