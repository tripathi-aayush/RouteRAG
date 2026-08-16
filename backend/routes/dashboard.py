from fastapi import APIRouter, Depends
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.db import get_db
from backend.models import BusinessDocument, SalesRecord, Product, Customer
import io

router = APIRouter()

def get_latest_csv_data(db: Session):
    # Get the most recent CSV upload
    latest_doc = (
        db.query(BusinessDocument)
        .filter(BusinessDocument.source_type == "upload")
        .order_by(BusinessDocument.created_at.desc())
        .first()
    )

    if latest_doc and latest_doc.raw_content:
        # Convert CSV content to DataFrame
        df = pd.read_csv(io.StringIO(latest_doc.raw_content))
        return df

    # Fallback to sample data if no uploads
    return pd.read_csv("sample_sales_data.csv")

# Column aliases: map common alternative names to the expected column names
_COLUMN_ALIASES = {
    "date": "Date",
    "product": "Product",
    "region": "Region",
    "sales": "Sales",
    "revenue": "Sales",
    "units": "Sales",
    "customer_age": "Customer_Age",
    "age": "Customer_Age",
    "customer_gender": "Customer_Gender",
    "gender": "Customer_Gender",
    "customer_satisfaction": "Customer_Satisfaction",
    "satisfaction": "Customer_Satisfaction",
}

_REQUIRED_COLUMNS = {"Date", "Product", "Region", "Sales", "Customer_Age", "Customer_Gender", "Customer_Satisfaction"}

def _normalise_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Rename uploaded CSV columns to match the expected schema."""
    rename_map = {}
    for col in df.columns:
        normalised = _COLUMN_ALIASES.get(col.strip().lower())
        if normalised and col != normalised:
            rename_map[col] = normalised
    if rename_map:
        df = df.rename(columns=rename_map)
    return df

@router.get("/api/dashboard/metrics")
async def get_dashboard_metrics(db: Session = Depends(get_db)):
    try:
        df = get_latest_csv_data(db)
        df = _normalise_columns(df)

        # Check all required columns are present
        missing = _REQUIRED_COLUMNS - set(df.columns)
        if missing:
            return {
                "error": f"Uploaded file is missing required columns: {', '.join(sorted(missing))}. "
                         f"Expected: Date, Product, Region, Sales, Customer_Age, Customer_Gender, Customer_Satisfaction."
            }

        # Ensure correct types
        df["Customer_Satisfaction"] = pd.to_numeric(df["Customer_Satisfaction"], errors="coerce")
        df["Customer_Age"] = pd.to_numeric(df["Customer_Age"], errors="coerce")
        df["Sales"] = pd.to_numeric(df["Sales"], errors="coerce")

        # Calculate metrics from the latest data
        metrics = {
            "total_sales": len(df),
            "avg_satisfaction": round(float(df['Customer_Satisfaction'].mean()), 2),
            "total_products": len(df['Product'].unique()),
            "regions": len(df['Region'].unique()),
            "data_source": "upload" if (
                db.query(BusinessDocument)
                .filter(BusinessDocument.source_type == "upload")
                .first()
            ) else "sample",

            # Charts data
            "sales_by_product": df.groupby('Product').size().to_dict(),
            "satisfaction_by_region": df.groupby('Region')['Customer_Satisfaction'].mean().round(2).to_dict(),
            "age_distribution": df['Customer_Age'].value_counts().sort_index().to_dict(),
            "sales_by_region": df.groupby('Region').size().to_dict(),
            "sales_by_gender": df.groupby('Customer_Gender').size().to_dict(),
            "sales_trend": df.groupby('Date').size().to_dict(),

            # Recent queries from uploaded data
            "recent_queries": [
                {
                    "id": 1,
                    "query": f"Analyzing data from {df.shape[0]} records",
                    "timestamp": datetime.now().isoformat()
                }
            ]
        }

        return metrics
    except Exception as e:
        return {"error": str(e)}