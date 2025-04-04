import "bootstrap/dist/css/bootstrap.min.css";
import "./UserDashboard.css";
import profilePhoto from "./Images/profile.png";
import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "../services/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = ("0" + (d.getMonth() + 1)).slice(-2);
  const day = ("0" + d.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};

const BookNowModal = ({ show, onHide, onSubmit, hotel, room, defaultCheckIn, defaultCheckOut, defaultNoRoom }) => {
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1); // Move to the next day

  const [checkIn, setCheckIn] = useState(defaultCheckIn || new Date());
  const [checkOut, setCheckOut] = useState(defaultCheckOut || new Date());
  const [NoRoom, setNoRoom] = useState(defaultNoRoom || 1);
  const handleSubmit = () => {
    const formattedCheckIn = formatDate(checkIn);
    const formattedCheckOut = formatDate(checkOut);
    onSubmit(formattedCheckIn, formattedCheckOut, NoRoom);
    onHide();
  };

  const handleRoomChange = (event) => {
    setNoRoom(event.target.value); // Updates state when input changes
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          Book {hotel && hotel.hotel_name} - {room && room.room_type}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <label className="form-label">Check-In:</label>
          <DatePicker
            selected={checkIn}
            onChange={(date) => setCheckIn(date)}
            dateFormat="yyyy/MM/dd"
            className="form-control form-control-sm"
            minDate={tomorrow} // Prevent today & past dates
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Check-Out:</label>
          <DatePicker
            selected={checkOut}
            onChange={(date) => setCheckOut(date)}
            dateFormat="yyyy/MM/dd"
            className="form-control form-control-sm"
            minDate={checkIn}  // Check-out must be after check-in
          />
        </div>
                
        <div className="mb-3">
          <label className="form-label" htmlFor="idkk">Number of Rooms Required:</label>
          <input 
            type='number' 
            id="idkk" 
            className="form-control form-control-sm"
            value={NoRoom} 
            onChange={handleRoomChange} 
            min="1"
          />
        </div>
        
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Book Now
        </Button>
      </Modal.Footer>
    </Modal>
  );
};



