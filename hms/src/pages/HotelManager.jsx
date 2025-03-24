import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HotelManagerDashboard.css";
import profilePhoto from "./Images/profile.png";

const HotelManagerDashboard = () => {
  const [page, setPage] = useState("profile");

  const content = {
    profile: (
      <div className="profile-section">
              <h2>Profile Overview</h2>
              <div className="profile-card">
                <img className="ProfilePh" src={profilePhoto} alt="Profile Photo" />
                <p><strong>Manager Name:</strong> Michael Johnson</p>
                <p><strong>Email:</strong> micxhael@luxuryinn.com</p>
                <p><strong>Hotel Name:</strong> Luxury Inn</p>
                <button className="btn edit-profile">Edit Profile</button>
              </div>
      
              <div className="account-settings">
                <h3>Account Settings</h3>
                <button className="btn change-password">Change Password</button>
                <button className="btn delete-account">Delete Account</button>
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
            <tr>
              <td>#R001</td>
              <td>Deluxe Suite</td>
              <td>$150</td>
              <td>Available</td>
              <td>
                <button className="btn btn-warning">Update</button>
                <button className="btn btn-danger">Delete</button>
              </td>
            </tr>
            <tr>
              <td>#R002</td>
              <td>Standard Room</td>
              <td>$80</td>
              <td>Booked</td>
              <td>
                <button className="btn btn-warning">Update</button>
                <button className="btn btn-danger">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        <button className="btn btn-success">Add New Room</button>
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
            <tr>
              <td>#B001</td>
              <td>John Doe</td>
              <td>Deluxe Suite</td>
              <td>2025-04-15</td>
              <td>2025-04-20</td>
              <td>
                <button className="btn btn-danger">Cancel</button>
              </td>
            </tr>
            <tr>
              <td>#B002</td>
              <td>Jane Smith</td>
              <td>Standard Room</td>
              <td>2025-04-18</td>
              <td>2025-04-22</td>
              <td>
                <button className="btn btn-danger">Cancel</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  };

  return (
    <div className="admin-dashboard">
      <div className="banner">
        <div>Hotel Manager Dashboard</div>
        <a href="/" className="home-btn">
          Home
        </a>
      </div>

      <div className="sidebar">
        <button className="sidebar-link" onClick={() => setPage("profile")}>
          Profile
        </button>
        <button className="sidebar-link" onClick={() => setPage("manageHotel")}>
          Manage Hotel
        </button>
        <button className="sidebar-link" onClick={() => setPage("manageBookings")}>
          Manage Bookings
        </button>
      </div>

      <div className="content">{content[page]}</div>
    </div>
  );
};

export default HotelManagerDashboard;
