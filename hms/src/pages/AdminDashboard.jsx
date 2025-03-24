import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [page, setPage] = useState("home");

  const content = {
    home: (
      <div>
        <h2>Welcome, Admin</h2>
        <p>Select an option from the sidebar.</p>
      </div>
    ),
    users: (
      <div>
        <h2>Manage Users</h2>
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
            <tr>
              <td>#101</td>
              <td>John Doe</td>
              <td>john@example.com</td>
              <td>
                <button className="btn btn-danger">Remove</button>
              </td>
            </tr>
            <tr>
              <td>#102</td>
              <td>Jane Smith</td>
              <td>jane@example.com</td>
              <td>
                <button className="btn btn-danger">Remove</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
    hotels: (
      <div>
        <h2>Manage Hotel Listings</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Hotel ID</th>
              <th>Hotel Name</th>
              <th>Owner</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#H001</td>
              <td>Luxury Inn</td>
              <td>Michael Johnson</td>
              <td>
                <button className="btn btn-warning">Approve</button>
                <button className="btn btn-danger">Flag</button>
              </td>
            </tr>
            <tr>
              <td>#H002</td>
              <td>Cozy Stay</td>
              <td>Emily Davis</td>
              <td>
                <button className="btn btn-warning">Approve</button>
                <button className="btn btn-danger">Flag</button>
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
};

export default AdminDashboard;