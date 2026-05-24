import { Navigate } from "react-router";
import { jwtDecode } from "jwt-decode";

const Auth = ({ children }) => {
  // Get cookie string and extract "token"
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const token = getCookie("token");

  let decoded = null;
  if (token) {
    try {
      decoded = jwtDecode(token);
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  if (decoded && decoded.role === "Admin") {
    return children;
  }

  return <Navigate to="/login" />;
};

export default Auth;
