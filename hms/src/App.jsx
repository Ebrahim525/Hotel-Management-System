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
        {/* <Login /> */}
        {/* <AdminDashboard /> */}
        <UserDashboard />
        {/* <HotelManagerDashboard /> */}
      </>
    )
  }

  export default App
