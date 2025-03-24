import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./UserDashboard.css";
import profilePhoto from "./Images/profile.png";

const UserDashboard = () => {
  const [page, setPage] = useState("profile");

  const content = {
    profile: (
      <div className="profile-section">
        <h2>Profile Overview</h2>
        <div className="profile-card">
          <img className="ProfilePh" src={profilePhoto} alt="Profile Photo" />
          <p><strong>Full Name:</strong> John Doe</p>
          <p><strong>Email Address:</strong> john@example.com</p>
          <button className="btn edit-profile">Edit Profile</button>
        </div>

        <div className="account-settings">
          <h3>Account Settings</h3>
          <button className="btn change-password">Change Password</button>
          <button className="btn delete-account">Delete Account</button>
        </div>
      </div>
    ),

    userHotels: (
      <div className="hotel-management">
        <h2>Your Hotels</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Hotel ID</th>
              <th>Hotel Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#H005</td>
              <td>Urban Stay</td>
              <td className="status approved">Approved</td>
            </tr>
            <tr>
              <td>#H008</td>
              <td>Hilltop Lodge</td>
              <td className="status pending">Pending</td>
            </tr>
          </tbody>
        </table>
        <button className="btn add-hotel">+ Add New Hotel</button>
      </div>
    ),

    searchHotel: (
      <div className="search-hotels">
        <h2>Search for Hotels</h2>
        <input type="text" className="form-control" placeholder="Enter hotel name..." />
        <button className="btn search-btn mt-2">Search</button>

        <h3 className="mt-4">Manage Rooms</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Room ID</th>
              <th>Room Type</th>
              <th>Availability</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#R101</td>
              <td>Deluxe</td>
              <td className="available">Available</td>
              <td><button className="btn update-room">Update</button></td>
            </tr>
            <tr>
              <td>#R202</td>
              <td>Suite</td>
              <td className="booked">Booked</td>
              <td><button className="btn remove-room">Remove</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  };

  return (
    <div className="user-dashboard">
      <div className="banner">
        <div>Hotel Management System</div>
        <a href="/" className="home-btn">Home</a>
      </div>

      <div className="sidebar">
        <button className="sidebar-link" onClick={() => setPage("profile")}>Profile</button>
        <button className="sidebar-link" onClick={() => setPage("userHotels")}>Your Hotels</button>
        <button className="sidebar-link" onClick={() => setPage("searchHotel")}>Search Hotels</button>
      </div>

      <div className="content">{content[page]}</div>
    </div>
  );
};

export default UserDashboard;
