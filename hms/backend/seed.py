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
    manager_user = User(
        username="manager456",
        email="manager@example.com",
        password=bcrypt.generate_password_hash("managerpass").decode('utf-8'),
        usertype="Manager"
    )
    guest_user = User(
        username="guest789",
        email="guest@example.com",
        password=bcrypt.generate_password_hash("guestpass").decode('utf-8'),
        usertype="Guest"
    )

    db.session.add_all([admin_user, manager_user, guest_user])
    db.session.commit()

    print("✅ Users seeded successfully!")

    # ----------------- Seed Hotels -----------------
    hotel1 = Hotel(
        hotel_name="Luxury Inn",
        location="New York",
        status="Open",
        owner_id=manager_user.id
    )
    hotel2 = Hotel(
        hotel_name="Cozy Stay",
        location="Los Angeles",
        status="Open",
        owner_id=manager_user.id
    )

    db.session.add_all([hotel1, hotel2])
    db.session.commit()

    print("🏨 Hotels seeded successfully!")

    # ----------------- Seed Rooms -----------------
    room1 = Room(
        room_type="Deluxe",
        price_per_night=150.0,
        availability=True,
        hotel_id=hotel1.id
    )
    room2 = Room(
        room_type="Suite",
        price_per_night=250.0,
        availability=True,
        hotel_id=hotel2.id
    )

    db.session.add_all([room1, room2])
    db.session.commit()

    print("🛏️ Rooms seeded successfully!")

    # ----------------- Seed Booking -----------------
    booking1 = Booking(
        booking_status="Confirmed",
        check_in_date=datetime.strptime("2025-04-01", "%Y-%m-%d").date(),
        check_out_date=datetime.strptime("2025-04-05", "%Y-%m-%d").date(),
        room_id=room1.id,
        user_id=guest_user.id,
        hotel_id=hotel1.id
    )

    db.session.add(booking1)
    db.session.commit()

    print("📅 Bookings seeded successfully!")

    # ----------------- Seed Payment -----------------
    payment1 = Payment(
        payment_status="Paid",
        amount_paid=600.0,
        booking_id=booking1.id
    )

    db.session.add(payment1)
    db.session.commit()

    print("💳 Payments seeded successfully!")

    # ----------------- Seed Review -----------------
    review1 = Review(
        rating=4.5,
        user_id=guest_user.id,
        hotel_id=hotel1.id
    )

    db.session.add(review1)
    db.session.commit()

    print("⭐ Reviews seeded successfully!")
