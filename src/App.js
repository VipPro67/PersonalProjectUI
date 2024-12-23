import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Login from "./components/Login";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import CoursesPage from "./components/CoursesPage";
import StudentsPage from "./components/StudentsPage";
import EnrollmentsPage from "./components/EnrollmentsPage";

function App() {
  const [auth, setAuth] = useState(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    return { accessToken, refreshToken };
  });
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (auth.accessToken) {
      try {
        const decodedToken = jwtDecode(auth.accessToken);
        setUsername(decodedToken.unique_name || "");
      } catch (error) {
        console.error("Error decoding token:", error);
        setUsername("");
      }
    } else {
      setUsername("");
    }
  }, [auth.accessToken]);

  const setToken = (tokens) => {
    setAuth(tokens);
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
  };

  const logoutThisDevice = () => {
    setAuth({});
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const logoutAllDevices = async () => {
    try {
      await axios.post(
        `http://20.39.224.87:5000/api/auth/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        }
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
      {auth.accessToken && (
        <Navbar
          logoutThisDevice={logoutThisDevice}
          logoutAllDevices={logoutAllDevices}
          username={username}
        />
      )}
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/courses"
          element={
            auth.accessToken ? (
              <CoursesPage token={auth.accessToken} setToken={setToken} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/students"
          element={
            auth.accessToken ? (
              <StudentsPage token={auth.accessToken} setToken={setToken} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/enrollments"
          element={
            auth.accessToken ? (
              <EnrollmentsPage token={auth.accessToken} setToken={setToken} />
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

