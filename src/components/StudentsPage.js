import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosConfig";
import { useNavigate, useLocation } from "react-router-dom";
import StudentViewModal from "./StudentViewModal";
import StudentEditModal from "./StudentEditModal";
import StudentCreateModal from "./StudentCreateModal"; // Add this import

const StudentPage = () => {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [query, setQuery] = useState({
    studentName: "",
    email: "",
    phoneNumber: "",
    address: "",
    gradeMin: "",
    gradeMax: "",
    page: 1,
    itemsPerPage: 10,
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchStudents();
  }, [location.search]);
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents();
  };
  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get(
        "/students",
        {
          params: {
            ...query,
            gradeMin: query.gradeMin || undefined,
            gradeMax: query.gradeMax || undefined,
          },
        }
      );
      setStudents(response.data.data);
    } catch (error) {
      console.log("Error fetching students:", error);

      if (error.response && error.response.status === 404) {
        setStudents([]);
      } else {
        console.error("Error fetching students:", error);
        setNotification({
          message: "Failed to fetch students",
          detail: error.response
            ? error.response.data.message
            : "Unknown error",
          type: "error",
        });
      }

    }
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await axiosInstance.delete(
          `/students/${studentId}`);
        setStudents(
          students.filter((student) => student.studentId !== studentId)
        );
        setNotification({
          message: "Student deleted successfully",
          type: "success",
        });
      } catch (error) {
        console.error("Error deleting student:", error);
        setNotification({
          message: "Failed to delete student",
          detail: error.response.data.message,
          type: "error",
        });
      }
    }
  };

  const handleUpdateStudent = async (updatedStudent) => {
    try {
      const response = await axiosInstance.put(
        `/students/${updatedStudent.studentId}`,
        updatedStudent);
      const updatedStudents = students.map((student) =>
        student.studentId === updatedStudent.studentId
          ? response.data.data
          : student
      );
      setStudents(updatedStudents);
      setIsEditModalOpen(false);
      setNotification({
        message: "Student updated successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating student:", error);
      if (error.response.data.message === "Validation failed") {
        return error.response.data.error;
      }

      setNotification({
        message: "Failed to update student",
        detail: error.response.data.message,
        type: "error",
      });
    }
  };
  const handleCreateStudent = async (newStudent) => {
    try {
      const response = await axiosInstance.post(
        "/students",
        newStudent
      );
      setStudents([...students, response.data.data]);
      setIsCreateModalOpen(false);
      setNotification({
        message: "Student created successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error creating student:", error);
      if (error.response.data.message === "Validation failed") {
        console.log("Validation failed student page");
        return error.response.data.error;
      }

      setNotification({
        message: "Failed to create student",
        detail: error.response.data.message,
        type: "error",
      });
    }
  };

  const handleQueryChange = (e) => {
    const { name, value } = e.target;
    setQuery((prevQuery) => ({
      ...prevQuery,
      [name]: value,
    }));
  };

  if (error) {
    return <div>Error: {error}</div>;
  }
  return (
    <div className="container mx-auto p-4">
      <div className="container grid grid-cols-2">
        <h1 className="text-2xl font-bold mb-4">Students</h1>
        <div className="flex justify-end">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-500 text-white px-4 py-2 rounded mb-4"
          >
            Create Student
          </button>
        </div>
      </div>
      <form onSubmit={handleSearch} className="mb-4 bg-gray-100">
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            name="studentName"
            placeholder="Student Name"
            value={query.studentName}
            onChange={handleQueryChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={query.email}
            onChange={handleQueryChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            value={query.phoneNumber}
            onChange={handleQueryChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={query.address}
            onChange={handleQueryChange}
            className="border p-2 rounded"
          />
          <input
            type="number"
            name="gradeMin"
            placeholder="Minimum Grade"
            value={query.gradeMin}
            onChange={handleQueryChange}
            className="border p-2 rounded"
          />
          <input
            type="number"
            name="gradeMax"
            placeholder="Maximum Grade"
            value={query.gradeMax}
            onChange={handleQueryChange}
            className="border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </form>

      {students.length > 0 ? (
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Full Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Phone Number</th>
              <th className="py-2 px-4 border-b">Date of Birth</th>
              <th className="py-2 px-4 border-b">Address</th>
              <th className="py-2 px-4 border-b">Grade</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.studentId} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b text-center">
                  {student.studentId}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {student.fullName}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {student.email}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {student.phoneNumber}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {student.dateOfBirth}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <span dangerouslySetInnerHTML={{ __html: student.address }}></span>
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {student.grade}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => handleViewDetails(student)}
                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(student)}
                    className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(student.studentId)}
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
        <p>No student found</p>
      )}

      {isViewModalOpen && (
        <StudentViewModal
          student={selectedStudent}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}

      {isEditModalOpen && (
        <StudentEditModal
          student={selectedStudent}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateStudent}
        />
      )}

      {isCreateModalOpen && (
        <StudentCreateModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateStudent}
        />
      )}
      {notification.message && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-md shadow-md ${notification.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white`}
        >
          <p>{notification.message}</p>
          <p>{notification.detail}</p>
        </div>
      )}
    </div>
  );
};

export default StudentPage;
