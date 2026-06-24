#!/bin/bash

# Qual Engine Deployment Script
# Handles deployment to staging and production environments

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-ghcr.io}"
IMAGE_NAME="${IMAGE_NAME:-qual-engine-backend}"
VERSION="${VERSION:-latest}"

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

# Parse arguments
ENVIRONMENT=${1:-staging}
ACTION=${2:-deploy}

if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    log_error "Invalid environment: $ENVIRONMENT"
    echo "Usage: $0 [staging|production] [deploy|rollback|status]"
    exit 1
fi

# Load environment-specific configuration
if [ -f "$PROJECT_ROOT/.env.$ENVIRONMENT" ]; then
    log_info "Loading environment variables from .env.$ENVIRONMENT"
    export $(cat "$PROJECT_ROOT/.env.$ENVIRONMENT" | grep -v '^#' | xargs)
fi

# Pre-deployment checks
pre_deploy_checks() {
    log_info "Running pre-deployment checks..."

    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi

    # Check required environment variables
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL is not set"
        exit 1
    fi

    if [ -z "$JWT_SECRET_KEY" ]; then
        log_error "JWT_SECRET_KEY is not set"
        exit 1
    fi

    log_info "Pre-deployment checks passed"
}

# Build Docker image
build_image() {
    log_info "Building Docker image..."

    cd "$PROJECT_ROOT"

    # Get git commit hash for tagging
    GIT_COMMIT=$(git rev-parse --short HEAD)
    FULL_TAG="$DOCKER_REGISTRY/$IMAGE_NAME:$GIT_COMMIT"

    # Build image
    docker build \
        --build-arg BUILD_ENV=$ENVIRONMENT \
        -t "$FULL_TAG" \
        -t "$DOCKER_REGISTRY/$IMAGE_NAME:$ENVIRONMENT" \
        -t "$DOCKER_REGISTRY/$IMAGE_NAME:latest" \
        .

    log_info "Docker image built: $FULL_TAG"
    echo "$FULL_TAG" > "$PROJECT_ROOT/.last_build_tag"
}

# Push image to registry
push_image() {
    log_info "Pushing image to registry..."

    if [ ! -f "$PROJECT_ROOT/.last_build_tag" ]; then
        log_error "No build tag found. Run build first."
        exit 1
    fi

    FULL_TAG=$(cat "$PROJECT_ROOT/.last_build_tag")

    # Login to registry if credentials provided
    if [ -n "$DOCKER_USERNAME" ] && [ -n "$DOCKER_PASSWORD" ]; then
        echo "$DOCKER_PASSWORD" | docker login "$DOCKER_REGISTRY" -u "$DOCKER_USERNAME" --password-stdin
    fi

    # Push all tags
    docker push "$FULL_TAG"
    docker push "$DOCKER_REGISTRY/$IMAGE_NAME:$ENVIRONMENT"

    log_info "Image pushed successfully"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."

    if [ "$ENVIRONMENT" == "production" ]; then
        log_warn "Running migrations in production. Are you sure? (y/n)"
        read -r confirmation
        if [ "$confirmation" != "y" ]; then
            log_info "Migrations cancelled"
            return
        fi
    fi

    # Run migrations using docker
    docker run --rm \
        -e DATABASE_URL="$DATABASE_URL" \
        "$DOCKER_REGISTRY/$IMAGE_NAME:$ENVIRONMENT" \
        alembic upgrade head

    log_info "Migrations completed"
}

# Deploy with Docker Compose
deploy_compose() {
    log_info "Deploying with Docker Compose..."

    cd "$PROJECT_ROOT"

    if [ "$ENVIRONMENT" == "production" ]; then
        COMPOSE_FILE="docker-compose.prod.yml"
    else
        COMPOSE_FILE="docker-compose.yml"
    fi

    # Pull latest images
    docker-compose -f "$COMPOSE_FILE" pull

    # Stop old containers
    docker-compose -f "$COMPOSE_FILE" down

    # Start new containers
    docker-compose -f "$COMPOSE_FILE" up -d

    # Wait for health check
    log_info "Waiting for services to be healthy..."
    sleep 10

    # Check health
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "unhealthy"; then
        log_error "Some services are unhealthy"
        docker-compose -f "$COMPOSE_FILE" ps
        exit 1
    fi

    log_info "Deployment completed successfully"
}

