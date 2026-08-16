# RouteRAG FastAPI app entrypoint
from fastapi import FastAPI
from backend.routes import rag, upload, session, feedback, chart, analytics, dashboard, evaluate

app = FastAPI(title="RouteRAG API", description="RouteRAG Business Intelligence API")

app.include_router(rag.router)
app.include_router(upload.router)
app.include_router(session.router)
app.include_router(feedback.router)
app.include_router(chart.router)
app.include_router(analytics.router)
app.include_router(dashboard.router)
app.include_router(evaluate.router)

@app.get("/")
def read_root():
    return {"message": "RouteRAG backend is running."}

# Placeholder for future endpoints (query, session, feedback, etc.)
