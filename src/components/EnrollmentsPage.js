import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosConfig";
import EnrollmentCreateModal from "./EnrollmentCreateModal";

const EnrollmentsPage = () => {
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
    sortBy: "enrollmentId",
    sortByDirection: "asc",
    page: 1,
    itemsPerPage: 10,
  });
  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10,
  });

  useEffect(() => {
    fetchEnrollments(query);
  }, []);

  const fetchEnrollments = async (queryParams) => {
    try {
      const response = await axiosInstance.get(
        `/enrollments?${new URLSearchParams(queryParams).toString()}`
      );
      setEnrollments(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setEnrollments([]);
      } else {
        console.error("Error fetching enrollments:", error);
        setNotification({
          message: "Failed to fetch enrollments",
          detail: error.response
            ? error.response.data.message
            : "Unknown error",
          type: "error",
        });
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
      const response = await axiosInstance.post("/enrollments", newEnrollment);
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
        await axiosInstance.delete(`/enrollments/${enrollmentId}`);
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
    fetchEnrollments(query);
  };

  const handleSort = (column) => {
    const newSortOrder =
      query.sortBy === column && query.sortByDirection === "asc"
        ? "desc"
        : "asc";

    setQuery((prevQuery) => ({
      ...prevQuery,
      sortBy: column,
      sortByDirection: newSortOrder,
    }));
  };
  const handlePageChange = (newPage) => {
    setQuery((prevQuery) => ({ ...prevQuery, page: newPage }));
    fetchEnrollments({ ...query, page: newPage });
  };

  const getSortIcon = (column) => {
    if (query.sortBy === column) {
      return query.sortByDirection === "asc" ? "▲" : "▼";
    }
    return null;
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
        <div className="container grid grid-cols-1">
          {" "}
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th
                  className="py-2 px-4 border-b cursor-pointer"
                  onClick={() => handleSort("enrollmentId")}
                >
                  Enrollment ID{getSortIcon("enrollmentId")}
                </th>
                <th
                  className="py-2 px-4 border-b cursor-pointer"
                  onClick={() => handleSort("courseId")}
                >
                  Course ID{getSortIcon("courseId")}
                </th>
                <th
                  className="py-2 px-4 border-b cursor-pointer"
                  onClick={() => handleSort("studentId")}
                >
                  Student ID{getSortIcon("studentId")}
                </th>
                <th className="py-2 px-4 border-b">Course Name</th>

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
                  </td>{" "}
                  <td className="py-2 px-4 border-b text-center">
                    {enrollment.studentId}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {enrollment.courseName}
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
          {pagination.totalPage > 0 && (
            <div className="flex justify-center mt-4">
              <nav className="inline-flex rounded-md shadow">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Previous
                </button>
                {[...Array(pagination.totalPage)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      pagination.currentPage === index + 1
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPage}
                  className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
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
