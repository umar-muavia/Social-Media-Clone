import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:4000/login", {
        email,
        password,
      });
      console.log(response.data);
      if (response.data.status === "OK") {
        // Save the token and user information in local storage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user-Name", response.data.username);
        localStorage.setItem("userId", response.data.userId); // Store userId

        alert("Welcome to our website");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert(error.response.data.message);
    }
  };

  return (
    <>
      <div className="py-[68px] flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-4 text-center">Log In</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
              >
                Log In
              </button>
            </div>
          </form>
          <div className="mt-4 text-center">
            <p className="text-md">
              Don't have an account?{" "}
              <NavLink to="/register" className="text-blue-500 no-underline">
                Sign-Up
              </NavLink>
            </p>
          </div>
        </div>
      </div>{" "}
    </>
  );
}

export default Login;
