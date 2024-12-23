import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import ValidationMessage from "./ValidationMessage";

const Register = () => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    fullName: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [language, setLanguage] = useState(localStorage.getItem("acceptLanguage") || "en-US");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);
    localStorage.setItem("acceptLanguage", selectedLanguage); // Save selected language to localStorage
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const response = await axios.post(
        "http://20.39.224.87:5000/api/auth/register",
        formData,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Accept-Language": language, // Include selected language in headers
          },
        }
      );

      if (response.data.status === 200) {
        navigate("/login"); // Redirect to login page after successful registration
      } else {
        setErrors({
          general: response.data.message || "An error occurred during registration.",
        });
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrors(error.response.data.error); // Set specific field errors from the response
      } else {
        setErrors({ general: "An error occurred. Please try again." });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Language Selector positioned in top-right */}
      <div className="absolute top-4 right-4">
        <label htmlFor="language" className="block text-sm font-medium text-gray-700">
          Language
        </label>
        <select
          id="language"
          name="language"
          value={language}
          onChange={handleLanguageChange}
          className="mt-1 block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="en-US">EN</option>
          <option value="vi-VN">VI</option>
        </select>
      </div>

      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {["userName", "email", "password", "fullName", "address"].map(
              (field, index) => (
                <div key={field}>
                  <label htmlFor={field} className="sr-only">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    id={field}
                    name={field}
                    type={field === "password" ? "password" : "text"}
                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                      index === 0
                        ? "rounded-t-md"
                        : index === 4
                        ? "rounded-b-md"
                        : ""
                    } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={formData[field]}
                    onChange={handleChange}
                  />
                  <ValidationMessage errors={errors} field={field} />
                </div>
              )
            )}
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <p className="text-sm">{errors.general}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Register
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
