from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models.models import User, Hotel, Room, Booking, Review
from app import db

hotel_bp = Blueprint('hotel_bp', __name__)

