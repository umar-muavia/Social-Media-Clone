import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import AllPostData from "../components/AllPostData";
import { isTokenExpired } from "../utils/auth";

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    // Function to handle logout
    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user-Name");
      localStorage.removeItem("userId");
      navigate("/login");
    };

    // Initial check if token is expired
    if (!token || isTokenExpired()) {
      handleLogout();
    }

    // Set interval to check for token expiration every minute
    const intervalId = setInterval(() => {
      if (isTokenExpired()) {
        handleLogout();
      }
    }, 60000); // 60000 ms = 1 minute

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [token, navigate]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <>
      <SearchBar onSearch={handleSearch} />
      <AllPostData searchTerm={searchTerm} />
    </>
  );
}

export default Dashboard;
