from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# ----------------- User Model -----------------
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(15))
    usertype = db.Column(db.String(20))  # Admin/Manager/Guest
    date_registered = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Relationships
    bookings = db.relationship('Booking', backref='user', lazy=True)
    reviews = db.relationship('Review', backref='user', lazy=True)
    hotels = db.relationship('Hotel', backref='owner', lazy=True)


# ----------------- Booking Model -----------------
class Booking(db.Model):
    __tablename__ = 'booking'
    id = db.Column(db.Integer, primary_key=True)
    booking_status = db.Column(db.String(20), nullable=False)  # Confirmed/Canceled
    date_booked = db.Column(db.DateTime, default=db.func.current_timestamp())
    check_in_date = db.Column(db.Date)
    check_out_date = db.Column(db.Date)

    # Foreign keys
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotel.id'), nullable=False)  # New field

    # Relationships
    payments = db.relationship('Payment', backref='booking', lazy=True)


# ----------------- Room Model -----------------
class Room(db.Model):
    __tablename__ = 'room'
    id = db.Column(db.Integer, primary_key=True)
    room_type = db.Column(db.String(50), nullable=False)
    price_per_night = db.Column(db.Float, nullable=False)
    availability = db.Column(db.Integer, default=True)
    date_uploaded = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Foreign key
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotel.id'), nullable=False)

    # Relationships
    bookings = db.relationship('Booking', backref='room', lazy=True)


# ----------------- Payment Model -----------------
class Payment(db.Model):
    __tablename__ = 'payment'
    id = db.Column(db.Integer, primary_key=True)
    payment_date = db.Column(db.DateTime, default=db.func.current_timestamp())
    payment_status = db.Column(db.String(20), nullable=False)  # Paid/Pending
    amount_paid = db.Column(db.Float, nullable=False)

    # Foreign key
    booking_id = db.Column(db.Integer, db.ForeignKey('booking.id'), nullable=False)


# ----------------- Review Model -----------------
class Review(db.Model):
    __tablename__ = 'review'
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Float, nullable=False)
    date_posted = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotel.id'), nullable=False)


# ----------------- Hotel Model -----------------
class Hotel(db.Model):
    __tablename__ = 'hotel'
    id = db.Column(db.Integer, primary_key=True)
    hotel_name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    rating = db.Column(db.Float)
    status = db.Column(db.String(20))  # Open/Closed
    date_added = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Foreign key
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    # Relationships
    rooms = db.relationship('Room', backref='hotel', lazy=True)
    reviews = db.relationship('Review', backref='hotel', lazy=True)
