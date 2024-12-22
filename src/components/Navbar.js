import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = ({ logout, username }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white font-bold text-xl">Management</div>
        <div className="flex items-center">
          <Link to="/courses" className="text-white mr-4">
            Courses
          </Link>
          <Link to="/students" className="text-white mr-4">
            Students
          </Link>
          <Link to="/enrollments" className="text-white mr-4">
            Enrollments
          </Link>
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="text-white focus:outline-none"
            >
              {username}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                <button
                  onClick={logout}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
