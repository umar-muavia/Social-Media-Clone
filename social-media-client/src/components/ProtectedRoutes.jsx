import React from "react";
import { Navigate } from "react-router-dom";
import { isTokenExpired } from "../utils/auth.js";

const ProtectedRoute = ({ element: Component, ...rest }) => {
  const isAuthenticated = localStorage.getItem("token") && !isTokenExpired();
  if (!isAuthenticated) {
    localStorage.removeItem("token");
    localStorage.removeItem("user-Name");
  }
  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
