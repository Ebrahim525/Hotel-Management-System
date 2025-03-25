from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_migrate import Migrate
from models.models import db

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

if __name__ == "__main__":
    app.run(debug=True, port=5000)  # Port 5000 is default
