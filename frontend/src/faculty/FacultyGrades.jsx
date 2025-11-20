import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FacultyGrades = () => {
  const [grades, setGrades] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('facultyToken');
        const institutionId = localStorage.getItem('institutionId');

        if (!token || !institutionId) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${baseUrl}/api/faculties/courses`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Institution-Id': institutionId
          }
        });

        setCourses(response.data);
        if (response.data.length > 0) {
          setSelectedCourse(response.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError(error.response?.data?.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchGrades(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchGrades = async (courseId) => {
    try {
      const token = localStorage.getItem('facultyToken');
      const institutionId = localStorage.getItem('institutionId');

      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${baseUrl}/api/faculties/courses/${courseId}/grades`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Institution-Id': institutionId
        }
      });

      setGrades(response.data);
    } catch (error) {
      console.error('Error fetching grades:', error);
      setError(error.response?.data?.message || 'Failed to load grades');
    }
  };

  const handleGradeUpdate = async (studentId, assignmentId, grade) => {
    try {
      const token = localStorage.getItem('facultyToken');
      const institutionId = localStorage.getItem('institutionId');

      const baseUrl = import.meta.env.VITE_API_URL;
      await axios.put(`${baseUrl}/api/faculties/grades`, {
        student_id: studentId,
        assignment_id: assignmentId,
        grade: grade
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Institution-Id': institutionId
        }
      });

      // Refresh grades after update
      fetchGrades(selectedCourse);
    } catch (error) {
      console.error('Error updating grade:', error);
      setError(error.response?.data?.message || 'Failed to update grade');
    }
  };

  if (loading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading grades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Grades</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Grade Management
          </h1>
          <p className="text-xl text-gray-600">
            View and manage student grades for your courses.
          </p>
        </div>

        <div className="mb-8">
          <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Course
          </label>
          <select
            id="course-select"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="block w-full max-w-md px-4 py-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} - {course.semester || 'N/A'}
              </option>
            ))}
          </select>
        </div>

        {grades.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Grades Available</h3>
            <p className="text-gray-600">No student submissions or grades found for this course.</p>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Student Grades</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submission Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {grades.map((grade, index) => (
                    <tr key={`${grade.student_id}-${grade.assignment_id}-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{grade.student_name}</div>
                        <div className="text-sm text-gray-500">{grade.student_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{grade.assignment_title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {grade.submission_date ? new Date(grade.submission_date).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={grade.grade || ''}
                          onChange={(e) => {
                            const newGrades = [...grades];
                            newGrades[index].grade = e.target.value;
                            setGrades(newGrades);
                          }}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Grade"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleGradeUpdate(grade.student_id, grade.assignment_id, grade.grade)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Save
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          View Submission
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyGrades;