import React, { useState } from "react";
import { Link , useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLoggedIn = localStorage.getItem("token"); // Check if user is logged in

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user-Name");
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div>
              <a href="/" className="flex items-center py-4 px-2 no-underline">
                <span className="font-semibold text-gray-500 text-lg">
                  YourSocialApp
                </span>
              </a>
            </div>
            {/*desktop*/}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/profile"
                className="py-4 px-2 text-gray-500 font-semibold hover:text-blue-500 transition duration-300 no-underline"
              >
                Profile
              </Link>
              <Link
                to="/dashboard"
                className="py-4 px-2 text-gray-500 font-semibold hover:text-blue-500 transition duration-300 no-underline"
              >
                Dashboard
              </Link>
              <Link
                to="/create-post"
                className="py-4 px-2 text-gray-500 font-semibold hover:text-blue-500 transition duration-300 no-underline"
              >
                Create Post
              </Link>
            </div>
          </div>
          {isLoggedIn ? (
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={handleLogout}
                className="py-2 px-2 font-medium text-gray-500 rounded hover:bg-gray-200 transition duration-300 no-underline"
              >
                Log-Out
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <Link
                to="/login"
                className="py-2 px-2 font-medium text-gray-500 rounded hover:bg-gray-200 transition duration-300 no-underline"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="py-2 px-2 font-medium text-white bg-blue-500 rounded hover:bg-blue-400 transition duration-300 no-underline"
              >
                Sign Up
              </Link>
            </div>
          )}
          <div className="md:hidden flex items-center">
            <button
              className="outline-none mobile-menu-button"
              onClick={toggleMenu}
            >
              <svg
                className="w-6 h-6 text-gray-500 hover:text-blue-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className={`mobile-menu ${isMenuOpen ? "" : "hidden"}`}>
        <ul className="">
          <li>
            <Link
              to="/profile"
              className="block text-sm px-2 py-4 hover:bg-blue-500 transition duration-300 no-underline"
            >
              Profile
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard"
              className="block text-sm px-2 py-4 hover:bg-blue-500 transition duration-300 no-underline"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/create-post"
              className="block text-sm px-2 py-4 hover:bg-blue-500 transition duration-300 no-underline"
            >
              Create Post
            </Link>
          </li>
          {!isLoggedIn && (
            <>
              <li>
                <Link
                  to="/login"
                  className="block text-sm px-2 py-4 hover:bg-blue-500 transition duration-300 no-underline"
                >
                  Log In
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="block text-sm px-2 py-4 hover:bg-blue-500 transition duration-300 no-underline"
                >
                  Sign Up
                </Link>
              </li>
            </>
          )}
          {isLoggedIn && (
            <li>
              <button
                onClick={handleLogout}
                className="block text-sm px-2 py-4 hover:bg-gray-200 transition duration-300 no-underline"
              >
                Log-Out
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
