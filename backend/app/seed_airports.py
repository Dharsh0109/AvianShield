"""
Run once after alembic upgrade head to seed the airports table.
Usage: python seed_airports.py
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import SessionLocal
from app.models.airport import Airport

AIRPORTS = [
    {"airport_code": "DEL", "airport_name": "Delhi Indira Gandhi International",
     "latitude": 28.5562, "longitude": 77.1000, "habitat_profile": "riverine",       "elevation": 237.0},
    {"airport_code": "BOM", "airport_name": "Mumbai Chhatrapati Shivaji Maharaj International",
     "latitude": 19.0896, "longitude": 72.8656, "habitat_profile": "coastal",         "elevation": 11.0},
    {"airport_code": "BLR", "airport_name": "Bengaluru Kempegowda International",
     "latitude": 13.1986, "longitude": 77.7066, "habitat_profile": "inland_scrub",    "elevation": 915.0},
    {"airport_code": "MAA", "airport_name": "Chennai International",
     "latitude": 12.9941, "longitude": 80.1709, "habitat_profile": "coastal_wetland", "elevation": 16.0},
    {"airport_code": "AMD", "airport_name": "Ahmedabad Sardar Vallabhbhai Patel International",
     "latitude": 23.0772, "longitude": 72.6347, "habitat_profile": "wetland",         "elevation": 57.0},
    {"airport_code": "GAU", "airport_name": "Guwahati Lokpriya Gopinath Bordoloi International",
     "latitude": 26.1061, "longitude": 91.5859, "habitat_profile": "floodplain",      "elevation": 49.0},
]


def seed():
    db = SessionLocal()
    try:
        for data in AIRPORTS:
            exists = db.query(Airport).filter(Airport.airport_code == data["airport_code"]).first()
            if not exists:
                db.add(Airport(**data))
        db.commit()
        count = db.query(Airport).count()
        print(f"Airports in DB: {count}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
