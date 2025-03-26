from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_migrate import Migrate
from models.models import db, User
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt


app = Flask(__name__)

# Database configuration (using SQLite for now)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hms.db'  # SQLite
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'hmsprjt'  # Change this to a strong secret key

# Initialize extensions
db.init_app(app)
bcrypt = Bcrypt(app)
CORS(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

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
            additional_claims={"usertype": user.usertype}
        )

        return jsonify({
            "message": "Login successful!",
            "access_token": access_token,
            "redirect_url": f"/{user.usertype.lower()}"
        })
    else:
        return jsonify({"error": "Invalid email or password"}), 401



@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('fullname')  # <-- Get the username from request
    email = data.get('email')
    password = data.get('password')
    usertype = data.get('usertype')
    phone_number = data.get('phone_number')

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
@app.route('/admin', methods=['GET'])
@jwt_required()
def admin_dashboard():
    current_user = get_jwt_identity()
    claims = get_jwt()
    usertype = claims.get("usertype")
    if usertype == "Admin":
        return jsonify({"message": "Welcome to the Admin Dashboard!"})
    else:
        return jsonify({"error": "Unauthorized access!"}), 403



@app.route('/manager')
def manager_dashboard():
    return "Welcome to the Manager Dashboard!"

@app.route('/guest')
def guest_dashboard():
    return "Welcome to the Guest Dashboard!"


if __name__ == "__main__":
    app.run(debug=True, port=5000)  # Port 5000 is default
