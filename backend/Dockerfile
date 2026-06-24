# Multi-stage build for Qual Engine Backend
FROM python:3.12-slim as builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.12-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libpq5 \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1000 qualengine && \
    mkdir -p /app/storage /app/logs && \
    chown -R qualengine:qualengine /app

# Set working directory
WORKDIR /app

# Copy Python packages from builder
COPY --from=builder --chown=qualengine:qualengine /root/.local /home/qualengine/.local

# Copy application code
COPY --chown=qualengine:qualengine . .

# Set Python path
ENV PATH="/home/qualengine/.local/bin:${PATH}"
ENV PYTHONPATH="/app:${PYTHONPATH}"

# Switch to non-root user
USER qualengine

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
