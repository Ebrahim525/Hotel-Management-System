// import axios from "axios";

// // Create Axios instance with base URL
// const axiosInstance = axios.create({
//   baseURL: "http://127.0.0.1:5000",
// });

// // Add a request interceptor to attach the token
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token"); // Get token from localStorage
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`; // Attach token to headers
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );


// export default axiosInstance;
// In axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:5000",
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;