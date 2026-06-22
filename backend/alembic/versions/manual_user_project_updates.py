"""Add name and is_active to User, status to Project

Revision ID: manual_001
Revises: f6160569f89c
Create Date: 2024-06-22 15:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'manual_001'
down_revision = 'f6160569f89c'
branch_labels = None
depends_on = None


def upgrade():
    # Add columns to users table
    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(sa.Column('name', sa.String(255), nullable=True))
        batch_op.add_column(sa.Column('is_active', sa.Boolean(), nullable=True, server_default='1'))
        batch_op.add_column(sa.Column('last_login', sa.DateTime(), nullable=True))

    # Add status column to projects table
    with op.batch_alter_table('projects') as batch_op:
        batch_op.add_column(sa.Column('status', sa.String(32), nullable=True, server_default='active'))


def downgrade():
    # Remove columns from users table
    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_column('last_login')
        batch_op.drop_column('is_active')
        batch_op.drop_column('name')

    # Remove status column from projects table
    with op.batch_alter_table('projects') as batch_op:
        batch_op.drop_column('status')