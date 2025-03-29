from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models.models import User, Hotel, Review, Payment, Booking, Room
from app import db

# Create a blueprint for admin routes
admin_bp = Blueprint('admin_bp', __name__)

# ------------------- Get Users (Top 7 or Search) -------------------
@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    claims = get_jwt()
    usertype = claims.get("usertype")

    # Restrict to admin only
    if usertype != "Admin":
        return jsonify({"error": "Unauthorized access!"}), 403

    search_query = request.args.get('search', '').strip()

    if search_query:
        # Search by ID, username, or email
        users = User.query.filter(
            (User.id == search_query) |
            (User.username.ilike(f"%{search_query}%")) |
            (User.email.ilike(f"%{search_query}%"))
        ).all()
    else:
        # Get top 7 users if no search query
        users = User.query.limit(7).all()

    if not users:
        return jsonify({"message": "No users found."}), 404

    # Serialize user data
    user_list = [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "phone_number": user.phone_number,
            "usertype": user.usertype,
            "date_registered": user.date_registered.strftime('%Y-%m-%d %H:%M:%S')
        }
        for user in users
    ]
    return jsonify({"users": user_list}), 200

ADMIN_USER_ID = 1

@admin_bp.route('/remove-user/<int:user_id>', methods=['DELETE'])
@jwt_required()
def remove_user(user_id):
    claims = get_jwt()
    usertype = claims.get("usertype")

    # Restrict to admin only
    if usertype != "Admin":
        return jsonify({"error": "Unauthorized access!"}), 403

    
    if int(user_id) == int(ADMIN_USER_ID):
        return jsonify({"error": "Admin user cannot be removed!"}), 403


    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found."}), 404
    
    # if(user.usertype == "Manager"):
    #     hotels_to_delete = Hotel.query.filter_by(owner_id=user_id).all()

    #     for hotel in hotels_to_delete:
    #         Booking.query.filter_by(hotel_id=hotel.id).delete()
    #         Room.query.filter_by(hotel_id=hotel.id).delete()
    #         Review.query.filter_by(hotel_id=hotel.id).delete()
    #         db.session.delete(hotel)
    
    # if(user.usertype == "Guest"):
    #     Review.query.filter_by(user_id=user_id).delete()
    #     guest_bookings = Booking.query.filter_by(user_id=user_id).all()

    #     for booking in guest_bookings:
    #         Payment.query.filter_by(booking_id=booking.id).delete()
    #     Booking.query.filter_by(user_id=user_id).delete()


    db.session.delete(user)
    db.session.flush()
    db.session.commit()
    return jsonify({"message": f"User with ID {user_id} and associated hotels have been removed."}), 200



@admin_bp.route('/hotels', methods=['GET'])
@jwt_required()
def get_hotels():
    claims = get_jwt()
    usertype = claims.get("usertype")

    if usertype != "Admin":
        return jsonify({"error": "Unauthorized access!"}), 403

    page = request.args.get("page", 1, type=int)
    per_page = 7
    search_query = request.args.get("search_query", "").strip().lower()

    # Initial query with join
    query = (
        db.session.query(Hotel, User.username)
        .join(User, Hotel.owner_id == User.id)
    )

    # Apply search filter before paginating
    if search_query:
        query = query.filter(
            (Hotel.id.ilike(f"%{search_query}%")) |
            (Hotel.hotel_name.ilike(f"%{search_query}%")) |
            (User.username.ilike(f"%{search_query}%")) |
            (Hotel.status.ilike(f"%{search_query}%"))
        )

    # Paginate after filtering
    hotels = query.paginate(page=page, per_page=per_page, error_out=False)

    hotel_list = [
        {
            "id": hotel.id,
            "name": hotel.hotel_name,
            "owner": owner_name,
            "status": hotel.status,
        }
        for hotel, owner_name in hotels.items
    ]

    return jsonify({
        "hotels": hotel_list,
        "total_pages": hotels.pages,
        "current_page": page,
    }), 200



@admin_bp.route('/hotels/<int:hotel_id>/approve', methods=['PATCH'])
@jwt_required()
def approve_hotel(hotel_id):
    claims = get_jwt()
    if claims.get("usertype") != "Admin":
        return jsonify({"error": "Unauthorized access!"}), 403

    hotel = Hotel.query.get(hotel_id)
    if not hotel:
        return jsonify({"error": "Hotel not found"}), 404

    hotel.status = "Approved"
    db.session.commit()

    return jsonify({"success": f"Hotel {hotel.hotel_name} approved successfully"}), 200


@admin_bp.route('/hotels/<int:hotel_id>/flag', methods=['PATCH'])
@jwt_required()
def flag_hotel(hotel_id):
    claims = get_jwt()
    if claims.get("usertype") != "Admin":
        return jsonify({"error": "Unauthorized access!"}), 403

    hotel = Hotel.query.get(hotel_id)
    if not hotel:
        return jsonify({"error": "Hotel not found"}), 404

    hotel.status = "Flagged"
    db.session.commit()

    return jsonify({"success": f"Hotel {hotel.hotel_name} flagged successfully"}), 200


@admin_bp.route('/hotels/<int:hotel_id>/delete', methods=['DELETE'])
@jwt_required()
def delete_hotel(hotel_id):
    claims = get_jwt()
    if claims.get("usertype") != "Admin":
        return jsonify({"error": "Unauthorized access!"}), 403

    hotel = Hotel.query.get(hotel_id)
    if not hotel:
        return jsonify({"error": "Hotel not found"}), 404

    db.session.delete(hotel)
    db.session.commit()

    return jsonify({"success": f"Hotel {hotel.hotel_name} deleted successfully"}), 200
