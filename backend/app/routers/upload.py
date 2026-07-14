import io
import pandas as pd
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import airport_service
from app.models.strike_event import StrikeEvent
from datetime import datetime

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("")
async def upload_synthetic_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Accept a synthetic strikes CSV and bulk-insert into synthetic_strike_events."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files accepted")

    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))

    required = {"airport_code", "time", "strike_occurred", "strike_probability",
                "f_season", "f_dawn_dusk", "f_weather", "f_base"}
    missing = required - set(df.columns)
    if missing:
        raise HTTPException(status_code=422, detail=f"Missing columns: {missing}")

    inserted = 0
    for _, row in df.iterrows():
        airport = airport_service.get_by_code(db, row["airport_code"])
        if not airport:
            continue
        event = StrikeEvent(
            airport_id=airport.airport_id,
            event_time=pd.to_datetime(row["time"]),
            strike_occurred=int(row["strike_occurred"]),
            strike_probability=float(row["strike_probability"]),
            f_season=float(row["f_season"]),
            f_dawn_dusk=float(row["f_dawn_dusk"]),
            f_weather=float(row["f_weather"]),
            f_base=float(row["f_base"]),
        )
        db.add(event)
        inserted += 1

    db.commit()
    return {"inserted": inserted, "total_rows": len(df)}
