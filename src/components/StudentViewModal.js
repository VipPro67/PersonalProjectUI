import React from "react";

const StudentViewModal = ({ student, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Student Details</h3>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <p><strong>ID:</strong> {student.studentId}</p>
          <p><strong>Full Name:</strong> {student.fullName}</p>
          <p><strong>Email:</strong> {student.email}</p>
          <p><strong>Phone Number:</strong> {student.phoneNumber}</p>
          <p><strong>Date of Birth:</strong> {student.dateOfBirth}</p>
          <p><strong>Address:</strong><span dangerouslySetInnerHTML={{ __html: student.address }}></span>
          </p>
          <p><strong>Grade:</strong> {student.grade}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentViewModal;