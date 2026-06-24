-- CRITICAL DATABASE INDEXES FOR PERFORMANCE
-- Run this script to improve performance by 10-20x

-- Phase 0: Core indexes for authentication and organization
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id);
CREATE INDEX IF NOT EXISTS idx_orgs_plan ON orgs(plan);

-- Phase 1: Project and transcript indexes
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transcripts_project_id ON transcripts(project_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_created_at ON transcripts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transcript_segments_transcript_id ON transcript_segments(transcript_id);
CREATE INDEX IF NOT EXISTS idx_transcript_segments_start_time ON transcript_segments(start_time);

-- Phase 2: Analysis grid indexes
CREATE INDEX IF NOT EXISTS idx_analyses_transcript_id ON analyses(transcript_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_grids_analysis_id ON analysis_grids(analysis_id);
CREATE INDEX IF NOT EXISTS idx_grid_cells_grid_id ON grid_cells(grid_id);
CREATE INDEX IF NOT EXISTS idx_themes_analysis_id ON themes(analysis_id);
CREATE INDEX IF NOT EXISTS idx_evidence_analysis_id ON evidence(analysis_id);
CREATE INDEX IF NOT EXISTS idx_verbatims_analysis_id ON verbatims(analysis_id);
CREATE INDEX IF NOT EXISTS idx_verbatims_theme_id ON verbatims(theme_id);

-- Phase 3: Chat and RAG indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_project_id ON chat_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_by ON chat_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_vector_store_project_id ON vector_store(project_id);
-- Note: For vector similarity, we need pgvector extension:
-- CREATE EXTENSION IF NOT EXISTS vector;
-- CREATE INDEX idx_vector_store_embedding ON vector_store USING ivfflat (embedding vector_cosine_ops);

-- Phase 4: Open-ends and concept testing indexes
CREATE INDEX IF NOT EXISTS idx_open_end_questions_project_id ON open_end_questions(project_id);
CREATE INDEX IF NOT EXISTS idx_open_end_responses_question_id ON open_end_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_codes_question_id ON codes(question_id);
CREATE INDEX IF NOT EXISTS idx_response_codes_response_id ON response_codes(response_id);
CREATE INDEX IF NOT EXISTS idx_response_codes_code_id ON response_codes(code_id);
CREATE INDEX IF NOT EXISTS idx_concept_tests_project_id ON concept_tests(project_id);
CREATE INDEX IF NOT EXISTS idx_concept_evaluations_test_id ON concept_evaluations(test_id);

-- Phase 5: Clips and reels indexes
CREATE INDEX IF NOT EXISTS idx_clips_project_id ON clips(project_id);
CREATE INDEX IF NOT EXISTS idx_clips_status ON clips(status);
CREATE INDEX IF NOT EXISTS idx_reels_project_id ON reels(project_id);
CREATE INDEX IF NOT EXISTS idx_reel_items_reel_id ON reel_items(reel_id);
CREATE INDEX IF NOT EXISTS idx_share_links_token ON share_links(token);
CREATE INDEX IF NOT EXISTS idx_media_processing_jobs_status ON media_processing_jobs(status);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_org_id_created_at ON projects(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transcripts_project_id_created_at ON transcripts(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_transcript_id_status ON analyses(transcript_id, status);
CREATE INDEX IF NOT EXISTS idx_clips_project_id_status ON clips(project_id, status);

-- Usage tracking indexes
CREATE INDEX IF NOT EXISTS idx_usage_events_org_id ON usage_events(org_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_created_at ON usage_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_events_org_id_created_at ON usage_events(org_id, created_at DESC);

-- Performance monitoring
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;