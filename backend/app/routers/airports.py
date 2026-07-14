from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.services import airport_service
from app.schemas.airport_schema import AirportOut, AirportCreate

router = APIRouter(prefix="/airports", tags=["airports"])


@router.get("", response_model=List[AirportOut])
def list_airports(db: Session = Depends(get_db)):
    return airport_service.get_all(db)


@router.get("/{airport_id}", response_model=AirportOut)
def get_airport(airport_id: int, db: Session = Depends(get_db)):
    airport = airport_service.get_by_id(db, airport_id)
    if not airport:
        raise HTTPException(status_code=404, detail="Airport not found")
    return airport


@router.post("", response_model=AirportOut, status_code=201)
def create_airport(data: AirportCreate, db: Session = Depends(get_db)):
    return airport_service.create(db, data)
