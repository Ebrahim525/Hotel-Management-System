import { useState } from "react";
import axios from "axios";
import "./Logincss.css";

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    phone_number: "",
    usertype: "",
  });

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Login/Register
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isRegister) {
        // Registration API
        const response = await axios.post("http://127.0.0.1:5000/register", {
          fullname: formData.fullname,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone_number,
          usertype: formData.usertype,
        });

        if (response.data.message === "User registered successfully!") {
          alert("Registration Successful. Please login!");
          setIsRegister(false);
        }
      } else {
        // Login API
        const response = await axios.post("http://127.0.0.1:5000/login", {
          email: formData.email,
          password: formData.password,
        });

        if (response.data.access_token) {
          // Save JWT token to localStorage
          localStorage.setItem("token", response.data.access_token);

          // Redirect to user dashboard
          window.location.href = response.data.redirect_url;
        } else {
          alert("Invalid email or password.");
        }
      }
    } catch (error) {
      console.error("Error:", error.response.data);
      alert("Error: " + error.response.data.error);
    }
  };

  return (
    <div className="login-page">
      <div className="backimage"></div>
      <div className={`lgcontainer ${isRegister ? "lgslide-in" : "lgslide-out"}`}>
        <h2>{isRegister ? "Register" : "Log In"}</h2>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <input
                type="text"
                name="fullname"
                placeholder="Full Name"
                value={formData.fullname}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="phone_number"
                placeholder="Phone Number"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />
              <select
                name="usertype"
                value={formData.usertype}
                onChange={handleChange}
                required
              >
                <option value="">Select User Type</option>
                <option value="Guest">Guest</option>
                <option value="Manager">Hotel Manager</option>
              </select>
            </>
          )}
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">{isRegister ? "Register" : "Login"}</button>
        </form>

        {/* Toggle Register/Login */}
        <p>
          {isRegister ? (
            <>
              Already have an account?{" "}
              <a href="#" onClick={() => setIsRegister(false)}>
                Log in
              </a>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <a href="#" onClick={() => setIsRegister(true)}>
                Register
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default Login;