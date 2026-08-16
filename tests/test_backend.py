# RouteRAG Backend API & Logic Tests
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.llm.analysis_graph import BusinessAnalysisGraph, route_by_type
from backend.evaluation.qa_eval import BusinessInsightEvaluator

client = TestClient(app)

def test_read_root():
    """Verify backend root health check."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "RouteRAG backend is running."}

def test_dashboard_metrics():
    """Verify dashboard metrics endpoint aggregates data correctly."""
    response = client.get("/api/dashboard/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "total_sales" in data
    assert data["total_sales"] > 0
    assert "sales_by_product" in data

def test_analytics_endpoint():
    """Verify natural language to SQL analytics endpoint."""
    response = client.get("/api/analytics?query=what+is+the+sales+trend+over+time")
    assert response.status_code == 200
    data = response.json()
    assert "result" in data
    assert "chat_response" in data
    assert len(data["result"]) > 0

def test_graph_compilation():
    """Verify LangGraph analysis workflow compiles with conditional routing."""
    graph_engine = BusinessAnalysisGraph()
    assert graph_engine.graph is not None

def test_router_classification():
    """Verify LangGraph query routing logic."""
    assert route_by_type({"input": "Show me the revenue growth over time"}) == "trend_analysis"
    assert route_by_type({"input": "Compare Widget A versus Widget B"}) == "comparative_analysis"
    assert route_by_type({"input": "Forecast future sales next quarter"}) == "predictive_analysis"
    assert route_by_type({"input": "Summarize total orders"}) == "general_analysis"

def test_evaluator_metric_parser():
    """Verify regex metric parser in BusinessInsightEvaluator."""
    evaluator = BusinessInsightEvaluator()
    sample_output = """
Accuracy: 4.5
Completeness: 5
Relevance: 4
Business Value: 4.8
Overall Feedback: Outstanding synthesis of regional sales performance.
"""
    parsed = evaluator._parse_metrics(sample_output)
    assert parsed["accuracy"] == 4.5
    assert parsed["completeness"] == 5.0
    assert parsed["relevance"] == 4.0
    assert parsed["business_value"] == 4.8
    assert "Outstanding synthesis" in parsed["overall_feedback"]
