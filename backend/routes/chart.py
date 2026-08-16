from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.models import BusinessMetric
from backend.db import get_db
from backend.visualization.chart_engine import ChartEngine
from backend.routes.dashboard import get_latest_csv_data
import pandas as pd

router = APIRouter()

# Keywords in metric names that map to a specific chart type and params
_METRIC_CHART_MAP = [
    (["time", "trend", "date", "daily", "monthly"],
     "time_series", {"metric": "Sales"}),
    (["region", "regional", "geography"],
     "bar", {"dimension": "Region", "metric": "Sales"}),
    (["product", "item", "category"],
     "bar", {"dimension": "Product", "metric": "Sales"}),
    (["gender", "sex"],
     "pie", {"dimension": "Customer_Gender", "metric": "Sales"}),
    (["age", "demographic", "segment"],
     "bar", {"dimension": "Customer_Age", "metric": "Sales"}),
    (["satisfaction", "rating", "score"],
     "bar", {"dimension": "Product", "metric": "Customer_Satisfaction"}),
]

def _resolve_chart_params(metric_name: str):
    """Derive chart type and params from the metric name."""
    name_lower = (metric_name or "").lower()
    for keywords, chart_type, params in _METRIC_CHART_MAP:
        if any(kw in name_lower for kw in keywords):
            return chart_type, params
    # Default: bar chart of sales by product
    return "bar", {"dimension": "Product", "metric": "Sales"}

@router.get("/api/chart/{metric_id}")
def get_chart(metric_id: int, db: Session = Depends(get_db)):
    metric = db.query(BusinessMetric).filter(BusinessMetric.id == metric_id).first()
    if not metric:
        raise HTTPException(status_code=404, detail="Metric not found")

    # Load latest data
    df = get_latest_csv_data(db)

    # Rename CSV columns to match ChartEngine expectations where needed
    if "Customer_Satisfaction" in df.columns:
        df["Customer_Satisfaction"] = pd.to_numeric(df["Customer_Satisfaction"], errors="coerce")
    if "Sales" not in df.columns and "Revenue" in df.columns:
        df = df.rename(columns={"Revenue": "Sales"})

    chart_type, params = _resolve_chart_params(metric.metric_name)
    params["title"] = metric.metric_name

    engine = ChartEngine()
    try:
        chart_spec = engine.create_visualization(df, chart_type, params)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chart generation failed: {str(e)}")

    return {
        "metric_id": metric.id,
        "metric_name": metric.metric_name,
        "chart_spec": chart_spec,
    }

