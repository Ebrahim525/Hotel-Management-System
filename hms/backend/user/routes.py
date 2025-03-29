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
