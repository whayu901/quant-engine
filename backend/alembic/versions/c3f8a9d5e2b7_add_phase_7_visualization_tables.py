"""Add Phase 7 visualization tables

Revision ID: c3f8a9d5e2b7
Revises: b7e9f3d2a1c8
Create Date: 2024-12-24 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'c3f8a9d5e2b7'
down_revision = 'b7e9f3d2a1c8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create ENUM types for Phase 7
    op.execute("CREATE TYPE visualizationtype AS ENUM ('word_cloud', 'network_graph', 'heatmap', 'timeline', 'geographic', 'sentiment_flow', 'theme_river', 'speaker_metrics', 'code_mixing', 'engagement')")
    op.execute("CREATE TYPE aggregationperiod AS ENUM ('hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly')")
    op.execute("CREATE TYPE cachestatus AS ENUM ('fresh', 'stale', 'rebuilding', 'error')")

    # Create project_visualization_cache table
    op.create_table('project_visualization_cache',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('project_id', sa.String(36), nullable=False),
        sa.Column('visualization_type', postgresql.ENUM('word_cloud', 'network_graph', 'heatmap', 'timeline', 'geographic', 'sentiment_flow', 'theme_river', 'speaker_metrics', 'code_mixing', 'engagement', name='visualizationtype'), nullable=False),
        sa.Column('cache_key', sa.String(255), nullable=False),
        sa.Column('cache_status', postgresql.ENUM('fresh', 'stale', 'rebuilding', 'error', name='cachestatus'), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('last_accessed', sa.DateTime(), nullable=True),
        sa.Column('access_count', sa.Integer(), nullable=True, default=0),
        sa.Column('data', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('computation_time_ms', sa.Integer(), nullable=True),
        sa.Column('data_size_bytes', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('project_id', 'visualization_type', 'cache_key', name='uq_project_viz_cache')
    )
    op.create_index('idx_viz_cache_project', 'project_visualization_cache', ['project_id'])
    op.create_index('idx_viz_cache_type', 'project_visualization_cache', ['visualization_type'])
    op.create_index('idx_viz_cache_status', 'project_visualization_cache', ['cache_status'])
    op.create_index('idx_viz_cache_expires', 'project_visualization_cache', ['expires_at'])

    # Create theme_cooccurrences table
    op.create_table('theme_cooccurrences',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('project_id', sa.String(36), nullable=False),
        sa.Column('theme_a_id', sa.String(36), nullable=False),
        sa.Column('theme_b_id', sa.String(36), nullable=False),
        sa.Column('theme_a_name', sa.String(255), nullable=False),
        sa.Column('theme_b_name', sa.String(255), nullable=False),
        sa.Column('cooccurrence_count', sa.Integer(), nullable=False, default=0),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('lift_score', sa.Float(), nullable=True),
        sa.Column('correlation', sa.Float(), nullable=True),
        sa.Column('transcript_ids', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('segment_ids', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('first_occurrence', sa.DateTime(), nullable=True),
        sa.Column('last_occurrence', sa.DateTime(), nullable=True),
        sa.Column('language', sa.String(10), nullable=True),
        sa.Column('is_code_mixed', sa.Boolean(), nullable=True, default=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('project_id', 'theme_a_id', 'theme_b_id', name='uq_theme_pair'),
        sa.CheckConstraint('theme_a_id < theme_b_id', name='check_theme_order')
    )
    op.create_index('idx_cooccur_project', 'theme_cooccurrences', ['project_id'])
    op.create_index('idx_cooccur_count', 'theme_cooccurrences', ['cooccurrence_count'])
    op.create_index('idx_cooccur_confidence', 'theme_cooccurrences', ['confidence_score'])

    # Create timeseries_metrics table
    op.create_table('timeseries_metrics',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('project_id', sa.String(36), nullable=False),
        sa.Column('period_start', sa.DateTime(), nullable=False),
        sa.Column('period_end', sa.DateTime(), nullable=False),
        sa.Column('period_type', postgresql.ENUM('hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly', name='aggregationperiod'), nullable=False),
        sa.Column('metric_name', sa.String(100), nullable=False),
        sa.Column('metric_category', sa.String(50), nullable=True),
        sa.Column('value', sa.Float(), nullable=False),
        sa.Column('count', sa.Integer(), nullable=True, default=1),
        sa.Column('min_value', sa.Float(), nullable=True),
        sa.Column('max_value', sa.Float(), nullable=True),
        sa.Column('avg_value', sa.Float(), nullable=True),
        sa.Column('std_dev', sa.Float(), nullable=True),
        sa.Column('percentile_25', sa.Float(), nullable=True),
        sa.Column('percentile_50', sa.Float(), nullable=True),
        sa.Column('percentile_75', sa.Float(), nullable=True),
        sa.Column('breakdown', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('language', sa.String(10), nullable=True),
        sa.Column('region', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('project_id', 'metric_name', 'period_start', 'period_type', name='uq_timeseries_metric')
    )
    op.create_index('idx_ts_project', 'timeseries_metrics', ['project_id'])
    op.create_index('idx_ts_metric', 'timeseries_metrics', ['metric_name'])
    op.create_index('idx_ts_period', 'timeseries_metrics', ['period_start', 'period_end'])
    op.create_index('idx_ts_type', 'timeseries_metrics', ['period_type'])

    # Create geographic_metrics table
    op.create_table('geographic_metrics',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('project_id', sa.String(36), nullable=False),
        sa.Column('country_code', sa.String(2), nullable=False),
        sa.Column('country_name', sa.String(100), nullable=False),
        sa.Column('region', sa.String(100), nullable=True),
        sa.Column('city', sa.String(100), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('metric_name', sa.String(100), nullable=False),
        sa.Column('value', sa.Float(), nullable=False),
        sa.Column('count', sa.Integer(), nullable=True, default=1),
        sa.Column('population', sa.Integer(), nullable=True),
        sa.Column('value_per_capita', sa.Float(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('period_start', sa.DateTime(), nullable=True),
        sa.Column('period_end', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('project_id', 'country_code', 'region', 'city', 'metric_name', name='uq_geo_metric')
    )
    op.create_index('idx_geo_project', 'geographic_metrics', ['project_id'])
    op.create_index('idx_geo_country', 'geographic_metrics', ['country_code'])
    op.create_index('idx_geo_metric', 'geographic_metrics', ['metric_name'])
    op.create_index('idx_geo_coords', 'geographic_metrics', ['latitude', 'longitude'])

    # Create word_frequencies table
    op.create_table('word_frequencies',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('project_id', sa.String(36), nullable=False),
        sa.Column('word', sa.String(100), nullable=False),
        sa.Column('normalized_word', sa.String(100), nullable=False),
        sa.Column('language', sa.String(10), nullable=False),
        sa.Column('frequency', sa.Integer(), nullable=False),
        sa.Column('document_frequency', sa.Integer(), nullable=True),
        sa.Column('tf_idf_score', sa.Float(), nullable=True),
        sa.Column('part_of_speech', sa.String(20), nullable=True),
        sa.Column('is_stopword', sa.Boolean(), nullable=True, default=False),
        sa.Column('is_entity', sa.Boolean(), nullable=True, default=False),
        sa.Column('entity_type', sa.String(50), nullable=True),
        sa.Column('avg_sentiment', sa.Float(), nullable=True),
        sa.Column('positive_count', sa.Integer(), nullable=True, default=0),
        sa.Column('negative_count', sa.Integer(), nullable=True, default=0),
        sa.Column('neutral_count', sa.Integer(), nullable=True, default=0),
        sa.Column('theme_associations', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('period_start', sa.DateTime(), nullable=True),
        sa.Column('period_end', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('project_id', 'normalized_word', 'language', 'period_start', name='uq_word_freq')
    )
    op.create_index('idx_word_project', 'word_frequencies', ['project_id'])
    op.create_index('idx_word_frequency', 'word_frequencies', ['frequency'])
    op.create_index('idx_word_tfidf', 'word_frequencies', ['tf_idf_score'])
    op.create_index('idx_word_language', 'word_frequencies', ['language'])

    # Create sentiment_flows table
    op.create_table('sentiment_flows',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('project_id', sa.String(36), nullable=False),
        sa.Column('transcript_id', sa.String(36), nullable=True),
        sa.Column('position', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.Float(), nullable=True),
        sa.Column('sentiment_score', sa.Float(), nullable=False),
        sa.Column('sentiment_label', sa.String(20), nullable=True),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('smoothed_score', sa.Float(), nullable=True),
        sa.Column('trend', sa.String(20), nullable=True),
        sa.Column('speaker_id', sa.String(36), nullable=True),
        sa.Column('speaker_name', sa.String(255), nullable=True),
        sa.Column('text_snippet', sa.Text(), nullable=True),
        sa.Column('emotions', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('dominant_emotion', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['transcript_id'], ['transcripts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_sentiment_project', 'sentiment_flows', ['project_id'])
    op.create_index('idx_sentiment_transcript', 'sentiment_flows', ['transcript_id'])
    op.create_index('idx_sentiment_position', 'sentiment_flows', ['position'])
    op.create_index('idx_sentiment_timestamp', 'sentiment_flows', ['timestamp'])

    # Create engagement_metrics table
    op.create_table('engagement_metrics',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('project_id', sa.String(36), nullable=False),
        sa.Column('user_id', sa.String(36), nullable=True),
        sa.Column('action_type', sa.String(50), nullable=False),
        sa.Column('target_type', sa.String(50), nullable=True),
        sa.Column('target_id', sa.String(36), nullable=True),
        sa.Column('duration_seconds', sa.Integer(), nullable=True),
        sa.Column('interaction_count', sa.Integer(), nullable=True, default=1),
        sa.Column('session_id', sa.String(36), nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('device_type', sa.String(20), nullable=True),
        sa.Column('country', sa.String(2), nullable=True),
        sa.Column('region', sa.String(100), nullable=True),
        sa.Column('load_time_ms', sa.Integer(), nullable=True),
        sa.Column('render_time_ms', sa.Integer(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_engagement_project', 'engagement_metrics', ['project_id'])
    op.create_index('idx_engagement_user', 'engagement_metrics', ['user_id'])
    op.create_index('idx_engagement_action', 'engagement_metrics', ['action_type'])
    op.create_index('idx_engagement_timestamp', 'engagement_metrics', ['timestamp'])
    op.create_index('idx_engagement_session', 'engagement_metrics', ['session_id'])

    # Create custom_visualizations table
    op.create_table('custom_visualizations',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('project_id', sa.String(36), nullable=False),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('visualization_type', postgresql.ENUM('word_cloud', 'network_graph', 'heatmap', 'timeline', 'geographic', 'sentiment_flow', 'theme_river', 'speaker_metrics', 'code_mixing', 'engagement', name='visualizationtype'), nullable=False),
        sa.Column('config', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('filters', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('is_public', sa.Boolean(), nullable=True, default=False),
        sa.Column('is_template', sa.Boolean(), nullable=True, default=False),
        sa.Column('view_count', sa.Integer(), nullable=True, default=0),
        sa.Column('clone_count', sa.Integer(), nullable=True, default=0),
        sa.Column('last_viewed', sa.DateTime(), nullable=True),
        sa.Column('version', sa.Integer(), nullable=True, default=1),
        sa.Column('parent_id', sa.String(36), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_custom_viz_project', 'custom_visualizations', ['project_id'])
    op.create_index('idx_custom_viz_user', 'custom_visualizations', ['user_id'])
    op.create_index('idx_custom_viz_type', 'custom_visualizations', ['visualization_type'])
    op.create_index('idx_custom_viz_public', 'custom_visualizations', ['is_public'])


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('custom_visualizations')
    op.drop_table('engagement_metrics')
    op.drop_table('sentiment_flows')
    op.drop_table('word_frequencies')
    op.drop_table('geographic_metrics')
    op.drop_table('timeseries_metrics')
    op.drop_table('theme_cooccurrences')
    op.drop_table('project_visualization_cache')

    # Drop ENUM types
    op.execute('DROP TYPE IF EXISTS visualizationtype')
    op.execute('DROP TYPE IF EXISTS aggregationperiod')
    op.execute('DROP TYPE IF EXISTS cachestatus')