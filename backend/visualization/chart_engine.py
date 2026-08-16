from typing import Dict, List, Any
import pandas as pd
import numpy as np
from datetime import datetime

class ChartEngine:
    def __init__(self):
        self.chart_types = {
            "time_series": self._create_time_series,
            "bar": self._create_bar_chart,
            "pie": self._create_pie_chart,
            "scatter": self._create_scatter_plot,
            "heatmap": self._create_heatmap,
            "funnel": self._create_funnel_chart
        }

    def create_visualization(self, data: pd.DataFrame, chart_type: str,
                           params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create a visualization specification based on data and type."""
        if chart_type not in self.chart_types:
            raise ValueError(f"Unsupported chart type: {chart_type}")

        return self.chart_types[chart_type](data, params or {})

    def _create_time_series(self, df: pd.DataFrame, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create time series chart specification."""
        metric = params.get("metric", "Revenue")
        group_by = params.get("group_by", None)

        if group_by:
            data = df.groupby(["Date", group_by])[metric].sum().reset_index()
            series = []
            for group in data[group_by].unique():
                group_data = data[data[group_by] == group]
                series.append({
                    "name": str(group),
                    "data": group_data[metric].tolist(),
                    "dates": group_data["Date"].dt.strftime("%Y-%m-%d").tolist()
                })
        else:
            data = df.groupby("Date")[metric].sum().reset_index()
            series = [{
                "name": metric,
                "data": data[metric].tolist(),
                "dates": data["Date"].dt.strftime("%Y-%m-%d").tolist()
            }]

        return {
            "type": "line",
            "series": series,
            "xAxis": {
                "type": "datetime",
                "title": "Date"
            },
            "yAxis": {
                "title": metric
            },
            "title": params.get("title", f"{metric} Over Time")
        }

    def _create_bar_chart(self, df: pd.DataFrame, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create bar chart specification."""
        dimension = params.get("dimension", "Category")
        metric = params.get("metric", "Revenue")
        sort_by = params.get("sort_by", "value")  # or 'dimension'

        data = df.groupby(dimension)[metric].sum().reset_index()
        if sort_by == "value":
            data = data.sort_values(metric, ascending=False)

        return {
            "type": "bar",
            "data": {
                "labels": data[dimension].tolist(),
                "datasets": [{
                    "data": data[metric].tolist(),
                    "backgroundColor": self._generate_colors(len(data))
                }]
            },
            "options": {
                "title": params.get("title", f"{metric} by {dimension}"),
                "scales": {
                    "y": {
                        "beginAtZero": True,
                        "title": {"display": True, "text": metric}
                    },
                    "x": {
                        "title": {"display": True, "text": dimension}
                    }
                }
            }
        }

    def _create_pie_chart(self, df: pd.DataFrame, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create pie chart specification."""
        dimension = params.get("dimension", "Category")
        metric = params.get("metric", "Revenue")

        data = df.groupby(dimension)[metric].sum()

        return {
            "type": "pie",
            "data": {
                "labels": data.index.tolist(),
                "datasets": [{
                    "data": data.values.tolist(),
                    "backgroundColor": self._generate_colors(len(data))
                }]
            },
            "options": {
                "title": params.get("title", f"{metric} Distribution by {dimension}"),
                "responsive": True
            }
        }

    def _create_scatter_plot(self, df: pd.DataFrame, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create scatter plot specification."""
        x_metric = params.get("x_metric", "Units_Sold")
        y_metric = params.get("y_metric", "Revenue")
        group_by = params.get("group_by", "Category")

        series = []
        for group in df[group_by].unique():
            group_data = df[df[group_by] == group]
            series.append({
                "name": str(group),
                "data": list(zip(
                    group_data[x_metric].tolist(),
                    group_data[y_metric].tolist()
                ))
            })

        return {
            "type": "scatter",
            "series": series,
            "xAxis": {
                "title": x_metric
            },
            "yAxis": {
                "title": y_metric
            },
            "title": params.get("title", f"{y_metric} vs {x_metric} by {group_by}")
        }

    def _create_heatmap(self, df: pd.DataFrame, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create heatmap specification."""
        row_dimension = params.get("row_dimension", "Category")
        col_dimension = params.get("col_dimension", "Region")
        metric = params.get("metric", "Revenue")

        pivot_data = df.pivot_table(
            values=metric,
            index=row_dimension,
            columns=col_dimension,
            aggfunc='sum'
        )

        return {
            "type": "heatmap",
            "data": pivot_data.values.tolist(),
            "xAxis": {
                "categories": pivot_data.columns.tolist()
            },
            "yAxis": {
                "categories": pivot_data.index.tolist()
            },
            "title": params.get("title", f"{metric} Heatmap: {row_dimension} vs {col_dimension}")
        }

    def _create_funnel_chart(self, df: pd.DataFrame, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create funnel chart specification."""
        stages = params.get("stages", ["Category"])
        metric = params.get("metric", "Revenue")

        data = []
        for stage in stages:
            value = df.groupby(stage)[metric].sum().sort_values(ascending=False).iloc[0]
            data.append({
                "name": stage,
                "value": float(value)
            })

        return {
            "type": "funnel",
            "data": {
                "labels": [d["name"] for d in data],
                "datasets": [{
                    "data": [d["value"] for d in data],
                    "backgroundColor": self._generate_colors(len(data))
                }]
            },
            "options": {
                "title": params.get("title", f"{metric} Funnel Analysis")
            }
        }

    def _generate_colors(self, n: int) -> List[str]:
        """Generate a list of distinct colors."""
        colors = [
            "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
            "#FF9F40", "#FF6384", "#C9CBCF", "#4BC0C0", "#FF9F40"
        ]
        return colors[:n]

    def get_chart_suggestions(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Suggest appropriate visualizations based on data characteristics."""
        suggestions = []

        # Time series if date column exists
        if "Date" in df.columns:
            suggestions.append({
                "type": "time_series",
                "title": "Trend Analysis",
                "params": {
                    "metric": "Revenue",
                    "group_by": "Category"
                }
            })

        # Category comparisons
        if "Category" in df.columns:
            suggestions.append({
                "type": "bar",
                "title": "Category Performance",
                "params": {
                    "dimension": "Category",
                    "metric": "Revenue"
                }
            })

        # Regional analysis
        if "Region" in df.columns:
            suggestions.append({
                "type": "pie",
                "title": "Regional Distribution",
                "params": {
                    "dimension": "Region",
                    "metric": "Revenue"
                }
            })

        # Correlation analysis
        if all(col in df.columns for col in ["Units_Sold", "Revenue"]):
            suggestions.append({
                "type": "scatter",
                "title": "Revenue vs Units Sold",
                "params": {
                    "x_metric": "Units_Sold",
                    "y_metric": "Revenue",
                    "group_by": "Category"
                }
            })

        return suggestions