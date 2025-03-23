import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <Login /> */}
      <AdminDashboard />
    </>
  )
}

export default App
