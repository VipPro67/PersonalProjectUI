import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ValidationMessage from "./ValidationMessage";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [language, setLanguage] = useState(
    localStorage.getItem("acceptLanguage") || "en-US"
  );
  const navigate = useNavigate();

  useEffect(() => {
    const getTokens = async () => {
      try {
        const response = await axios.post(
          "http://20.108.26.12:5000/api/auth/refresh-token",
          {
            refreshToken: localStorage.getItem("refreshToken"),
          },
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "Accept-Language": language ? language : "en-US",
            },
          }
        );
        const newToken = response.data.data.accessToken;
        localStorage.setItem("accessToken", newToken);
        localStorage.setItem("refreshAttempted", "true");
        navigate("/courses");
      } catch (error) {
        console.error("Refresh token error:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.setItem("refreshAttempted", "true");
      }
    };
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      navigate("/courses");
    } else {
      const refreshToken = localStorage.getItem("refreshToken");
      const refreshAttempted = localStorage.getItem("refreshAttempted");
      if (refreshToken && refreshAttempted !== "true") {
        getTokens();
      }
    }

    // Clean up function to remove the refreshAttempted flag when component unmounts
    return () => {
      localStorage.removeItem("refreshAttempted");
    };
  }, [navigate, language]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const response = await axios.post(
        "http://20.108.26.12:5000/api/auth/login",
        {
          username,
          password,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Accept-Language": language ? language : "en-US",
          },
        }
      );

      // Check if the response contains the expected data
      if (response.data && response.data.status === 200 && response.data.data) {
        const { accessToken, refreshToken } = response.data.data;
        if (accessToken && refreshToken) {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          navigate("/courses");
          window.location.reload();
        } else {
          throw new Error("Invalid token data received");
        }
      } else {
        throw new Error(
          response.data.message || "An unexpected error occurred"
        );
      }
    } catch (error) {
      console.error("Login error:", error);
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
        setErrors({
          general: error.message || "An error occurred. Please try again.",
        });
      }
    }
  };

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);
    localStorage.setItem("acceptLanguage", selectedLanguage); // Save the selected language to localStorage
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <label
          htmlFor="language"
          className="block text-sm font-medium text-gray-700"
        >
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
              <ValidationMessage errors={errors} field="userName" />
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

          <div className="text-center mt-4">
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
