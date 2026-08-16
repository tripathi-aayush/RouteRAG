# RouteRAG Setup Guide

## Backend
1. Create and activate Python virtual environment
2. Install dependencies: `pip install -r backend/requirements.txt`
3. Set up PostgreSQL and update connection string in `backend/.env`
4. Run Alembic migrations: `cd backend && python -m alembic upgrade head`
5. Start FastAPI: `uvicorn backend.main:app --reload --port 9100`

## Frontend
1. `cd frontend`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev -- --port 3000`

## Environment Variables
- `GOOGLE_API_KEY` for Google Gemini LLM & embeddings
- `DATABASE_URL` for PostgreSQL pgvector connection

