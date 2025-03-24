  import { useState } from 'react';
  import reactLogo from './assets/react.svg';
  import viteLogo from '/vite.svg';
  import './App.css';
  import AdminDashboard from './pages/AdminDashboard';
  import Login from './pages/Login';


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
