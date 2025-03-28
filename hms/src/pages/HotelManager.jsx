import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HotelManagerDashboard.css";
import profilePhoto from "./Images/profile.png";


const HotelManagerDashboard = () => {
  const [page, setPage] = useState("profile");
  const [hotels, setHotels] = useState([
    { 
      name: "Luxury Inn", 
      location: "Pattikkaadu",
      roomTypes: [
        { type: "Deluxe Suite", price: 150, availability: 5 },
        { type: "Standard Room", price: 80, availability: 3 },
      ] 
    }
  ]);
  const [selectedHotelIndex, setSelectedHotelIndex] = useState(0);
  const [newHotel, setNewHotel] = useState({ name: "", location: "" });
  const [newRoomType, setNewRoomType] = useState({ type: "", price: "", availability: "" });
  const [editingRoomType, setEditingRoomType] = useState(null);
  const [profile, setProfile] = useState({
    name: "Michael Johnson",
    email: "micxhael@luxuryinn.com",
    hotel: "Luxury Inn",
    location: "Pattikkaadu"
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bookings, setBookings] = useState([
    { id: "#B001", user: "John Doe", room: "Deluxe Suite", checkIn: "2025-04-15", checkOut: "2025-04-20" },
    { id: "#B002", user: "Jane Smith", room: "Standard Room", checkIn: "2025-04-18", checkOut: "2025-04-22" },
  ]);


  const handleAddOrUpdateRoomType = () => {
    if (!newRoomType.type || !newRoomType.price || !newRoomType.availability) return;
  
    setHotels(hotels.map((hotel, index) => 
      index === selectedHotelIndex
        ? {
            ...hotel,
            roomTypes: editingRoomType
              ? hotel.roomTypes.map(room => 
                  room.type === editingRoomType?.type ? { ...newRoomType } : room
                )
              : [...hotel.roomTypes, { ...newRoomType }]
          }
        : hotel
    ));
  
    setNewRoomType({ 
      ...newRoomType, 
      price: Number(e.target.value), 
      availability: Number(e.target.value) 
    });
    
    setEditingRoomType(null);
  };
  

  const handleAddHotel = () => {
    if (!newHotel.name || !newHotel.location) return;
  
    setHotels([...hotels, { ...newHotel, roomTypes: [] }]);
    setNewHotel({ name: "", location: "" });
  };
  


  const handleDeleteRoomType = (type) => {
    setHotels(hotels.map((hotel, index) => 
      index === selectedHotelIndex
        ? {
            ...hotel,
            roomTypes: hotel.roomTypes.filter(room => room.type !== type)
          }
        : hotel
    ));
  };


  const handleEditRoomType = (room) => {
    setNewRoomType({ ...room }); // Spread the object to create a new instance
    setEditingRoomType(room);
  };
  


  const handleCancelEdit = () => {
    setNewRoomType({ type: "", price: "", availability: "" });
    setEditingRoomType(null);
  };


  const handleCancelBooking = (id) => {
    setBookings(bookings.filter((booking) => booking.id !== id));
  };


  const handleProfileEditToggle = () => {
    setIsEditingProfile(!isEditingProfile);
  };


  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };


  const content = {
    profile: (
      <div className="profile-section">
        <h2>Profile Overview</h2>
        <div className="profile-card">
          <img className="ProfilePh" src={profilePhoto} alt="Profile" />
          {isEditingProfile ? (
            <div>
              <input type="text" name="name" value={profile.name} onChange={handleProfileChange} />
              <input type="email" name="email" value={profile.email} onChange={handleProfileChange} />
              <input type="text" name="hotel" value={profile.hotel} onChange={handleProfileChange} />
              <button className="btn save-profile" onClick={handleProfileEditToggle}>Save</button>
            </div>
          ) : (
            <div>
              <p><strong>Manager Name:</strong> {profile.name}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Hotel Name:</strong> {profile.hotel}</p>
              <button className="btn edit-profile" onClick={handleProfileEditToggle}>Edit Profile</button>
            </div>
          )}
        </div>
      </div>
    ),
    manageHotel: (
      <div className="manage-hotel-container">
        <div className="hotel-selection">
          <h3>Select Hotel</h3>
          <select 
            className="form-select"
            value={selectedHotelIndex}
            onChange={(e) => setSelectedHotelIndex(parseInt(e.target.value))}
          >
            {hotels.map((hotel, index) => (
              <option key={index} value={index}>
                {hotel.name} - {hotel.location}
              </option>
            ))}
          </select>
        </div>
    
        <div className="room-type-wrapper">
          <div className="room-types">
            <h2>Manage Room Types</h2>
            {hotels.length > 0 ? (
  <h3>Hotel: {hotels[selectedHotelIndex]?.name}, {hotels[selectedHotelIndex]?.location}</h3>
) : (
  <p>No hotels available. Please add a new hotel.</p>
)}

            <table className="table">
              <thead>
                <tr>
                  <th>Room Type</th>
                  <th>Price per Night</th>
                  <th>Availability</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {hotels[selectedHotelIndex].roomTypes.map((room) => (
                  <tr key={room.type}>
                    <td>{room.type}</td>
                    <td>${room.price}</td>
                    <td>{room.availability}</td>
                    <td>
                      <button className="btn btn-warning" onClick={() => handleEditRoomType(room)}>Update</button>
                      <button className="btn btn-danger" onClick={() => handleDeleteRoomType(room.type)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
    
          {/* Keep the existing add-room-section exactly as is from Code A */}
          <div className="add-room-section">
            <h4>{editingRoomType ? "Edit Room Type" : "Add Room Type"}</h4>
            <input type="text" placeholder="Type Name" value={newRoomType.type} onChange={(e) => setNewRoomType({ ...newRoomType, type: e.target.value })} />
            <input type="number" placeholder="Price" value={newRoomType.price} onChange={(e) => setNewRoomType({ ...newRoomType, price: e.target.value })} />
            <input type="number" placeholder="Availability" value={newRoomType.availability} onChange={(e) => setNewRoomType({ ...newRoomType, availability: e.target.value })} />
            <button className="btn btn-success" onClick={handleAddOrUpdateRoomType}>
              {editingRoomType ? "Save Changes" : "Add Room Type"}
            </button>
            {editingRoomType && <button className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>}
          </div>
        </div>
    
        {/* Add this new section for adding hotels */}
        <div className="add-hotel-section">
          <h3>Add New Hotel</h3>
          <input 
            type="text" 
            placeholder="Hotel Name" 
            value={newHotel.name}
            onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
          />
          <input 
            type="text" 
            placeholder="Location" 
            value={newHotel.location}
            onChange={(e) => setNewHotel({ ...newHotel, location: e.target.value })}
          />
          <button className="btn btn-primary" onClick={handleAddHotel}>
            Add Hotel
          </button>
        </div>
      </div>
    ),
    manageBookings: (
      <div>
        <h2>Manage Bookings</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>User Name</th>
              <th>Room Type</th>
              <th>Check-in Date</th>
              <th>Check-out Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.user}</td>
                <td>{booking.room}</td>
                <td>{booking.checkIn}</td>
                <td>{booking.checkOut}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleCancelBooking(booking.id)}>Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  };


  return (
    <div className="admin-dashboard">
      <div className="banner">
        <div>Hotel Manager Dashboard</div>
        <a href="/" className="home-btn">Home</a>
      </div>
      <div className="sidebar">
        <button className="sidebar-link" onClick={() => setPage("profile")}>Profile</button>
        <button className="sidebar-link" onClick={() => setPage("manageHotel")}>Manage Hotel</button>
        <button className="sidebar-link" onClick={() => setPage("manageBookings")}>Manage Bookings</button>
      </div>
      <div className="content">{content[page]}</div>
    </div>
  );
};


export default HotelManagerDashboard;