# Deploy to Kubernetes
deploy_kubernetes() {
    log_info "Deploying to Kubernetes..."

    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi

    NAMESPACE="qual-engine-$ENVIRONMENT"
    DEPLOYMENT="backend"

    # Update image
    kubectl set image deployment/$DEPLOYMENT \
        backend="$DOCKER_REGISTRY/$IMAGE_NAME:$ENVIRONMENT" \
        -n "$NAMESPACE"

    # Wait for rollout
    kubectl rollout status deployment/$DEPLOYMENT -n "$NAMESPACE"

    log_info "Kubernetes deployment completed"
}

# Rollback deployment
rollback() {
    log_info "Rolling back deployment..."

    if [ "$DEPLOYMENT_TYPE" == "kubernetes" ]; then
        kubectl rollout undo deployment/backend -n "qual-engine-$ENVIRONMENT"
        kubectl rollout status deployment/backend -n "qual-engine-$ENVIRONMENT"
    else
        # For Docker Compose, we need to restore previous image
        log_warn "Rollback for Docker Compose requires manual intervention"
        log_warn "Previous images are tagged with git commit hashes"
    fi

    log_info "Rollback completed"
}

# Check deployment status
check_status() {
    log_info "Checking deployment status..."

    if [ "$DEPLOYMENT_TYPE" == "kubernetes" ]; then
        kubectl get pods -n "qual-engine-$ENVIRONMENT"
        kubectl get services -n "qual-engine-$ENVIRONMENT"
    else
        cd "$PROJECT_ROOT"
        if [ "$ENVIRONMENT" == "production" ]; then
            docker-compose -f docker-compose.prod.yml ps
        else
            docker-compose ps
        fi
    fi

    # Check health endpoint
    if [ -n "$HEALTH_CHECK_URL" ]; then
        log_info "Checking health endpoint..."
        curl -f "$HEALTH_CHECK_URL" || log_warn "Health check failed"
    fi
}

# Post-deployment tasks
post_deploy() {
    log_info "Running post-deployment tasks..."

    # Clear Redis cache
    if [ -n "$REDIS_URL" ]; then
        log_info "Clearing Redis cache..."
        # Add Redis clear command here
    fi

    # Warm up cache
    if [ -n "$API_BASE_URL" ]; then
        log_info "Warming up cache..."
        curl -s "$API_BASE_URL/api/v1/health" > /dev/null || true
        curl -s "$API_BASE_URL/docs" > /dev/null || true
    fi

    # Send notification
    if [ -n "$SLACK_WEBHOOK" ]; then
        log_info "Sending deployment notification..."
        curl -X POST "$SLACK_WEBHOOK" \
            -H 'Content-Type: application/json' \
            -d "{\"text\": \"Deployment to $ENVIRONMENT completed successfully\"}"
    fi

    log_info "Post-deployment tasks completed"
}

# Main execution
main() {
    log_info "Starting deployment to $ENVIRONMENT"
    log_info "Action: $ACTION"

    case "$ACTION" in
        deploy)
            pre_deploy_checks
            build_image
            push_image
            run_migrations

            # Choose deployment method
            if [ "$DEPLOYMENT_TYPE" == "kubernetes" ]; then
                deploy_kubernetes
            else
                deploy_compose
            fi

            post_deploy
            check_status
            ;;

        rollback)
            rollback
            ;;

        status)
            check_status
            ;;

        build)
            pre_deploy_checks
            build_image
            ;;

        migrate)
            run_migrations
            ;;

        *)
            log_error "Invalid action: $ACTION"
            echo "Usage: $0 [staging|production] [deploy|rollback|status|build|migrate]"
            exit 1
            ;;
    esac

    log_info "Deployment script completed"
}

# Run main function
main