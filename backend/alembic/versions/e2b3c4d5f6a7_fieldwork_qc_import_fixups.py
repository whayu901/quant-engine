"""Fieldwork QC import fix-ups: interviews.audio_ref, unique (batch_id, external_id), import_jobs.batch_id

Revision ID: e2b3c4d5f6a7
Revises: d1a2b3c4e5f6
Create Date: 2026-06-30 00:00:00.000000

Defensive on `import_jobs`: that table has never been created by a migration
(the Phase 1 migration is a no-op), so we create it here when absent, otherwise
just add the `batch_id` column.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e2b3c4d5f6a7'
down_revision: Union[str, Sequence[str], None] = 'd1a2b3c4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _columns(inspector, table):
    return {c["name"] for c in inspector.get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    # interviews: add audio_ref + unique (batch_id, external_id).
    with op.batch_alter_table("interviews") as batch_op:
        if "audio_ref" not in _columns(inspector, "interviews"):
            batch_op.add_column(sa.Column("audio_ref", sa.String(), nullable=True))
        batch_op.create_unique_constraint(
            "uq_interviews_batch_external", ["batch_id", "external_id"])

    # import_jobs: create when missing (never migrated), else add batch_id.
    if "import_jobs" not in tables:
        op.create_table(
            "import_jobs",
            sa.Column("id", sa.String(length=32), nullable=False),
            sa.Column("org_id", sa.String(length=32), nullable=False),
            sa.Column("project_id", sa.String(length=32), nullable=False),
            sa.Column("integration_id", sa.String(length=32), nullable=True),
            sa.Column("batch_id", sa.String(length=32), nullable=True),
            sa.Column("source", sa.String(length=32), nullable=False),
            sa.Column("status", sa.String(length=32), nullable=True),
            sa.Column("payload_ref", sa.Text(), nullable=True),
            sa.Column("result_summary", sa.JSON(), nullable=True),
            sa.Column("error", sa.Text(), nullable=True),
            sa.Column("started_at", sa.DateTime(), nullable=True),
            sa.Column("completed_at", sa.DateTime(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            # Named so later SQLite batch_alter_table (e.g. the schema
            # reconciliation adding the integration_id FK) can reflect them.
            sa.ForeignKeyConstraint(["org_id"], ["orgs.id"], name="fk_import_jobs_org"),
            sa.ForeignKeyConstraint(["project_id"], ["projects.id"], name="fk_import_jobs_project"),
            sa.ForeignKeyConstraint(["batch_id"], ["fieldwork_batches.id"], name="fk_import_jobs_batch"),
            sa.PrimaryKeyConstraint("id"),
        )
    elif "batch_id" not in _columns(inspector, "import_jobs"):
        with op.batch_alter_table("import_jobs") as batch_op:
            batch_op.add_column(sa.Column("batch_id", sa.String(length=32), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    with op.batch_alter_table("interviews") as batch_op:
        batch_op.drop_constraint("uq_interviews_batch_external", type_="unique")
        if "audio_ref" in _columns(inspector, "interviews"):
            batch_op.drop_column("audio_ref")

    # In the canonical chain this migration is what creates import_jobs (no
    # earlier migration does), so its downgrade drops the table — keeping
    # `downgrade base` clean. If a legacy DB had import_jobs before this revision
    # the upgrade only added a column; dropping the table on the way down is
    # acceptable since downgrade is a teardown path.
    if "import_jobs" in inspector.get_table_names():
        op.drop_table("import_jobs")
