import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element }) => {
  const token = sessionStorage.getItem("token");

  // If token is present, allow access
  return token ? element : <Navigate to="/" />;
};

export default PrivateRoute;
