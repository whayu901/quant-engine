# Data & AI Orchestration System for Qual Engine

## Project Goals (vs Competitor: CoLoop.ai)
- **Build AI-powered qualitative research platform** surpassing CoLoop
- **Southeast Asia focus**: Code-mixed languages, regional compliance, local pricing
- **Handle millions of data points** with smooth performance (no lag)
- **Enterprise-grade**: Multi-tenancy, RBAC, PII masking, audit trails

## Agent Registry & Capabilities

### AI & Machine Learning Team
```yaml
ai-engineer:
  role: Chief AI Architect
  expertise: [LLMs, NLP, Computer Vision, Audio Processing]
  responsibilities:
    - Design AI pipelines for transcription & analysis
    - Optimize Claude/GPT integration
    - Implement RAG architecture
    - Build recommendation systems

  tech_stack:
    - LLMs: [Claude, GPT-4, Llama, Southeast Asia models]
    - Frameworks: [LangChain, Transformers, spaCy]
    - Embeddings: [OpenAI, Sentence-BERT, Multilingual models]
    - Audio: [Whisper, Deepgram, AssemblyAI]

  current_context:
    challenges:
      - Southeast Asia languages (code-mixing)
      - Real-time transcription at scale
      - Context-aware analysis
    opportunities:
      - Custom SEA language models
      - Hybrid cloud/edge processing
      - Multimodal analysis (audio + video + text)

data-scientist:
  role: Analytics & Insights Lead
  expertise: [Statistical Analysis, ML Models, Predictive Analytics]
  responsibilities:
    - Design statistical models for qual/quant analysis
    - Build predictive models for insights
    - Create clustering algorithms for themes
    - Develop sentiment analysis models

  tech_stack:
    - Python: [scikit-learn, statsmodels, scipy]
    - Deep Learning: [PyTorch, TensorFlow]
    - Visualization: [Plotly, D3.js]
    - Analysis: [pandas, numpy, polars]

  current_context:
    focus_areas:
      - Theme extraction algorithms
      - Sentiment analysis for SEA markets
      - Cross-cultural insight detection
      - Statistical significance testing

data-analyst:
  role: Business Intelligence Lead
  expertise: [Data Visualization, Reporting, KPIs]
  responsibilities:
    - Design dashboards and reports
    - Create data stories from research
    - Build executive summaries
    - Monitor platform metrics

  tech_stack:
    - BI Tools: [Tableau, PowerBI, Looker]
    - SQL: [Complex queries, Window functions]
    - Python: [pandas, matplotlib, seaborn]
    - Frontend: [Recharts, D3.js, Chart.js]

  current_context:
    deliverables:
      - Client dashboards (millions of records)
      - Real-time analytics
      - Automated report generation
      - Cross-project insights
```

