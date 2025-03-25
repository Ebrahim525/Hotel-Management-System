"""Initial migration

Revision ID: 029a1f57d191
Revises: 
Create Date: 2025-03-26 00:31:46.263674

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '029a1f57d191'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('user',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(length=50), nullable=False),
    sa.Column('email', sa.String(length=100), nullable=False),
    sa.Column('password', sa.String(length=100), nullable=False),
    sa.Column('phone_number', sa.String(length=15), nullable=True),
    sa.Column('usertype', sa.String(length=20), nullable=True),
    sa.Column('date_registered', sa.DateTime(), nullable=True),
    sa.Column('admin_user_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['admin_user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.create_table('hotel',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('hotel_name', sa.String(length=100), nullable=False),
    sa.Column('location', sa.String(length=100), nullable=False),
    sa.Column('rating', sa.Float(), nullable=True),
    sa.Column('status', sa.String(length=20), nullable=True),
    sa.Column('date_added', sa.DateTime(), nullable=True),
    sa.Column('owner_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['owner_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('review',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('rating', sa.Float(), nullable=False),
    sa.Column('date_posted', sa.DateTime(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('hotel_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['hotel_id'], ['hotel.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('room',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('room_type', sa.String(length=50), nullable=False),
    sa.Column('price_per_night', sa.Float(), nullable=False),
    sa.Column('availability', sa.Boolean(), nullable=True),
    sa.Column('capacity', sa.Integer(), nullable=False),
    sa.Column('date_uploaded', sa.DateTime(), nullable=True),
    sa.Column('hotel_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['hotel_id'], ['hotel.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('booking',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('booking_status', sa.String(length=20), nullable=False),
    sa.Column('date_booked', sa.DateTime(), nullable=True),
    sa.Column('check_in_date', sa.Date(), nullable=True),
    sa.Column('check_out_date', sa.Date(), nullable=True),
    sa.Column('room_id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['room_id'], ['room.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('payment',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('payment_date', sa.DateTime(), nullable=True),
    sa.Column('payment_status', sa.String(length=20), nullable=False),
    sa.Column('amount_paid', sa.Float(), nullable=False),
    sa.Column('booking_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['booking_id'], ['booking.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('payment')
    op.drop_table('booking')
    op.drop_table('room')
    op.drop_table('review')
    op.drop_table('hotel')
    op.drop_table('user')
    # ### end Alembic commands ###
