import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Login from "./components/Login";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import CoursesPage from "./components/CoursesPage";
import StudentsPage from "./components/StudentsPage";
import EnrollmentsPage from "./components/EnrollmentsPage";
import axiosInstance from "./utils/axiosConfig";

function App() {
  const [username, setUsername] = useState("");
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    var accessToken = localStorage.getItem("accessToken");
    setAccessToken(accessToken);
    if (accessToken) {
      try {
        const decodedToken = jwtDecode(accessToken);
        setUsername(decodedToken.unique_name || "");
      } catch (error) {
        console.error("Error decoding token:", error);
        setUsername("");
      }
    } else {
      setUsername("");
    }
  }, [accessToken]);
  const logoutThisDevice = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  };

  const logoutAllDevices = async () => {
    try {
      await axiosInstance.post(
        `http://20.39.224.87:5000/api/auth/logout`,
      );
      logoutThisDevice(); 
    } catch (error) {
      console.error("Error logging out from all devices:", error);
      if (error.response && error.response.status === 401) {
        logoutThisDevice(); 
      }
    }
  };

  return (
    <Router>
      {accessToken && (
        <Navbar
          logoutThisDevice={logoutThisDevice}
          logoutAllDevices={logoutAllDevices}
          username={username}
        />
      )}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/courses"
          element={
            accessToken ? (
              <CoursesPage/>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/students"
          element={
            accessToken ? (
              <StudentsPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/enrollments"
          element={
            accessToken ? (
              <EnrollmentsPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/courses" />} />
      </Routes>
    </Router>
  );
}

export default App;