### Data Engineering & Database Team
```yaml
data-engineer:
  role: Data Pipeline Architect
  expertise: [ETL/ELT, Streaming, Data Lakes]
  responsibilities:
    - Build scalable data pipelines
    - Implement real-time processing
    - Design data warehouse architecture
    - Manage data quality & governance

  tech_stack:
    - Pipelines: [Apache Airflow, Prefect, Dagster]
    - Streaming: [Kafka, Redis Streams, Pulsar]
    - Processing: [Apache Spark, Dask, Polars]
    - Storage: [S3, MinIO, Data Lakes]

  current_context:
    architecture:
      - Ingestion: Multi-format (audio/video/docs)
      - Processing: Async with Celery + Redis
      - Storage: PostgreSQL + pgvector + S3
      - Caching: Redis for hot data

    optimizations_needed:
      - Batch processing for millions of records
      - Stream processing for real-time insights
      - Data partitioning strategies
      - Incremental processing

postgres-pro:
  role: PostgreSQL Performance Expert
  expertise: [Query Optimization, Indexing, Partitioning, Extensions]
  responsibilities:
    - Optimize database performance
    - Design efficient schemas
    - Implement pgvector for embeddings
    - Configure replication & sharding

  tech_stack:
    - Extensions: [pgvector, pg_stat_statements, pg_trgm]
    - Monitoring: [pg_stat_monitor, pgBadger]
    - Optimization: [EXPLAIN ANALYZE, pg_hint_plan]
    - Replication: [Streaming, Logical, pgpool]

  current_context:
    database_state:
      - Current: SQLite (dev) → PostgreSQL (prod)
      - Tables: 35+ across phases
      - Records: Millions expected
      - Extensions: pgvector for embeddings

    critical_optimizations:
      - Index strategy for transcript searches
      - Partitioning for time-series data
      - Full-text search optimization
      - Vector similarity search tuning

database-optimizer:
  role: Query Performance Specialist
  expertise: [Query Plans, Caching, Connection Pooling]
  responsibilities:
    - Analyze and optimize slow queries
    - Implement caching strategies
    - Design materialized views
    - Monitor database health

  tech_stack:
    - Tools: [pgAdmin, DataGrip, pgcli]
    - Caching: [Redis, Memcached, Query caching]
    - Monitoring: [Prometheus, Grafana, New Relic]
    - Pooling: [PgBouncer, Pgpool-II]

  current_context:
    performance_targets:
      - Query response: <100ms for dashboards
      - Concurrent users: 1000+
      - Data volume: 100M+ records
      - Uptime: 99.9%

    bottlenecks_identified:
      - N+1 queries in admin endpoints
      - Missing indexes on foreign keys
      - No connection pooling
      - Lack of query result caching
```

## Unified Memory System

```json
{
  "project_metrics": {
    "data_volume": {
      "transcripts": "10,000+",
      "surveys": "50,000+",
      "open_ends": "100,000+",
      "media_files": "TB-scale expected"
    },
    "performance_requirements": {
      "dashboard_load": "<2 seconds",
      "search_latency": "<200ms",
      "transcription_speed": "real-time",
      "concurrent_users": "1000+"
    },
    "ai_capabilities": {
      "languages": ["English", "Bahasa", "Malay", "Thai", "Vietnamese", "Tagalog"],
      "models": {
        "transcription": "Whisper + Deepgram",
        "analysis": "Claude 3 + GPT-4",
        "embeddings": "text-embedding-ada-002",
        "local": "Llama 3 for edge cases"
      }
    }
  },

  "data_architecture": {
    "ingestion": {
      "formats": ["audio/mp3", "video/mp4", "docs/docx", "data/csv"],
      "processing": "Async with Celery",
      "storage": "S3/MinIO for media, PostgreSQL for metadata"
    },
    "analysis": {
      "pipeline": "3-stage Claude pipeline",
      "rag": "pgvector for embeddings",
      "search": "Semantic + keyword hybrid"
    },
    "visualization": {
      "frontend": "React + Recharts + D3.js",
      "backend": "Aggregation APIs",
      "caching": "Redis for computed results"
    }
  },

  "optimization_strategies": {
    "database": {
      "indexing": "B-tree + GiST + GIN indexes",
      "partitioning": "By org_id and date",
      "materialized_views": "For dashboards",
      "connection_pooling": "PgBouncer"
    },
    "ai_processing": {
      "batch_inference": "For bulk analysis",
      "edge_caching": "For repeated queries",
      "model_quantization": "For speed",
      "streaming": "For real-time transcription"
    },
    "frontend": {
      "virtual_scrolling": "For large datasets",
      "lazy_loading": "For media files",
      "web_workers": "For data processing",
      "react_query": "For API caching"
    }
  }
}
```

## Task Coordination Protocols

