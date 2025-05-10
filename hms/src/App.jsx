import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import PrivateRoute from './component/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import GuestDashboard from './pages/UserDashboard';
import HotelManagerDashboard from './pages/HotelManager';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<PrivateRoute element={<AdminDashboard />} />} />
        <Route path="/manager" element={<PrivateRoute element={<HotelManagerDashboard />} />} />
        <Route path="/guest" element={<PrivateRoute element={<GuestDashboard />} />} />
      </Routes>
    </Router>
  );
}

export default App;