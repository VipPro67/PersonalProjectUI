import React, { useState } from 'react';

const CreateCourseModal = ({ onClose, onCreate }) => {
  const [newCourse, setNewCourse] = useState({
    courseId: '',
    courseName: '',
    description: '',
    credit: 0,
    instructor: '',
    department: '',
    startDate: '',
    endDate: '',
    schedule: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedCourse = {
      ...newCourse,
      credit: parseInt(newCourse.credit),
      startDate: formatDateForSubmit(newCourse.startDate),
      endDate: formatDateForSubmit(newCourse.endDate)
    };

    const validationErrors = await onCreate(formattedCourse);
    if (validationErrors) {
      setErrors(validationErrors);
      console.error('Validation errors:', errors);
    } else {
      onClose();
    }
  };

  const formatDateForSubmit = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Create New Course</h3>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="courseId">
                Course ID
              </label>
              <input
                type="text"
                id="courseId"
                name="courseId"
                value={newCourse.courseId}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              {errors.CourseId && Array.isArray(errors.CourseId) ? (
                errors.CourseId.map((error, index) => (
                  <p key={index} className="text-red-500 text-xs italic">{error}</p>
                ))
              ) : errors.CourseId ? (
                <p className="text-red-500 text-xs italic">{errors.CourseId}</p>
              ) : null}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="courseName">
                Course Name
              </label>
              <input
                type="text"
                id="courseName"
                name="courseName"
                value={newCourse.courseName}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              {errors.CourseName && <p className="text-red-500 text-xs italic">{errors.CourseName}</p>}
            </div>
            <div className="mb-4 col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={newCourse.description}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              {errors.Description && <p className="text-red-500 text-xs italic">{errors.Description}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="credit">
                Credit
              </label>
              <input
                type="number"
                id="credit"
                name="credit"
                value={newCourse.credit}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              {errors.Credit && <p className="text-red-500 text-xs italic">{errors.Credit}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="instructor">
                Instructor
              </label>
              <input
                type="text"
                id="instructor"
                name="instructor"
                value={newCourse.instructor}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              {errors.Instructor && <p className="text-red-500 text-xs italic">{errors.Instructor}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="department">
                Department
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={newCourse.department}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              {errors.Department && <p className="text-red-500 text-xs italic">{errors.Department}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={newCourse.startDate}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              {errors.StartDate && <p className="text-red-500 text-xs italic">{errors.StartDate}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={newCourse.endDate}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              {errors.EndDate && <p className="text-red-500 text-xs italic">{errors.EndDate}</p>}
            </div>
            <div className="mb-4 col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="schedule">
                Schedule
              </label>
              <input
                type="text"
                id="schedule"
                name="schedule"
                value={newCourse.schedule}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              {errors.Schedule && <p className="text-red-500 text-xs italic">{errors.Schedule}</p>}
            </div>
          </div>
          <div className="flex items-center justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;