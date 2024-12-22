import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import ValidationMessage from "./ValidationMessage";

const Login = ({ setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a token in localStorage
    const auth = localStorage.getItem("auth");
    if (auth) {
      const { accessToken } = JSON.parse(auth);
      if (accessToken) {
        // If there's a token, redirect to the courses page
        navigate("/courses");
      }
    }
  }, [navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const response = await axios.post(
        "http://20.39.224.87:5000/api/auth/login",
        {
          username,
          password,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === 200) {
        // Store both access token and refresh token
        const tokens = {
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken,
        };
        setToken(tokens);
        localStorage.setItem("auth", JSON.stringify(tokens));
        navigate("/courses");
      } else {
        setErrors({
          general: response.data.message || "An error occurred during login.",
        });
      }
    } catch (error) {
      if (error.response) {
        const { data } = error.response;
        if (data.status === 400 && data.error) {
          setErrors(data.error);
        } else if (data.status === 401) {
          setErrors({
            general: data.error || "Username or password is invalid.",
          });
        } else {
          setErrors({
            general: data.message || "An error occurred during login.",
          });
        }
      } else if (error.request) {
        setErrors({
          general: "No response received from the server. Please try again.",
        });
      } else {
        setErrors({ general: "An error occurred. Please try again." });
      }
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <ValidationMessage errors={errors} field="username" />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <ValidationMessage errors={errors} field="password" />
            </div>
          </div>

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
              Sign in
            </button>
          </div>
          <div className="text-center">
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Don't have an account? Sign up now.
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
