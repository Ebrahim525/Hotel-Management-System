from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.models import db, User

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
            "room_type": b.room_type,
            "check_in": b.check_in_date.strftime('%Y-%m-%d'),
            "check_out": b.check_out_date.strftime('%Y-%m-%d'),
            "price": b.price,
            "status": b.status
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

    if booking.status == "Cancelled":
        return jsonify({"message": "Booking is already cancelled."})

    # Assuming cancellation is allowed before check-in
    if booking.check_in_date > datetime.utcnow():
        booking.status = "Cancelled"
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
    room_type = data.get("room_type")
    check_in = data.get("check_in")
    check_out = data.get("check_out")
    price = data.get("price")

    if not all([room_type, check_in, check_out, price]):
        return jsonify({"error": "All fields are required!"}), 400

    new_booking = Booking(
        user_id=user.id,
        room_type=room_type,
        check_in_date=datetime.strptime(check_in, '%Y-%m-%d'),
        check_out_date=datetime.strptime(check_out, '%Y-%m-%d'),
        price=price,
        status="Confirmed"
    )
    db.session.add(new_booking)
    db.session.commit()

    return jsonify({"message": "Booking created successfully!"})

