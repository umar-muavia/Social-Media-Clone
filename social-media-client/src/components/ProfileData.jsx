import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function ProfileData() {
  const [user, setUser] = useState(null);
  const defaultProfilePicture = "uploads/default-profile.png"; // ensure this path is correct
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:4000/current-user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleUpload = async () => {
    fileInputRef.current.click();
  };

  const handleFileInputChange = async (event) => {
    const formData = new FormData();
    formData.append("profilePicture", event.target.files[0]);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:4000/upload-profile-picture",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser((prevUser) => ({
        ...prevUser,
        profilePicture: response.data.profilePicture,
      }));
      console.log("response" , response.data); // Check the response here
      fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  if (!user) {
    return <div className="text-center">Loading...</div>;
  }

  const profilePictureSrc = user.profilePicture
    ? `http://localhost:4000/${user.profilePicture}`
    : `http://localhost:4000/${defaultProfilePicture}`;

  // console.log("Profile picture source:", profilePictureSrc); // Debugging log

  return (
    <div className="bg-gray-100 pt-4">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full overflow-hidden">
            <img
              src={profilePictureSrc}
              alt="User profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = `http://localhost:4000/${defaultProfilePicture}`;
              }}
            />
          </div>
          <h2 className="text-xl font-semibold mt-4">{user.username}</h2>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            className="hidden"
          />
          <button
            onClick={handleUpload}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
          >
            Upload Image
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileData;
