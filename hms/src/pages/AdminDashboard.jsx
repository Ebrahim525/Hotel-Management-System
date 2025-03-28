import { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [message, setMessage] = useState("");
  const [page, setPage] = useState("home");
  const [successMessage, setSuccessMessage] = useState("");
  //
  

  // User data
  const [users, setUsers] = useState([
    // { id: 101, name: "John Doe", email: "john@example.com" },
    // { id: 102, name: "Jane Smith", email: "jane@example.com" },
    // { id: 103, name: "Alice Johnson", email: "alice@example.com" },
    // { id: 104, name: "Bob Brown", email: "bob@example.com" },
  ]);

  // Hotel data
  const [hotels, setHotels] = useState([
    { id: "H001", name: "Luxury Inn", owner: "Michael Johnson", status: "Pending" },
    { id: "H002", name: "Cozy Stay", owner: "Emily Davis", status: "Pending" },
  ]);

  // Search states
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [hotelSearchQuery, setHotelSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/admin/users"); // Correct API
        setUsers(response.data.users || []); // Set fetched users
        setMessage("Welcome to the Admin Dashboard!");
      } catch (error) {
        console.error("Error:", error.response || error);
        setMessage("Failed to load user data. Please login again.");
      }
    };
  
    fetchUsers();
  }, []);

  // Handle User Search
  const handleUserSearch = (e) => {
    setUserSearchQuery(e.target.value.toLowerCase());
  };

  // Filtered User List
  const filteredUsers = users.filter(
    (user) =>
      user.id.toString().includes(userSearchQuery) ||
      user.username.toLowerCase().includes(userSearchQuery) ||
      user.email.toLowerCase().includes(userSearchQuery)
  );

  // Handle Hotel Search
  const handleHotelSearch = (e) => {
    setHotelSearchQuery(e.target.value.toLowerCase());
  };

  // Filtered Hotel List
  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.id.toLowerCase().includes(hotelSearchQuery) ||
      hotel.name.toLowerCase().includes(hotelSearchQuery) ||
      hotel.owner.toLowerCase().includes(hotelSearchQuery) ||
      hotel.status.toLowerCase().includes(hotelSearchQuery)
  );

  // Remove user
  // const handleRemoveUser = (id) => {
  //   setUsers(users.filter((user) => user.id !== id));
  //   setSuccessMessage("User with ID #${id} was successfully removed.");
  //   setTimeout(() => setSuccessMessage(""), 3000);
  // };
  // Remove user with API call
  const handleRemoveUser = async (id) => {
    try {
      const response = await axiosInstance.delete(`/admin/remove-user/${id}`);
      if (response.status === 200) {
        setUsers(users.filter((user) => user.id !== id));
        setSuccessMessage(`User with ID #${id} was successfully removed.`);
      } else {
        setSuccessMessage("Failed to remove the user.");
      }
    } catch (error) {
      console.error("Error:", error.response || error);
      setSuccessMessage("Failed to remove the user.");
    }

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(""), 3000);
  };


  // Approve hotel
  const handleApproveHotel = (id) => {
    setHotels(
      hotels.map((hotel) =>
        hotel.id === id ? { ...hotel, status: "Approved" } : hotel
      )
    );
    setSuccessMessage("Hotel #${id} has been approved.");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Flag hotel (removes from list)
  const handleFlagHotel = (id) => {
    setHotels(hotels.filter((hotel) => hotel.id !== id));
    setSuccessMessage("Hotel #${id} has been flagged and removed");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const content = {
    home: (
      <div>
        <h2>Welcome, Admin</h2>
        <p>{message || "Select an option from the sidebar."}</p>
      </div>
    ),
    users: (
      <div>
        <h2>Manage Users</h2>
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        {/* User Search Input */}
        <input
          type="text"
          placeholder="Search by ID, Name, or Email"
          value={userSearchQuery}
          onChange={handleUserSearch}
          className="form-control mb-3"
        />

        <table className="table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleRemoveUser(user.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && <p>No matching users found.</p>}
      </div>
    ),
    hotels: (
      <div>
        <h2>Manage Hotel Listings</h2>
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        {/* Hotel Search Input */}
        <input
          type="text"
          placeholder="Search by Hotel ID, Name, Owner, or Status"
          value={hotelSearchQuery}
          onChange={handleHotelSearch}
          className="form-control mb-3"
        />

        <table className="table">
          <thead>
            <tr>
              <th>Hotel ID</th>
              <th>Hotel Name</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredHotels.map((hotel) => (
              <tr key={hotel.id}>
                <td>#{hotel.id}</td>
                <td>{hotel.name}</td>
                <td>{hotel.owner}</td>
                <td>{hotel.status}</td>
                <td>
                  {hotel.status !== "Approved" && (
                    <button
                      className="btn btn-warning"
                      onClick={() => handleApproveHotel(hotel.id)}
                    >
                      Approve
                    </button>
                  )}
                  <button
                    className="btn btn-danger"
                    onClick={() => handleFlagHotel(hotel.id)}
                  >
                    Flag
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredHotels.length === 0 && <p>No matching hotels found.</p>}
      </div>
    ),
  };

  return (
    <div className="admin-dashboard">
      <div className="banner">
        <div>Hotel Management System</div>
        <a href="/" className="home-btn">
          Home
        </a>
      </div>

      <div className="sidebar">
        <button className="sidebar-link" onClick={() => setPage("users")}>
          Manage Users
        </button>
        <button className="sidebar-link" onClick={() => setPage("hotels")}>
          Manage Hotel Listings
        </button>
      </div>

      <div className="content">{content[page]}</div>
    </div>
  );
}

export default AdminDashboard
