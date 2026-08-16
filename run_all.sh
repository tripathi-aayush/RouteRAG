#!/bin/bash
# Script to run both RouteRAG backend (FastAPI) and frontend (Next.js) in development mode
# Usage: ./run_all.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Starting RouteRAG Development Environment ==="

# 1. Check if PostgreSQL container is running on port 5432
if ! nc -z localhost 5432 >/dev/null 2>&1; then
  echo "PostgreSQL is not listening on port 5432."
  if docker ps -a --format '{{.Names}}' | grep -q -E '^(routerag-postgres|insightforge-postgres)$'; then
    CONTAINER=$(docker ps -a --format '{{.Names}}' | grep -E '^(routerag-postgres|insightforge-postgres)$' | head -n 1)
    echo "Starting existing Docker container '$CONTAINER'..."
    docker start "$CONTAINER"
    sleep 3
  else
    echo "Launching new pgvector PostgreSQL Docker container..."
    docker run -d --name routerag-postgres \
      -e POSTGRES_DB=routerag \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_PASSWORD=postgres \
      -p 5432:5432 pgvector/pgvector:pg16
    sleep 4
  fi
fi

if nc -z localhost 5432 >/dev/null 2>&1; then
  echo "✓ PostgreSQL is active on port 5432."
else
  echo "ERROR: Unable to connect to PostgreSQL on port 5432. Please ensure Docker is running."
  exit 1
fi

# 2. Activate Python virtual environment
if [ -d ".venv" ]; then
  source .venv/bin/activate
  echo "✓ Virtual environment activated (.venv)."
else
  echo "ERROR: Virtual environment (.venv) not found. Run 'uv venv .venv' and install requirements."
  exit 1
fi

# 3. Ensure database migrations are up to date BEFORE starting apps
echo "Running database migrations..."
cd backend
python -m alembic upgrade head
cd ..
echo "✓ Alembic migrations completed."

# 4. Check and free ports 9100 (backend) and 3000 (frontend)
for PORT in 9100 3000; do
  if lsof -i :$PORT >/dev/null 2>&1; then
    PID_TO_KILL=$(lsof -ti :$PORT)
    echo "Port $PORT is occupied by PID $PID_TO_KILL. Terminating process..."
    kill -9 $PID_TO_KILL
    sleep 1
  fi
done

# 5. Start Backend (FastAPI) on port 9100
echo "" > backend.log
echo "Starting FastAPI backend on port 9100..."
(python -m uvicorn backend.main:app --reload --port 9100 --log-level info 2>&1 | tee -a backend.log) &
BACKEND_PID=$!
echo "✓ Backend running on http://127.0.0.1:9100 (PID $BACKEND_PID)"

# 6. Start Frontend (Next.js) on port 3000
echo "" > frontend.log
echo "Starting Next.js frontend on port 3000..."
cd frontend
(npm run dev -- --port 3000 2>&1 | tee -a ../frontend.log) &
FRONTEND_PID=$!
cd ..
echo "✓ Frontend running on http://localhost:3000 (PID $FRONTEND_PID)"

echo "RouteRAG is live: Web UI at http://localhost:3000 | API at http://127.0.0.1:9100"

# Cleanup on Ctrl+C
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait $BACKEND_PID $FRONTEND_PID
