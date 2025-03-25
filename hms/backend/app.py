from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_migrate import Migrate
from models.models import db, User

app = Flask(__name__)

# Database configuration (using SQLite for now)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hms.db'  # SQLite
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)
bcrypt = Bcrypt(app)
CORS(app)
migrate = Migrate(app, db)

@app.route('/')
def home():
    return "Hotel Management System Backend is running!"


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    # Check if user exists
    user = User.query.filter_by(email=email).first()

    if user and bcrypt.check_password_hash(user.password, password):
        # Redirect based on usertype
        if user.usertype == "Admin":
            return jsonify({"message": "Login successful!", "redirect_url": "/admin/dashboard"})
        elif user.usertype == "Manager":
            return jsonify({"message": "Login successful!", "redirect_url": "/manager/dashboard"})
        elif user.usertype == "Guest":
            return jsonify({"message": "Login successful!", "redirect_url": "/guest/dashboard"})
    else:
        return jsonify({"error": "Invalid email or password"}), 401



@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')  # <-- Get the username from request
    email = data.get('email')
    password = data.get('password')
    usertype = data.get('usertype')

    # Check if username or email is missing
    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required!"}), 400

    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "User already exists"}), 409

    # Hash the password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Create a new user with username
    new_user = User(username=username, email=email, password=hashed_password, usertype=usertype)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully!"}), 201




# ------------------- Dummy Dashboards -------------------
@app.route('/admin/dashboard')
def admin_dashboard():
    return "Welcome to the Admin Dashboard!"

@app.route('/manager/dashboard')
def manager_dashboard():
    return "Welcome to the Manager Dashboard!"

@app.route('/guest/dashboard')
def guest_dashboard():
    return "Welcome to the Guest Dashboard!"


if __name__ == "__main__":
    app.run(debug=True, port=5000)  # Port 5000 is default
