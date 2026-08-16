import pandas as pd
import numpy as np
from typing import List, Dict, Any
import json

def process_business_data(raw_content: str) -> Dict[str, Any]:
    """Process uploaded business data and extract key insights."""
    df = pd.read_csv(raw_content)

    insights = {
        "summary": {
            "total_records": len(df),
            "time_range": {
                "start": df['Date'].min(),
                "end": df['Date'].max()
            }
        },
        "metrics": {
            "total_revenue": df['Revenue'].sum(),
            "total_units": df['Units_Sold'].sum(),
            "avg_order_value": df['Revenue'].mean()
        },
        "dimensions": {
            "categories": df['Category'].unique().tolist(),
            "regions": df['Region'].unique().tolist(),
            "products": df['Product'].unique().tolist()
        },
        "key_insights": []
    }

    # Revenue by category
    category_revenue = df.groupby('Category')['Revenue'].sum().to_dict()
    insights['analysis']['category_performance'] = category_revenue

    # Region analysis
    region_analysis = df.groupby('Region').agg({
        'Revenue': ['sum', 'mean'],
        'Units_Sold': 'sum'
    }).to_dict()
    insights['analysis']['regional_performance'] = region_analysis

    # Time series analysis
    time_series = df.groupby('Date').agg({
        'Revenue': 'sum',
        'Units_Sold': 'sum'
    }).to_dict()
    insights['analysis']['time_series'] = time_series

    # Product performance
    product_analysis = df.groupby('Product').agg({
        'Revenue': 'sum',
        'Units_Sold': 'sum'
    }).sort_values('Revenue', ascending=False).head(5).to_dict()
    insights['analysis']['top_products'] = product_analysis

    return insights

def generate_chart_spec(data: Dict[str, Any], chart_type: str) -> Dict[str, Any]:
    """Generate visualization specifications."""
    if chart_type == "revenue_by_category":
        return {
            "type": "bar",
            "data": data['analysis']['category_performance'],
            "options": {
                "title": "Revenue by Category",
                "xAxis": "Category",
                "yAxis": "Revenue"
            }
        }
    elif chart_type == "regional_performance":
        return {
            "type": "pie",
            "data": data['analysis']['regional_performance']['Revenue']['sum'],
            "options": {
                "title": "Revenue Distribution by Region"
            }
        }
    elif chart_type == "revenue_trend":
        return {
            "type": "line",
            "data": data['analysis']['time_series']['Revenue'],
            "options": {
                "title": "Revenue Trend Over Time",
                "xAxis": "Date",
                "yAxis": "Revenue"
            }
        }
    elif chart_type == "top_products":
        return {
            "type": "bar",
            "data": data['analysis']['top_products']['Revenue'],
            "options": {
                "title": "Top 5 Products by Revenue",
                "xAxis": "Product",
                "yAxis": "Revenue"
            }
        }

    return None