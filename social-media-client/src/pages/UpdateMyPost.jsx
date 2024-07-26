import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, NavLink } from "react-router-dom";

function UpdateMyPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState({
    title: "",
    image: null,
    description: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:4000/my-post/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response);
        setPost(response.data);
      } catch (error) {
        console.error("Error fetching post:", error);
        setError(
          "There was an error fetching the post. Please try again later."
        );
      }
    };

    fetchPost();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setPost((prevPost) => ({
        ...prevPost,
        [name]: files[0], // Only store the file object
      }));
    } else {
      setPost((prevPost) => ({
        ...prevPost,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", post.title);
      formData.append("description", post.description);
      if (post.image) {
        formData.append("image", post.image);
      }

      const response = await axios.put(
        `http://localhost:4000/my-post/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        alert("Post updated Successfully")
        navigate("/profile");
      } else {
        console.error("Update failed with status:", response.status);
      }
    } catch (error) {
      console.error("Error updating post:", error);
      setError("There was an error updating the post. Please try again later.");
    }
  };

  return (
    <>
      <div className="py-4 flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Update Your Post
          </h2>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Post Title
              </label>
              <input
                type="text"
                id="title"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                name="title"
                value={post.title}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Post Description
              </label>
              <textarea
                id="description"
                rows="4"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                name="description"
                value={post.description}
                onChange={handleChange}
              ></textarea>
            </div>
            <div className="mb-4">
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700"
              >
                Upload Image
              </label>
              <input
                type="file"
                id="image"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                name="image"
                onChange={handleChange}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <NavLink to="/profile">
                <button
                  type="button"
                  className="py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
                >
                  Cancel
                </button>
              </NavLink>
              <button
                type="submit"
                className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
              >
                Update Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default UpdateMyPost;
