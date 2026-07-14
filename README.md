# 🛡️ AvianShield

**Bird Strike Intelligence Platform for Indian Airports**

AvianShield is a full-stack AI-powered platform that predicts bird strike risk at Indian airports using real-time weather data and a trained LightGBM machine learning model. It provides live risk assessments, dispatch alerts, prediction history, and runway safety recommendations through a modern glassmorphism UI.

---

## 📸 Overview

| Dashboard | Airport Overview | Runway Safety |
|-----------|-----------------|---------------|
| Live risk map of all monitored airports | Per-airport strike probability & weather | Ranked dispatch recommendations |

---

## 🏗️ Architecture

```
AvianShield/
├── frontend/          # React + TypeScript + Tailwind (Vite)
├── backend/           # FastAPI + SQLAlchemy + PostgreSQL
└── ml_pipeline/       # LightGBM model training, evaluation & inference
```

---

## ✨ Features

### 🖥️ Frontend
- **Glassmorphism UI** — frosted glass cards, smooth transitions, shimmer skeletons
- **Dashboard** — live risk map (Leaflet) + stat cards + airport grid
- **Airport Overview** — per-airport strike probability, weather snapshot, 24-window prediction chart
- **Runway Safety Panel** — all airports ranked by risk with dispatch action recommendations
- **Prediction History** — 48-window trend chart + tabular log per airport
- **Alert Management** — filter, acknowledge and resolve dispatch alerts
- **Synthetic Data Upload** — batch ingest CSV strike data
- **System Status** — API health check + ML model performance metrics
- **Login Page** — glass-styled authentication screen
- **Client-side TTL cache** — 60-second in-memory cache on all API calls for instant page transitions

### ⚙️ Backend
- **FastAPI** REST API with full CORS support
- **Live weather** via [Open-Meteo](https://open-meteo.com/) API (30-minute server-side cache)
- **ML inference** via LightGBM model with SHAP top-factor explanations (5-minute prediction cache)
- **PostgreSQL** database with SQLAlchemy ORM and Alembic migrations
- **Endpoints:** airports, weather, predictions, alerts, CSV upload, model metrics

### 🤖 ML Pipeline
- **Synthetic dataset** — India airport bird strike data generator with habitat, season, weather and dawn/dusk factors
- **Feature engineering** — cyclic time encoding, rolling weather windows, habitat one-hot encoding
- **Model** — LightGBM with SMOTE oversampling for class imbalance
- **Evaluation** — PR-AUC, precision, recall, F1, confusion matrix
- **SHAP** — top contributing features per prediction

---

## 📊 Model Performance

| Metric | Value |
|--------|-------|
| Recall | 88.8% |
| Precision | 18.0% |
| F1-Score | 29.9% |
| PR-AUC | 0.2853 |
| Classification Threshold | 0.30 |

> High recall is prioritised — missing a real bird strike is more costly than a false alarm.

**Risk Levels:**
| Level | Probability Range |
|-------|------------------|
| Low | 0.00 – 0.30 |
| Medium | 0.31 – 0.60 |
| High | 0.61 – 1.00 |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version |
|------------|---------|
| React | 18.3 |
| TypeScript | 5.6 |
| Tailwind CSS | 3.4 |
| Vite | 5.4 |
| React Router | 6.27 |
| Recharts | 2.13 |
| React Leaflet | 4.2 |
| Axios | 1.7 |

### Backend
| Technology | Version |
|------------|---------|
| FastAPI | 0.115 |
| Uvicorn | 0.30 |
| SQLAlchemy | 2.0 |
| Alembic | 1.13 |
| Pydantic | 2.9 |
| psycopg2 | 2.9 |

### ML Pipeline
| Technology | Version |
|------------|---------|
| LightGBM | 4.5 |
| scikit-learn | 1.5 |
| imbalanced-learn | 0.12 |
| SHAP | 0.46 |
| pandas | 2.2 |
| numpy | 1.26 |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/AvianShield.git
cd AvianShield
```

### 2. Database setup
```sql
CREATE DATABASE avianshield;
```

### 3. Backend setup
```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file:
```env
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/avianshield
SECRET_KEY=changeme
ENVIRONMENT=development
```

Run migrations and seed airports:
```bash
alembic upgrade head
python app/seed_airports.py
```

Start the backend:
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. ML Pipeline (optional — model already trained)
```bash
cd ml_pipeline
python train.py       # Train the LightGBM model
python evaluate.py    # Generate metrics.json
```

### 5. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

The app will be available at **http://localhost:5173**
The API will be available at **http://localhost:8000**
API docs at **http://localhost:8000/docs**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/airports` | List all airports |
| GET | `/airports/{id}` | Get airport by ID |
| GET | `/airports/{id}/risk` | Run live prediction |
| GET | `/airports/{id}/predictions` | Prediction history |
| GET | `/airports/{id}/weather` | Weather snapshots |
| GET | `/alerts` | List dispatch alerts |
| PATCH | `/alerts/{id}` | Update alert status |
| POST | `/predict` | Manual prediction |
| POST | `/upload` | Upload CSV data |
| GET | `/model/metrics` | ML model metrics |
| GET | `/health` | API health check |

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── models/          # SQLAlchemy ORM models
│   ├── routers/         # FastAPI route handlers
│   ├── schemas/         # Pydantic request/response schemas
│   ├── services/        # Business logic & ML inference
│   ├── main.py          # FastAPI app entry point
│   └── database.py      # DB connection & session
└── alembic/             # Database migrations

frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Sidebar.tsx
│   │   ├── TopNavbar.tsx
│   │   ├── AirportCard.tsx
│   │   ├── MapPanel.tsx
│   │   ├── WeatherCard.tsx
│   │   ├── PredictionChart.tsx
│   │   ├── DispatchAlertTable.tsx
│   │   └── RiskLevelBadge.tsx
│   ├── pages/           # Page-level components
│   │   ├── Dashboard.tsx
│   │   ├── AirportOverview.tsx
│   │   ├── RunwaySafetyPanel.tsx
│   │   ├── PredictionHistory.tsx
│   │   ├── AlertManagement.tsx
│   │   ├── SyntheticDataUpload.tsx
│   │   ├── SystemStatus.tsx
│   │   └── Login.tsx
│   └── services/
│       └── api.ts       # Axios client with TTL cache

ml_pipeline/
├── train.py             # Model training
├── evaluate.py          # Model evaluation
├── predict.py           # Inference function
├── features.py          # Feature engineering
├── data_generation/     # Synthetic data generator
└── models/
    ├── avianshield_lgbm.pkl
    └── metrics.json
```

---

## 🔐 Default Login

```
Email:    admin@avianshield.in
Password: admin
```

---

## 📄 License

This project is for educational and research purposes.

---

*Built with ❤️ for aviation safety in India*
