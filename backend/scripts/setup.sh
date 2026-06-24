#!/bin/bash

# Qual Engine Initial Setup Script
# Sets up the backend for first-time deployment

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check system requirements
check_requirements() {
    log_step "Checking system requirements..."

    # Check Python version
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        log_info "Python version: $PYTHON_VERSION"
    else
        log_error "Python 3 is not installed"
        exit 1
    fi

    # Check Docker
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
        log_info "Docker version: $DOCKER_VERSION"
    else
        log_warn "Docker is not installed (optional for local development)"
    fi

    # Check PostgreSQL client
    if command -v psql &> /dev/null; then
        log_info "PostgreSQL client found"
    else
        log_warn "PostgreSQL client not found (optional)"
    fi

    # Check ffmpeg
    if command -v ffmpeg &> /dev/null; then
        log_info "ffmpeg found"
    else
        log_warn "ffmpeg not found (required for media processing)"
        log_warn "Install with: apt-get install ffmpeg (Ubuntu) or brew install ffmpeg (Mac)"
    fi

    # Check Redis
    if command -v redis-cli &> /dev/null; then
        log_info "Redis client found"
    else
        log_warn "Redis not found (required for caching and Celery)"
        log_warn "Install with: apt-get install redis (Ubuntu) or brew install redis (Mac)"
    fi
}

# Setup Python virtual environment
setup_venv() {
    log_step "Setting up Python virtual environment..."

    cd "$PROJECT_ROOT"

    if [ ! -d "venv" ]; then
        python3 -m venv venv
        log_info "Virtual environment created"
    else
        log_info "Virtual environment already exists"
    fi

    # Activate venv
    source venv/bin/activate

    # Upgrade pip
    pip install --upgrade pip
}

# Install dependencies
install_dependencies() {
    log_step "Installing Python dependencies..."

    cd "$PROJECT_ROOT"

    # Install production dependencies
    pip install -r requirements.txt

    # Ask if dev dependencies should be installed
    echo -n "Install development dependencies? (y/n): "
    read -r install_dev
    if [ "$install_dev" == "y" ]; then
        if [ -f "requirements-dev.txt" ]; then
            pip install -r requirements-dev.txt
        else
            log_warn "requirements-dev.txt not found"
        fi
    fi

    log_info "Dependencies installed"
}

# Setup environment file
setup_env() {
    log_step "Setting up environment configuration..."

    cd "$PROJECT_ROOT"

    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_info "Created .env from .env.example"
            log_warn "Please edit .env and configure your settings"

            # Generate secret keys
            JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))")
            SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")

            # Update .env with generated secrets
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s/your-jwt-secret-key-change-this/$JWT_SECRET/" .env
                sed -i '' "s/your-secret-key-here-change-in-production/$SECRET_KEY/" .env
            else
                # Linux
                sed -i "s/your-jwt-secret-key-change-this/$JWT_SECRET/" .env
                sed -i "s/your-secret-key-here-change-in-production/$SECRET_KEY/" .env
            fi

            log_info "Generated secure secret keys"
        else
            log_error ".env.example not found"
            exit 1
        fi
    else
        log_info ".env file already exists"
    fi
}

# Setup database
setup_database() {
    log_step "Setting up database..."

    echo -n "Use SQLite for development? (y/n): "
    read -r use_sqlite

    if [ "$use_sqlite" == "y" ]; then
        log_info "Using SQLite for development"
        # SQLite is already configured in .env.example
    else
        log_info "Setting up PostgreSQL..."

        echo -n "PostgreSQL host [localhost]: "
        read -r pg_host
        pg_host=${pg_host:-localhost}

        echo -n "PostgreSQL port [5432]: "
        read -r pg_port
        pg_port=${pg_port:-5432}

        echo -n "PostgreSQL database name [qualengine]: "
        read -r pg_db
        pg_db=${pg_db:-qualengine}

        echo -n "PostgreSQL username [qualengine]: "
        read -r pg_user
        pg_user=${pg_user:-qualengine}

        echo -n "PostgreSQL password: "
        read -rs pg_pass
        echo

        # Update .env
        DATABASE_URL="postgresql://$pg_user:$pg_pass@$pg_host:$pg_port/$pg_db"

        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" .env
        else
            sed -i "s|DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" .env
        fi

        log_info "PostgreSQL configured"
    fi

    # Run migrations
    log_info "Running database migrations..."
    source venv/bin/activate
    alembic upgrade head

    log_info "Database setup complete"
}

