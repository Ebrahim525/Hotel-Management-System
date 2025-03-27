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
  // const handleStarClick = (id, star) => {
  //   setRatings((prevRatings) => ({ ...prevRatings, [id]: star }));
  // };

  const handleStarClick = (id, rating) => {
    setRatings((prev) => ({
      ...prev,
      [id]: rating, // Set rating for specific booking
    }));
  };

  const sampleHotels = [
    { id: 1, name: "Urban Stay", location: "New York", rooms: 5, checkIn: "2025-03-20", checkOut: "2025-03-25" },
    { id: 2, name: "Mountain Resort", location: "Denver", rooms: 3, checkIn: "2025-04-10", checkOut: "2025-04-15" },
    { id: 3, name: "Ocean Breeze", location: "Miami", rooms: 2, checkIn: "2025-05-01", checkOut: "2025-05-05" }
  ];

  const handleSearch = () => {
    const name = document.getElementById("hotelName").value.toLowerCase();
    const location = document.getElementById("location").value.toLowerCase();
    const rooms = parseInt(document.getElementById("rooms").value, 10);
  
    const results = sampleHotels.filter(hotel =>
      (name === "" || hotel.name.toLowerCase().includes(name)) &&
      (location === "" || hotel.location.toLowerCase().includes(location)) &&
      (!rooms || hotel.rooms >= rooms)
    );
  
    setFilteredHotels(results);
  };  

  const [filteredHotels, setFilteredHotels] = useState([]);

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

    searchHotel: (
      <div className="search-hotels">
        <h2>Search for Hotels</h2>
    
        <div className="search-filters">
          <div className="input-group">
            <div className="form-floating">
              <input type="text" className="form-control" id="hotelName" placeholder="Hotel Name" />
              <label htmlFor="hotelName">Hotel Name</label>
            </div>
    
            <div className="form-floating">
              <input type="date" className="form-control" id="checkIn" placeholder="Check-in Date" />
              <label htmlFor="checkIn">Check-in</label>
            </div>
    
            <div className="form-floating">
              <input type="date" className="form-control" id="checkOut" placeholder="Check-out Date" />
              <label htmlFor="checkOut">Check-out</label>
            </div>
    
            <div className="form-floating">
              <input type="text" className="form-control" id="location" placeholder="Location" />
              <label htmlFor="location">Location</label>
            </div>
    
            <div className="form-floating">
              <input type="number" className="form-control" id="rooms" placeholder="Rooms" min="1" />
              <label htmlFor="rooms">Rooms</label>
            </div>
    
            <button className="btn btn-primary btn-lg" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
    
        {/* Search Results */}
        {filteredHotels.length > 0 && (
  <div className="search-results">
    <h3>Search Results</h3>
    <table className="table">
      <thead>
        <tr>
          <th>Hotel Name</th>
          <th>Location</th>
          <th>Rooms Available</th>
          <th>Check-in</th>
          <th>Check-out</th>
          <th>  </th>
        </tr>
      </thead>
      <tbody>
        {filteredHotels.map((hotel) => (
          <tr key={hotel.id}>
            <td>{hotel.name}</td>
            <td>{hotel.location}</td>
            <td>{hotel.rooms}</td>
            <td>{hotel.checkIn}</td>
            <td>{hotel.checkOut}</td>
            <td>
              <button 
                className="btn btn-success"
                onClick={() => handleBook(hotel)}
              >
                Book Now
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

      </div>
    ),
  };

  const handleBook = (hotel) => {
    alert(`Booking confirmed for ${hotel.name} from ${hotel.checkIn} to ${hotel.checkOut}!`);
    
    // Optional: Add booking logic here if you want to store it in state or database
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
        <button className="sidebar-link" onClick={() => setPage("searchHotel")}>Search Hotel</button>
      </div>

      <div className="content">{content[page]}</div>
    </div>
  );
};

export default UserDashboard;
