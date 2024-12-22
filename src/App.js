import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Login from "./components/Login";
import Register from "./components/Register"; // Add this line
import Navbar from "./components/Navbar";
import CoursesPage from "./components/CoursesPage";
import StudentsPage from "./components/StudentsPage";
import EnrollmentsPage from "./components/EnrollmentsPage";

function App() {
  const [auth, setAuth] = useState(() => {
    const savedAuth = localStorage.getItem("auth");
    return savedAuth ? JSON.parse(savedAuth) : {};
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
    localStorage.setItem("auth", JSON.stringify(tokens));
  };

  const logout = () => {
    setAuth({});
    localStorage.removeItem("auth");
  };

  return (
    <Router>
      {auth.accessToken && <Navbar logout={logout} username={username} />}
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
        <Route path="/" element={<Navigate to="/courses" />} />
      </Routes>
    </Router>
  );
}

export default App;
