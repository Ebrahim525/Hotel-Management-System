import { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [message, setMessage] = useState("");
  const [page, setPage] = useState("home");
  const [successMessage, setSuccessMessage] = useState("");

  // User data
  const [users, setUsers] = useState([
    { id: 101, name: "John Doe", email: "john@example.com" },
    { id: 102, name: "Jane Smith", email: "jane@example.com" },
    { id: 103, name: "Alice Johnson", email: "alice@example.com" },
    { id: 104, name: "Bob Brown", email: "bob@example.com" },
  ]);

  // Hotel data
  const [hotels, setHotels] = useState([
    { id: "H001", name: "Luxury Inn", owner: "Michael Johnson", status: "Pending" },
    { id: "H002", name: "Cozy Stay", owner: "Emily Davis", status: "Pending" },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("/admin");
        setMessage(response.data.message);
      } catch (error) {
        setMessage("Unauthorized. Please login again.");
      }
    };
    fetchData();
  }, []);

  // Remove user
  const handleRemoveUser = (id) => {
    setUsers(users.filter((user) => user.id !== id));
    setSuccessMessage(`User with ID #${id} was successfully removed.`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Approve hotel
  const handleApproveHotel = (id) => {
    setHotels(
      hotels.map((hotel) =>
        hotel.id === id ? { ...hotel, status: "Approved" } : hotel
      )
    );
    setSuccessMessage(`Hotel #${id} has been approved.`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Flag hotel (removes from list)
  const handleFlagHotel = (id) => {
    setHotels(hotels.filter((hotel) => hotel.id !== id));
    setSuccessMessage(`Hotel #${id} has been flagged and removed.`);
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
            {users.map((user) => (
              <tr key={user.id}>
                <td>#{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleRemoveUser(user.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p>No users remaining.</p>}
      </div>
    ),
    hotels: (
      <div>
        <h2>Manage Hotel Listings</h2>
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
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
            {hotels.map((hotel) => (
              <tr key={hotel.id}>
                <td>#{hotel.id}</td>
                <td>{hotel.name}</td>
                <td>{hotel.owner}</td>
                <td>{hotel.status}</td>
                <td>
                  {hotel.status !== "Approved" && (
                    <button className="btn btn-warning" onClick={() => handleApproveHotel(hotel.id)}>
                      Approve
                    </button>
                  )}
                  <button className="btn btn-danger" onClick={() => handleFlagHotel(hotel.id)}>
                    Flag
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {hotels.length === 0 && <p>No hotels remaining.</p>}
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

export default AdminDashboard;
