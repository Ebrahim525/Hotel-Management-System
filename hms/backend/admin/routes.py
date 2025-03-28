from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models.models import User
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

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"User with ID {user_id} has been removed."}), 200


# def remove_user(user_id):
#     user = User.query.get(user_id)
#     if not user:
#         return jsonify({"error": "User not found"}), 404
#     db.session.delete(user)
#     db.session.commit()
#     return jsonify({"message": f"User with ID #{user_id} was successfully removed."})

# from flask import jsonify

# @app.route('/get_user/<int:user_id>', methods=['GET'])
# def get_user(user_id):
#     user = User.query.get(user_id)
#     if user:
#         return jsonify({"id": user.id, "name": user.username, "email": user.email}), 200
#     else:
#         return jsonify({"error": "User not found"}), 404


# def search_users():
#     query = request.args.get('q')
#     if not query:
#         return jsonify({"error": "Search query is missing"}), 400

#     users = User.query.filter(
#         (User.username.ilike(f"%{query}%")) |
#         (User.email.ilike(f"%{query}%")) |
#         (User.id == query)
#     ).all()

#     if not users:
#         return jsonify({"message": "No matching users found"}), 404

#     user_list = [{"id": user.id, "name": user.username, "email": user.email} for user in users]
#     return jsonify(user_list)
