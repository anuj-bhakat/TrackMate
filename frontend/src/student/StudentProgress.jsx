import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentProgress = () => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL;
  const studentId = localStorage.getItem('studentId');
  const token = localStorage.getItem('studentToken');

  useEffect(() => {
    const fetchProgressData = async () => {
      if (!studentId || !token) {
        setError('Student information not found. Please login again.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${baseUrl}/api/course-students-marks/summary/by-student/${studentId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProgressData(response.data);
      } catch (error) {
        console.error('Error fetching progress data:', error);
        setError(error.response?.data?.message || 'Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [baseUrl, studentId, token]);

  const getGradeColor = (gradePoint) => {
    if (gradePoint === null || gradePoint === undefined) return 'text-gray-500';
    if (gradePoint >= 9) return 'text-green-600';
    if (gradePoint >= 7) return 'text-blue-600';
    if (gradePoint >= 5) return 'text-yellow-600';
    if (gradePoint >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeLetter = (gradePoint) => {
    if (gradePoint === null || gradePoint === undefined) return 'N/A';
    if (gradePoint >= 9) return 'A';
    if (gradePoint >= 8) return 'B';
    if (gradePoint >= 7) return 'C';
    if (gradePoint >= 6) return 'D';
    if (gradePoint >= 5) return 'E';
    if (gradePoint >= 4) return 'P';
    return 'F';
  };

  const calculateSemesterGPA = (courses) => {
    const validCourses = courses.filter(course => course.grade_point !== null);
    if (validCourses.length === 0) return 0;

    const totalCredits = validCourses.reduce((sum, course) => sum + course.credits, 0);
    const weightedSum = validCourses.reduce((sum, course) => sum + (course.grade_point * course.credits), 0);

    return totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : 0;
  };

  const calculateOverallGPA = (semesters) => {
    let totalCredits = 0;
    let weightedSum = 0;

    semesters.forEach(semester => {
      semester.courses.forEach(course => {
        if (course.grade_point !== null) {
          totalCredits += course.credits;
          weightedSum += course.grade_point * course.credits;
        }
      });
    });

    return totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : 0;
  };

  if (loading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
              Academic Progress
            </h1>
            <p className="text-xl text-gray-600">
              Track your grades and course completion status.
            </p>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
              Academic Progress
            </h1>
            <p className="text-xl text-gray-600">
              Track your grades and course completion status.
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
              Academic Progress
            </h1>
            <p className="text-xl text-gray-600">
              Track your grades and course completion status.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">No progress data available</p>
          </div>
        </div>
      </div>
    );
  }

  const SemesterDetails = ({ semester, onBack, getGradeColor, getGradeLetter }) => (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Semesters
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">{semester.semester_name}</h2>
          <p className="text-gray-600">Semester {semester.semester_sequence}</p>
        </div>
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>

      {/* Semester Summary */}
      <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-indigo-900 mb-1">Semester Performance</h3>
            <p className="text-indigo-700 text-sm">{semester.courses.length} Course{semester.courses.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-900">{calculateSemesterGPA(semester.courses)}</div>
            <div className="text-sm text-indigo-700 font-medium">SGPA</div>
          </div>
        </div>
      </div>

      {/* Course Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {semester.courses.map((course) => (
          <div key={course.course_id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-5 border-b border-indigo-200">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-bold text-indigo-900 mb-1 truncate">{course.course_name}</h4>
                  <p className="text-indigo-700 text-sm font-medium mb-3">{course.course_code}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-200 text-indigo-800 font-semibold text-xs">
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {course.credits} Credits
                    </span>
                    {course.grade_point !== null && course.grade_point !== undefined && (
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full font-bold text-white text-xs ${course.grade_point >= 9 ? 'bg-green-500' : course.grade_point >= 7 ? 'bg-blue-500' : course.grade_point >= 5 ? 'bg-yellow-500' : course.grade_point >= 4 ? 'bg-orange-500' : 'bg-red-500'}`}>
                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Grade {getGradeLetter(course.grade_point)} ({course.grade_point})
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right ml-6 flex-shrink-0">
                  {course.total_marks !== null ? (
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                      <div className="text-2xl font-bold text-indigo-900 mb-1">
                        {course.total_marks}/100
                      </div>
                      <div className="text-sm text-indigo-700 font-medium">
                        Grade Points: {course.grade_point && course.grade_point > 0 ? (course.grade_point * course.credits).toFixed(1) : 'F'}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div className="text-gray-600 text-xs font-medium">Not Graded</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4">
              {/* Marks Breakdown */}
              {course.marks && (
                <div className="mb-4">
                  <h6 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Assessment Breakdown
                  </h6>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(course.marks).map(([component, marks]) => {
                        const weightage = course.weightage[component];
                        const percentage = weightage ? (marks / weightage) * 100 : 0;
                        return (
                          <div key={component} className="flex items-center justify-between py-1">
                            <div className="flex items-center space-x-3 flex-1">
                              <span className="text-sm font-medium text-gray-700 capitalize min-w-0 flex-1">{component}</span>
                              <span className="text-sm text-gray-500 whitespace-nowrap">({weightage}%)</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-bold text-gray-900 min-w-[2rem] text-right">
                                {marks !== null ? marks : 'N/A'}
                              </span>
                              {marks !== null && weightage && (
                                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full transition-all duration-300 ${percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-blue-500' : percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Academic Progress
          </h1>
        </div>

        {/* Overall GPA Summary */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Academic Performance Overview</h2>
              <p className="text-gray-600">Student: <span className="font-semibold text-gray-900">{progressData.student.name}</span></p>
              <p className="text-gray-500 text-sm">Student ID: {progressData.student.student_id}</p>
            </div>
            <div className="text-center md:text-right">
              <div className="mb-3">
                <div className="text-4xl font-bold text-indigo-600">{calculateOverallGPA(progressData.semesters)}</div>
              </div>
              <div className="text-lg text-gray-700 font-semibold">CGPA</div>
            </div>
          </div>
        </div>

        {/* Semester-wise Progress */}
        {selectedSemester ? (
          <SemesterDetails
            semester={selectedSemester}
            onBack={() => setSelectedSemester(null)}
            getGradeColor={getGradeColor}
            getGradeLetter={getGradeLetter}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {progressData.semesters.map((semester) => (
              <div
                key={semester.semester_id}
                className="group bg-white/80 backdrop-blur-sm rounded-xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer border border-white/50 overflow-hidden"
                onClick={() => setSelectedSemester(semester)}
              >
                <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 p-6 border-b border-indigo-200/50">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-indigo-900 mb-3">{semester.semester_name}</h3>
                    <p className="text-indigo-700 text-sm mb-2">Semester {semester.semester_sequence}</p>
                    <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-200/70 text-indigo-800 font-semibold text-xs mb-4 shadow-sm">
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {semester.courses.length} Course{semester.courses.length !== 1 ? 's' : ''}
                    </div>

                    <div className="mt-2">
                      <div className="mb-2">
                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-blue-800">{calculateSemesterGPA(semester.courses)}</div>
                      </div>
                      <div className="text-sm text-indigo-700 font-semibold">SGPA</div>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-center text-indigo-700 group-hover:text-indigo-800 transition-colors">
                    <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-sm font-semibold">Click to view details</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProgress;