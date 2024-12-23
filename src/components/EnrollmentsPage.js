import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import EnrollmentCreateModal from "./EnrollmentCreateModal";
import { handleTokenError } from "../utils/tokenRefresh";

const EnrollmentsPage = ({ token, setToken }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notification, setNotification] = useState({
    message: "",
    detail: "",
    type: "",
  });
  const [query, setQuery] = useState({
    courseId: "",
    studentId: "",
    page: 1,
    itemsPerPage: 10,
  });

  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const page = searchParams.get("page") || 1;
    const itemsPerPage = searchParams.get("itemsPerPage") || 10;
    const courseId = searchParams.get("courseId") || "";
    const studentId = searchParams.get("studentId") || "";

    setQuery({
      courseId,
      studentId,
      page: Number(page),
      itemsPerPage: Number(itemsPerPage),
    });

    fetchEnrollments({ courseId, studentId, page, itemsPerPage });
  }, [token, location.search]);

  const fetchEnrollments = async ({
    courseId,
    studentId,
    page,
    itemsPerPage,
  }) => {
    try {
      const response = await axios.get(
        `http://20.39.224.87:5000/api/enrollments?courseId=${courseId}&studentId=${studentId}&page=${page}&itemsPerPage=${itemsPerPage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEnrollments(response.data.data);
    } catch (error) {
      console.log("Error fetching enrollments:", error);
      try {
        await handleTokenError(error, navigate, setToken, async (newToken) => {
          const retryResponse = await axios.get(
            `http://20.39.224.87:5000/api/enrollments${location.search}`,
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
          setEnrollments(retryResponse.data.data);
        });
      } catch (finalError) {
        if (finalError.response && finalError.response.status === 404) {
          setEnrollments([]);
        } else {
          console.error("Error fetching enrollments:", finalError);
          setNotification({
            message: "Failed to fetch enrollments",
            detail: finalError.response
              ? finalError.response.data.message
              : "Unknown error",
            type: "error",
          });
        }
      }
    }
  };
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const createEnrollment = async (newEnrollment) => {
    try {
      const response = await axios.post(
        "http://20.39.224.87:5000/api/enrollments",
        newEnrollment,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchEnrollments(query);
      setIsCreateModalOpen(false);
      setNotification({
        message: "Enrollment created successfully",
        detail: null,
        type: "success",
      });
    } catch (error) {
      console.error("Error creating enrollment:", error);
      if (error.response.data.message === "Validation failed") {
        return error.response.data.error;
      }
      setNotification({
        message: "Failed to create enrollment",
        detail: error.response.data.message,
        type: "error",
      });
    }
  };

  const handleDelete = async (enrollmentId) => {
    if (window.confirm("Are you sure you want to delete this enrollment?")) {
      try {
        await axios.delete(
          `http://20.39.224.87:5000/api/enrollments/${enrollmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        fetchEnrollments(query);
        setNotification({
          message: "Enrollment deleted successfully",
          type: "success",
        });
      } catch (error) {
        console.error("Error deleting enrollment:", error);
        setNotification({
          message: "Failed to delete enrollment",
          detail: error.response.data.message,
          type: "error",
        });
      }
    }
  };

  const handleQueryChange = (e) => {
    const { name, value } = e.target;
    setQuery((prevQuery) => ({
      ...prevQuery,
      [name]: value,
    }));
  };

  const handleQuerySubmit = (e) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    navigate(`/enrollments?${searchParams.toString()}`);
  };
    return (
    <div className="container mx-auto p-4">
      <div className="container grid grid-cols-2">
        <h1 className="text-2xl font-bold mb-4">Enrollments</h1>
        <div className="flex justify-end">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-500 text-white px-4 py-2 rounded mb-4"
          >
            Create Enrollment
          </button>
        </div>
      </div>
      <form onSubmit={handleQuerySubmit} className="mb-4 bg-gray-100">
        <div className="grid grid-cols-3 gap-4">
          {" "}
          <input
            type="text"
            name="courseId"
            value={query.courseId}
            onChange={handleQueryChange}
            placeholder="Course ID"
            className="mr-2 p-2 border rounded"
          />
          <input
            type="number"
            name="studentId"
            value={query.studentId}
            onChange={handleQueryChange}
            placeholder="Student ID"
            className="mr-2 p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Search
          </button>
        </div>
      </form>
      {enrollments.length > 0 ? (
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Enrollment ID</th>
              <th className="py-2 px-4 border-b">Course ID</th>
              <th className="py-2 px-4 border-b">Course Name</th>
              <th className="py-2 px-4 border-b">Student ID</th>
              <th className="py-2 px-4 border-b">Student Name</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment.enrollmentId} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b text-center">
                  {enrollment.enrollmentId}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {enrollment.courseId}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {enrollment.courseName}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {enrollment.studentId}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {enrollment.studentName}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => handleDelete(enrollment.enrollmentId)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No enrollments found</p>
      )}

      {isCreateModalOpen && (
        <EnrollmentCreateModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={createEnrollment}
        />
      )}
      {notification.message && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-md shadow-md ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          <p>{notification.message}</p>
          <p>{notification.detail}</p>
        </div>
      )}
    </div>
  );
};

export default EnrollmentsPage;
