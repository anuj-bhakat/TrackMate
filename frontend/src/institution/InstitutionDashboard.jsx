import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InstitutionDashboard = () => {
  const [stats, setStats] = useState({
    totalPrograms: 0,
    totalSemesters: 0,
    totalCourses: 0,
    totalStudents: 0,
    totalFaculties: 0,
    totalGroups: 0,
    assignedStudents: 0,
    unassignedStudents: 0,
    coursesWithFaculty: 0,
    coursesWithoutFaculty: 0,
    activeGroups: 0,
    inactiveGroups: 0,
    facultyUtilization: 0
  });
  const [loading, setLoading] = useState(true);

  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');

      // Fetch all data in parallel
      const [
        programsRes,
        semestersRes,
        coursesRes,
        studentsRes,
        facultiesRes,
        groupsRes,
        studentDetailsRes
      ] = await Promise.all([
        axios.get(`${baseUrl}/api/programs/${institutionId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}/api/semesters/${institutionId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}/api/courses/institution/${institutionId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}/api/students/institution/${institutionId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}/api/faculties/institution/${institutionId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}/api/groups/institution/${institutionId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}/api/student-details/institution/${institutionId}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const programs = programsRes.data;
      const semesters = semestersRes.data;
      const courses = coursesRes.data;
      const students = studentsRes.data;
      const faculties = facultiesRes.data;
      const groups = groupsRes.data;
      const studentDetails = studentDetailsRes.data;

      // Calculate stats
      const assignedStudents = studentDetails.length;
      const unassignedStudents = students.length - assignedStudents;
      const coursesWithFaculty = courses.filter(course => course.assigned_faculty).length;
      const coursesWithoutFaculty = courses.length - coursesWithFaculty;
      const activeGroups = groups.filter(group => group.status === 'active' || !group.status).length;
      const inactiveGroups = groups.length - activeGroups;
      const facultyUtilization = faculties.length > 0 ? Math.round((coursesWithFaculty / courses.length) * 100) : 0;

      setStats({
        totalPrograms: programs.length,
        totalSemesters: semesters.length,
        totalCourses: courses.length,
        totalStudents: students.length,
        totalFaculties: faculties.length,
        totalGroups: groups.length,
        assignedStudents,
        unassignedStudents,
        coursesWithFaculty,
        coursesWithoutFaculty,
        activeGroups,
        inactiveGroups,
        facultyUtilization
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-black mb-3">
              Institution Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Comprehensive overview of your institution's operations and performance metrics.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-slate-50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-orange-600">{stats.totalPrograms}</div>
                    <div className="text-sm font-medium text-slate-600">Programs</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Academic Programs</p>
                  <p className="text-xs text-slate-500">Institution curriculum structure</p>
                </div>
                <div className="mt-4 flex items-center text-xs text-orange-600 font-medium">
                  <span>Active Programs</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-slate-50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-red-600">{stats.totalStudents}</div>
                    <div className="text-sm font-medium text-slate-600">Students</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Total Enrollment</p>
                  <p className="text-xs text-slate-500">Student population overview</p>
                </div>
                <div className="mt-4 flex items-center text-xs text-red-600 font-medium">
                  <span>Active Enrollment</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">{stats.totalFaculties}</div>
                    <div className="text-sm font-medium text-slate-600">Faculties</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Teaching Staff</p>
                  <p className="text-xs text-slate-500">Academic faculty members</p>
                </div>
                <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
                  <span>Active Faculty</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-slate-50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{stats.totalCourses}</div>
                    <div className="text-sm font-medium text-slate-600">Courses</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Academic Courses</p>
                  <p className="text-xs text-slate-500">Course offerings overview</p>
                </div>
                <div className="mt-4 flex items-center text-xs text-blue-600 font-medium">
                  <span>Available Courses</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Data Overview Cards */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-2xl shadow-xl border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Student Assignment Status</h2>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-green-50 rounded-xl border border-slate-200 hover:border-green-300 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-slate-700">Assigned Students</span>
                  </div>
                  <span className="text-green-600 font-bold text-lg">{stats.assignedStudents}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200 hover:border-gray-300 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-slate-700">Unassigned Students</span>
                  </div>
                  <span className="text-gray-600 font-bold text-lg">{stats.unassignedStudents}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl shadow-xl border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Course Faculty Assignment</h2>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-slate-700">Courses with Faculty</span>
                  </div>
                  <span className="text-purple-600 font-bold text-lg">{stats.coursesWithFaculty}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200 hover:border-gray-300 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-slate-700">Courses without Faculty</span>
                  </div>
                  <span className="text-gray-600 font-bold text-lg">{stats.coursesWithoutFaculty}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl shadow-xl border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">System Performance</h2>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-slate-700">Student Coverage</span>
                  </div>
                  <span className="text-blue-600 font-bold text-lg">
                    {stats.totalStudents > 0 ? Math.round((stats.assignedStudents / stats.totalStudents) * 100) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-slate-700">Course Coverage</span>
                  </div>
                  <span className="text-purple-600 font-bold text-lg">
                    {stats.totalCourses > 0 ? Math.round((stats.coursesWithFaculty / stats.totalCourses) * 100) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-orange-50 rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-slate-700">Group Activity</span>
                  </div>
                  <span className="text-orange-600 font-bold text-lg">
                    {stats.totalGroups > 0 ? Math.round((stats.activeGroups / stats.totalGroups) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionDashboard;