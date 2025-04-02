import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HotelManagerDashboard.css";
import profilePhoto from "./Images/profile.png";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axiosInstance from "../services/axiosInstance";


const HotelManagerDashboard = () => {
  const [page, setPage] = useState("profile");
  const [hotels, setHotels] = useState([]);
  const [selectedHotelIndex, setSelectedHotelIndex] = useState(0);
  const [newHotel, setNewHotel] = useState({ name: "", location: "" });
  const [newRoomType, setNewRoomType] = useState({ type: "", price: "", capacity: "" });
  const [editingRoomType, setEditingRoomType] = useState(null);
  const [profile, setProfile] = useState({});

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get(`/hotel/prof`);
      console.log("Profile data from API:", response.data);  // Check what data is received
      setProfile(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  fetchProfile();
}, []);

  

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
      const response = await axiosInstance.get(`/hotel/bookings`);
      console.log(response.data);
      setBookings(response.data);
      }
      catch(error){
        console.error("Error:", error.response || error);
      }
    };

    fetchBookings();
  }, []);


  useEffect(() => {
    const fetchHotels = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const response = await fetch("http://127.0.0.1:5000/hotel/get-hotels", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
  
        const data = await response.json();
  
        if (response.ok) {
          // Map API data to frontend hotel format
          const formattedHotels = data.hotels.map((hotel) => ({
            id: hotel.id,
            name: hotel.name,
            location: hotel.location,
            roomTypes: hotel.rooms.map((room) => ({
              room_id: room.room_id,
              type: room.type,
              price: room.price,
              capacity: room.capacity,
            })),
          }));
  
          setHotels(formattedHotels);
        } else {
          console.error("Error fetching hotels:", data.error);
        }
      } catch (error) {
        console.error("Error fetching hotels:", error);
      }
    };
  
    fetchHotels();
  }, []);
  
  
  


  const handleAddOrUpdateRoomType = async () => {
    if (!newRoomType.type || !newRoomType.price || !newRoomType.capacity) {
      alert("❌ Please fill all fields before submitting.");
      return;
    }
  
    const token = sessionStorage.getItem("token");
  
    try {
      let url = "http://127.0.0.1:5000/hotel/add-room";
      let method = "POST";
  
      const bodyData = {
        hotel_id: hotels[selectedHotelIndex]?.id,
        room_type: newRoomType.type,
        price_per_night: Number(newRoomType.price),
        capacity: Number(newRoomType.capacity),
      };

      console.log("Request body being sent:", bodyData);
      // console.log("Selected hotel index:", selectedHotelIndex);
      // console.log("Selected hotel object:", hotels[selectedHotelIndex]);

  
      // If editing an existing room
      if (editingRoomType) {
        url = `http://127.0.0.1:5000/hotel/edit-room/${editingRoomType.room_id}`;
        method = "PATCH";
      }
  
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert(`✅ ${data.success}`);
        // Update or add room in the frontend state
        setHotels(
          hotels.map((hotel, index) =>
            index === selectedHotelIndex
              ? {
                  ...hotel,
                  roomTypes: editingRoomType
                    ? hotel.roomTypes.map((room) =>
                        room.room_id === editingRoomType.room_id
                          ? { ...newRoomType, room_id: editingRoomType.room_id }
                          : room
                      )
                    : [
                        ...hotel.roomTypes,
                        { ...newRoomType, room_id: data.room_id }, // Add new room
                      ],
                }
              : hotel
          )
        );
  
        // Clear the form after adding/updating
        setNewRoomType({ type: "", price: "", capacity: "" });
        setEditingRoomType(null);
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating/adding room:", error);
      alert("❌ An error occurred while updating/adding the room.");
    }
  };
  
  
  

  // const handleAddHotel = () => {
  //   if (!newHotel.name || !newHotel.location) return;
  
  //   setHotels([...hotels, { ...newHotel, roomTypes: [] }]);
  //   setNewHotel({ name: "", location: "" });
  // };

  const handleAddHotel = async () => {
    if (!newHotel.name || !newHotel.location) {
      alert("❌ Please enter hotel name and location.");
      return;
    }
  
    const token = sessionStorage.getItem("token");
  
    try {
      const response = await fetch("http://127.0.0.1:5000/hotel/add-hotel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hotel_name: newHotel.name,
          location: newHotel.location,
          rating: 0, // Default rating
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert(`✅ ${data.success}`);
        setHotels([...hotels, { ...newHotel, roomTypes: [] }]);
        setNewHotel({ name: "", location: "" });
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error("Error adding hotel:", error);
      alert("❌ An error occurred while adding the hotel.");
    }

    window.location.reload();
  };
  
  


  const handleDeleteRoomType = async (room_id) => {
    const token = sessionStorage.getItem("token");
  
    try {
      const response = await fetch(`http://127.0.0.1:5000/hotel/delete-room/${room_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert(`✅ ${data.success}`);
        // Update state after successful deletion
        setHotels(
          hotels.map((hotel, index) =>
            index === selectedHotelIndex
              ? {
                  ...hotel,
                  roomTypes: hotel.roomTypes.filter(
                    (room) => room.room_id !== room_id
                  ),
                }
              : hotel
          )
        );
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error("Error deleting room type:", error);
      alert("❌ An error occurred while deleting the room.");
    }
  };
  

  const handleEditRoomType = (room) => {
    setNewRoomType({ ...room }); // Spread the object to create a new instance
    setEditingRoomType(room);
  };
  


  const handleCancelEdit = () => {
    setNewRoomType({ type: "", price: "", capacity: "" });
    setEditingRoomType(null);
  };


  const handleProfileEditToggle = () => {
    setIsEditingProfile(!isEditingProfile);
  };


  const handleUpdateUsername = async (newName) => {
    // Validate input
    if (typeof newName !== 'string' || newName.trim() === '') {
        alert('❌ Please enter a valid username');
        return false; // Return false to indicate failure
    }

    const trimmedName = newName.trim();
    const token = sessionStorage.getItem("token");

    try {
        const response = await fetch("http://127.0.0.1:5000/hotel/edit", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ username: trimmedName }),
        });

        const data = await response.json();
        
        if (response.ok) {
            alert(`✅ ${data.success}`);
            return true; // Return true to indicate success
        } else {
            alert(`❌ ${data.error || 'Failed to update username'}`);
            return false;
        }
    } catch (error) {
        console.error("Error updating name:", error);
        alert("❌ An error occurred while updating the name.");
        return false;
    }
};
  

  //
  const handleConfirmBooking = async (id) => {
    const token = sessionStorage.getItem("token");
    try {
      const response = await fetch(`http://127.0.0.1:5000/hotel/confirm/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      if (response.ok) {
        alert(`✅ ${data.success}`);
        setBookings(
          bookings.map((booking) =>
            booking.booking_id === id
              ? { ...booking, booking_status: "Confirmed" }
              : booking
          )
        );
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
      alert("❌ An error occurred while confirming the booking.");
    }
  };

  const handleDeleteBooking = async (id) => {
    const token = sessionStorage.getItem("token");
    try {
      const response = await fetch(`http://127.0.0.1:5000/hotel/remove/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      if (response.ok) {
        alert(`✅ ${data.success}`);
        setBookings(bookings.filter((booking) => booking.booking_id !== id));
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("❌ An error occurred while deleting the booking.");
    }
  };

  


  const content = {
    profile: (
      <div className="profile-section">
        <h2>Profile Overview</h2>
        <div className="profile-card">
          <img className="ProfilePh" src={profilePhoto} alt="Profile" />
          {isEditingProfile ? (
            <div>
              <input 
                type="text" 
                value={profile.username || ''} 
                onChange={(e) => setProfile({...profile, username: e.target.value})}
              /> 
              <button 
                className="btn save-profile" 
                onClick={() => {
                  handleUpdateUsername(profile.username);
                  handleProfileEditToggle();
                }}
              >
                Save
              </button>
            </div>
          ) : (
            <div>
              <p><strong>Manager Name:</strong> {profile.username}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <button className="btn edit-profile" onClick={handleProfileEditToggle}>
                Edit Profile
              </button>
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
              <option key={hotel.id} value={index}>
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
                  <th>capacity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {hotels[selectedHotelIndex]?.roomTypes.map((room) => (
                  <tr key={room.room_id}>
                    <td>{room.type}</td>
                    <td>${room.price}</td>
                    <td>{room.capacity}</td>
                    <td>
                      <button
                        className="btn btn-warning"
                        onClick={() => handleEditRoomType(room)}
                      >
                        Update
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteRoomType(room.room_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
    
          {/* Keep the existing add-room-section exactly as is from Code A */}
          <div className="add-room-section">
            <h4>{editingRoomType ? "Edit Room Type" : "Add Room Type"}</h4>
            <select
              value={newRoomType.type}
              onChange={(e) => setNewRoomType({ ...newRoomType, type: e.target.value })}
              className="form-select"
            >
              <option value="">Select Room Type</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Standard">Standard</option>
              <option value="Suite">Suite</option>
            </select>

            <input type="number" placeholder="Price" value={newRoomType.price} onChange={(e) => setNewRoomType({ ...newRoomType, price: e.target.value })} />
            <input type="number" placeholder="capacity" value={newRoomType.capacity} onChange={(e) => setNewRoomType({ ...newRoomType, capacity: e.target.value })} />
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
              <th>Hotel ID</th>
              <th>Room ID</th>
              <th>User Name</th>
              <th>Check-in Date</th>
              <th>Check-out Date</th>
              <th>Booking Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.booking_id}>
                <td>{b.booking_id}</td>
                <td>{b.hotel_id}</td>
                <td>{b.room_id}</td>
                <td>{b.username}</td>
                <td>{b.check_n_date}</td>
                <td>{b.check_out_date}</td>
                <td>
                  <span
                    className={
                      b.booking_status === "Confirmed"
                        ? "confirmed"
                        : "pendingg"
                    }
                  >
                    {b.booking_status}
                  </span>
                </td>
                <td>
                  {b.booking_status !== "Confirmed" && (
                    <button
                      className="btn btn-warning"
                      onClick={() => handleConfirmBooking(b.booking_id)}
                    >
                      Confirm
                    </button>
                  )}
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteBooking(b.booking_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),    
  };

  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    sessionStorage.removeItem("token"); 
    navigate("/");
  };

  return (
    <div className="admin-dashboard">
      <div className="banner">
        <div>Hotel Manager Dashboard</div>
        <a href="#" className="home-btn" onClick={handleLogout}>
          Logout
        </a>
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