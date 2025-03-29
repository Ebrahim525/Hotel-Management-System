import { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminDashboard.css";

// DELETE HOTEL WILL DELTE ALL ROOMS ASSCIATED

function AdminDashboard() {
  const [message, setMessage] = useState("");
  const [page, setPage] = useState("home");
  const [successMessage, setSuccessMessage] = useState("");


  const [users, setUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");

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

  const handleUserSearch = (e) => {
    setUserSearchQuery(e.target.value.toLowerCase());
  };

  const filteredUsers = users.filter(
    (user) =>
      user.id.toString().includes(userSearchQuery) ||
      user.username.toLowerCase().includes(userSearchQuery) ||
      user.email.toLowerCase().includes(userSearchQuery)
  );

  const handleRemoveUser = async (id) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete User #${id}? This action cannot be undone.`
    );
  
    if (!confirmDelete) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/admin/remove-user/${id}`);
      if (response.status === 200) {
        setUsers(users.filter((user) => user.id !== id));
        setSuccessMessage(`User with ID #${id} was successfully removed.`);
        window.location.reload();
      } else {
        setSuccessMessage("Failed to remove the user.");
      }
    } catch (error) {
      console.error("Error:", error.response || error);
      setSuccessMessage("Failed to remove the user.");
    }

    setTimeout(() => setSuccessMessage(""), 3000);
  };


  //Hotel
  const [hotels, setHotels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hotelSearchQuery, setHotelSearchQuery] = useState("");

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await axiosInstance.get(
          `/admin/hotels?page=${currentPage}&search_query=${hotelSearchQuery}`
        );
        setHotels(response.data.hotels);
        setTotalPages(response.data.total_pages);
      } catch (error) {
        console.error("Error fetching hotels:", error);
      }
    };

    fetchHotels();
  }, [currentPage, hotelSearchQuery]);


  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.id.toString().toLowerCase().includes(hotelSearchQuery) ||
      hotel.name.toLowerCase().includes(hotelSearchQuery) ||
      hotel.owner.toLowerCase().includes(hotelSearchQuery) ||
      hotel.status.toLowerCase().includes(hotelSearchQuery)
  );
  

  const hotelsPerPage = 7;
  const indexOfLastHotel = currentPage * hotelsPerPage;
  const indexOfFirstHotel = indexOfLastHotel - hotelsPerPage;
  const currentHotels = filteredHotels.slice(
    indexOfFirstHotel,
    indexOfLastHotel
  );
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  

  const handleHotelSearch = (e) => {
    setHotelSearchQuery(e.target.value.toLowerCase());
    setCurrentPage(1);
  };  


  const handleApproveHotel = async (id) => {
    try {
      const response = await axiosInstance.patch(`/admin/hotels/${id}/approve`);
      if (response.status === 200) {
        setHotels(
          hotels.map((hotel) =>
            hotel.id === id ? { ...hotel, status: "Approved" } : hotel
          )
        );
        setSuccessMessage(`✅ ${response.data.success}`);
      } else {
        setSuccessMessage("❌ Failed to approve the hotel.");
      }
    } catch (error) {
      console.error("Error approving hotel:", error);
      setSuccessMessage("❌ An error occurred while approving the hotel.");
    }
  
    setTimeout(() => setSuccessMessage(""), 3000);
  };
  

const handleFlagHotel = async (id) => {
  try {
    const response = await axiosInstance.patch(`/admin/hotels/${id}/flag`);
    if (response.status === 200) {
      setHotels(
        hotels.map((hotel) =>
          hotel.id === id ? { ...hotel, status: "Flagged" } : hotel
        )
      );
      setSuccessMessage(`Hotel ${id} has been flagged.`);
    } else {
      setSuccessMessage("❌ Failed to flag the hotel.");
    }
  } catch (error) {
    console.error("Error flagging hotel:", error.response || error);
    setSuccessMessage("❌ Failed to flag the hotel.");
  }

  setTimeout(() => setSuccessMessage(""), 3000);
};


const handleDeleteHotel = async (id) => {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete Hotel #${id}? This action cannot be undone.`
  );

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await axiosInstance.delete(`/admin/hotels/${id}/delete`);
    if (response.status === 200) {
      setHotels(hotels.filter((hotel) => hotel.id !== id));
      setSuccessMessage(`Hotel #${id} has been successfully deleted.`);
    } else {
      setSuccessMessage("❌ Failed to delete the hotel.");
    }
  } catch (error) {
    console.error("Error deleting hotel:", error.response || error);
    setSuccessMessage("❌ Failed to delete the hotel.");
  }

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
              <th>User Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>#{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.usertype}</td>
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

        <input
          type="text"
          placeholder="Search by Hotel ID, Name, Owner, or Status"
          value={hotelSearchQuery}
          onChange={handleHotelSearch}
          className="form-control mb-3"
        />

        <nav className="pagenav">
          <ul className="pagination">
            {Array.from({
              length: totalPages,
            }).map((_, index) => (
              <li key={index + 1} className="page-item">
                <button
                  onClick={() => paginate(index + 1)}
                  className={`page-link ${currentPage === index + 1 ? "active" : ""}`}
                >
                  {index + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>


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
                  {hotel.status === "Approved" ? (
                    <button
                      className="btn btn-warning"
                      onClick={() => handleFlagHotel(hotel.id)}
                    >
                      Flag
                    </button>
                  ) : (
                    <button
                      className="btn btn-warning"
                      onClick={() => handleApproveHotel(hotel.id)}
                    >
                      Approve
                    </button>
                  )}

                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteHotel(hotel.id)}
                  >
                    Delete
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
          Sign Out
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