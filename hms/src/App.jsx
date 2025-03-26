  import { useState } from 'react';
  import reactLogo from './assets/react.svg';
  import viteLogo from '/vite.svg';
  import './App.css';
  import AdminDashboard from './pages/AdminDashboard';
  import UserDashboard from './pages/UserDashboard';
  import HotelManagerDashboard from './pages/HotelManager.jsx';
  import Login from './pages/Login';


  function App() {
    const [count, setCount] = useState(0)

    return (
      <>
        <Login />
        {/* <AdminDashboard /> */}
        {/* <UserDashboard /> */}
        {/* <HotelManagerDashboard /> */}
      </>
    )
  }

  export default App

  // import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// import './App.css';
// import AdminDashboard from './pages/AdminDashboard';
// import UserDashboard from './pages/UserDashboard';
// import HotelManagerDashboard from './pages/HotelManager';
// import Login from './pages/Login';

// function Navbar() {
//   return (
//     <nav>
//       <Link to="/">Login</Link> | 
//       <Link to="/admin">Admin Dashboard</Link> | 
//       <Link to="/user">User Dashboard</Link> | 
//       <Link to="/manager">Hotel Manager</Link>
//     </nav>
//   );
// }

// function App() {
//   return (
//     <Router>
//       <Navbar />
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/admin" element={<AdminDashboard />} />
//         <Route path="/user" element={<UserDashboard />} />
//         <Route path="/manager" element={<HotelManagerDashboard />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
