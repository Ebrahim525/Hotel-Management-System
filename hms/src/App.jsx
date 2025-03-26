import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import HotelManagerDashboard from './pages/HotelManager';
import Login from './pages/Login';

function Navbar() {
  return (
    <nav>
      <Link to="/" className="nav-link">Login</Link> | 
      <Link to="/admin" className="nav-link">Admin Dashboard</Link> | 
      <Link to="/user" className="nav-link">User Dashboard</Link> | 
      <Link to="/manager" className="nav-link">Hotel Manager</Link>
    </nav>
  );
}

function App() {
  return (
    <Router>
      {/* <Navbar /> */}
      <Routes>
        {/* Route for Login */}
        <Route path="/" element={<Login />} />

        {/* Route for Admin Dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Route for User Dashboard */}
        <Route path="/guest" element={<UserDashboard />} />

        {/* Route for Hotel Manager Dashboard */}
        <Route path="/manager" element={<HotelManagerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;