const UserDashboard = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState("profile");

  // Profile state and messages
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  const [profileMessage, setProfileMessage] = useState("");

  // Booking states: separate active (upcoming) bookings from past bookings (history)
  const [activeBookings, setActiveBookings] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);

  // For modification – holds the booking being edited and the new dates
  const [editingBooking, setEditingBooking] = useState(null);
  const [newDates, setNewDates] = useState({ check_in: "", check_out: "" });
  const [modificationMessage, setModificationMessage] = useState("");

  // For reviews: ratings and review inputs keyed by booking id
  const [ratings, setRatings] = useState({});
  const [reviewInputs, setReviewInputs] = useState({});

  // Hotels and search state
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [searchMessage, setSearchMessage] = useState("");

  // State for booking modal
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Fetch dashboard data from backend and split bookings by date
  const fetchUserDashboard = async () => {
    try {
      const response = await axiosInstance.get("/user/dashboard");
      setUserProfile({
        fullName: response.data.fullname,
        email: response.data.email,
      });
      const today = new Date().toISOString().slice(0, 10);
      const allBookings = response.data.booking_history || [];
      const active = allBookings.filter(
        (b) => b.check_out >= today && b.status !== "Cancelled"
      );
      const past = allBookings.filter((b) => b.check_out < today);

      if (past.length > 0) {
        try {
          const response = await axiosInstance.put('/booking/update-past-bookings');
          console.log(response.data.message);
        } catch (error) {
          console.error("Error updating past bookings:", error);
        }
      }

      setActiveBookings(active);
      setBookingHistory(past);
    } catch (error) {
      console.error("Error fetching dashboard:", error.response || error);
      setProfileMessage("Failed to load dashboard. Please try again.");
    }
  };

  useEffect(() => {
    fetchUserDashboard();
  }, []);

  // Profile editing handlers
  const handleProfileChange = (e) => {
    setUserProfile({ ...userProfile, [e.target.name]: e.target.value });
  };

  const [searchDetails, setSearchDetails] = useState({
    checkIn: "",
    checkOut: "",
    guests: ""
  });

  const [searchSubmitted, setSearchSubmitted] = useState(false);
  
  const toggleEditProfile = () => {
    setIsEditing((prev) => !prev);
  };

  const saveProfileChanges = async () => {
    try {
      const payload = {
        fullname: userProfile.fullName,
        email: userProfile.email,
      };
      const response = await axiosInstance.put("/user/profile/edit", payload);
      setUserProfile({
        fullName: response.data.new_fullname,
        email: response.data.new_email,
      });
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error.response || error);
      setProfileMessage("Failed to update profile. Please try again.");
    }
  };

  // Booking modification handlers
  const handleModifyClick = (booking) => {
    if (booking.status === "Cancellation Request Sent") return;
    setEditingBooking(booking.booking_id);
    setNewDates({ check_in: booking.check_in, check_out: booking.check_out });
  };

  const handleDateChange = (field, value) => {
    setNewDates((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitModification = async (bookingId) => {
    try {
      await axiosInstance.put(`/user/booking/update/${bookingId}`, newDates);
      fetchUserDashboard();
      setEditingBooking(null);
      setModificationMessage("Booking updated successfully! (Status set to Pending)");
      setTimeout(() => setModificationMessage(""), 5000);
    } catch (error) {
      console.error("Error sending modification request:", error.response || error);
      setModificationMessage("Failed to update booking. Please try again.");
      setTimeout(() => setModificationMessage(""), 5000);
    }
  };

  // Booking cancellation handler
  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this booking?");
    if (confirmCancel) {
      try {
        await axiosInstance.delete(`/user/booking/cancel/${bookingId}`);
        fetchUserDashboard();
        window.location.reload();
        alert("Booking cancelled and deleted successfully!");
      } catch (error) {
        console.error("Error cancelling booking:", error.response || error);
      }
    }
  };

  // Review handlers
  const toggleReviewInput = (bookingId) => {
    setReviewInputs((prev) => ({ ...prev, [bookingId]: !prev[bookingId] }));
  };

  const handleStarClick = (bookingId, star) => {
    setRatings((prev) => ({ ...prev, [bookingId]: star }));
  };

  const handleSubmitReview = async (bookingId) => {
    const rating = ratings[bookingId];
    if (rating === undefined) {
      alert("Please provide a rating.");
      return;
    }
    try {
      await axiosInstance.post(`/user/booking/review/${bookingId}`, { rating });
      setBookingHistory((prev) =>
        prev.map((booking) =>
          booking.booking_id === bookingId ? { ...booking, rating: rating } : booking
        )
      );
      setReviewInputs((prev) => ({ ...prev, [bookingId]: false }));
      alert("Review submitted successfully.");
    } catch (error) {
      console.error("Error submitting review:", error.response || error);
      alert("Failed to submit review. Please try again.");
    }
  };

  // Compute reviewsByHotel: map each hotel_id to the booking_id that submitted the first review.
  const reviewsByHotel = useMemo(() => {
    return bookingHistory.reduce((acc, booking) => {
      if (booking.rating != null) {
        if (!acc[booking.hotel_id]) {
          acc[booking.hotel_id] = booking.booking_id;
        }
      }
      return acc;
    }, {});
  }, [bookingHistory]);

  // Fetch hotels from backend based on search criteria.
  const fetchHotels = async (params) => {
    try {
      const response = await axiosInstance.get("/hotels/search", { params });
      // If results exist, clear any search message.
      setFilteredHotels(response.data.results || []);
      setSearchMessage("");
    } catch (error) {
      console.error("Error fetching hotels:", error.response || error);
      if (error.response && error.response.status === 404) {
        // Set the search message returned from the backend.
        setFilteredHotels([]);
        setSearchMessage(error.response.data.message);
      }
    }
  };

  // Handle search input submission.
  const handleSearch = () => {
    const checkIn = document.getElementById("checkIn").value;
    const checkOut = document.getElementById("checkOut").value;
    const guests = document.getElementById("guests").value.trim();

    const missingFields = [];
    if (!checkIn) missingFields.push("Check-in Date");
    if (!checkOut) missingFields.push("Check-out Date");
    if (!guests) missingFields.push("Number of Rooms");
    
    if (missingFields.length > 0) {
      alert(`The following entries are missing: ${missingFields.join(", ")}`);
      setFilteredHotels([]);
      return; // do not proceed with search
    }

    const location = document.getElementById("location").value.trim();
    const hotelName = document.getElementById("hotelName").value.trim();
    const minPrice = document.getElementById("minPrice").value.trim();
    const maxPrice = document.getElementById("maxPrice").value.trim();
    const minRating = document.getElementById("minRating").value.trim();
    // For roomType, get the value from the select
    const roomType = document.getElementById("roomType").value;

    let params = {
      check_in: checkIn,
      check_out: checkOut,
      guests,
    };
    if (location) params.location = location;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (minRating) params.min_rating = minRating;
    if (hotelName) params.hotel_name = hotelName;
    if (roomType !== "") params.room_type = roomType;

    setSearchDetails({ checkIn, checkOut, guests });
    setSearchSubmitted(true);
    fetchHotels(params);
  };

  // Booking handler to open the booking modal.
  const handleBook = (hotel, room) => {
    if (!room) {
      alert("No room available for the selected availability.");
      return;
    }
    
    setSelectedHotel(hotel);
    setSelectedRoom(room);
    setShowBookModal(true);
  };

  // Submit booking from modal.
  const submitBooking = (checkInDate, checkOutDate, NoRoom) => {
    axiosInstance
      .post("/user/booking/new", {
        room_id: selectedRoom.room_id,
        check_in: checkInDate,
        check_out: checkOutDate,
        no_of_rooms: NoRoom
      })
      .then((response) => {
        alert(
          `Booking created successfully! (Status set to Pending) for ${selectedHotel.hotel_name} (${selectedRoom.room_type}) from ${checkInDate} to ${checkOutDate}!`
        );
        fetchUserDashboard();
        window.location.reload();
      })
      .catch((error) => {
        alert("Booking failed: " + error.response.data.error);
      });
  };

  const handleLogout = (e) => {
    e.preventDefault();
    sessionStorage.removeItem("token");
    navigate("/");
  };

  // Inline style for input boxes.
  const inputStyle = { maxWidth: "300px" };

  // Flatten the filteredHotels into individual room entries.
  const flatRooms = filteredHotels.reduce((acc, hotel) => {
    if (hotel.rooms_available && hotel.rooms_available.length > 0) {
      hotel.rooms_available.forEach((room) => {
        acc.push({
          hotel_id: hotel.hotel_id,
          hotel_name: hotel.hotel_name,
          location: hotel.location,
          rating: hotel.rating,
          room_id: room.room_id,
          room_type: room.room_type,
          availability: room.availability,
          price_per_night: room.price_per_night,
        });
      });
    }
    return acc;
  }, []);

  // Define component content based on selected page.
  const content = {
    profile: (
      <div className="profile-section">
        <h2>Profile Overview</h2>
        <div className="profile-card">
          <img className="ProfilePh" src={profilePhoto} alt="Profile" />
          <p>
            <strong>Full Name:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="fullName"
                value={userProfile.fullName || ""}
                onChange={handleProfileChange}
                className="form-control form-control-sm"
                style={inputStyle}
              />
            ) : (
              userProfile.fullName
            )}
          </p>
          <p>
            <strong>Email Address:</strong>{" "}
            {/* In edit mode, display as plain text rather than an input */}
            {userProfile.email}
          </p>

          {isEditing ? (
            <div className="d-flex justify-content-center gap-2">
              <button
                className="btn btn-success save-profile"
                onClick={saveProfileChanges}
              >
                Save
              </button>
              <button
                className="btn btn-danger cancel-profile"
                onClick={toggleEditProfile}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="d-flex justify-content-center">
              <button className="btn edit-profile" onClick={toggleEditProfile}>
                Edit Profile
              </button>
            </div>
          )}
          
          {profileMessage && <p className="error-msg">{profileMessage}</p>}
        </div>
      </div>
    ),
    activeBookings: (
      <div className="bookings">
        <h2>Your Active Bookings</h2>
        {modificationMessage && (
          <div className="alert alert-success" role="alert">
            {modificationMessage}
          </div>
        )}
        {activeBookings.length === 0 ? (
          <p>No upcoming bookings.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Hotel</th>
                <th>Room</th>
                <th>Type</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeBookings.map((booking) => (
                <tr key={booking.booking_id}>
                  <td>{booking.hotel_id}</td>
                  <td>{booking.room_id}</td>
                  <td>{booking.room_type}</td>
                  <td>
                    {editingBooking === booking.booking_id ? (
                      <input
                        type="date"
                        value={newDates.check_in}
                        onChange={(e) =>
                          handleDateChange("check_in", e.target.value)
                        }
                        className="form-control form-control-sm"
                      />
                    ) : (
                      booking.check_in
                    )}
                  </td>
                  <td>
                    {editingBooking === booking.booking_id ? (
                      <input
                        type="date"
                        value={newDates.check_out}
                        onChange={(e) =>
                          handleDateChange("check_out", e.target.value)
                        }
                        className="form-control form-control-sm"
                      />
                    ) : (
                      booking.check_out
                    )}
                  </td>
                  <td>{booking.status}</td>
                  <td>
                    {booking.status === "Cancellation Request Sent" ? (
                      <span>Cancellation Request Sent</span>
                    ) : editingBooking === booking.booking_id ? (
                      <>
                        {/* <button
                          className="btn btn-primary submit-modification-btn"
                          onClick={() => handleSubmitModification(booking.booking_id)}
                        >
                          Submit Modification Request
                        </button> */}
                        {/* <button
                          className="btn btn-warning cancel-edit-btn"
                          onClick={() => setEditingBooking(null)}
                        >
                          Cancel
                        </button> */}
                      </>
                    ) : (
                      <>
                        {/* <button
                          className="btn modify-btn"
                          onClick={() => handleModifyClick(booking)}
                        >
                          Modify
                        </button>{" "} */}
                        <button
                          className="btn cancel-booking-btn"
                          onClick={() => handleCancelBooking(booking.booking_id)}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    ),
    bookings: (
      <div className="bookings">
        <h2>Your Booking History</h2>
        {bookingHistory.length === 0 ? (
          <p>No past bookings.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Hotel</th>
                <th>Room</th>
                <th>Type</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {bookingHistory.map((booking) => {
                const alreadyReviewed = reviewsByHotel[booking.hotel_id];
                return (
                  <tr key={booking.booking_id}>
                    <td>{booking.hotel_id}</td>
                    <td>{booking.room_id}</td>
                    <td>{booking.room_type}</td>
                    <td>{booking.check_in}</td>
                    <td>{booking.check_out}</td>
                    <td>
                      {alreadyReviewed ? (
                        alreadyReviewed === booking.booking_id ? (
                          <>
                            <span>
                              Review Submitted (Rating: {booking.rating})
                            </span>{" "}
                            <button
                              className="btn edit-review-btn"
                              onClick={() =>
                                toggleReviewInput(booking.booking_id)
                              }
                            >
                              Edit Review
                            </button>
                          </>
                        ) : (
                          <span>Already Reviewed</span>
                        )
                      ) : (
                        <button
                          className="btn review-btn"
                          onClick={() => toggleReviewInput(booking.booking_id)}
                        >
                          Review
                        </button>
                      )}
                      {reviewInputs[booking.booking_id] && (
                        <div className="review-section">
                          <div className="stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`star ${
                                  ratings[booking.booking_id] >= star
                                    ? "selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleStarClick(booking.booking_id, star)
                                }
                              >
                                &#9733;
                              </span>
                            ))}
                          </div>
                          <button
                            className="btn submit-review"
                            onClick={() => handleSubmitReview(booking.booking_id)}
                          >
                            Submit
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    ),
    searchHotel: (
      <div className="search-hotels">
        <h2>Search for Hotels</h2>
        <div className="search-filters">
          <div className="input-group flex-wrap">
            <div className="form-floating mb-2" style={inputStyle}>
              <input
                type="date"
                className="form-control form-control-sm"
                id="checkIn"
                placeholder="Check-in Date (optional)"
                required
                min={new Date().toISOString().split("T")[0]} // prevents past dates
              />
              <label htmlFor="checkIn">Check-in</label>
            </div>
            <div className="form-floating mb-2" style={inputStyle}>
              <input
                type="date"
                className="form-control form-control-sm"
                id="checkOut"
                placeholder="Check-out Date (optional)"
                required
                min={new Date().toISOString().split("T")[0]} // could be improved further based on check-in
              />
              <label htmlFor="checkOut">Check-out</label>
            </div>
            <div className="form-floating mb-2" style={inputStyle}>
              <input
                type="text"
                className="form-control form-control-sm"
                id="hotelName"
                placeholder="Hotel Name (optional)"
              />
              <label htmlFor="hotelName">Hotel Name</label>
            </div>
            <div className="form-floating mb-2" style={inputStyle}>
              <input
                type="text"
                className="form-control form-control-sm"
                id="location"
                placeholder="Location (optional)"
              />
              <label htmlFor="location">Location</label>
            </div>
            <div className="form-floating mb-2" style={inputStyle}>
              <input
                type="number"
                className="form-control form-control-sm"
                id="guests"
                placeholder="Guests (optional)"
                min="1"
              />
              <label htmlFor="guests">No. Rooms</label>
            </div>
            <div className="form-floating mb-2" style={inputStyle}>
              <input
                type="number"
                className="form-control form-control-sm"
                id="minPrice"
                placeholder="Min Price (optional)"
                required
              />
              <label htmlFor="minPrice">Min Price</label>
            </div>
            <div className="form-floating mb-2" style={inputStyle}>
              <input
                type="number"
                className="form-control form-control-sm"
                id="maxPrice"
                placeholder="Max Price (optional)"
              />
              <label htmlFor="maxPrice">Max Price</label>
            </div>
            <div className="form-floating mb-2" style={inputStyle}>
              <input
                type="number"
                className="form-control form-control-sm"
                id="minRating"
                placeholder="Min Rating (optional)"
                step="0.1"
              />
              <label htmlFor="minRating">Min Rating</label>
            </div>
            <div className="form-floating mb-2" style={inputStyle}>
              {/* Replace the text input with a select dropdown */}
              <select
                className="form-select form-select-sm"
                id="roomType"
                defaultValue=""
              >
                <option value="">Select Room Type (optional)</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
                <option value="Standard">Standard</option>
              </select>
              <label htmlFor="roomType">Room Type</label>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
        {!searchSubmitted && (
          <p>Please enter your search criteria to find available hotels.</p>
        )}
        {searchSubmitted && flatRooms.length > 0 ? (
          <div className="search-results">
            <h3>Search Results</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Hotel Name</th>
                  <th>Location</th>
                  <th>Room Type</th>
                  <th>Availability</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {flatRooms.map((room) => (
                  <tr key={room.room_id}>
                    <td>{room.hotel_name}</td>
                    <td>{room.location}</td>
                    <td>{room.room_type}</td>
                    <td>{room.availability}</td>
                    <td>{room.price_per_night}</td>
                    <td>{room.rating}</td>
                    <td>
                      <button
                        className="btn book-now-btn btn-sm"
                        onClick={() =>
                          handleBook(
                            { hotel_id: room.hotel_id, hotel_name: room.hotel_name },
                            room
                          )
                        }
                      >
                        Book Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>{searchMessage || "No hotels found matching your criteria."}</p>
        )}
      </div>
    ),
  };

  return (
    <div className="user-dashboard">
      <div className="banner">
        <div>Hotel Management System</div>
        <a href="#" className="home-btn" onClick={handleLogout}>
          Logout
        </a>
      </div>
      <div className="sidebar">
        <button className="sidebar-link" onClick={() => setPage("profile")}>
          Profile
        </button>
        <button className="sidebar-link" onClick={() => setPage("activeBookings")}>
          Active Bookings
        </button>
        <button className="sidebar-link" onClick={() => setPage("bookings")}>
          Booking History
        </button>
        <button className="sidebar-link" onClick={() => setPage("searchHotel")}>
          Search Hotel
        </button>
      </div>
      <div className="content">{content[page]}</div>
      {showBookModal && selectedHotel && selectedRoom && (
        <BookNowModal
          show={showBookModal}
          onHide={() => setShowBookModal(false)}
          hotel={selectedHotel}
          room={selectedRoom}
          onSubmit={submitBooking}
          defaultCheckIn={searchDetails.checkIn ? new Date(searchDetails.checkIn) : undefined}
          defaultCheckOut={searchDetails.checkOut ? new Date(searchDetails.checkOut) : undefined}
          defaultNoRoom={searchDetails.guests || 1}
        />
      )}
    </div>
  );
};

export default UserDashboard;