import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./UserDashboard.css";
import profilePhoto from "./Images/profile.png";


const toggleReviewInput = (id) => {
  setReviewInputs((prev) => ({
    ...prev,
    [id]: !prev[id], // Toggle review input visibility
  }));
};

const UserDashboard = () => {
  const [page, setPage] = useState("profile");
  const [reviewInputs, setReviewInputs] = useState({}); // Track review input states
  const [ratings, setRatings] = useState({});

  const toggleReviewInput = (id) => {
    setReviewInputs((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle visibility
    }));
  };

  const handleStarClick = (id, rating) => {
    setRatings((prev) => ({
      ...prev,
      [id]: rating, // Set rating for specific booking
    }));
  };

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

    bookings: (
      <div className="bookings">
        <h2>Your Bookings</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Hotel Name</th>
              <th>Room ID</th>
              <th>Room Type</th>
              <th>Date</th>
              <th>Status</th>
              <th>Modify</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Urban Stay</td>
              <td>#R101</td>
              <td>Deluxe</td>
              <td>2025-03-20</td>
              <td className="status approved">Confirmed</td>
              <td><button className="btn modify-btn">Modify</button></td>
            </tr>
          </tbody>
        </table>

        {/* Booking History Section */}
        <h2 className="mt-4">Booking History</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Hotel Name</th>
              <th>Room ID</th>
              <th>Room Type</th>
              <th>Date</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {[{ id: 1, hotel: "City View Hotel", room: "#R301", type: "Standard", date: "2025-02-15" },
              { id: 2, hotel: "Mountain Resort", room: "#R404", type: "Executive", date: "2025-01-30" }
            ].map((booking) => (
              <tr key={booking.id}>
                <td>{booking.hotel}</td>
                <td>{booking.room}</td>
                <td>{booking.type}</td>
                <td>{booking.date}</td>
                <td>
                  <button className="btn review-btn" onClick={() => toggleReviewInput(booking.id)}>Review</button>
                  {reviewInputs[booking.id] && (
  <div className="review-section">
    {/* Star Rating */}
    <div className="stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${ratings[booking.id] >= star ? "selected" : ""}`}
          onClick={() => handleStarClick(booking.id, star)}
        >
          ★
        </span>
      ))}
    </div>

    {/* Review Input Field */}
    <input type="text" placeholder="Write a review..." className="form-control" />

    {/* Buttons: Submit & Cancel */}
    <div className="review-buttons">
      <button className="btn submit-review" onClick={() => toggleReviewInput(booking.id)}>Submit</button>
      <button className="btn cancel-review" onClick={() => toggleReviewInput(booking.id)}>Cancel</button>
    </div>
  </div>
)}

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),

    searchHotel: (
      <div className="search-hotels">
        <h2>Search for Hotels</h2>
        <input type="text" className="form-control" placeholder="Enter hotel name..." />
        <button className="btn search-btn mt-2">Search</button>
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
        <button className="sidebar-link" onClick={() => setPage("bookings")}>Bookings</button>
        <button className="sidebar-link" onClick={() => setPage("searchHotel")}>Search Hotels</button>
      </div>

      <div className="content">{content[page]}</div>
    </div>
  );
};

export default UserDashboard;
