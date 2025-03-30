from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.models import db, User, Booking, Hotel, Room
from datetime import datetime, timezone

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
        # Check if the new email already exists
        if User.query.filter_by(email=new_email).first():
            return jsonify({"error": "Email already exists!"}), 409
        user.email = new_email

    # Save changes
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
    """Fetch user details and booking history for the dashboard."""
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    if not user:
        return jsonify({"error": "User not found!"}), 404

    bookings = Booking.query.filter_by(user_id=user.id).all()
    booking_history = [
        {
            "booking_id": b.id,
            "room_id": b.room_id,
            "hotel_id": b.hotel_id,
            "check_in": b.check_in_date.strftime('%Y-%m-%d'),
            "check_out": b.check_out_date.strftime('%Y-%m-%d'),
            "status": b.booking_status,
            "review": b.review if hasattr(b, 'review') else "",
            "rating": b.rating if hasattr(b, 'rating') else 0
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
    """Cancel a booking if it's allowed."""
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    if not user:
        return jsonify({"error": "User not found!"}), 404

    booking = Booking.query.filter_by(id=booking_id, user_id=user.id).first()
    if not booking:
        return jsonify({"error": "Booking not found!"}), 404

    if booking.booking_status == "Cancelled":
        return jsonify({"message": "Booking is already cancelled."})

    # Assuming cancellation is allowed before check-in
    if booking.check_in_date <= datetime.now(timezone.utc).date():
        booking.booking_status = "Cancelled"
        db.session.commit()
        return jsonify({"message": "Booking cancelled successfully!"})
    
    return jsonify({"error": "Cancellation not allowed after check-in date."}), 403


# ------------------- Make a New Booking -------------------
@user_bp.route('/booking/new', methods=['POST'])
@jwt_required()
def new_booking():
    """Create a new booking for a user."""
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

    # Get the room based on room_id
    room = Room.query.filter_by(id=room_id).first()
    if not room:
        return jsonify({"error": "Room not found!"}), 404

    # Get the hotel_id based on the room's hotel_id
    hotel_id = room.hotel_id

    # Date format validation
    try:
        check_in_date = datetime.strptime(check_in, '%Y-%m-%d').date()
        check_out_date = datetime.strptime(check_out, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Please use YYYY-MM-DD."}), 400
    
    if check_in_date >= check_out_date:
        return jsonify({"error": "Check-out date must be after check-in date."}), 400

    # Check if the room is available for the selected dates
    existing_booking = Booking.query.filter(
        Booking.room_id == room.id,
        Booking.check_in_date < check_out_date,
        Booking.check_out_date > check_in_date,
        Booking.booking_status == "Confirmed"
    ).first()

    if existing_booking:
        return jsonify({"error": "Room is already booked for the selected dates!"}), 400

    # Create the new booking
    new_booking = Booking(
        user_id=user.id,
        room_id=room.id,  # Link the booking to the room
        hotel_id=hotel_id,  # Link the booking to the hotel
        check_in_date=check_in_date,
        check_out_date=check_out_date,
        booking_status="Confirmed"
    )
    db.session.add(new_booking)
    db.session.commit()

    return jsonify({"message": "Booking created successfully!", "booking_id": new_booking.id})

# ------------------- Update Booking -------------------
@user_bp.route('/booking/update/<int:booking_id>', methods=['PUT'])
@jwt_required()
def update_booking(booking_id):
    """Update booking details before check-in."""
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    if not user:
        return jsonify({"error": "User not found!"}), 404

    booking = Booking.query.filter_by(id=booking_id, user_id=user.id).first()
    if not booking:
        return jsonify({"error": "Booking not found!"}), 404

    # Disallow modifications if check-in has already started
    if booking.check_in_date <= datetime.utcnow().date():
        return jsonify({"error": "Cannot modify booking after check-in date."}), 403

    data = request.json
    new_room_type = data.get('room_type')
    new_check_in = data.get('check_in')
    new_check_out = data.get('check_out')

    if new_room_type:
        booking.room_type = new_room_type
    if new_check_in:
        booking.check_in_date = datetime.strptime(new_check_in, '%Y-%m-%d')
    if new_check_out:
        booking.check_out_date = datetime.strptime(new_check_out, '%Y-%m-%d')

    db.session.commit()
    return jsonify({"message": "Booking updated successfully!"})


# ------------------- Submit Booking Review -------------------
@user_bp.route('/booking/review/<int:booking_id>', methods=['POST'])
@jwt_required()
def submit_review(booking_id):
    """Submit a review and rating for a booking."""
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    if not user:
        return jsonify({"error": "User not found!"}), 404

    booking = Booking.query.filter_by(id=booking_id, user_id=user.id).first()
    if not booking:
        return jsonify({"error": "Booking not found!"}), 404

    data = request.json
    review_text = data.get('review')
    rating = data.get('rating')

    if not review_text or rating is None:
        return jsonify({"error": "Review text and rating are required!"}), 400

    # Allow review only if the check-out date is in the past
    if booking.check_out_date > datetime.utcnow().date():
        return jsonify({"error": "You can only review after check-out."}), 403

    booking.review = review_text
    booking.rating = rating
    db.session.commit()

    return jsonify({"message": "Review submitted successfully!"})

# ------------------- Search Hotels -------------------
@user_bp.route('/hotels/search', methods=['GET'])
def search_hotels():
    """Search hotels based on filters."""
    location = request.args.get('location', type=str)
    rooms_required = request.args.get('rooms', default=1, type=int)
    check_in = request.args.get('check_in')
    check_out = request.args.get('check_out')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    min_rating = request.args.get('min_rating', type=float)

    # Ensure required parameters are provided
    if not location or not check_in or not check_out:
        return jsonify({"error": "Location, check-in, and check-out dates are required!"}), 400

    # Validate date format
    try:
        check_in_date = datetime.strptime(check_in, '%Y-%m-%d')
        check_out_date = datetime.strptime(check_out, '%Y-%m-%d')
        if check_out_date <= check_in_date:
            return jsonify({"error": "Check-out date must be after check-in date."}), 400
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

    # Filter hotels based on location
    query = Hotel.query.filter_by(location=location)
    if min_rating is not None:
        query = query.filter(Hotel.rating >= min_rating)

    hotels = query.all()
    if not hotels:
        return jsonify({"message": "No hotels found in this location."}), 404

    available_hotels = []

    for hotel in hotels:
        # Optimize query by filtering rooms directly
        free_rooms_query = (
            Room.query
            .filter(Room.hotel_id == hotel.id)
            .filter(~Room.bookings.any(
                (Booking.check_in_date < check_out_date) &
                (Booking.check_out_date > check_in_date)
            ))
        )

        # Apply price filtering if values exist
        if min_price is not None:
            free_rooms_query = free_rooms_query.filter(Room.price_per_night >= min_price)
        if max_price is not None:
            free_rooms_query = free_rooms_query.filter(Room.price_per_night <= max_price)

        free_rooms_count = free_rooms_query.count()  # Efficient count query
        free_rooms = free_rooms_query.all()  # Fetch only if needed

        if free_rooms_count >= rooms_required:
            available_hotels.append({
                "hotel_id": hotel.id,
                "hotel_name": hotel.hotel_name,  # Fixed attribute name
                "location": hotel.location,
                "rating": hotel.rating,
                "available_rooms": free_rooms_count,
                "min_price": min(room.price_per_night for room in free_rooms) if free_rooms else None
            })

    if not available_hotels:
        return jsonify({"message": "No available hotels match your criteria."}), 404

    return jsonify({"results": available_hotels})