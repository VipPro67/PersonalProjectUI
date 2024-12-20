import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import StudentViewModal from "./StudentViewModal";
import StudentEditModal from "./StudentEditModal";
import StudentCreateModal from "./StudentCreateModal"; // Add this import

const StudentPage = ({ token }) => {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Add these new state variables for query parameters
  const [query, setQuery] = useState({
    studentName: "",
    email: "",
    phoneNumber: "",
    address: "",
    gradeMin: "",
    gradeMax: "",
    page: 1,
    itemsPerPage: 10
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchStudents();
  }, [token]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents();
  };
  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        "http://20.39.224.87:5000/api/students",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            ...query,
            gradeMin: query.gradeMin || undefined,
            gradeMax: query.gradeMax || undefined,
          }
        }
      );
      setStudents(response.data.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      else if (error.response && error.response.status === 404) {
        setStudents([]);
      } else {
        setError("Failed to fetch students.");
        console.error("Error fetching students:", error);
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
        await axios.delete(`http://20.39.224.87:5000/api/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(students.filter(student => student.studentId !== studentId));
      } catch (error) {
        console.error("Error deleting student:", error);
        setError("Failed to delete student.");
      }
    }
  };

  const handleUpdateStudent = (updatedStudent) => {
    setStudents(students.map(student =>
      student.studentId === updatedStudent.studentId ? updatedStudent : student
    ));
    setIsEditModalOpen(false);
  };

  // Add this function to handle student creation
  const handleCreateStudent = async (newStudent) => {
    try {
      const response = await axios.post(
        "http://20.39.224.87:5000/api/students",
        newStudent,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStudents([...students, response.data.data]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating student:", error);
      setError("Failed to create student.");
    }
  };

  const handleQueryChange = (e) => {
    const { name, value } = e.target;
    setQuery(prevQuery => ({
      ...prevQuery,
      [name]: value
    }));
  };


  if (error) {
    return <div>Error: {error}</div>;
  }
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Students</h1>
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
      >
        Create Student
      </button>

      {/* Add this filter form */}
      <form onSubmit={handleSearch} className="mb-4 grid grid-cols-2 gap-4">
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
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded col-span-2"
        >
          Search
        </button>
      </form>

      {students.length > 0 ? (<table className="min-w-full bg-white border border-gray-300">

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
              <td className="py-2 px-4 border-b">{student.studentId}</td>
              <td className="py-2 px-4 border-b">{student.fullName}</td>
              <td className="py-2 px-4 border-b">{student.email}</td>
              <td className="py-2 px-4 border-b">{student.phoneNumber}</td>
              <td className="py-2 px-4 border-b">{student.dateOfBirth}</td>
              <td className="py-2 px-4 border-b">{student.address}</td>
              <td className="py-2 px-4 border-b">{student.grade}</td>
              <td className="py-2 px-4 border-b">
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
      </table>) : <p>No student found matching the query.</p>
      }

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
          token={token}
        />
      )}

      {isCreateModalOpen && (
        <StudentCreateModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateStudent}
          token={token}
        />
      )}
    </div>
  );
};

export default StudentPage;


