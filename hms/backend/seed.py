from app import app
from models.models import db, User, Hotel, Room, Booking, Payment, Review
from flask_bcrypt import Bcrypt
from datetime import datetime

bcrypt = Bcrypt(app)

# Create app context
with app.app_context():
    # Clear existing data
    db.drop_all()
    db.create_all()

    # ----------------- Seed Users -----------------
    admin_user = User(
        username="admin123",
        email="admin@example.com",
        password=bcrypt.generate_password_hash("password123").decode('utf-8'),
        usertype="Admin"
    )

    db.session.add_all([admin_user])
    db.session.commit()

    print("✅ Users seeded successfully!")