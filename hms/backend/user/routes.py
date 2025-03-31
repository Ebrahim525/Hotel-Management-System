from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.models import db, User, Booking, Hotel, Room, Review
from datetime import datetime, timezone

# Define allowed room types
ALLOWED_ROOM_TYPES = {"Deluxe", "Suite", "Standard"}

user_bp = Blueprint('user_bp', __name__)

# ------------------- Edit Profile -------------------
@user_bp.route('/profile/edit', methods=['PUT'])
@jwt_required()
def edit_profile():
    current_user_email = get_jwt_identity()
    data = request.json

    # Extract new data
    new_fullname = data.get('fullname')
    new_email = data.get('email')

    # Find the user
    user = User.query.filter_by(email=current_user_email).first()
    if not user:
        return jsonify({"error": "User not found!"}), 404

    # Update profile data
    if new_fullname:
        user.username = new_fullname
    if new_email:
        existing_user = User.query.filter_by(email=new_email).first()
        if existing_user and existing_user.id != user.id:
            return jsonify({"error": "Email already exists!"}), 409
        user.email = new_email

    db.session.commit()

    return jsonify({
        "message": "Profile updated successfully!",
        "new_fullname": user.username,
        "new_email": user.email
    })


# ------------------- Get User Dashboard -------------------
@user_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    if not user:
        return jsonify({"error": "User not found!"}), 404

    bookings = Booking.query.filter_by(user_id=user.id).all()
    today = datetime.utcnow().date()
    updated = False

    for booking in bookings:
        if booking.booking_status == "Confirmed" and booking.check_out_date < today:
            booking.booking_status = "Completed"
            updated = True

    if updated:
        db.session.commit()

    booking_history = [
        {
            "booking_id": b.id,
            "room_id": b.room_id,
            "hotel_id": b.hotel_id,
            "check_in": b.check_in_date.strftime('%Y-%m-%d'),
            "check_out": b.check_out_date.strftime('%Y-%m-%d'),
            "status": b.booking_status
        }
        for b in bookings
    ]

    return jsonify({
        "fullname": user.username,
        "email": user.email,
        "booking_history": booking_history
    })


# ------------------- Cancel Booking -------------------
@user_bp.route('/booking/cancel/<int:booking_id>', methods=['DELETE'])
@jwt_required()
def cancel_booking(booking_id):
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    if not user:
        return jsonify({"error": "User not found!"}), 404

    booking = Booking.query.filter_by(id=booking_id, user_id=user.id).first()
    if not booking:
        return jsonify({"error": "Booking not found!"}), 404

    # Delete the booking completely from the database
    db.session.delete(booking)
    db.session.commit()
    return jsonify({"message": "Booking cancelled and deleted successfully!"})


# ------------------- Make a New Booking -------------------
@user_bp.route('/booking/new', methods=['POST'])
@jwt_required()
def new_booking():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    if not user:
        return jsonify({"error": "User not found!"}), 404

    data = request.json
    room_id = data.get("room_id")
    check_in = data.get("check_in")
    check_out = data.get("check_out")
    
    if not all([room_id, check_in, check_out]):
        return jsonify({"error": "All fields are required!"}), 400

    room = Room.query.filter_by(id=room_id).first()
    if not room:
        return jsonify({"error": "Room not found!"}), 404

    hotel_id = room.hotel_id

    try:
        check_in_date = datetime.strptime(check_in, '%Y-%m-%d').date()
        check_out_date = datetime.strptime(check_out, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Please use YYYY-MM-DD."}), 400
    
    # Ensure the check-in date is not in the past
    today = datetime.utcnow().date()
    if check_in_date < today:
        return jsonify({"error": "Check-in date cannot be in the past."}), 400

    if check_in_date >= check_out_date:
        return jsonify({"error": "Check-out date must be after check-in date."}), 400

    existing_booking = Booking.query.filter(
        Booking.room_id == room.id,
        Booking.check_in_date < check_out_date,
        Booking.check_out_date > check_in_date,
        Booking.booking_status == "Confirmed"
    ).first()

    if existing_booking:
        return jsonify({"error": "Room is already booked for the selected dates!"}), 400

    new_booking = Booking(
        user_id=user.id,
        room_id=room.id,
        hotel_id=hotel_id,
        check_in_date=check_in_date,
        check_out_date=check_out_date,
        booking_status="Pending"  # Set status to Pending
    )
    db.session.add(new_booking)
    db.session.commit()

    return jsonify({"message": "Booking created successfully!", "booking_id": new_booking.id})


# ------------------- Update Booking -------------------
@user_bp.route('/booking/update/<int:booking_id>', methods=['PUT'])
@jwt_required()
def update_booking(booking_id):
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    if not user:
        return jsonify({"error": "User not found!"}), 404

    booking = Booking.query.filter_by(id=booking_id, user_id=user.id).first()
    if not booking:
        return jsonify({"error": "Booking not found!"}), 404

    # Prevent modification if check-in has already started
    if booking.check_in_date <= datetime.utcnow().date():
        return jsonify({"error": "Cannot modify booking after check-in date."}), 403

    data = request.json
    new_room_type = data.get('room_type')
    new_check_in = data.get('check_in')
    new_check_out = data.get('check_out')

    # Validate room type if provided
    if new_room_type and new_room_type not in ALLOWED_ROOM_TYPES:
        return jsonify({"error": f"Invalid room type. Allowed values: {', '.join(ALLOWED_ROOM_TYPES)}."}), 400

    new_check_in_date = booking.check_in_date
    new_check_out_date = booking.check_out_date
    if new_check_in:
        try:
            new_check_in_date = datetime.strptime(new_check_in, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"error": "Invalid check-in date format. Please use YYYY-MM-DD."}), 400
    if new_check_out:
        try:
            new_check_out_date = datetime.strptime(new_check_out, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"error": "Invalid check-out date format. Please use YYYY-MM-DD."}), 400

    # Ensure new check-in date is not in the past
    today = datetime.utcnow().date()
    if new_check_in_date < today:
        return jsonify({"error": "Check-in date cannot be in the past."}), 400

    if new_check_in_date >= new_check_out_date:
        return jsonify({"error": "Check-out date must be after check-in date."}), 400

    overlapping_booking = Booking.query.filter(
        Booking.room_id == booking.room_id,
        Booking.id != booking.id,
        Booking.booking_status == "Confirmed",
        Booking.check_in_date < new_check_out_date,
        Booking.check_out_date > new_check_in_date
    ).first()

    if overlapping_booking:
        return jsonify({"error": "The new dates clash with an existing booking for this room."}), 400

    if new_room_type:
        booking.room_type = new_room_type
    booking.check_in_date = new_check_in_date
    booking.check_out_date = new_check_out_date

    # Set status to Pending after update
    booking.booking_status = "Pending"

    db.session.commit()
    return jsonify({"message": "Booking updated successfully!"})


