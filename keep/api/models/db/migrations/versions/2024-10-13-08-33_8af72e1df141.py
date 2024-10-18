"""add runbook schema

Revision ID: 8af72e1df141
Revises: 83c1020be97d
Create Date: 2024-10-13 08:33:24.727292

"""

import sqlalchemy as sa
import sqlalchemy_utils
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "8af72e1df141"
down_revision = "83c1020be97d"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "runbook",
        sa.Column("tenant_id", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("relative_path", sa.Text(), nullable=True),
        sa.Column("title", sa.Text(), nullable=True),
        sa.Column("timestamp", sa.DateTime(), nullable=True),
        sa.Column("id", sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column("repo_id", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("provider_type", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("provider_id", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenant.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("runbook", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_runbook_timestamp"), ["timestamp"], unique=False
        )

    op.create_table(
        "runbookcontent",
        sa.Column("runbook_id", sqlmodel.sql.sqltypes.GUID(), nullable=True),
        sa.Column("content", sa.Text(), nullable=True),
        sa.Column("link", sa.Text(), nullable=True),
        sa.Column("id", sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column("encoding", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("file_name", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["runbook_id"], ["runbook.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "runbooktoincident",
        sa.Column(
            "incident_id",
            sqlalchemy_utils.types.uuid.UUIDType(binary=False),
            nullable=False,
        ),
        sa.Column("tenant_id", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("runbook_id", sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column("timestamp", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["incident_id"], ["incident.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["runbook_id"],
            ["runbook.id"],
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id"],
            ["tenant.id"],
        ),
        sa.PrimaryKeyConstraint("incident_id", "runbook_id"),
    )

    with op.batch_alter_table("incident", schema=None) as batch_op:
        batch_op.add_column(sa.Column("runbooks_count", sa.Integer(), nullable=False))

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("incident", schema=None) as batch_op:
        batch_op.drop_column("runbooks_count")
    
    op.drop_table("runbooktoincident")
    op.drop_table("runbookcontent")
    with op.batch_alter_table("runbook", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_runbook_timestamp"))

    op.drop_table("runbook")
    # ### end Alembic commands ###
