import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosConfig";
import { useNavigate, useLocation } from "react-router-dom";
import StudentViewModal from "./StudentViewModal";
import StudentEditModal from "./StudentEditModal";
import StudentCreateModal from "./StudentCreateModal";

const StudentPage = () => {
  const [students, setStudents] = useState([]);
  const [notice, setNotice] = useState({ message: "", detail: "", type: "" });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [queryParams, setQueryParams] = useState({
    studentName: "",
    email: "",
    phoneNumber: "",
    address: "",
    gradeMin: "",
    gradeMax: "",
    sortBy: "studentId",
    sortByDirection: "asc",
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const page = searchParams.get("page");
    const itemsPerPage = searchParams.get("itemsPerPage");
    if (isNaN(page) || isNaN(itemsPerPage) || page <= 0 || itemsPerPage <= 0) {
      setQueryParams({ ...queryParams, page: 1, itemsPerPage: 10 });
      navigate(`/students?page=1&itemsPerPage=10`);
    }
    fetchStudents();
  }, [location.search]);

  const showNotice = (message, detail, type) => {
    setNotice({ message, detail, type });
    setTimeout(() => setNotice({ message: "", detail: "", type: "" }), 3000);
  };

  const fetchStudents = async () => {
    try {
      //check page, itemsPerPage valid 
      const response = await axiosInstance.get(`/students${location.search}`);
      setStudents(response.data.data);
    } catch (error) {
      console.log("Error fetching students:", error);
      if (error.response && error.response.status === 404) {
        setStudents([]);
      } else {
        console.error("Error fetching students:", error);
        showNotice(
          "Failed to fetch students",
          error.response ? error.response.data.message : "Unknown error",
          "error"
        );
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
    searchParams.append("itemsPerPage", "10");
    navigate(`/students?${searchParams.toString()}`);
  };

  const handleSort = (column) => {
    const newSortDirection =
      queryParams.sortBy === column && queryParams.sortByDirection === "asc"
        ? "desc"
        : "asc";

    setQueryParams((prev) => ({
      ...prev,
      sortBy: column,
      sortByDirection: newSortDirection,
    }));
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("sortBy", column);
    searchParams.set("sortByDirection", newSortDirection);
    navigate(`/students?${searchParams.toString()}`);
  };

  const getSortIcon = (column) => {
    if (queryParams.sortBy === column) {
      return queryParams.sortByDirection === "asc" ? "▲" : "▼";
    }
    return null;
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
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }
    try {
      await axiosInstance.delete(`/students/${studentId}`);
      showNotice("Student deleted successfully", null, "success");
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      showNotice(
        "Failed to delete student",
        error.response.data.message,
        "error"
      );
    }
  };

  const handleUpdateStudent = async (updatedStudent) => {
    try {
      const response = await axiosInstance.put(
        `/students/${updatedStudent.studentId}`,
        updatedStudent
      );
      setStudents(
        students.map((student) =>
          student.studentId === updatedStudent.studentId
            ? response.data.data
            : student
        )
      );
      setIsEditModalOpen(false);
      showNotice("Student updated successfully", null, "success");
    } catch (error) {
      console.error("Error updating student:", error);
      if (error.response && error.response.data && error.response.data.error) {
        if (error.response.data.message === "Validation failed") {
          return error.response.data.error;
        }
        showNotice(error.response.data.error, "error");
      } else {
        showNotice(
          "An error occurred while updating the student",
          error.response.data.message,
          "error"
        );
      }
    }
  };

  const handleCreateStudent = async (newStudent) => {
    try {
      const response = await axiosInstance.post("/students", newStudent);
      setStudents([...students, response.data.data]);
      setIsCreateModalOpen(false);
      showNotice("Student created successfully", null, "success");
    } catch (error) {
      console.error("Error creating student:", error);
      if (error.response && error.response.data && error.response.data.error) {
        if (error.response.data.message === "Validation failed") {
          return error.response.data.error;
        }
        showNotice(error.response.data.error, "error");
      } else {
        showNotice(
          "An error occurred while creating the student",
          error.response.data.message,
          "error"
        );
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="container grid grid-cols-2">
        <h1 className="text-2xl font-bold mb-4">Students</h1>
        <div className="flex justify-end">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mb-4 bg-green-500 text-white px-4 py-2 rounded"
          >
            Create Student
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
            name="studentName"
            placeholder="Student Name"
            value={queryParams.studentName}
            onChange={handleQueryChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={queryParams.email}
            onChange={handleQueryChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            value={queryParams.phoneNumber}
            onChange={handleQueryChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={queryParams.address}
            onChange={handleQueryChange}
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="gradeMin"
            placeholder="Min Grade"
            value={queryParams.gradeMin}
            onChange={handleQueryChange}
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="gradeMax"
            placeholder="Max Grade"
            value={queryParams.gradeMax}
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

      {students.length > 0 ? (
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort("studentId")}>
                ID {getSortIcon("studentId")}
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort("fullName")}>
                Full Name {getSortIcon("fullName")}
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort("email")}>
                Email {getSortIcon("email")}
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort("phoneNumber")}>
                Phone Number {getSortIcon("phoneNumber")}
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort("dateOfBirth")}>
                Date of Birth {getSortIcon("dateOfBirth")}
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort("address")}>
                Address {getSortIcon("address")}
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort("grade")}>
                Grade {getSortIcon("grade")}
              </th>
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
                  <span
                    dangerouslySetInnerHTML={{ __html: student.address }}
                  ></span>
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
        <p>No students found</p>
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

export default StudentPage;
