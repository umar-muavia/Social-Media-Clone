import React, { useState, useEffect } from "react";
import axios from "axios";

function SearchBar({ onSearch }) {
  const [profilePicture, setProfilePicture] = useState(
    "https://via.placeholder.com/40"
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:4000/current-user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.profilePicture) {
          setProfilePicture(
            `http://localhost:4000/${response.data.profilePicture}`
          );
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSearch(searchTerm);
      setSearchTerm(""); // Clear the search input
    }
  };

  return (
    <div className="bg-gray-100 pt-3">
      <div className="flex items-center p-4 bg-white rounded-lg max-w-3xl mx-auto">
        <img
          src={profilePicture}
          alt="Profile"
          className="w-10 h-10 rounded-full mr-4"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/40";
          }}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search by username and press enter"
          className="flex-grow px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>
    </div>
  );
}

export default SearchBar;
