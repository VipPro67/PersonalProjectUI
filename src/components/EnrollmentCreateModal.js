import React, { useState } from "react";
import ValidationMessage from "./ValidationMessage";

const EnrollmentCreateModal = ({ onClose, onCreate }) => {
  const [newEnrollment, setNewEnrollment] = useState({
    studentId: "",
    courseId: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEnrollment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    var validationErrors = await onCreate({
      studentId: parseInt(newEnrollment.studentId),
      courseId: newEnrollment.courseId,
    });
    if (validationErrors) {
      console.error("Validation errors:", validationErrors);
      setErrors(validationErrors);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Create New Enrollment</h3>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="studentId"
            >
              Student ID
            </label>
            <input
              type="number"
              id="studentId"
              name="studentId"
              value={newEnrollment.studentId}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.studentId ? "border-red-500" : ""
              }`}
            />
            <ValidationMessage errors={errors} field="studentId" />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="courseId"
            >
              Course ID
            </label>
            <input
              type="text"
              id="courseId"
              name="courseId"
              value={newEnrollment.courseId}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.courseId ? "border-red-500" : ""
              }`}
            />
            <ValidationMessage errors={errors} field="courseId" />
          </div>
          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Create Enrollment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnrollmentCreateModal;
