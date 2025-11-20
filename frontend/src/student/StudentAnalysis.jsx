import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentAnalysis = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('group'); // 'group' or 'course'
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('studentToken');
  const studentId = localStorage.getItem('studentId');

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!studentId || !token) {
        setError('Student not authenticated');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${baseUrl}/api/student-group-analytics/student-groups/${studentId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setAnalytics(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [baseUrl, token, studentId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'reviewed':
        return 'bg-green-100 text-green-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'not submitted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'reviewed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'submitted':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        );
      case 'not submitted':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const calculateOverallStats = () => {
    const totalMarks = analytics.reduce((sum, group) => sum + group.total_marks, 0);
    const maxTotal = analytics.reduce((sum, group) => sum + group.max_total, 0);
    const totalAssignments = analytics.reduce((sum, group) => sum + group.assignments.length, 0);
    const submittedAssignments = analytics.reduce((sum, group) =>
      sum + group.assignments.filter(assignment => assignment.status !== 'not submitted').length, 0
    );
    const reviewedAssignments = analytics.reduce((sum, group) =>
      sum + group.assignments.filter(assignment => assignment.status === 'reviewed').length, 0
    );

    return {
      totalMarks,
      maxTotal,
      totalAssignments,
      submittedAssignments,
      reviewedAssignments,
      overallPercentage: maxTotal > 0 ? ((totalMarks / maxTotal) * 100).toFixed(1) : 0
    };
  };

  const groupByCourse = () => {
    const courseMap = new Map();

    analytics.forEach(group => {
      const courseId = group.course?.id;
      if (!courseId) return;

      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          course: group.course,
          groups: [],
          total_marks: 0,
          max_total: 0,
          assignments: []
        });
      }

      const courseData = courseMap.get(courseId);
      courseData.groups.push(group);
      courseData.total_marks += group.total_marks;
      courseData.max_total += group.max_total;
      courseData.assignments.push(...group.assignments);
    });

    return Array.from(courseMap.values());
  };

  const CourseDetails = ({ courseData, onBack }) => (
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
          Back to Courses
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">{courseData.course.course_name}</h2>
          <p className="text-gray-600">{courseData.course.course_code}</p>
        </div>
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>

      {/* Course Summary */}
      <div className="bg-green-50 rounded-lg border border-green-200 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-green-900 mb-1">Course Performance</h3>
            <p className="text-green-700 text-sm">
              Program: {courseData.course.program_code} | Semester: {courseData.course.semester_code}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-900">{courseData.total_marks}/{courseData.max_total}</div>
            <div className="text-sm text-green-700">
              {courseData.max_total > 0 ? ((courseData.total_marks / courseData.max_total) * 100).toFixed(1) : 0}% Score
            </div>
          </div>
        </div>
      </div>

      {/* Groups in this course */}
      <div className="space-y-4">
        <h4 className="text-xl font-bold text-gray-900 mb-4">Groups in this Course</h4>
        <div className="grid gap-4 md:grid-cols-2">
          {courseData.groups.map((group) => (
            <div key={group.group_id} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h5 className="font-bold text-blue-900 mb-1">{group.group_name}</h5>
                  <p className="text-sm text-blue-700">Code: {group.group_code}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-900">{group.total_marks}/{group.max_total}</div>
                  <div className="text-xs text-blue-600">
                    {group.max_total > 0 ? ((group.total_marks / group.max_total) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${group.max_total > 0 ? ((group.total_marks / group.max_total) * 100) : 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assignments for this course */}
      <div className="space-y-4">
        {courseData.assignments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No assignments found for this course</p>
          </div>
        ) : (
          <>
            <h4 className="text-xl font-bold text-gray-900 mb-4">All Assignments</h4>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {courseData.assignments.map((assignment) => (
                <div key={assignment.assignment_id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="text-base font-bold text-gray-900 mb-2">
                        {assignment.assignment_name}
                      </h5>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                          {getStatusIcon(assignment.status)}
                          <span className="ml-1 capitalize">{assignment.status.replace('_', ' ')}</span>
                        </span>
                        {assignment.status === 'reviewed' && (
                          <span className="text-sm font-bold text-indigo-600">
                            {assignment.marks}/{assignment.max_marks}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const GroupDetails = ({ group, onBack }) => (
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
          Back to Groups
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">{group.group_name}</h2>
          <p className="text-gray-600">Group Code: {group.group_code}</p>
        </div>
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>

      {/* Group Summary */}
      <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-indigo-900 mb-1">Group Performance</h3>
            {group.course && (
              <p className="text-indigo-700 text-sm">{group.course.course_name} ({group.course.course_code})</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-900">{group.total_marks}/{group.max_total}</div>
            <div className="text-sm text-indigo-700">
              {group.max_total > 0 ? ((group.total_marks / group.max_total) * 100).toFixed(1) : 0}% Score
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Details */}
      <div className="space-y-4">
        {group.assignments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No assignments found for this group</p>
          </div>
        ) : (
          <>
            <h4 className="text-xl font-bold text-gray-900 mb-6">Assignment Details</h4>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {group.assignments.map((assignment) => (
                <div key={assignment.assignment_id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="text-base font-bold text-gray-900 mb-2">
                        {assignment.assignment_name}
                      </h5>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                          {getStatusIcon(assignment.status)}
                          <span className="ml-1 capitalize">{assignment.status.replace('_', ' ')}</span>
                        </span>
                        {assignment.status === 'reviewed' && (
                          <span className="text-sm font-bold text-indigo-600">
                            {assignment.marks}/{assignment.max_marks}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const stats = calculateOverallStats();

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Assignment Analysis
          </h1>

          {/* View Toggle */}
          <div className="flex justify-center">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('group')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'group'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Group-wise View
              </button>
              <button
                onClick={() => setViewMode('course')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'course'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Course-wise View
              </button>
            </div>
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Marks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMarks}/{stats.maxTotal}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overall Percentage</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overallPercentage}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Submitted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.submittedAssignments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Content */}
        {selectedGroup ? (
          <GroupDetails
            group={selectedGroup}
            onBack={() => setSelectedGroup(null)}
          />
        ) : selectedCourse ? (
          <CourseDetails
            courseData={selectedCourse}
            onBack={() => setSelectedCourse(null)}
          />
        ) : viewMode === 'group' ? (
          /* Group-wise Analysis */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {analytics.map((group) => (
              <div
                key={group.group_id}
                className="group bg-white/80 backdrop-blur-sm rounded-xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer border border-white/50 overflow-hidden"
                onClick={() => setSelectedGroup(group)}
              >
                <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 p-6 border-b border-indigo-200/50">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-indigo-900 mb-3">{group.group_name}</h3>
                    <p className="text-indigo-700 text-sm mb-2">Code: {group.group_code}</p>
                    {group.course && (
                      <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-200/70 text-indigo-800 font-semibold text-xs mb-3 shadow-sm">
                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {group.course.course_name}
                      </div>
                    )}

                    <div className="mt-2">
                      <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-blue-800 mb-1">{group.total_marks}/{group.max_total}</div>
                      <div className="text-sm text-indigo-700 font-semibold">
                        {group.max_total > 0 ? ((group.total_marks / group.max_total) * 100).toFixed(1) : 0}% Score
                      </div>
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
        ) : (
          /* Course-wise Analysis */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groupByCourse().map((courseData) => (
              <div
                key={courseData.course.id}
                className="group bg-white/80 backdrop-blur-sm rounded-xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer border border-white/50 overflow-hidden"
                onClick={() => setSelectedCourse(courseData)}
              >
                <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 p-4 border-b border-purple-200/50">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-purple-900 mb-2">{courseData.course.course_name}</h3>
                    <p className="text-purple-700 text-sm mb-2">{courseData.course.course_code}</p>
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-200/70 text-purple-800 font-medium text-xs mb-2 shadow-sm">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m0 0l-2-2m2 2l2-2m6-6v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2h8a2 2 0 012 2z" />
                      </svg>
                      {courseData.course.program_code} | Sem {courseData.course.semester_code}
                    </div>

                    <div className="mt-1">
                      <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-800 to-violet-800 mb-1">{courseData.total_marks}/{courseData.max_total}</div>
                      <div className="text-xs text-purple-700 font-semibold">
                        {courseData.max_total > 0 ? ((courseData.total_marks / courseData.max_total) * 100).toFixed(1) : 0}% Score
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="text-center text-purple-700 mb-2">
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-medium text-xs mb-1.5">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {courseData.groups.length} Group{courseData.groups.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">{courseData.assignments.length} Assignment{courseData.assignments.length !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="flex items-center justify-center text-purple-700 group-hover:text-purple-800 transition-colors">
                    <svg className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-sm font-medium">Click to view details</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {analytics.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No analytics data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAnalysis;