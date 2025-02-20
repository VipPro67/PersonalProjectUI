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
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    setAccessToken(storedAccessToken);

    if (storedAccessToken) {
      try {
        const decodedToken = jwtDecode(storedAccessToken);
        setUsername(decodedToken.unique_name || "");
      } catch (error) {
        console.error("Error decoding token:", error);
        setUsername("");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    } else {
      setUsername("");
    }
    setIsLoading(false);
  }, []);

  const logoutThisDevice = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAccessToken("");
    setUsername("");
    window.location.href = "/login";
  };

  const logoutAllDevices = async () => {
    try {
      await axiosInstance.post(
        `http://20.108.26.12:5000/api/auth/logout`,
      );
      logoutThisDevice(); 
    } catch (error) {
      console.error("Error logging out from all devices:", error);
      if (error.response && error.response.status === 401) {
        logoutThisDevice(); 
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
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
        <Route path="/login" element={accessToken ? <Navigate to="/courses" /> : <Login />} />
        <Route path="/register" element={accessToken ? <Navigate to="/courses" /> : <Register />} />
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
        <Route path="/" element={<Navigate to={accessToken ? "/courses" : "/login"} />} />
        <Route path="*" element={<Navigate to={accessToken ? "/courses" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;

