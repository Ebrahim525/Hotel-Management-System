from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
)

from models.models import db, User

app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hms.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'hmsprjt'

# Initialize extensions
db.init_app(app)
bcrypt = Bcrypt(app)
CORS(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Avoid circular imports by importing routes after initializing app
from admin.routes import admin_bp
from hotelManager.routes import hotel_bp
from user.routes import user_bp, search_hotels  # Import the user blueprint

app.register_blueprint(user_bp, url_prefix='/user')  # Register with '/user' prefix
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(hotel_bp, url_prefix='/hotel')
app.add_url_rule('/hotels/search', 'search_hotels', search_hotels, methods=['GET'])

# Routes
@app.route('/')
def home():
    return "Hotel Management System Backend is running!"

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and bcrypt.check_password_hash(user.password, password):
        access_token = create_access_token(
            identity=user.email,
            additional_claims={"usertype": user.usertype, "user_id": user.id}
        )
        return jsonify({
            "message": "Login successful!",
            "access_token": access_token,
            "redirect_url": f"/{user.usertype.lower()}"
        })
    return jsonify({"error": "Invalid email or password"}), 401

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('fullname')
    email = data.get('email')
    password = data.get('password')
    usertype = data.get('usertype')
    phone_number = data.get('phone_number')

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required!"}), 400

    if usertype == "Admin":
        return jsonify({"error": "Cannot Register Admin"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User already exists"}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    new_user = User(
        username=username,
        email=email,
        password=hashed_password,
        usertype=usertype
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully!"}), 201

@app.route('/admin', methods=['GET'])
@jwt_required()
def admin_dashboard():
    claims = get_jwt()
    if claims.get("usertype") == "Admin":
        return jsonify({"message": "Welcome to the Admin Dashboard!"})
    return jsonify({"error": "Unauthorized access!"}), 403

@app.route('/manager')
def manager_dashboard():
    return "Welcome to the Manager Dashboard!"

@app.route('/guest')
@jwt_required()
def guest_dashboard():
    claims = get_jwt()
    if claims.get("usertype") == "Guest":
        return jsonify({"message": "Welcome to the Guest Dashboard!"})
    return jsonify({"error": "Unauthorized access!"}), 403


# Run the app
if __name__ == "__main__":
    app.run(debug=True, port=5000)
