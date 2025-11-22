import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StudentNavbar from './StudentNavbar';
import StudentAssignments from './StudentAssignments';
import StudentAnalysis from './StudentAnalysis';
import StudentProgress from './StudentProgress';

const StudentHome = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = import.meta.env.VITE_API_URL;
  const studentId = localStorage.getItem('studentId');
  const token = localStorage.getItem('studentToken');

  useEffect(() => {
    // Check if studentToken exists, if not redirect to login
    const token = localStorage.getItem('studentToken');
    if (!token) {
      navigate('/student-login');
      return;
    }

    // Fetch dashboard data from both Progress and Analysis APIs
    const fetchDashboardData = async () => {
      if (!studentId || !token) {
        setLoading(false);
        return;
      }

      try {
        const [progressResponse, analyticsResponse] = await Promise.all([
          axios.get(`${baseUrl}/api/course-students-marks/summary/by-student/${studentId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${baseUrl}/api/student-group-analytics/student-groups/${studentId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        ]);

        setDashboardData({
          progress: progressResponse.data,
          analytics: analyticsResponse.data
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, baseUrl, studentId, token]);

  const renderContent = () => {
    switch (activeTab) {
      case 'assignments':
        return <StudentAssignments />;
      case 'analysis':
        return <StudentAnalysis />;
      case 'progress':
        return <StudentProgress />;
      default:
        return (
          <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Header Section */}
              <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-black mb-3">
                  Student Dashboard
                </h1>
                <p className="text-lg text-gray-600">
                  Welcome back! Here's your academic overview.
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <>
                  {/* Statistics Cards */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition duration-300"></div>
                      <div className="relative bg-slate-50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-blue-600">
                              {dashboardData?.progress && (() => {
                                const semesters = dashboardData.progress.semesters || [];
                                const totalCourses = semesters.reduce((sum, sem) => sum + sem.courses.length, 0);
                                const gradedCourses = semesters.reduce((sum, sem) =>
                                  sum + sem.courses.filter(course => course.grade_point !== null).length, 0
                                );
                                return totalCourses > 0 ? Math.round((gradedCourses / totalCourses) * 100) : 0;
                              })()}%
                            </div>
                            <div className="text-sm font-medium text-slate-600">Progress</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">Academic Progress</p>
                          <p className="text-xs text-slate-500">Track your grades and completion</p>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-blue-600 font-medium">
                          <span>Overall Completion</span>
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition duration-300"></div>
                      <div className="relative bg-slate-50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-green-600">{dashboardData?.analytics?.length || 0}</div>
                            <div className="text-sm font-medium text-slate-600">Groups</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">Active Groups</p>
                          <p className="text-xs text-slate-500">Current course groups enrolled</p>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
                          <span>Enrolled Groups</span>
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition duration-300"></div>
                      <div className="relative bg-slate-50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-purple-600">
                              {dashboardData?.progress && (() => {
                                const semesters = dashboardData.progress.semesters || [];
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

                                return totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : '0.00';
                              })()}
                            </div>
                            <div className="text-sm font-medium text-slate-600">CGPA</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">Current GPA</p>
                          <p className="text-xs text-slate-500">Cumulative grade point average</p>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-purple-600 font-medium">
                          <span>Academic Performance</span>
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Assignment Analytics Card */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition duration-300"></div>
                      <div className="relative bg-slate-50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-orange-600">
                              {dashboardData?.analytics && (() => {
                                const totalMarks = dashboardData.analytics.reduce((sum, group) => sum + group.total_marks, 0);
                                const maxTotal = dashboardData.analytics.reduce((sum, group) => sum + group.max_total, 0);
                                return maxTotal > 0 ? ((totalMarks / maxTotal) * 100).toFixed(1) : 0;
                              })()}%
                            </div>
                            <div className="text-sm font-medium text-slate-600">Assignment Score</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">Assignment Performance</p>
                          <p className="text-xs text-slate-500">Overall assignment completion</p>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-orange-600 font-medium">
                          <span>Assignment Analytics</span>
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assignment Statistics Row */}
                  <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {dashboardData?.analytics ? dashboardData.analytics.reduce((sum, group) => sum + group.assignments.length, 0) : 0}
                          </p>
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
                          <p className="text-sm font-medium text-gray-600">Submitted</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {dashboardData?.analytics ? dashboardData.analytics.reduce((sum, group) =>
                              sum + group.assignments.filter(assignment => assignment.status !== 'not submitted').length, 0
                            ) : 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Reviewed</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {dashboardData?.analytics ? dashboardData.analytics.reduce((sum, group) =>
                              sum + group.assignments.filter(assignment => assignment.status === 'reviewed').length, 0
                            ) : 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-slate-50 rounded-2xl shadow-xl border border-slate-200 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-slate-800">Quick Actions</h2>
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <button
                        onClick={() => setActiveTab('assignments')}
                        className="group relative p-6 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mr-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-slate-900 text-lg group-hover:text-indigo-900 transition-colors">View Assignments</p>
                            <p className="text-sm text-slate-500 mt-1">Check pending tasks and submissions</p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('progress')}
                        className="group relative p-6 bg-gradient-to-r from-slate-50 to-green-50 rounded-xl border border-slate-200 hover:border-green-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mr-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-slate-900 text-lg group-hover:text-green-900 transition-colors">Academic Progress</p>
                            <p className="text-sm text-slate-500 mt-1">View detailed grades and performance</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <StudentNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderContent()}
    </div>
  );
};

export default StudentHome;