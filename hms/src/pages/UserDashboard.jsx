import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./UserDashboard.css";
import profilePhoto from "./Images/profile.png";

const UserDashboard = () => {
  const [page, setPage] = useState("profile");

  // Profile state
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState({
    fullName: "John Doe",
    email: "john@example.com",
  });

  // Handle profile input changes
  const handleProfileChange = (e) => {
    setUserProfile({ ...userProfile, [e.target.name]: e.target.value });
  };

  // Toggle edit mode
  const toggleEditProfile = () => {
    setIsEditing(!isEditing);
  };

  // Save profile changes
  const saveProfileChanges = () => {
    setIsEditing(false);
  };

  // Dummy data for bookings
  const [bookings, setBookings] = useState([
    { id: 1, hotel: "Urban Stay", room: "#R101", type: "Deluxe", date: "2025-03-20", status: "Confirmed" },
    { id: 2, hotel: "City View Hotel", room: "#R301", type: "Standard", date: "2025-02-15", status: "Confirmed" }
  ]);

  // Track which booking is being modified
  const [editingBooking, setEditingBooking] = useState(null);

  // Dummy data for booking history
  const [bookingHistory, setBookingHistory] = useState([
    { id: 3, hotel: "City View Hotel", room: "#R301", type: "Standard", date: "2025-02-15", review: "", rating: 0 },
    { id: 4, hotel: "Mountain Resort", room: "#R404", type: "Executive", date: "2025-01-30", review: "", rating: 0 }
  ]);

  // Track which review input is being shown
  const [reviewInputs, setReviewInputs] = useState({});
  const [ratings, setRatings] = useState({});

  // Enable modify mode
  const handleModifyClick = (booking) => {
    setEditingBooking(booking.id);
  };

  // Update booking details when modified
  const handleBookingChange = (id, field, value) => {
    setBookings((prevBookings) =>
      prevBookings.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  // Save the modified booking
  const handleSaveClick = () => {
    setEditingBooking(null);
  };

  // Toggle review input visibility
  const toggleReviewInput = (id) => {
    setReviewInputs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Handle star rating selection
  const handleStarClick = (id, star) => {
    setRatings((prevRatings) => ({ ...prevRatings, [id]: star }));
  };

  // Submit review
  const handleSubmitReview = (id, reviewText) => {
    setBookingHistory((prevHistory) =>
      prevHistory.map((b) =>
        b.id === id ? { ...b, review: reviewText, rating: ratings[id] || 0 } : b
      )
    );
    setReviewInputs((prev) => ({ ...prev, [id]: false }));
  };

  const content = {
    profile: (
      <div className="profile-section">
        <h2>Profile Overview</h2>
        <div className="profile-card">
          <img className="ProfilePh" src={profilePhoto} alt="Profile" />
          <p><strong>Full Name:</strong> 
            {isEditing ? (
              <input
                type="text"
                name="fullName"
                value={userProfile.fullName}
                onChange={handleProfileChange}
              />
            ) : (
              userProfile.fullName
            )}
          </p>
          <p><strong>Email Address:</strong> 
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={userProfile.email}
                onChange={handleProfileChange}
              />
            ) : (
              userProfile.email
            )}
          </p>

          {isEditing ? (
            <>
              <button className="btn save-profile" onClick={saveProfileChanges}>Save</button>
              <button className="btn cancel-profile" onClick={toggleEditProfile}>Cancel</button>
            </>
          ) : (
            <button className="btn edit-profile" onClick={toggleEditProfile}>Edit Profile</button>
          )}
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
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.hotel}</td>
                <td>{booking.room}</td>
                <td>
                  {editingBooking === booking.id ? (
                    <input
                      type="text"
                      value={booking.type}
                      onChange={(e) => handleBookingChange(booking.id, "type", e.target.value)}
                    />
                  ) : (
                    booking.type
                  )}
                </td>
                <td>
                  {editingBooking === booking.id ? (
                    <input
                      type="date"
                      value={booking.date}
                      onChange={(e) => handleBookingChange(booking.id, "date", e.target.value)}
                    />
                  ) : (
                    booking.date
                  )}
                </td>
                <td className="status approved">{booking.status}</td>
                <td>
                  {editingBooking === booking.id ? (
                    <button className="btn save-btn" onClick={handleSaveClick}>Save</button>
                  ) : (
                    <button className="btn modify-btn" onClick={() => handleModifyClick(booking)}>Modify</button>
                  )}
                </td>
              </tr>
            ))}
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
            {bookingHistory.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.hotel}</td>
                <td>{booking.room}</td>
                <td>{booking.type}</td>
                <td>{booking.date}</td>
                <td>
                  {booking.review ? (
                    <span>{booking.review} - ⭐ {booking.rating}</span>
                  ) : (
                    <>
                      <button className="btn review-btn" onClick={() => toggleReviewInput(booking.id)}>Review</button>
                      {reviewInputs[booking.id] && (
                        <div className="review-section">
                          <input
                            type="text"
                            placeholder="Write a review..."
                            className="form-control"
                            onChange={(e) => handleSubmitReview(booking.id, e.target.value)}
                          />
                          <button className="btn submit-review" onClick={() => handleSubmitReview(booking.id, document.querySelector('.review-section input').value)}>Submit</button>
                        </div>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
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
        <button className="sidebar-link" onClick={() => setPage("bookings")}>Bookings</button>
      </div>

      <div className="content">{content[page]}</div>
    </div>
  );
};

export default UserDashboard;
