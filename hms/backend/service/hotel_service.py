from flask import jsonify
from models.models import db, Hotel

def get_hotels():
    hotels = Hotel.query.all()
    return [
        {
            "id": hotel.id,
            "name": hotel.name,
            "owner": hotel.owner,
            "status": hotel.status
        }
        for hotel in hotels
    ]

def approve_hotel(hotel_id):
    hotel = Hotel.query.get(hotel_id)
    if not hotel:
        return {"error": "Hotel not found"}, 404

    hotel.status = 'Approved'
    db.session.commit()
    return {"message": f"Hotel #{hotel_id} has been approved."}, 200

def flag_hotel(hotel_id):
    hotel = Hotel.query.get(hotel_id)
    if not hotel:
        return {"error": "Hotel not found"}, 404

    db.session.delete(hotel)
    db.session.commit()
    return {"message": f"Hotel #{hotel_id} has been flagged and removed."}, 200
