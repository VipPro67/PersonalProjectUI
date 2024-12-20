import React, { useEffect, useState } from "react";
import axios from "axios";

const CourseDetailsPopup = ({ courseId, token, onClose }) => {
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(
          `http://20.39.224.87:5000/api/courses/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCourseDetails(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching course details:", error);
        setError("Failed to fetch course details");
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, token]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!courseDetails) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Course Details</h3>
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
          <p><strong>ID:</strong> {courseDetails.courseId}</p>
          <p><strong>Name:</strong> {courseDetails.courseName}</p>
          <p><strong>Description:</strong> {courseDetails.description}</p>
          <p><strong>Credit:</strong> {courseDetails.credit}</p>
          <p><strong>Instructor:</strong> {courseDetails.instructor}</p>
          <p><strong>Department:</strong> {courseDetails.department}</p>
          <p><strong>Start Date:</strong> {courseDetails.startDate}</p>
          <p><strong>End Date:</strong> {courseDetails.endDate}</p>
          <p><strong>Schedule:</strong> {courseDetails.schedule}</p>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPopup;