# ------------------- Submit Booking Review -------------------
@user_bp.route('/booking/review/<int:booking_id>', methods=['POST'])
@jwt_required()
def submit_review(booking_id):
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    if not user:
        return jsonify({"error": "User not found!"}), 404

    booking = Booking.query.filter_by(id=booking_id, user_id=user.id).first()
    if not booking:
        return jsonify({"error": "Booking not found!"}), 404

    data = request.json
    rating = data.get('rating')
    if rating is None:
        return jsonify({"error": "Rating is required!"}), 400

    if booking.check_out_date > datetime.utcnow().date():
        return jsonify({"error": "You can only rate after check-out."}), 403

    new_review = Review(
        rating=rating,
        user_id=user.id,
        hotel_id=booking.hotel_id
    )
    db.session.add(new_review)
    db.session.commit()

    return jsonify({"message": "Review submitted successfully!"})


# ------------------- Search Hotels -------------------
@user_bp.route('/hotels/search', methods=['GET'])
def search_hotels():
    location = request.args.get('location', type=str)
    hotel_name = request.args.get('hotel_name', type=str)  # <-- Extract hotel name
    required_capacity = request.args.get('guests', default=1, type=int)
    check_in = request.args.get('check_in')
    check_out = request.args.get('check_out')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    min_rating = request.args.get('min_rating', type=float)
    room_type = request.args.get('room_type', type=str)

    # If a room type filter is provided, validate it.
    if room_type and room_type not in ALLOWED_ROOM_TYPES:
        return jsonify({"error": f"Invalid room type filter. Allowed values: {', '.join(ALLOWED_ROOM_TYPES)}."}), 400

    query = Hotel.query
    if location:
        query = query.filter(Hotel.location.ilike(f"%{location}%"))
    if hotel_name:  # <-- Add filtering for hotel name
        query = query.filter(Hotel.hotel_name.ilike(f"%{hotel_name}%"))
    if min_rating is not None:
        query = query.filter(Hotel.rating >= min_rating)
    
    hotels = query.all()
    available_hotels = []

    for hotel in hotels:
        if check_in and check_out:
            try:
                check_in_date = datetime.strptime(check_in, '%Y-%m-%d')
                check_out_date = datetime.strptime(check_out, '%Y-%m-%d')
                if check_out_date <= check_in_date:
                    return jsonify({"error": "Check-out date must be after check-in date."}), 400
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

            free_rooms_query = (
                Room.query
                .filter(Room.hotel_id == hotel.id)
                .filter(~Room.bookings.any(
                    (Booking.booking_status == "Confirmed") &
                    (Booking.check_in_date < check_out_date) &
                    (Booking.check_out_date > check_in_date)
                ))
            )
        else:
            free_rooms_query = Room.query.filter(Room.hotel_id == hotel.id)
        
        if min_price is not None:
            free_rooms_query = free_rooms_query.filter(Room.price_per_night >= min_price)
        if max_price is not None:
            free_rooms_query = free_rooms_query.filter(Room.price_per_night <= max_price)

        if room_type:
            free_rooms_query = free_rooms_query.filter(Room.room_type == room_type)

        free_rooms = free_rooms_query.all()

        matching_rooms = [room for room in free_rooms if room.capacity >= required_capacity]

        if matching_rooms:
            min_room_price = min(room.price_per_night for room in matching_rooms)
            available_hotels.append({
                "hotel_id": hotel.id,
                "hotel_name": hotel.hotel_name,
                "location": hotel.location,
                "rating": hotel.rating,
                "rooms_available": [{
                    "room_id": room.id,
                    "room_type": room.room_type,
                    "capacity": room.capacity,
                    "price_per_night": room.price_per_night
                } for room in matching_rooms],
                "min_price": min_room_price
            })

    if not available_hotels:
        return jsonify({"message": "No available hotels match your criteria."}), 404

    return jsonify({"results": available_hotels})
