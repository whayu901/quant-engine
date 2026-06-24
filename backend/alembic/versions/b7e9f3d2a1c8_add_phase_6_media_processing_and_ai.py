"""Add Phase 6 media processing and AI tables

Revision ID: b7e9f3d2a1c8
Revises: a4ed82f6ee87
Create Date: 2024-12-24 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'b7e9f3d2a1c8'
down_revision = 'a4ed82f6ee87'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create ENUM types
    op.execute("CREATE TYPE mediaprocessingstatus AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled')")
    op.execute("CREATE TYPE modeltype AS ENUM ('classifier', 'ner', 'sentiment', 'topic', 'summarization', 'code_mixing', 'custom')")
    op.execute("CREATE TYPE mediaquality AS ENUM ('original', '1080p', '720p', '480p', '360p')")

    # Create media_files table
    op.create_table('media_files',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('project_id', sa.String(36), nullable=False),
        sa.Column('transcript_id', sa.String(36), nullable=True),
        sa.Column('original_filename', sa.String(255), nullable=False),
        sa.Column('file_type', sa.String(10), nullable=True),
        sa.Column('file_size', sa.Integer(), nullable=True),
        sa.Column('duration', sa.Float(), nullable=True),
        sa.Column('original_path', sa.String(500), nullable=True),
        sa.Column('processed_paths', sa.JSON(), nullable=True),
        sa.Column('audio_path', sa.String(500), nullable=True),
        sa.Column('thumbnail_path', sa.String(500), nullable=True),
        sa.Column('waveform_path', sa.String(500), nullable=True),
        sa.Column('video_codec', sa.String(50), nullable=True),
        sa.Column('video_bitrate', sa.Integer(), nullable=True),
        sa.Column('video_resolution', sa.String(20), nullable=True),
        sa.Column('video_fps', sa.Float(), nullable=True),
        sa.Column('audio_codec', sa.String(50), nullable=True),
        sa.Column('audio_sample_rate', sa.Integer(), nullable=True),
        sa.Column('audio_channels', sa.Integer(), nullable=True),
        sa.Column('audio_bitrate', sa.Integer(), nullable=True),
        sa.Column('processing_status', sa.Enum('pending', 'processing', 'completed', 'failed', 'cancelled',
                                               name='mediaprocessingstatus'), nullable=True),
        sa.Column('processing_started_at', sa.DateTime(), nullable=True),
        sa.Column('processing_completed_at', sa.DateTime(), nullable=True),
        sa.Column('processing_error', sa.Text(), nullable=True),
        sa.Column('waveform_data_url', sa.String(500), nullable=True),
        sa.Column('waveform_resolution', sa.Integer(), nullable=True),
        sa.Column('waveform_generated_at', sa.DateTime(), nullable=True),
        sa.Column('vtt_file_path', sa.String(500), nullable=True),
        sa.Column('srt_file_path', sa.String(500), nullable=True),
        sa.Column('timeline_json_path', sa.String(500), nullable=True),
        sa.Column('chapters_generated', sa.Boolean(), nullable=True),
        sa.Column('video_quality_score', sa.Float(), nullable=True),
        sa.Column('audio_quality_score', sa.Float(), nullable=True),
        sa.Column('detected_languages', sa.JSON(), nullable=True),
        sa.Column('has_code_mixing', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['transcript_id'], ['transcripts.id'], ondelete='SET NULL')
    )
    op.create_index('idx_media_project', 'media_files', ['project_id'], unique=False)
    op.create_index('idx_media_status', 'media_files', ['processing_status'], unique=False)
    op.create_index('idx_media_created', 'media_files', ['created_at'], unique=False)

    # Create media_processing_jobs table
    op.create_table('media_processing_jobs',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('media_file_id', sa.String(36), nullable=False),
        sa.Column('job_type', sa.String(50), nullable=False),
        sa.Column('celery_task_id', sa.String(255), nullable=True),
        sa.Column('priority', sa.Integer(), nullable=True),
        sa.Column('status', sa.Enum('pending', 'processing', 'completed', 'failed', 'cancelled',
                                    name='mediaprocessingstatus'), nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('progress_percentage', sa.Float(), nullable=True),
        sa.Column('current_step', sa.String(100), nullable=True),
        sa.Column('total_steps', sa.Integer(), nullable=True),
        sa.Column('result_data', sa.JSON(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('retry_count', sa.Integer(), nullable=True),
        sa.Column('max_retries', sa.Integer(), nullable=True),
        sa.Column('processing_time_seconds', sa.Float(), nullable=True),
        sa.Column('cpu_usage_percent', sa.Float(), nullable=True),
        sa.Column('memory_usage_mb', sa.Float(), nullable=True),
        sa.Column('api_calls_made', sa.Integer(), nullable=True),
        sa.Column('estimated_cost_usd', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['media_file_id'], ['media_files.id'], ondelete='CASCADE')
    )

    # Create video_highlights table
    op.create_table('video_highlights',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('media_file_id', sa.String(36), nullable=False),
        sa.Column('project_id', sa.String(36), nullable=False),
        sa.Column('title', sa.String(255), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('start_time', sa.Float(), nullable=False),
        sa.Column('end_time', sa.Float(), nullable=False),
        sa.Column('duration', sa.Float(), nullable=True),
        sa.Column('transcript_segment_ids', sa.JSON(), nullable=True),
        sa.Column('transcript_text', sa.Text(), nullable=True),
        sa.Column('importance_score', sa.Float(), nullable=True),
        sa.Column('auto_detected', sa.Boolean(), nullable=True),
        sa.Column('detection_method', sa.String(50), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('category', sa.String(50), nullable=True),
        sa.Column('sentiment', sa.String(20), nullable=True),
        sa.Column('clip_file_path', sa.String(500), nullable=True),
        sa.Column('thumbnail_path', sa.String(500), nullable=True),
        sa.Column('view_count', sa.Integer(), nullable=True),
        sa.Column('share_count', sa.Integer(), nullable=True),
        sa.Column('created_by', sa.String(36), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['media_file_id'], ['media_files.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'])
    )

    # Create highlight_reels table
    op.create_table('highlight_reels',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('project_id', sa.String(36), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('highlight_ids', sa.JSON(), nullable=True),
        sa.Column('transition_type', sa.String(50), nullable=True),
        sa.Column('transition_duration', sa.Float(), nullable=True),
        sa.Column('include_captions', sa.Boolean(), nullable=True),
        sa.Column('include_speaker_labels', sa.Boolean(), nullable=True),
        sa.Column('reel_file_path', sa.String(500), nullable=True),
        sa.Column('total_duration', sa.Float(), nullable=True),
        sa.Column('thumbnail_path', sa.String(500), nullable=True),
        sa.Column('logo_path', sa.String(500), nullable=True),
        sa.Column('intro_text', sa.Text(), nullable=True),
        sa.Column('outro_text', sa.Text(), nullable=True),
        sa.Column('export_quality', sa.Enum('original', '1080p', '720p', '480p', '360p',
                                           name='mediaquality'), nullable=True),
        sa.Column('export_format', sa.String(10), nullable=True),
        sa.Column('generation_status', sa.Enum('pending', 'processing', 'completed', 'failed', 'cancelled',
                                               name='mediaprocessingstatus'), nullable=True),
        sa.Column('created_by', sa.String(36), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'])
    )

    # Create custom_ai_models table
    op.create_table('custom_ai_models',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('org_id', sa.String(36), nullable=False),
        sa.Column('model_name', sa.String(100), nullable=False),
        sa.Column('model_type', sa.Enum('classifier', 'ner', 'sentiment', 'topic', 'summarization',
                                        'code_mixing', 'custom', name='modeltype'), nullable=False),
        sa.Column('base_model', sa.String(100), nullable=True),
        sa.Column('framework', sa.String(20), nullable=True),
        sa.Column('training_dataset_id', sa.String(36), nullable=True),
        sa.Column('training_samples', sa.Integer(), nullable=True),
        sa.Column('validation_samples', sa.Integer(), nullable=True),
        sa.Column('test_samples', sa.Integer(), nullable=True),
        sa.Column('validation_accuracy', sa.Float(), nullable=True),
        sa.Column('validation_f1_score', sa.Float(), nullable=True),
        sa.Column('validation_precision', sa.Float(), nullable=True),
        sa.Column('validation_recall', sa.Float(), nullable=True),
        sa.Column('confusion_matrix', sa.JSON(), nullable=True),
        sa.Column('model_storage_path', sa.String(500), nullable=True),
        sa.Column('model_size_mb', sa.Float(), nullable=True),
        sa.Column('model_version', sa.String(20), nullable=True),
        sa.Column('model_checksum', sa.String(64), nullable=True),
        sa.Column('inference_time_ms', sa.Float(), nullable=True),
        sa.Column('throughput_samples_per_sec', sa.Float(), nullable=True),
        sa.Column('supported_languages', sa.JSON(), nullable=True),
        sa.Column('handles_code_mixing', sa.Boolean(), nullable=True),
        sa.Column('dialect_support', sa.JSON(), nullable=True),
        sa.Column('hyperparameters', sa.JSON(), nullable=True),
        sa.Column('training_duration_hours', sa.Float(), nullable=True),
        sa.Column('epochs_trained', sa.Integer(), nullable=True),
        sa.Column('best_epoch', sa.Integer(), nullable=True),
        sa.Column('training_cost_usd', sa.Float(), nullable=True),
        sa.Column('inference_cost_per_1k', sa.Float(), nullable=True),
        sa.Column('storage_cost_monthly', sa.Float(), nullable=True),
        sa.Column('is_deployed', sa.Boolean(), nullable=True),
        sa.Column('deployment_endpoint', sa.String(500), nullable=True),
        sa.Column('deployment_region', sa.String(50), nullable=True),
        sa.Column('total_predictions', sa.Integer(), nullable=True),
        sa.Column('last_used_at', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('deprecated_at', sa.DateTime(), nullable=True),
        sa.Column('replacement_model_id', sa.String(36), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.String(36), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['org_id'], ['orgs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id']),
        sa.UniqueConstraint('org_id', 'model_name', 'model_version', name='uq_org_model_version')
    )
    op.create_index('idx_model_org', 'custom_ai_models', ['org_id'], unique=False)
    op.create_index('idx_model_type', 'custom_ai_models', ['model_type'], unique=False)
    op.create_index('idx_model_active', 'custom_ai_models', ['is_active'], unique=False)

    # Create model_training_jobs table
    op.create_table('model_training_jobs',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('model_id', sa.String(36), nullable=True),
        sa.Column('org_id', sa.String(36), nullable=False),
        sa.Column('job_type', sa.String(50), nullable=True),
        sa.Column('experiment_name', sa.String(100), nullable=True),
        sa.Column('mlflow_run_id', sa.String(100), nullable=True),
        sa.Column('dataset_path', sa.String(500), nullable=True),
        sa.Column('dataset_size', sa.Integer(), nullable=True),
        sa.Column('class_distribution', sa.JSON(), nullable=True),
        sa.Column('status', sa.Enum('pending', 'processing', 'completed', 'failed', 'cancelled',
                                    name='mediaprocessingstatus'), nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('current_epoch', sa.Integer(), nullable=True),
        sa.Column('total_epochs', sa.Integer(), nullable=True),
        sa.Column('training_loss', sa.Float(), nullable=True),
        sa.Column('validation_loss', sa.Float(), nullable=True),
        sa.Column('gpu_type', sa.String(50), nullable=True),
        sa.Column('gpu_count', sa.Integer(), nullable=True),
        sa.Column('memory_usage_gb', sa.Float(), nullable=True),
        sa.Column('final_metrics', sa.JSON(), nullable=True),
        sa.Column('model_artifacts_path', sa.String(500), nullable=True),
        sa.Column('logs_path', sa.String(500), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('error_traceback', sa.Text(), nullable=True),
        sa.Column('compute_cost_usd', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['model_id'], ['custom_ai_models.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['org_id'], ['orgs.id'], ondelete='CASCADE')
    )

    # Create ai_analysis_results table
    op.create_table('ai_analysis_results',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('project_id', sa.String(36), nullable=False),
        sa.Column('transcript_id', sa.String(36), nullable=True),
        sa.Column('media_file_id', sa.String(36), nullable=True),
        sa.Column('analysis_type', sa.String(50), nullable=True),
        sa.Column('model_used', sa.String(100), nullable=True),
        sa.Column('custom_model_id', sa.String(36), nullable=True),
        sa.Column('used_text', sa.Boolean(), nullable=True),
        sa.Column('used_audio', sa.Boolean(), nullable=True),
        sa.Column('used_video', sa.Boolean(), nullable=True),
        sa.Column('results', sa.JSON(), nullable=True),
        sa.Column('confidence_scores', sa.JSON(), nullable=True),
        sa.Column('segment_results', sa.JSON(), nullable=True),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('key_findings', sa.JSON(), nullable=True),
        sa.Column('recommendations', sa.JSON(), nullable=True),
        sa.Column('visualization_data', sa.JSON(), nullable=True),
        sa.Column('visualization_type', sa.String(50), nullable=True),
        sa.Column('processing_time_seconds', sa.Float(), nullable=True),
        sa.Column('tokens_used', sa.Integer(), nullable=True),
        sa.Column('api_calls_made', sa.Integer(), nullable=True),
        sa.Column('cost_usd', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.String(36), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['transcript_id'], ['transcripts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['media_file_id'], ['media_files.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['custom_model_id'], ['custom_ai_models.id']),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'])
    )
    op.create_index('idx_ai_analysis_project', 'ai_analysis_results', ['project_id'], unique=False)
    op.create_index('idx_ai_analysis_type', 'ai_analysis_results', ['analysis_type'], unique=False)
    op.create_index('idx_ai_analysis_created', 'ai_analysis_results', ['created_at'], unique=False)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('ai_analysis_results')
    op.drop_table('model_training_jobs')
    op.drop_table('custom_ai_models')
    op.drop_table('highlight_reels')
    op.drop_table('video_highlights')
    op.drop_table('media_processing_jobs')
    op.drop_table('media_files')

    # Drop ENUM types
    op.execute('DROP TYPE IF EXISTS mediaprocessingstatus')
    op.execute('DROP TYPE IF EXISTS modeltype')
    op.execute('DROP TYPE IF EXISTS mediaquality')