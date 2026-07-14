from sqlalchemy.orm import Session
from app.models.airport import Airport
from app.schemas.airport_schema import AirportCreate


def get_all(db: Session):
    return db.query(Airport).order_by(Airport.airport_code).all()


def get_by_id(db: Session, airport_id: int):
    return db.query(Airport).filter(Airport.airport_id == airport_id).first()


def get_by_code(db: Session, code: str):
    return db.query(Airport).filter(Airport.airport_code == code).first()


def create(db: Session, data: AirportCreate):
    obj = Airport(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
