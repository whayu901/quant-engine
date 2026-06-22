#!/bin/bash

# Local setup script for Qual Engine - Phase 0
# This script sets up the application locally without Docker

echo "🚀 Qual Engine - Local Setup (Phase 0)"
echo "======================================"

# Check Python version
echo "Checking Python version..."
python3 --version

# Backend setup
echo ""
echo "📦 Setting up Backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Copy .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp ../.env.example .env
fi

# Run migrations
echo ""
echo "🗄️  Running database migrations..."
alembic upgrade head

# Seed database
echo ""
echo "🌱 Seeding database with demo data..."
python seed.py

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "To start the backend server, run:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --reload"
echo ""
echo "To start the Celery worker (in another terminal):"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  celery -A app.celery_app worker --loglevel=info"
echo ""
echo "Demo credentials:"
echo "  Admin: admin@demo.com / admin123"
echo "  Researcher: researcher@demo.com / research123"
echo "  Viewer: viewer@demo.com / viewer123"
echo ""
echo "API docs will be available at: http://localhost:8000/docs"