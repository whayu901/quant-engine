#!/bin/bash

echo "🚀 Starting Qual Engine Backend..."
echo "=================================="

# Activate virtual environment
source venv/bin/activate

echo "📦 Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "🗄️ Running database migrations..."
alembic upgrade head

echo ""
echo "🌱 Seeding database with demo data..."
python seed.py

echo ""
echo "✅ Starting API server..."
echo "API will be available at: http://localhost:8000"
echo "API docs at: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop"
echo "=================================="

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000