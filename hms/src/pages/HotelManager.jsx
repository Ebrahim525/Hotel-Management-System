import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HotelManagerDashboard.css";
import profilePhoto from "./Images/profile.png";

const HotelManagerDashboard = () => {
  const [page, setPage] = useState("profile");
  const [rooms, setRooms] = useState([
    { id: "#R001", type: "Deluxe Suite", price: 150, availability: "Available" },
    { id: "#R002", type: "Standard Room", price: 80, availability: "Booked" },
  ]);
  const [newRoom, setNewRoom] = useState({ id: "", type: "", price: "", availability: "Available" });
  const [editingRoom, setEditingRoom] = useState(null);
  const [profile, setProfile] = useState({
    name: "Michael Johnson",
    email: "micxhael@luxuryinn.com",
    hotel: "Luxury Inn",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bookings, setBookings] = useState([
    { id: "#B001", user: "John Doe", room: "Deluxe Suite", checkIn: "2025-04-15", checkOut: "2025-04-20" },
    { id: "#B002", user: "Jane Smith", room: "Standard Room", checkIn: "2025-04-18", checkOut: "2025-04-22" },
  ]);

  const handleAddRoom = () => {
    if (!newRoom.id || !newRoom.type || !newRoom.price) return;
    setRooms([...rooms, newRoom]);
    setNewRoom({ id: "", type: "", price: "", availability: "Available" });
  };

  const handleDeleteRoom = (id) => {
    setRooms(rooms.filter((room) => room.id !== id));
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
  };

  const handleUpdateRoom = () => {
    setRooms(rooms.map((room) => (room.id === editingRoom.id ? editingRoom : room)));
    setEditingRoom(null);
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
      <div>
        <h2>Manage Hotel - Rooms</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Room ID</th>
              <th>Room Type</th>
              <th>Price per Night</th>
              <th>Availability</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td>{room.id}</td>
                <td>{room.type}</td>
                <td>${room.price}</td>
                <td>{room.availability}</td>
                <td>
                  <button className="btn btn-warning" onClick={() => handleEditRoom(room)}>Update</button>
                  <button className="btn btn-danger" onClick={() => handleDeleteRoom(room.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {editingRoom ? (
          <div>
            <h3>Edit Room</h3>
            <input type="text" placeholder="Room Type" value={editingRoom.type} onChange={(e) => setEditingRoom({ ...editingRoom, type: e.target.value })} />
            <input type="number" placeholder="Price" value={editingRoom.price} onChange={(e) => setEditingRoom({ ...editingRoom, price: e.target.value })} />
            <button className="btn btn-success" onClick={handleUpdateRoom}>Save</button>
          </div>
        ) : (
          <div>
            <h3>Add New Room</h3>
            <input type="text" placeholder="Room ID" value={newRoom.id} onChange={(e) => setNewRoom({ ...newRoom, id: e.target.value })} />
            <input type="text" placeholder="Room Type" value={newRoom.type} onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })} />
            <input type="number" placeholder="Price" value={newRoom.price} onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })} />
            <button className="btn btn-success" onClick={handleAddRoom}>Add Room</button>
          </div>
        )}
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
