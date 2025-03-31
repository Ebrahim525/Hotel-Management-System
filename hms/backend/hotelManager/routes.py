from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models.models import User, Hotel, Room, Booking, Payment
from app import db

hotel_bp = Blueprint('hotel_bp', __name__)

@hotel_bp.route('/bookings', methods=['GET'])
@jwt_required()
def get_manager_bookings():
    claims = get_jwt()
    user_ido = claims.get("user_id")
    user_type = claims.get("usertype")

    if user_type != "Manager":
        return jsonify({"error": "Unauthorized action!"}), 403

    bookings = db.session.query(
    Booking.id,
    Booking.hotel_id,
    Booking.room_id,
    User.username,
    Booking.booking_status,
    Booking.check_in_date,
    Booking.check_out_date
    ).join(User, Booking.user_id == User.id)\
    .join(Hotel, Booking.hotel_id == Hotel.id)\
    .filter(Hotel.owner_id == user_ido)\
    .all()


    # Construct the response list
    bookings_list = [{
        'booking_id': book.id,
        'hotel_id': book.hotel_id,
        'room_id': book.room_id,
        'username': book.username,
        'check_in_date': book.check_in_date.isoformat(),
        'check_out_date': book.check_out_date.isoformat(),
        'booking_status': book.booking_status
    } for book in bookings]

    return jsonify(bookings_list)


@hotel_bp.route('/remove/<int:booking_id>', methods=['DELETE'])
@jwt_required()
def delete_booking(booking_id):
    claim = get_jwt()
    user_type = claim.get("usertype")

    if user_type != "Manager":
        return jsonify({"error": "Unauthorized action!"}), 403
    booking = Booking.query.get(booking_id)

    if not booking:
        return jsonify({"error": "Booking not found"}), 410 ####
    
    try:
        db.session.delete(booking)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting booking: {e}")


    return jsonify({"success": f"Booking {booking_id} deleted successfully"}), 200


@hotel_bp.route('/confirm/<int:booking_id>', methods=['PATCH'])
@jwt_required()
def confirm_booking(booking_id):
    claim = get_jwt()
    user_type = claim.get("usertype")

    if user_type != "Manager":
        return jsonify({"error": "Unauthorized action!"}), 403
    booking = Booking.query.get(booking_id)

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    payment = Payment.query.filter_by(booking_id=booking_id).first()

    if not payment:
        return jsonify({"error": "Payment not found"}), 404

    booking.booking_status = "Confirmed"

    
    payment.payment_status = "Confirmed"

    db.session.flush()
    db.session.commit()

    return jsonify({
        "success": f"Booking {booking_id} and payment status updated to Confirmed"
    }), 200


@hotel_bp.route('/edit', methods=['PATCH'])
@jwt_required()
def edit_username():
    claim = get_jwt()
    user_id = claim.get("user_id")
    user_type = claim.get("usertype")

    if user_type != "Manager":
        return jsonify({"error": "Unauthorized action!"}), 403
    data = request.get_json()
    userName = data.get("username")

    if not userName or userName.strip() == "":
        return jsonify({"error": "Name cannot be empty!"}), 400

    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found!"}), 404

    user.username = userName

    db.session.commit()  # <-- You also forgot the parentheses here!

    # Corrected indentation here
    return jsonify({"success": "User name updated successfully!"}), 200


@hotel_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    claim = get_jwt()
    user_id = claim.get('user_id')
    user_type = claim.get("usertype")

    if user_type != "Manager":
        return jsonify({"error": "Unauthorized action!"}), 403
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found!"}), 410

    user_data = {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
    }

    return jsonify(user_data), 200


@hotel_bp.route('/add-hotel', methods=['POST'])
@jwt_required()
def add_hotel():
    claim = get_jwt()
    user_type = claim.get("usertype")
    user_id = claim.get("user_id");

    if user_type != "Manager":
        return jsonify({"error": "Unauthorized action!"}), 403

    data = request.get_json()
    hotel_namee = data.get("hotel_name")
    locationn = data.get("location")
    ratingg = data.get("rating")
    owner_idd = user_id

    if not hotel_namee or not locationn:
        return jsonify({"error": "All fields are required!"}), 400

    try:
        new_hotel = Hotel(
            hotel_name=hotel_namee,
            location=locationn,
            rating = ratingg,
            status = "Pending",
            owner_id = owner_idd
        )
        db.session.add(new_hotel)
        db.session.commit()

        return jsonify({"success": "Hotel added successfully!", "hotel_id": new_hotel.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@hotel_bp.route('/get-hotels', methods=['GET'])
@jwt_required()
def get_hotels():
    claim = get_jwt()
    user_type = claim.get("usertype")
    user_id = claim.get("user_id")

    if user_type != "Manager":
        return jsonify({"error": "Unauthorized action!"}), 403

    try:
        hotels = Hotel.query.filter_by(owner_id=user_id).all()
        hotel_list = []
        
        for hotel in hotels:
            rooms = Room.query.filter_by(hotel_id=hotel.id).all()
            room_list = [
                {
                    "room_id": room.id,
                    "type": room.room_type,
                    "price": room.price_per_night,
                    "capacity": room.capacity,
                }
                for room in rooms
            ]
            
            hotel_data = {
                "id": hotel.id,
                "name": hotel.hotel_name,
                "location": hotel.location,
                "rating": hotel.rating,
                "status": hotel.status,
                "rooms": room_list,
            }
            hotel_list.append(hotel_data)

        return jsonify({"hotels": hotel_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@hotel_bp.route("/add-room", methods=["POST"])
@jwt_required()
def add_room():
    claim = get_jwt()
    user_type = claim.get("usertype")
    user_id = claim.get("user_id")

    if user_type != "Manager":
        return jsonify({"error": "Unauthorized action!"}), 403
    
    data = request.json
    hotel_id = data.get("hotel_id")
    room_type = data.get("room_type")
    price_per_night = data.get("price_per_night")
    capacity = data.get("capacity")

    if not (hotel_id and room_type and price_per_night and capacity):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        new_room = Room(
            hotel_id=hotel_id,
            room_type=room_type,
            price_per_night=price_per_night,
            capacity=capacity,
        )
        db.session.add(new_room)
        db.session.commit()

        return jsonify({"success": "Room added successfully!", "room_id": new_room.id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@hotel_bp.route("/edit-room/<int:room_id>", methods=["PATCH"])
@jwt_required()
def edit_room(room_id):
    claim = get_jwt()
    user_type = claim.get("usertype")
    user_id = claim.get("user_id")

    if user_type != "Manager":
        return jsonify({"error": "Unauthorized action!"}), 403
    
    data = request.json
    room = Room.query.get(room_id)

    if not room:
        return jsonify({"error": "Room not found"}), 410

    try:
        room.room_type = data.get("room_type", room.room_type)
        room.price_per_night = data.get("price_per_night", room.price_per_night)
        room.capacity = data.get("capacity", room.capacity)

        db.session.commit()
        return jsonify({"success": "Room updated successfully!"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@hotel_bp.route("/delete-room/<int:room_id>", methods=["DELETE"])
@jwt_required()
def delete_room(room_id):
    claim = get_jwt()
    user_type = claim.get("usertype")
    user_id = claim.get("user_id")

    if user_type != "Manager":
        return jsonify({"error": "Unauthorized action!"}), 403
    
    room = Room.query.get(room_id)

    if not room:
        return jsonify({"error": "Room not found"}), 404

    try:
        db.session.delete(room)
        db.session.commit()
        return jsonify({"success": "Room deleted successfully!"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
