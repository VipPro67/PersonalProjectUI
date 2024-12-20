import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import CourseDetailsPopup from "./CourseDetailsPopup.js";
import StudentsInCoursePopup from "./StudentsInCoursePopup";
import CourseEditModal from "./CourseEditModal";
import CreateCourseModal from "./CreateCourseModal.js";

const CoursesPage = ({ token }) => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New state for query parameters
  const [queryParams, setQueryParams] = useState({
    courseId: "",
    courseName: "",
    instructor: "",
    department: "",
    creditMin: "",
    creditMax: "",
    schedule: ""
  });

  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const page = searchParams.get('page') || 1;
    fetchCourses(page);
  }, [token, location.search]);

  const fetchCourses = async (page) => {
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
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      else if (error.response.status === 404) {
        setCourses([]);
      }
      else {
        console.error("Error fetching courses:", error);
        setError("Failed to fetch courses");
      }
    }
  };

  const handleQueryChange = (e) => {
    const { name, value } = e.target;
    setQueryParams(prev => ({ ...prev, [name]: value }));
  };

  const handleQuerySubmit = (e) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    searchParams.append('page', '1');
    navigate(`/courses?${searchParams.toString()}`);
  };

  const handleViewDetails = (courseId) => {
    setSelectedCourseId(courseId);
  };

  const handleViewStudents = (courseId) => {
    setSelectedCourseForStudents(courseId);
  };
  const handleEdit = (courseId) => {
    const courseToEdit = courses.find(course => course.courseId === courseId);
    setEditingCourse(courseToEdit);
  };

  const handleDelete = (courseId) => {
    setCourseToDelete(courseId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://20.39.224.87:5000/api/courses/${courseToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(courses.filter(course => course.courseId !== courseToDelete));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting course:", error);
      setError("Failed to delete course");
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
      setCourses(courses.map(course =>
        course.courseId === updatedCourse.courseId ? response.data.data : course
      ));
      setEditingCourse(null);
    } catch (error) {
      console.error("Error updating course:", error);
      setError("Failed to update course");
    }
  };

  const handleCreateCourse = async (newCourse) => {
    try {
      const response = await axios.post(
        'http://20.39.224.87:5000/api/courses',
        newCourse,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCourses([...courses, response.data.data]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating course:", error);
      if (error.response && error.response.data && error.response.data.error) {
        return error.response.data.error;
      } else {
        return { general: "An error occurred while creating the course. Please try again." };
      }
    }
  };


  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Courses</h1>
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded"
      >
        Create Course
      </button>
      <form onSubmit={handleQuerySubmit} className="mb-4 bg-gray-100 p-4 rounded">

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
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
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
                <td className="py-2 px-4 border-b">{course.courseId}</td>
                <td className="py-2 px-4 border-b">{course.courseName}</td>
                {/* <td className="py-2 px-4 border-b">{course.description}</td> */}
                <td className="py-2 px-4 border-b">{course.credit}</td>
                <td className="py-2 px-4 border-b">{course.instructor}</td>
                <td className="py-2 px-4 border-b">{course.department}</td>
                <td className="py-2 px-4 border-b">{course.startDate}</td>
                <td className="py-2 px-4 border-b">{course.endDate}</td>
                <td className="py-2 px-4 border-b">{course.schedule}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleViewDetails(course.courseId)}
                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleViewStudents(course.courseId)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Students
                  </button>
                  <button
                    onClick={() => handleEdit(course.courseId)}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(course.courseId)}
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
        <p>No courses found matching the query.</p>
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

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg">
            <h2 className="text-xl mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this course?</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <CreateCourseModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateCourse}
        />
      )}
    </div>
  );
};

export default CoursesPage;



