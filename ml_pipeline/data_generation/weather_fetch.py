"""
AvianShield - Step 1: Real Weather Data Fetcher
Fetches hourly historical weather (2020-2023) for 6 Indian airports
from the Open-Meteo Historical Weather API (free, no signup).
Output: ml_pipeline/data/raw/weather/india_airports_weather.csv
"""

import os
import time
import requests
import pandas as pd

AIRPORTS = {
    "DEL": {"name": "Delhi (IGI)",        "lat": 28.5562, "lon": 77.1000, "profile": "riverine"},
    "BOM": {"name": "Mumbai (CSMIA)",     "lat": 19.0896, "lon": 72.8656, "profile": "coastal"},
    "BLR": {"name": "Bengaluru (KIA)",    "lat": 13.1986, "lon": 77.7066, "profile": "inland_scrub"},
    "MAA": {"name": "Chennai (MAA)",      "lat": 12.9941, "lon": 80.1709, "profile": "coastal_wetland"},
    "AMD": {"name": "Ahmedabad (SVPI)",   "lat": 23.0772, "lon": 72.6347, "profile": "wetland"},
    "GAU": {"name": "Guwahati (LGBI)",    "lat": 26.1061, "lon": 91.5859, "profile": "floodplain"},
}

START_DATE = "2020-01-01"
END_DATE   = "2023-12-31"
BASE_URL   = "https://archive-api.open-meteo.com/v1/archive"

# ml_pipeline/data_generation/ -> ml_pipeline/ -> root
_HERE      = os.path.dirname(os.path.abspath(__file__))
_ML        = os.path.abspath(os.path.join(_HERE, ".."))
OUTPUT_DIR = os.path.join(_ML, "data", "raw", "weather")
OUTPUT_CSV = os.path.join(OUTPUT_DIR, "india_airports_weather.csv")


def fetch_airport(code: str, info: dict) -> pd.DataFrame:
    params = {
        "latitude":  info["lat"],
        "longitude": info["lon"],
        "start_date": START_DATE,
        "end_date":   END_DATE,
        "hourly": "temperature_2m,windspeed_10m,visibility,precipitation,cloudcover",
        "timezone": "Asia/Kolkata",
    }
    print(f"  Fetching {code} ({info['name']})...", flush=True)
    r = requests.get(BASE_URL, params=params, timeout=90)
    r.raise_for_status()
    df = pd.DataFrame(r.json()["hourly"])
    df["airport_code"] = code
    df["airport_name"] = info["name"]
    df["profile"]      = info["profile"]
    df["lat"]          = info["lat"]
    df["lon"]          = info["lon"]
    return df


def fetch_all() -> pd.DataFrame:
    frames = []
    for code, info in AIRPORTS.items():
        frames.append(fetch_airport(code, info))
        time.sleep(1)
    df = pd.concat(frames, ignore_index=True)
    df["time"] = pd.to_datetime(df["time"])
    print(f"\nTotal records fetched: {len(df):,}")
    return df


if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    df = fetch_all()
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"Saved -> {OUTPUT_CSV}")
    print(df.head(3).to_string())
