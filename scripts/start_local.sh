#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "  AI Recruiter - Automated Local Startup Script"
echo "=========================================================="

# 1. Check or Copy .env
if [ ! -f .env ]; then
    echo "[1/4] Generating .env configuration from .env.example..."
    cp .env.example .env
else
    echo "[1/4] .env configuration verified."
fi

# 2. Generate Master PDF Resume if missing
RESUME_PATH="backend/uploads/resumes/Adam_Blansett_Master_Resume.pdf"
if [ ! -f "$RESUME_PATH" ]; then
    echo "[2/4] Generating Adam Blansett Master PDF Resume..."
    python3 scripts/generate_master_resume.py "$RESUME_PATH"
else
    echo "[2/4] Master PDF Resume verified at: $RESUME_PATH"
fi

# 3. Check Docker Status
echo "[3/4] Checking Docker daemon status..."
if docker info > /dev/null 2>&1; then
    echo "Docker daemon is active. Starting complete AI Recruiter stack..."
    docker compose up -d --build
    echo ""
    echo "All services started successfully:"
    echo "  - React Dashboard:  http://localhost:5173 (or http://localhost:3000)"
    echo "  - FastAPI Backend:  http://localhost:8000/docs"
    echo "  - Built-in AI:      http://localhost:11434"
    echo "  - PostgreSQL DB:    localhost:5432 (user: postgres, db: ai_recruiter)"
    echo "  - Redis Queue:      localhost:6379"
else
    echo "Docker daemon is not reachable."
    echo "Please start Docker and run: docker compose up -d --build"
fi

echo "=========================================================="