### Protocol 1: Data Pipeline Implementation
```markdown
TRIGGER: "Build data pipeline for million-scale processing"

COORDINATION:
1. data-engineer + ai-engineer:
   - Design ingestion pipeline for multi-format data
   - Implement streaming for real-time processing
   - Set up batch processing for historical data

2. postgres-pro + database-optimizer:
   - Design partitioned tables for scale
   - Create indexes for common queries
   - Implement connection pooling

3. data-scientist + data-analyst:
   - Define metrics and KPIs
   - Build aggregation logic
   - Create visualization specs

DELIVERABLES:
- Airflow DAGs for orchestration
- Kafka topics for streaming
- Optimized database schema
- Dashboard specifications
```

### Protocol 2: AI Analysis Enhancement
```markdown
TRIGGER: "Improve AI analysis accuracy for SEA markets"

COORDINATION:
1. ai-engineer (LEAD):
   - Research SEA-specific language models
   - Fine-tune models on local data
   - Implement code-mixing detection

2. data-scientist:
   - Analyze accuracy metrics
   - Build validation datasets
   - Create A/B testing framework

3. data-engineer:
   - Set up model versioning
   - Build inference pipeline
   - Implement model monitoring

DELIVERABLES:
- Fine-tuned SEA models
- Accuracy improvement metrics
- Production deployment pipeline
```

### Protocol 3: Performance Optimization
```markdown
TRIGGER: "Optimize for millions of records without lag"

PARALLEL EXECUTION:
Branch A: Database (postgres-pro + database-optimizer)
├── Analyze slow queries
├── Add strategic indexes
├── Implement partitioning
└── Set up read replicas

Branch B: Backend (data-engineer + python-pro)
├── Implement caching layer
├── Add pagination everywhere
├── Use async processing
└── Optimize API responses

Branch C: Frontend (react-specialist + data-analyst)
├── Virtual scrolling for lists
├── Lazy loading for charts
├── Web workers for processing
└── Debounced search inputs

SYNCHRONIZATION: Load test with millions of records
```

## Agent Communication Matrix

| Task | Lead Agent | Support Agents | Validation |
|------|------------|----------------|------------|
| Data Pipeline | data-engineer | postgres-pro, ai-engineer | data-scientist |
| AI Models | ai-engineer | data-scientist, python-pro | data-analyst |
| Database Optimization | postgres-pro | database-optimizer, sql-pro | data-engineer |
| Dashboards | data-analyst | react-specialist, data-scientist | qa-expert |
| Performance | database-optimizer | All agents | qa-expert |

## Competitive Analysis vs CoLoop.ai

### Our Advantages
```yaml
southeast_asia_focus:
  - Local language support (code-mixing)
  - Regional compliance (data residency)
  - SEA-appropriate pricing
  - WhatsApp integration
  - Local cloud providers

technical_advantages:
  - Real-time processing at scale
  - Multimodal analysis
  - Custom AI models
  - Advanced caching
  - Better performance

user_experience:
  - Faster dashboards
  - Smoother interactions
  - Better visualizations
  - Offline capabilities
```

### Implementation Priorities
1. **Immediate**: Fix N+1 queries, add indexes, implement caching
2. **Week 1**: Build data pipeline for scale
3. **Week 2**: Optimize AI models for SEA
4. **Week 3**: Implement advanced visualizations
5. **Week 4**: Performance testing with millions of records

## Success Metrics

### Performance KPIs
- Dashboard load time: <2s for 1M records
- API response time: <100ms p95
- Concurrent users: 1000+ without degradation
- Transcription accuracy: >95% for SEA languages
- Analysis speed: <30s for 1000 transcripts

### Business KPIs
- Feature parity with CoLoop: 100%
- SEA market penetration: 5 countries
- User satisfaction: >4.5/5
- Platform uptime: 99.9%
- Cost per analysis: 50% lower than CoLoop

## Memory Updates Protocol

After each task:
```json
{
  "task_completed": "description",
  "metrics_improved": {},
  "bottlenecks_found": [],
  "optimizations_applied": [],
  "next_priority": ""
}
```

Remember: Our goal is to beat CoLoop.ai by being faster, more accurate, and more suitable for Southeast Asian markets!