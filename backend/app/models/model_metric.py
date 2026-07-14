from sqlalchemy import Column, Integer, Float, String, Date
from app.database import Base


class ModelMetric(Base):
    __tablename__ = "model_metrics"

    metric_id       = Column(Integer, primary_key=True, index=True)
    model_name      = Column(String(100), nullable=False)
    version         = Column(String(20), nullable=False)
    precision       = Column(Float)
    recall          = Column(Float)
    f1_score        = Column(Float)
    pr_auc          = Column(Float)
    evaluation_date = Column(Date, nullable=False)
