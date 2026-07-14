import os
import json
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.model_metric import ModelMetric

router = APIRouter(prefix="/model", tags=["metrics"])

# backend/app/routers/ -> backend/app/ -> backend/ -> root -> ml_pipeline/models/
_METRICS_PATH = os.path.abspath(os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "..", "..", "ml_pipeline", "models", "metrics.json"
))


@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db)):
    if not os.path.exists(_METRICS_PATH):
        raise HTTPException(status_code=404, detail="metrics.json not found — run evaluate.py first")

    with open(_METRICS_PATH) as f:
        data = json.load(f)

    existing = (
        db.query(ModelMetric)
        .filter(ModelMetric.model_name == data["model_name"], ModelMetric.version == data["version"])
        .first()
    )
    if not existing:
        db.add(ModelMetric(
            model_name=data["model_name"],
            version=data["version"],
            precision=data["precision"],
            recall=data["recall"],
            f1_score=data["f1_score"],
            pr_auc=data["pr_auc"],
            evaluation_date=date.today(),
        ))
        db.commit()

    return data