# Create storage directories
create_directories() {
    log_step "Creating storage directories..."

    cd "$PROJECT_ROOT"

    # Create directories for Phase 6
    directories=(
        "storage/media"
        "storage/waveforms"
        "storage/sync"
        "storage/thumbnails"
        "storage/models"
        "storage/datasets"
        "storage/exports"
        "storage/static"
        "logs"
    )

    for dir in "${directories[@]}"; do
        mkdir -p "$dir"
        log_info "Created $dir"
    done

    # Set permissions
    chmod -R 755 storage
    chmod -R 755 logs
}

# Setup Redis
setup_redis() {
    log_step "Setting up Redis..."

    if command -v redis-server &> /dev/null; then
        echo -n "Start Redis server? (y/n): "
        read -r start_redis
        if [ "$start_redis" == "y" ]; then
            redis-server --daemonize yes
            log_info "Redis server started"
        fi
    else
        log_warn "Redis not installed. Install it for caching and Celery support"
    fi
}

# Create initial admin user
create_admin() {
    log_step "Creating admin user..."

    source venv/bin/activate
    cd "$PROJECT_ROOT"

    python3 << EOF
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal, engine
from app.models import User, Org
from passlib.context import CryptContext
import uuid
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db = SessionLocal()

# Check if admin already exists
admin = db.query(User).filter(User.email == "admin@qualengine.com").first()
if admin:
    print("Admin user already exists")
else:
    # Create organization
    org = Org(
        id=str(uuid.uuid4()),
        name="Qual Engine Admin",
        plan="enterprise",
        created_at=datetime.utcnow()
    )
    db.add(org)

    # Create admin user
    admin = User(
        id=str(uuid.uuid4()),
        email="admin@qualengine.com",
        hashed_password=pwd_context.hash("admin123"),
        full_name="System Administrator",
        role="admin",
        org_id=org.id,
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(admin)

    db.commit()
    print("Admin user created successfully")
    print("Email: admin@qualengine.com")
    print("Password: admin123")
    print("⚠️  Please change the password immediately!")

db.close()
EOF
}

# Test the setup
test_setup() {
    log_step "Testing setup..."

    source venv/bin/activate
    cd "$PROJECT_ROOT"

    # Try to import the app
    python3 -c "from app.main import app; print('✅ App imports successfully')" || {
        log_error "Failed to import app"
        exit 1
    }

    # Check health endpoint
    log_info "Starting server for health check..."
    uvicorn app.main:app --port 8000 &
    SERVER_PID=$!

    sleep 5

    if curl -f http://localhost:8000/health &> /dev/null; then
        log_info "✅ Health check passed"
    else
        log_warn "Health check failed"
    fi

    # Stop server
    kill $SERVER_PID 2>/dev/null || true
}

# Main setup flow
main() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}   Qual Engine Backend Setup Script${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo

    check_requirements
    setup_venv
    install_dependencies
    setup_env
    create_directories
    setup_database
    setup_redis
    create_admin

    echo
    log_step "Setup complete! 🎉"
    echo
    log_info "Next steps:"
    echo "  1. Edit .env file with your configuration"
    echo "  2. Run: source venv/bin/activate"
    echo "  3. Start development server: uvicorn app.main:app --reload"
    echo "  4. Start Celery worker: celery -A app.tasks worker --loglevel=info"
    echo "  5. Access API docs: http://localhost:8000/docs"
    echo
    log_info "For production deployment, run: ./scripts/deploy.sh production"
}

# Run main function
main