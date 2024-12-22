import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import CourseDetailsPopup from "./CourseDetailsPopup.js";
import StudentsInCoursePopup from "./StudentsInCoursePopup";
import CourseEditModal from "./CourseEditModal";
import CreateCourseModal from "./CreateCourseModal.js";
import { handleTokenError } from "../utils/tokenRefresh";

const CoursesPage = ({ token, setToken }) => {
  const [courses, setCourses] = useState([]);
  const [notice, setNotice] = useState({ message: "", detail: "", type: "" });
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedCourseForStudents, setSelectedCourseForStudents] =
    useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New state for query parameters
  const [queryParams, setQueryParams] = useState({
    courseId: "",
    courseName: "",
    instructor: "",
    department: "",
    creditMin: "",
    creditMax: "",
    schedule: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const page = searchParams.get("page") || 1;
    fetchCourses(page);
  }, [token, location.search]);

  const showNotice = (message, detail, type) => {
    setNotice({ message, detail, type });
    setTimeout(() => setNotice({ message: "", detail: "", type: "" }), 3000);
  };
  const fetchCourses = async () => {
    try {
      const response = await axios.get(
        `http://20.39.224.87:5000/api/courses${location.search}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCourses(response.data.data);
    } catch (error) {
      console.log("Error fetching courses:", error);
      try {
        await handleTokenError(error, navigate, setToken, async (newToken) => {
          const retryResponse = await axios.get(
            `http://20.39.224.87:5000/api/courses${location.search}`,
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
          setCourses(retryResponse.data.data);
        });
      } catch (finalError) {
        if (finalError.response && finalError.response.status === 404) {
          setCourses([]);
        } else {
          console.error("Error fetching courses:", finalError);
          showNotice(
            "Failed to fetch courses",
            finalError.response
              ? finalError.response.data.message
              : "Unknown error",
            "error"
          );
        }
      }
    }
  };

  const handleQueryChange = (e) => {
    const { name, value } = e.target;
    setQueryParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuerySubmit = (e) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    searchParams.append("page", "1");
    navigate(`/courses?${searchParams.toString()}`);
  };

  const handleViewDetails = (courseId) => {
    setSelectedCourseId(courseId);
  };

  const handleViewStudents = (courseId) => {
    setSelectedCourseForStudents(courseId);
  };
  const handleEdit = (courseId) => {
    const courseToEdit = courses.find((course) => course.courseId === courseId);
    setEditingCourse(courseToEdit);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }
    try {
      await axios.delete(`http://20.39.224.87:5000/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showNotice("Course deleted successfully", null, "success");
    } catch (error) {
      console.error("Error deleting course:", error);
      showNotice(
        "Failed to delete course",
        error.response.data.message,
        "error"
      );
    }
  };
  const handleUpdateCourse = async (updatedCourse) => {
    try {
      const response = await axios.put(
        `http://20.39.224.87:5000/api/courses/${updatedCourse.courseId}`,
        updatedCourse,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCourses(
        courses.map((course) =>
          course.courseId === updatedCourse.courseId
            ? response.data.data
            : course
        )
      );
      setEditingCourse(null);
      showNotice("Course updated successfully", null, "success");
    } catch (error) {
      console.error("Error updating course:", error);
      if (error.response && error.response.data && error.response.data.error) {
        if (error.response.data.message == "Validation failed") {
          return error.response.data.error;
        }
        showNotice(error.response.data.error, "error");
      } else {
        showNotice(
          "An error occurred while creating the course",
          error.response.data.message,
          "error"
        );
      }
    }
  };

  const handleCreateCourse = async (newCourse) => {
    try {
      const response = await axios.post(
        "http://20.39.224.87:5000/api/courses",
        newCourse,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCourses([...courses, response.data.data]);
      setIsCreateModalOpen(false);
      showNotice("Course created successfully", null, "success");
    } catch (error) {
      console.error("Error creating course:", error);
      if (error.response && error.response.data && error.response.data.error) {
        if (error.response.data.message == "Validation failed") {
          return error.response.data.error;
        }
        showNotice(error.response.data.error, "error");
      } else {
        showNotice(
          "An error occurred while creating the course",
          error.response.data.message,
          "error"
        );
      }
    }
  };
  return (
    <div className="container mx-auto p-4">
      <div className="container grid grid-cols-2">
        <h1 className="text-2xl font-bold mb-4">Courses</h1>
        <div className="flex justify-end">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mb-4 bg-green-500 text-white px-4 py-2 rounded"
          >
            Create Course
          </button>
        </div>
      </div>

      <form
        onSubmit={handleQuerySubmit}
        className="mb-4 bg-gray-100 p-4 rounded"
      >
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            name="courseId"
            placeholder="Course ID"
            value={queryParams.courseId}
            onChange={handleQueryChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="courseName"
            placeholder="Course Name"
            value={queryParams.courseName}
            onChange={handleQueryChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="instructor"
            placeholder="Instructor"
            value={queryParams.instructor}
            onChange={handleQueryChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="department"
            placeholder="Department"
            value={queryParams.department}
            onChange={handleQueryChange}
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="creditMin"
            placeholder="Min Credit"
            value={queryParams.creditMin}
            onChange={handleQueryChange}
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="creditMax"
            placeholder="Max Credit"
            value={queryParams.creditMax}
            onChange={handleQueryChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="schedule"
            placeholder="Schedule"
            value={queryParams.schedule}
            onChange={handleQueryChange}
            className="p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </form>
      {courses.length > 0 ? (
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Name</th>
              {/* <th className="py-2 px-4 border-b">Description</th> */}
              <th className="py-2 px-4 border-b">Credit</th>
              <th className="py-2 px-4 border-b">Instructor</th>
              <th className="py-2 px-4 border-b">Department</th>
              <th className="py-2 px-4 border-b">Start Date</th>
              <th className="py-2 px-4 border-b">End Date</th>
              <th className="py-2 px-4 border-b">Schedule</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.courseId} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b text-center">
                  {course.courseId}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {course.courseName}
                </td>
                {/* <td className="py-2 px-4 border-b">{course.description}</td> */}
                <td className="py-2 px-4 border-b text-center">
                  {course.credit}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {course.instructor}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {course.department}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {course.startDate}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {course.endDate}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {course.schedule}
                </td>
                <td className="py-2 px-4 border-b grid grid-cols-2">
                  <button
                    onClick={() => handleViewDetails(course.courseId)}
                    className="bg-blue-500 text-white p-1 m-1 rounded"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleViewStudents(course.courseId)}
                    className="bg-blue-500 text-white p-1 m-1 rounded"
                  >
                    Students
                  </button>
                  <button
                    onClick={() => handleEdit(course.courseId)}
                    className="bg-green-500 text-white p-1 m-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(course.courseId)}
                    className="bg-red-500 text-white p-1 m-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No courses found</p>
      )}
      {selectedCourseId && (
        <CourseDetailsPopup
          courseId={selectedCourseId}
          token={token}
          onClose={() => setSelectedCourseId(null)}
        />
      )}

      {selectedCourseForStudents && (
        <StudentsInCoursePopup
          courseId={selectedCourseForStudents}
          token={token}
          onClose={() => setSelectedCourseForStudents(null)}
        />
      )}

      {editingCourse && (
        <CourseEditModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onUpdate={handleUpdateCourse}
        />
      )}
      {isCreateModalOpen && (
        <CreateCourseModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateCourse}
        />
      )}
      {notice.message && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-md shadow-md ${
            notice.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          <p>{notice.message}</p>
          <p>{notice.detail}</p>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
