import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const EnrollmentsPage = ({ token }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState({
    courseId: "",
    studentId: "",
    page: 1,
    itemsPerPage: 10
  });

  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const page = searchParams.get('page') || 1;
    const itemsPerPage = searchParams.get('itemsPerPage') || 10;
    const courseId = searchParams.get('courseId') || "";
    const studentId = searchParams.get('studentId') || "";

    setQuery({ courseId, studentId, page: Number(page), itemsPerPage: Number(itemsPerPage) });
    fetchEnrollments({ courseId, studentId, page, itemsPerPage });
  }, [token, location.search]);

  const fetchEnrollments = async (params) => {
    try {
      const response = await axios.get(
        "http://20.39.224.87:5000/api/enrollments",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: params
        }
      );
      setEnrollments(response.data.data);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      setError("Failed to fetch enrollments");
    }
  };

  const handleDelete = async (enrollmentId) => {
    //alert the user before deleting the enrollment
    if (!window.confirm("Are you sure you want to delete this enrollment?")) {
      return;
    }

    try {
      await axios.delete(
        `http://20.39.224.87:5000/api/enrollments/${enrollmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Refresh the enrollments list after successful deletion
      fetchEnrollments(query);
    } catch (error) {
      console.error("Error deleting enrollment:", error);
      setError("Failed to delete enrollment");
    }
  };

  const handleQueryChange = (e) => {
    const { name, value } = e.target;
    setQuery(prevQuery => ({
      ...prevQuery,
      [name]: value
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
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Enrollments</h1>

      {/* Query form */}
      <form onSubmit={handleQuerySubmit} className="mb-4">
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
      </form>
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
              <td className="py-2 px-4 border-b">{enrollment.enrollmentId}</td>
              <td className="py-2 px-4 border-b">{enrollment.courseId}</td>
              <td className="py-2 px-4 border-b">{enrollment.courseName}</td>
              <td className="py-2 px-4 border-b">{enrollment.studentId}</td>
              <td className="py-2 px-4 border-b">{enrollment.studentName}</td>
              <td className="py-2 px-4 border-b">
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
    </div>
  );
};

export default EnrollmentsPage;

