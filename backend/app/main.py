from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import airports, weather, predictions, alerts, upload, metrics

app = FastAPI(
    title="AvianShield API",
    description="Bird-strike risk prediction platform for Indian airports",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(airports.router)
app.include_router(weather.router)
app.include_router(predictions.router)
app.include_router(alerts.router)
app.include_router(upload.router)
app.include_router(metrics.router)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "service": "AvianShield API"}
