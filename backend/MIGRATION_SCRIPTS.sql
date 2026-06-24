-- ================================================================
-- QUAL ENGINE DATABASE OPTIMIZATION MIGRATION SCRIPTS
-- PostgreSQL 14+ Compatible
-- Run these migrations with: alembic upgrade head
-- ================================================================

-- MIGRATION 1: INSTALL EXTENSIONS
-- =================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;        -- Text search for SEA languages
CREATE EXTENSION IF NOT EXISTS btree_gin;      -- GIN indexes for multi-column
CREATE EXTENSION IF NOT EXISTS btree_gist;     -- GIST indexes
CREATE EXTENSION IF NOT EXISTS uuid-ossp;      -- UUID generation (if using later)

-- For pgvector support (Phase 2):
-- CREATE EXTENSION IF NOT EXISTS vector;  -- Uncomment when deploying pgvector


-- MIGRATION 2: PHASE 1 - FOREIGN KEY INDEXES (8 INDEXES)
-- ========================================================

-- User relationships
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_org_id
  ON users(org_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_created_by
  ON projects(created_by);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transcript_source_media
  ON transcripts(source_media_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_asset_project
  ON media_assets(project_id);

-- Analysis relationships
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analysis_status
  ON analyses(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_theme_analysis
  ON themes(analysis_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_implication_analysis
  ON implications(analysis_id);

-- Transcript segments (high cardinality, critical for joins)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_segment_transcript
  ON transcript_segments(transcript_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_segment_speaker
  ON transcript_segments(speaker);


-- MIGRATION 3: PHASE 2 - COMPOSITE INDEXES (15 INDEXES)
-- =======================================================

-- Time-range queries for analytics (most common dashboard queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analysis_org_created
  ON analyses(org_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transcript_project_created
  ON transcripts(project_id, transcription_status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_log_org_action
  ON activity_logs(org_id, action, created_at DESC);

-- Grid queries (for analysis grids dashboard)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gridcell_grid_position
  ON grid_cells(grid_id, row_id, column_id);

-- Evidence multi-filter (sentiment + importance queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_project_theme
  ON evidence(project_id, significance, sentiment DESC);

-- Chat lookups (session pagination)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_message_session_time
  ON chat_messages(session_id, created_at DESC);

-- Clip/Reel queries (status + time filtering)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clip_project_status
  ON clips(project_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reel_project_status
  ON reels(project_id, status, created_at DESC);

-- Open ends (wave + status filtering)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_open_end_question_wave
  ON open_end_questions(project_id, wave);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_open_end_response_question_status
  ON open_end_responses(question_id, review_status);

-- Vector store (source lookup)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vector_project_source
  ON vector_stores(project_id, source_type, source_id);

-- User hierarchy (theme exploration)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analysis_theme_hierarchy
  ON analysis_themes(project_id, parent_id, level);

-- Comment threads (discussion lookup)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comment_thread
  ON comments(target_type, target_id, parent_id);

-- User activity (last login tracking)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_org_user_active
  ON users(org_id, is_active, last_login DESC);

-- Project member access (team dashboard)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_member_access
  ON project_members(user_id, last_accessed DESC);


-- MIGRATION 4: PHASE 3 - JSON/ARRAY INDEXES (8 INDEXES)
-- ======================================================

-- GIN indexes for JSON containment queries (fast JSON filtering)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grid_cell_evidence_gin
  ON grid_cells USING GIN(evidence_ids);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_themes_gin
  ON evidence USING GIN(themes);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_open_end_response_codes_gin
  ON open_end_responses USING GIN(codes);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_concept_eval_ratings_gin
  ON concept_evaluations USING GIN(ratings);

-- GIST indexes for fuzzy/full-text matching (SEA language support)
-- These enable queries like: WHERE content ILIKE '%keyword%' to use index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_content_gist
  ON evidence USING GIST(content gist_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transcript_content_gist
  ON transcripts USING GIST(content gist_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_verbatim_quote_gist
  ON verbatims USING GIST(quote gist_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_message_content_gist
  ON chat_messages USING GIST(content gist_trgm_ops);


-- MIGRATION 5: PHASE 4 - PARTIAL INDEXES (10 INDEXES)
-- ====================================================
-- These indexes ONLY index "hot" records (pending/active)
-- Dramatically smaller than full table indexes, saves space and memory

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analysis_pending
  ON analyses(org_id, created_at DESC)
  WHERE status IN ('pending', 'running');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transcript_pending
  ON transcripts(project_id, created_at DESC)
  WHERE transcription_status IN ('pending', 'running');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_job_processing
  ON media_processing_jobs(status, created_at DESC)
  WHERE status IN ('pending', 'processing');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_import_job_active
  ON import_jobs(org_id, created_at DESC)
  WHERE status IN ('pending', 'running');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clip_processing
  ON clips(project_id, created_at DESC)
  WHERE status IN ('pending', 'processing');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reel_draft
  ON reels(project_id, created_at DESC)
  WHERE status IN ('draft', 'processing');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_session_active
  ON chat_sessions(user_id, updated_at DESC)
  WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_unread
  ON notifications(user_id, created_at DESC)
  WHERE is_read = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_openend_response_unreviewed
  ON open_end_responses(question_id, created_at DESC)
  WHERE review_status = 'pending';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comment_unresolved
  ON comments(target_type, created_at DESC)
  WHERE is_resolved = false;


-- MIGRATION 6: STATISTICS & CONSTRAINTS
-- =====================================

-- Ensure statistics are up to date
ANALYZE;

-- Add missing NOT NULL constraints if needed
-- ALTER TABLE analyses ALTER COLUMN status SET NOT NULL;
-- ALTER TABLE transcripts ALTER COLUMN transcription_status SET NOT NULL;


-- MIGRATION 7: VERIFY INDEXES ARE USED
-- =====================================
-- Run EXPLAIN ANALYZE on common queries to verify indexes are used

-- Example: Verify analysis status index is used
-- EXPLAIN ANALYZE
-- SELECT * FROM analyses WHERE status = 'pending' LIMIT 10;
-- Should show: Index Scan using idx_analysis_status


-- MIGRATION 8: CHECK INDEX BLOAT
-- ===============================
-- This query helps identify which indexes need rebuilding

SELECT schemaname, tablename, indexname,
    ROUND(100 * (pg_relation_size(indexrelid) - pg_relation_size(relfilenode)) /
    pg_relation_size(indexrelid)) as bloat_ratio
FROM pg_stat_user_indexes
WHERE pg_relation_size(indexrelid) > 1000000
ORDER BY bloat_ratio DESC;

-- Rebuild bloated indexes (after some time in production):
-- REINDEX INDEX CONCURRENTLY idx_name;


-- ================================================================
-- PHASE 2: TABLE PARTITIONING (FOR 100M+ RECORDS)
-- ================================================================
-- This should be done in a separate maintenance window
-- Not critical for initial optimization

-- PARTITION 1: RANGE PARTITION ON transcript_segments BY YEAR
-- ===========================================================
-- Benefits:
--   - Queries on recent segments use 1 partition (~5% of data)
--   - Archival queries on old data separate
--   - Faster VACUUM/ANALYZE on individual partitions
--   - Can drop entire years of old data without DELETE

-- ALTER TABLE transcript_segments
-- PARTITION BY RANGE (EXTRACT(YEAR FROM created_at));
--
-- CREATE TABLE transcript_segments_2024
--   PARTITION OF transcript_segments
--   FOR VALUES FROM (2024) TO (2025);
--
-- CREATE TABLE transcript_segments_2025
--   PARTITION OF transcript_segments
--   FOR VALUES FROM (2025) TO (2026);
--
-- CREATE TABLE transcript_segments_archive
--   PARTITION OF transcript_segments
--   FOR VALUES TO (MAXVALUE);


-- PARTITION 2: HASH PARTITION ON activity_logs FOR WRITE SCALING
-- =============================================================
-- Benefits:
--   - Distributes writes across 64 partitions
--   - Parallel INSERT/UPDATE/DELETE operations
--   - Faster inserts for high-volume logging

-- ALTER TABLE activity_logs
-- PARTITION BY HASH(org_id)
-- PARTITIONS 64;


-- PARTITION 3: LIST PARTITION ON evidence BY MARKET (SEA MARKETS)
-- =============================================================
-- Benefits:
--   - Queries for specific market only scan relevant partition
--   - Regional reports faster to generate
--   - Can replicate partitions to regional servers

-- ALTER TABLE evidence
-- PARTITION BY LIST(market);
--
-- CREATE TABLE evidence_indonesia
--   PARTITION OF evidence
--   FOR VALUES IN ('ID');
--
-- CREATE TABLE evidence_singapore
--   PARTITION OF evidence
--   FOR VALUES IN ('SG');
--
-- CREATE TABLE evidence_multimarket
--   PARTITION OF evidence
--   FOR VALUES IN ('MY', 'TH', 'VN', 'PH', 'en', NULL);


-- ================================================================
-- PHASE 3: MATERIALIZED VIEWS FOR DASHBOARDS
-- ================================================================
-- These are expensive aggregations that should be pre-computed

CREATE MATERIALIZED VIEW IF NOT EXISTS v_project_stats AS
SELECT
    p.id,
    p.org_id,
    p.name,
    COUNT(DISTINCT t.id) as transcript_count,
    COUNT(DISTINCT ts.id) as segment_count,
    COUNT(DISTINCT a.id) as analysis_count,
    COUNT(DISTINCT th.id) as theme_count,
    COUNT(DISTINCT e.id) as evidence_count,
    p.created_at
FROM projects p
LEFT JOIN transcripts t ON t.project_id = p.id
LEFT JOIN transcript_segments ts ON ts.transcript_id = t.id
LEFT JOIN analyses a ON a.transcript_id = t.id
LEFT JOIN themes th ON th.analysis_id = a.id
LEFT JOIN evidence e ON e.project_id = p.id
GROUP BY p.id, p.org_id, p.name, p.created_at;

-- Create index on the materialized view for faster queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_v_project_stats_org
  ON v_project_stats(org_id);

-- Refresh every hour (in production cron job):
-- REFRESH MATERIALIZED VIEW CONCURRENTLY v_project_stats;


CREATE MATERIALIZED VIEW IF NOT EXISTS v_analysis_completion_rate AS
SELECT
    p.id as project_id,
    p.org_id,
    COUNT(*) as total_analyses,
    COUNT(CASE WHEN a.status = 'done' THEN 1 END) as completed_analyses,
    ROUND(100.0 * COUNT(CASE WHEN a.status = 'done' THEN 1 END) /
        NULLIF(COUNT(*), 0), 2) as completion_rate,
    AVG(EXTRACT(EPOCH FROM (a.completed_at - a.created_at))) as avg_duration_seconds
FROM projects p
LEFT JOIN transcripts t ON t.project_id = p.id
LEFT JOIN analyses a ON a.transcript_id = t.id
GROUP BY p.id, p.org_id;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_v_analysis_completion_org
  ON v_analysis_completion_rate(org_id);


-- ================================================================
-- PERFORMANCE BASELINE QUERIES
-- ================================================================
-- Run these BEFORE and AFTER optimization to measure improvement

-- Q1: List all analyses for a project with related data
-- Expected: < 100ms after optimization
-- EXPLAIN ANALYZE
-- SELECT
--     a.id, a.status, COUNT(th.id) as theme_count,
--     STRING_AGG(th.name, ', ') as themes
-- FROM analyses a
-- LEFT JOIN themes th ON th.analysis_id = a.id
-- WHERE a.org_id = 'test-org-id'
-- GROUP BY a.id
-- ORDER BY a.created_at DESC
-- LIMIT 20;


-- Q2: Get evidence with sentiments for dashboard
-- Expected: < 50ms after optimization
-- EXPLAIN ANALYZE
-- SELECT
--     id, project_id, significance, sentiment,
--     ARRAY_LENGTH(themes, 1) as theme_count
-- FROM evidence
-- WHERE project_id = 'test-project-id'
--   AND significance = 'high'
-- ORDER BY sentiment DESC
-- LIMIT 50;


-- Q3: Complex grid cell query
-- Expected: < 150ms after optimization
-- EXPLAIN ANALYZE
-- SELECT
--     gc.id, gc.grid_id, gc.row_id, gc.column_id,
--     gc.frequency, gc.percentage,
--     ARRAY_LENGTH(gc.evidence_ids, 1) as evidence_count
-- FROM grid_cells gc
-- WHERE gc.grid_id = 'test-grid-id'
--   AND gc.percentage > 10
-- ORDER BY gc.percentage DESC;


-- Q4: Dashboard aggregation
-- Expected: < 200ms after optimization (or instant from materialized view)
-- EXPLAIN ANALYZE
-- SELECT * FROM v_project_stats WHERE org_id = 'test-org-id';


-- ================================================================
-- CONFIGURATION TUNING COMMANDS
-- ================================================================
-- These commands optimize PostgreSQL for the Qual Engine workload

-- View current settings:
-- SHOW max_connections;
-- SHOW shared_buffers;
-- SHOW effective_cache_size;
-- SHOW work_mem;

-- Suggested changes (edit /etc/postgresql/14/main/postgresql.conf):
-- shared_buffers = 8GB              (for 32GB server)
-- effective_cache_size = 24GB
-- work_mem = 50MB
-- maintenance_work_mem = 2GB
-- max_connections = 500
-- random_page_cost = 1.1            (for SSD)
-- effective_io_concurrency = 200
-- max_parallel_workers_per_gather = 4
-- max_parallel_workers = 8


-- ================================================================
-- USEFUL MONITORING QUERIES
-- ================================================================

-- 1. Find slow queries
-- SELECT query, calls, mean_exec_time, max_exec_time
-- FROM pg_stat_statements
-- WHERE mean_exec_time > 100
-- ORDER BY mean_exec_time DESC
-- LIMIT 20;

-- 2. Check cache hit ratio
-- SELECT
--   sum(heap_blks_read) as heap_read,
--   sum(heap_blks_hit) as heap_hit,
--   sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
-- FROM pg_statio_user_tables;

-- 3. Monitor table sizes
-- SELECT
--   tablename,
--   pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
-- LIMIT 20;

-- 4. Check active connections
-- SELECT datname, usename, application_name, state, state_change
-- FROM pg_stat_activity
-- WHERE datname = 'qualengine'
-- ORDER BY state_change DESC;

-- 5. Index usage statistics
-- SELECT
--   indexname,
--   idx_scan as scans,
--   idx_tup_read as tuples_read,
--   idx_tup_fetch as tuples_returned
-- FROM pg_stat_user_indexes
-- ORDER BY idx_scan DESC;

-- 6. Unused indexes (drop to save space)
-- SELECT schemaname, tablename, indexname
-- FROM pg_stat_user_indexes
-- WHERE idx_scan = 0
--   AND indexname NOT LIKE 'pg_toast%'
-- ORDER BY pg_relation_size(indexrelid) DESC;


-- ================================================================
-- END OF MIGRATION SCRIPTS
-- ================================================================
