import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InstitutionAnalytics = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedView, setSelectedView] = useState('overview');
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [fetchingPrograms, setFetchingPrograms] = useState(true);
  const [fetchingSemesters, setFetchingSemesters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const baseUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      fetchSemesters(selectedProgram);
    } else {
      setSemesters([]);
      setSelectedSemester('');
    }
  }, [selectedProgram]);

  useEffect(() => {
    if (selectedProgram && selectedSemester) {
      fetchAnalyticsData(selectedProgram, selectedSemester);
    } else {
      setStudentsData([]);
    }
  }, [selectedProgram, selectedSemester]);

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');
      const response = await axios.get(`${baseUrl}/api/programs/${institutionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPrograms(response.data);
    } catch (error) {
      console.error('Error fetching programs:', error);
      setPrograms([]);
    } finally {
      setFetchingPrograms(false);
    }
  };

  const fetchSemesters = async (programId) => {
    setFetchingSemesters(true);
    try {
      const token = localStorage.getItem('institutionToken');
      const response = await axios.get(`${baseUrl}/api/program-semesters/by-program/${programId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSemesters(response.data);
    } catch (error) {
      console.error('Error fetching semesters:', error);
      setSemesters([]);
    } finally {
      setFetchingSemesters(false);
    }
  };

  const fetchAnalyticsData = async (programId, semesterId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');
      const response = await axios.get(`${baseUrl}/api/course-students-marks/summary/by-program-semester/${programId}/${semesterId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudentsData(response.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setStudentsData([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateGradePoint = (marks) => {
    if (marks >= 91) return 10;
    if (marks >= 81) return 9;
    if (marks >= 71) return 8;
    if (marks >= 61) return 7;
    if (marks >= 51) return 6;
    if (marks >= 41) return 5;
    if (marks >= 35) return 4;
    return 0;
  };

  const getGradeLetter = (gradePoint) => {
    if (gradePoint === 10) return 'A+';
    if (gradePoint === 9) return 'A';
    if (gradePoint === 8) return 'B+';
    if (gradePoint === 7) return 'B';
    if (gradePoint === 6) return 'C+';
    if (gradePoint === 5) return 'C';
    if (gradePoint === 4) return 'D';
    return 'F';
  };

  const getGradeColor = (gradePoint) => {
    if (gradePoint >= 9) return 'text-green-600 bg-green-100';
    if (gradePoint >= 8) return 'text-blue-600 bg-blue-100';
    if (gradePoint >= 7) return 'text-yellow-600 bg-yellow-100';
    if (gradePoint >= 6) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getOverallStats = () => {
    const totalStudents = studentsData.length;
    const completedCourses = studentsData.flatMap(s => s.courses).filter(c => c.marks).length;
    const totalCourses = studentsData.flatMap(s => s.courses).length;
    const avgGradePoint = studentsData
      .flatMap(s => s.courses.filter(c => c.grade_point))
      .reduce((sum, c) => sum + c.grade_point, 0) /
      studentsData.flatMap(s => s.courses.filter(c => c.grade_point)).length || 0;

    return { totalStudents, completedCourses, totalCourses, avgGradePoint };
  };

  const filteredStudents = studentsData.filter(student =>
    student.student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (fetchingPrograms) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  const stats = getOverallStats();

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Student Analytics</h1>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
              >
                <option value="">Select Program</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.program_name} ({program.program_code})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                disabled={!selectedProgram || fetchingSemesters}
              >
                <option value="">
                  {fetchingSemesters ? 'Loading semesters...' : selectedProgram ? 'Select Semester' : 'Select Program first'}
                </option>
                {semesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.semester_name} (Seq - {semester.semester_sequence})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {selectedProgram && selectedSemester && loading && (
          <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          </div>
        )}

        {selectedProgram && selectedSemester && !loading && studentsData.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <p className="text-gray-500">No analytics data found for this program and semester.</p>
          </div>
        )}

        {selectedProgram && selectedSemester && !loading && studentsData.length > 0 && (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Total Students</h3>
                <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Courses Completed</h3>
                <div className="text-2xl font-bold text-green-600">{stats.completedCourses}</div>
                <div className="text-xs text-gray-500">out of {stats.totalCourses}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Completion Rate</h3>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((stats.completedCourses / stats.totalCourses) * 100)}%
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Average GPA</h3>
                <div className="text-2xl font-bold text-orange-600">{stats.avgGradePoint.toFixed(1)}</div>
              </div>
            </div>

            {/* View Toggle and Search */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setSelectedView('overview')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    selectedView === 'overview'
                      ? 'bg-white text-orange-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setSelectedView('detailed')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    selectedView === 'detailed'
                      ? 'bg-white text-orange-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Detailed Analysis
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search students..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {selectedView === 'overview' ? (
              /* Student Overview Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStudents.map((studentData) => {
                  const completedCourses = studentData.courses.filter(c => c.marks).length;
                  const totalCourses = studentData.courses.length;
                  const avgGrade = studentData.courses
                    .filter(c => c.grade_point)
                    .reduce((sum, c) => sum + c.grade_point, 0) /
                    studentData.courses.filter(c => c.grade_point).length || 0;
                  const progressPercent = Math.round((completedCourses / totalCourses) * 100);

                  return (
                    <div key={studentData.student.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100 relative">
                      <div className="absolute top-4 right-4">
                        <div className="text-sm font-bold text-blue-600">{completedCourses}/{totalCourses}</div>
                      </div>

                      <div className="pr-16">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{studentData.student.name}</h3>
                        <p className="text-sm text-gray-500 font-medium">{studentData.student.student_id}</p>
                      </div>

                      <div className="space-y-4 mt-4">

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Average GPA</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(Math.round(avgGrade))}`}>
                              {avgGrade.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Progress</span>
                            <span className="text-sm font-bold text-gray-900">{progressPercent}%</span>
                          </div>
                        </div>

                        {/* Enhanced Progress Bar */}
                        <div className="space-y-2">
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>0%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Detailed Analysis */
              <div className="space-y-6">
                {filteredStudents.map((studentData) => {
                  const completedCourses = studentData.courses.filter(c => c.marks).length;
                  const totalCourses = studentData.courses.length;
                  const avgGrade = studentData.courses
                    .filter(c => c.grade_point)
                    .reduce((sum, c) => sum + c.grade_point, 0) /
                    studentData.courses.filter(c => c.grade_point).length || 0;

                  return (
                    <div key={studentData.student.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">{studentData.student.name}</h2>
                            <p className="text-gray-600 font-medium">{studentData.student.student_id}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{avgGrade.toFixed(1)}</div>
                            <div className="text-sm text-gray-500">GPA</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">{completedCourses}/{totalCourses}</div>
                              <div className="text-xs text-gray-500">Courses</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">{Math.round((completedCourses/totalCourses)*100)}%</div>
                              <div className="text-xs text-gray-500">Complete</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4">

                        {/* Course Performance Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {studentData.courses.map((course) => (
                            <div key={course.course_id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <h3 className="font-bold text-gray-900 text-sm mb-1">{course.course_name}</h3>
                                  <p className="text-xs text-gray-500 font-medium">{course.course_code} • {course.credits} Credits</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ml-2 ${getGradeColor(course.grade_point)}`}>
                                  {course.grade_point !== null && course.grade_point !== undefined ? `${getGradeLetter(course.grade_point)} (${course.grade_point * course.credits})` : 'Pending'}
                                </span>
                              </div>

                              {course.marks ? (
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Total Score</span>
                                    <span className="font-bold text-lg text-gray-900">{course.total_marks}/100</span>
                                  </div>

                                  {/* Marks Breakdown */}
                                  <div className="space-y-1">
                                    {Object.entries(course.marks).map(([component, mark]) => {
                                      const weightage = course.weightage[component] || 0;
                                      const percentage = (mark / 100) * weightage;
                                      return (
                                        <div key={component} className="bg-white rounded p-2">
                                          <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium text-gray-600 capitalize">{component}</span>
                                            <span className="text-xs font-bold text-gray-900">{mark}/{weightage}</span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-3">
                                  <div className="text-gray-400 mb-1">
                                    <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </div>
                                  <div className="text-xs text-gray-500 font-medium">Marks not available</div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InstitutionAnalytics;