"""Add Fieldwork QC / Verifier tables (the wedge)

Revision ID: d1a2b3c4e5f6
Revises: c3f8a9d5e2b7
Create Date: 2026-06-30 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd1a2b3c4e5f6'
down_revision: Union[str, Sequence[str], None] = 'c3f8a9d5e2b7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema — create Fieldwork QC tables."""
    op.create_table(
        "fieldwork_batches",
        sa.Column("id", sa.String(length=32), nullable=False),
        sa.Column("org_id", sa.String(length=32), nullable=False),
        sa.Column("project_id", sa.String(length=32), nullable=False),
        sa.Column("market_id", sa.String(length=32), nullable=True),
        sa.Column("integration_id", sa.String(length=32), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("source", sa.String(length=32), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=True),
        sa.Column("rules", sa.JSON(), nullable=True),
        sa.Column("result_summary", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["org_id"], ["orgs.id"]),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_fieldwork_batches_org_id", "fieldwork_batches", ["org_id"])
    op.create_index("ix_fieldwork_batches_project_id", "fieldwork_batches", ["project_id"])

    op.create_table(
        "interviews",
        sa.Column("id", sa.String(length=32), nullable=False),
        sa.Column("org_id", sa.String(length=32), nullable=False),
        sa.Column("project_id", sa.String(length=32), nullable=False),
        sa.Column("batch_id", sa.String(length=32), nullable=False),
        sa.Column("external_id", sa.String(length=128), nullable=True),
        sa.Column("interviewer_id", sa.String(length=128), nullable=True),
        sa.Column("respondent_ref", sa.String(length=128), nullable=True),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("ended_at", sa.DateTime(), nullable=True),
        sa.Column("duration_sec", sa.Integer(), nullable=True),
        sa.Column("gps_lat", sa.Float(), nullable=True),
        sa.Column("gps_lng", sa.Float(), nullable=True),
        sa.Column("media_id", sa.String(length=32), nullable=True),
        sa.Column("answers", sa.JSON(), nullable=True),
        sa.Column("qc_status", sa.String(length=32), nullable=True),
        sa.Column("qc_score", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["org_id"], ["orgs.id"]),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"]),
        sa.ForeignKeyConstraint(["batch_id"], ["fieldwork_batches.id"]),
        sa.ForeignKeyConstraint(["media_id"], ["media_assets.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_interviews_org_id", "interviews", ["org_id"])
    op.create_index("ix_interviews_project_id", "interviews", ["project_id"])
    op.create_index("ix_interviews_batch_id", "interviews", ["batch_id"])
    op.create_index("ix_interviews_interviewer_id", "interviews", ["interviewer_id"])

    op.create_table(
        "qc_flags",
        sa.Column("id", sa.String(length=32), nullable=False),
        sa.Column("org_id", sa.String(length=32), nullable=False),
        sa.Column("interview_id", sa.String(length=32), nullable=False),
        sa.Column("batch_id", sa.String(length=32), nullable=False),
        sa.Column("check", sa.String(length=64), nullable=False),
        sa.Column("severity", sa.String(length=16), nullable=True),
        sa.Column("detail", sa.JSON(), nullable=True),
        sa.Column("status", sa.String(length=16), nullable=True),
        sa.Column("reviewer_id", sa.String(length=32), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["org_id"], ["orgs.id"]),
        sa.ForeignKeyConstraint(["interview_id"], ["interviews.id"]),
        sa.ForeignKeyConstraint(["batch_id"], ["fieldwork_batches.id"]),
        sa.ForeignKeyConstraint(["reviewer_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_qc_flags_org_id", "qc_flags", ["org_id"])
    op.create_index("ix_qc_flags_interview_id", "qc_flags", ["interview_id"])
    op.create_index("ix_qc_flags_batch_id", "qc_flags", ["batch_id"])

    op.create_table(
        "interviewer_scores",
        sa.Column("id", sa.String(length=32), nullable=False),
        sa.Column("org_id", sa.String(length=32), nullable=False),
        sa.Column("batch_id", sa.String(length=32), nullable=False),
        sa.Column("interviewer_id", sa.String(length=128), nullable=False),
        sa.Column("n_interviews", sa.Integer(), nullable=True),
        sa.Column("avg_duration_sec", sa.Float(), nullable=True),
        sa.Column("flag_rate", sa.Float(), nullable=True),
        sa.Column("anomaly_score", sa.Float(), nullable=True),
        sa.Column("computed_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["org_id"], ["orgs.id"]),
        sa.ForeignKeyConstraint(["batch_id"], ["fieldwork_batches.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_interviewer_scores_org_id", "interviewer_scores", ["org_id"])
    op.create_index("ix_interviewer_scores_batch_id", "interviewer_scores", ["batch_id"])
    op.create_index("ix_interviewer_scores_interviewer_id", "interviewer_scores", ["interviewer_id"])


def downgrade() -> None:
    """Downgrade schema — drop Fieldwork QC tables."""
    op.drop_table("interviewer_scores")
    op.drop_table("qc_flags")
    op.drop_table("interviews")
    op.drop_table("fieldwork_batches")
