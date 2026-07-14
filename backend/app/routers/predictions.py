from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.services import airport_service, prediction_service
from app.schemas.prediction_schema import PredictionOut, PredictRequest

router = APIRouter(tags=["predictions"])


@router.get("/airports/{airport_id}/risk", response_model=PredictionOut)
def get_risk(airport_id: int, db: Session = Depends(get_db)):
    """Fetch live weather, run inference, persist and return the prediction."""
    airport = airport_service.get_by_id(db, airport_id)
    if not airport:
        raise HTTPException(status_code=404, detail="Airport not found")
    window, result = prediction_service.run_prediction(db, airport)
    return PredictionOut(
        window_id=window.window_id,
        airport_id=airport.airport_id,
        window_start=window.window_start,
        window_end=window.window_end,
        predicted_probability=window.predicted_probability,
        risk_level=window.risk_level,
        model_version=window.model_version,
        top_factors=result.get("top_factors", []),
    )


@router.post("/predict", response_model=PredictionOut)
def predict_manual(req: PredictRequest, db: Session = Depends(get_db)):
    """Run inference with manually supplied weather values (no live fetch)."""
    from datetime import datetime, timedelta, timezone
    from app.services import ml_service, alert_service
    from app.models.prediction_window import PredictionWindow

    airport = airport_service.get_by_id(db, req.airport_id)
    if not airport:
        raise HTTPException(status_code=404, detail="Airport not found")

    result = ml_service.run_inference(
        temperature=req.temperature,
        visibility=req.visibility,
        wind_speed=req.wind_speed,
        precipitation=req.precipitation,
        cloud_cover=req.cloud_cover,
        hour=req.hour,
        month=req.month,
        habitat_profile=airport.habitat_profile,
    )

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    window = PredictionWindow(
        airport_id=airport.airport_id,
        window_start=now,
        window_end=now + timedelta(hours=3),
        predicted_probability=result["probability"],
        risk_level=result["risk_level"],
        model_version="1.0.0",
        generated_at=now,
    )
    db.add(window)
    db.commit()
    db.refresh(window)
    alert_service.create_alert(db, airport, window, result)

    return PredictionOut(
        window_id=window.window_id,
        airport_id=airport.airport_id,
        window_start=window.window_start,
        window_end=window.window_end,
        predicted_probability=window.predicted_probability,
        risk_level=window.risk_level,
        model_version=window.model_version,
        top_factors=result.get("top_factors", []),
    )


@router.get("/airports/{airport_id}/predictions", response_model=List[PredictionOut])
def prediction_history(airport_id: int, limit: int = 48, db: Session = Depends(get_db)):
    airport = airport_service.get_by_id(db, airport_id)
    if not airport:
        raise HTTPException(status_code=404, detail="Airport not found")
    rows = prediction_service.get_recent_predictions(db, airport_id, limit)
    return [
        PredictionOut(
            window_id=r.window_id,
            airport_id=r.airport_id,
            window_start=r.window_start,
            window_end=r.window_end,
            predicted_probability=r.predicted_probability,
            risk_level=r.risk_level,
            model_version=r.model_version,
        )
        for r in rows
    ]
