import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import FacultyPerformanceReport from './FacultyPerformanceReport';

const FacultyPerformance = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [showReportResults, setShowReportResults] = useState(false);
  const [reportFilters, setReportFilters] = useState({
    percentageMin: '',
    percentageMax: '',
    marksMin: '',
    marksMax: '',
    assignmentStatus: '',
    performanceCategory: ''
  });
  const [reportOptions, setReportOptions] = useState({
    includeStudentDetails: true,
    includeAssignmentBreakdown: true,
    includePerformanceTrends: false
  });
  const [filteredReportData, setFilteredReportData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem('facultyToken');
        const institutionId = localStorage.getItem('institutionId');
        const facultyId = localStorage.getItem('facultyId');

        if (!token || !institutionId || !facultyId) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${baseUrl}/api/groups/faculty/${facultyId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Institution-Id': institutionId
          }
        });

        setGroups(response.data);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setError(error.response?.data?.message || 'Failed to load groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleViewGroupPerformance = async (group) => {
    setPerformanceLoading(true);
    try {
      const token = localStorage.getItem('facultyToken');
      const institutionId = localStorage.getItem('institutionId');

      const baseUrl = import.meta.env.VITE_API_URL;

      // Fetch both group details and analytics in parallel
      const [studentsResponse, analyticsResponse] = await Promise.all([
        axios.get(`${baseUrl}/api/group-details/group/${group.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Institution-Id': institutionId
          }
        }),
        axios.get(`${baseUrl}/api/group-analytics/group-summary/${group.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Institution-Id': institutionId
          }
        })
      ]);

      // Combine student details with analytics data
      const studentsWithAnalytics = studentsResponse.data.map(student => {
        const analytics = analyticsResponse.data.find(
          a => a.student_id === student.student_details?.students?.student_id
        );
        return {
          ...student,
          analytics: analytics || null
        };
      });

      setStudents(studentsWithAnalytics);
      setSelectedGroup(group);
    } catch (error) {
      console.error('Error fetching group performance:', error);
      setError(error.response?.data?.message || 'Failed to load group performance');
    } finally {
      setPerformanceLoading(false);
    }
  };

  const handleViewStudentDetails = (student) => {
    setSelectedStudent(student);
  };

  const handleBackToGroupPerformance = () => {
    setSelectedStudent(null);
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setSelectedStudent(null);
    setStudents([]);
  };

  const handleGenerateReport = () => {
    setShowReportGenerator(true);
  };

  const handleBackToPerformance = () => {
    setShowReportGenerator(false);
    setShowReportResults(false);
  };

  const handleGenerateReportSubmit = () => {
    // Apply filters to students data
    let filtered = [...students];

    // Percentage filter
    if (reportFilters.percentageMin !== '') {
      const min = parseFloat(reportFilters.percentageMin);
      filtered = filtered.filter(student => {
        const analytics = student.analytics;
        const totalMarks = analytics?.total_marks || 0;
        const maxMarks = analytics?.max_total || 0;
        const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100) : 0;
        return percentage >= min;
      });
    }

    if (reportFilters.percentageMax !== '') {
      const max = parseFloat(reportFilters.percentageMax);
      filtered = filtered.filter(student => {
        const analytics = student.analytics;
        const totalMarks = analytics?.total_marks || 0;
        const maxMarks = analytics?.max_total || 0;
        const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100) : 0;
        return percentage <= max;
      });
    }

    // Marks filter
    if (reportFilters.marksMin !== '') {
      const min = parseFloat(reportFilters.marksMin);
      filtered = filtered.filter(student => (student.analytics?.total_marks || 0) >= min);
    }

    if (reportFilters.marksMax !== '') {
      const max = parseFloat(reportFilters.marksMax);
      filtered = filtered.filter(student => (student.analytics?.total_marks || 0) <= max);
    }

    // Assignment status filter
    if (reportFilters.assignmentStatus) {
      filtered = filtered.filter(student => {
        const assignments = student.analytics?.assignments || [];
        if (reportFilters.assignmentStatus === 'reviewed') {
          return assignments.some(a => a.status === 'reviewed');
        } else if (reportFilters.assignmentStatus === 'submitted') {
          return assignments.some(a => a.status === 'submitted');
        } else if (reportFilters.assignmentStatus === 'not_submitted') {
          return assignments.some(a => a.status === 'not submitted');
        }
        return true;
      });
    }

    // Performance category filter
    if (reportFilters.performanceCategory) {
      filtered = filtered.filter(student => {
        const analytics = student.analytics;
        const totalMarks = analytics?.total_marks || 0;
        const maxMarks = analytics?.max_total || 0;
        const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100) : 0;

        switch (reportFilters.performanceCategory) {
          case 'excellent':
            return percentage >= 90;
          case 'good':
            return percentage >= 80 && percentage < 90;
          case 'average':
            return percentage >= 70 && percentage < 80;
          case 'below_average':
            return percentage >= 60 && percentage < 70;
          case 'poor':
            return percentage < 60;
          default:
            return true;
        }
      });
    }

    setFilteredReportData(filtered);
    setShowReportGenerator(false);
    setShowReportResults(true);
  };

  if (loading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading performance data...</p>
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
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Performance Data</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (showReportGenerator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Generate Performance Report
                </h1>
                <p className="text-gray-600">Create detailed performance analysis reports with custom filters</p>
              </div>
            </div>
            <button
              onClick={handleBackToPerformance}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Performance
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 backdrop-blur-sm">
            <style jsx>{`
              input[type="number"]::-webkit-outer-spin-button,
              input[type="number"]::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
              }
              input[type="number"] {
                -moz-appearance: textfield;
              }
            `}</style>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Report Filters
              </h2>
              <p className="text-gray-600">Customize your report by setting specific criteria below</p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {/* Percentage Range */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <label className="block text-sm font-semibold text-blue-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Percentage Range (%)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Min"
                    value={reportFilters.percentageMin}
                    onChange={(e) => setReportFilters({...reportFilters, percentageMin: e.target.value})}
                    className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    style={{
                      WebkitAppearance: 'textfield',
                      MozAppearance: 'textfield'
                    }}
                    onWheel={(e) => e.target.blur()}
                  />
                  <span className="flex items-center text-sm text-blue-600 font-medium">to</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Max"
                    value={reportFilters.percentageMax}
                    onChange={(e) => setReportFilters({...reportFilters, percentageMax: e.target.value})}
                    className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    style={{
                      WebkitAppearance: 'textfield',
                      MozAppearance: 'textfield'
                    }}
                    onWheel={(e) => e.target.blur()}
                  />
                </div>
              </div>

              {/* Marks Range */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <label className="block text-sm font-semibold text-green-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  Marks Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={reportFilters.marksMin}
                    onChange={(e) => setReportFilters({...reportFilters, marksMin: e.target.value})}
                    className="w-16 px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    style={{
                      WebkitAppearance: 'textfield',
                      MozAppearance: 'textfield'
                    }}
                    onWheel={(e) => e.target.blur()}
                  />
                  <span className="flex items-center text-sm text-green-600 font-medium">to</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={reportFilters.marksMax}
                    onChange={(e) => setReportFilters({...reportFilters, marksMax: e.target.value})}
                    className="w-16 px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    style={{
                      WebkitAppearance: 'textfield',
                      MozAppearance: 'textfield'
                    }}
                    onWheel={(e) => e.target.blur()}
                  />
                </div>
              </div>

              {/* Assignment Status */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                <label className="block text-sm font-semibold text-purple-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Assignment Status
                </label>
                <select
                  value={reportFilters.assignmentStatus}
                  onChange={(e) => setReportFilters({...reportFilters, assignmentStatus: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                >
                  <option value="">All Assignments</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="submitted">Submitted</option>
                  <option value="not_submitted">Not Submitted</option>
                </select>
              </div>

              {/* Performance Category */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
                <label className="block text-sm font-semibold text-amber-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Performance Category
                </label>
                <select
                  value={reportFilters.performanceCategory}
                  onChange={(e) => setReportFilters({...reportFilters, performanceCategory: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                >
                  <option value="">All Categories</option>
                  <option value="excellent">Excellent (90-100%)</option>
                  <option value="good">Good (80-89%)</option>
                  <option value="average">Average (70-79%)</option>
                  <option value="below_average">Below Average (60-69%)</option>
                  <option value="poor">Poor (0-59%)</option>
                </select>
              </div>
            </div>

            {/* Report Options */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Report Options
              </h3>
              <p className="text-gray-600 mb-4">Choose what information to include in your report</p>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reportOptions.includeStudentDetails}
                    onChange={(e) => setReportOptions({...reportOptions, includeStudentDetails: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Student Details</span>
                    <p className="text-xs text-gray-600">Include personal information and IDs</p>
                  </div>
                </label>
                <label className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reportOptions.includeAssignmentBreakdown}
                    onChange={(e) => setReportOptions({...reportOptions, includeAssignmentBreakdown: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Assignment Breakdown</span>
                    <p className="text-xs text-gray-600">Detailed assignment performance data</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleBackToPerformance}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateReportSubmit}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showReportResults) {
    return (
      <FacultyPerformanceReport
        filteredReportData={filteredReportData}
        reportOptions={reportOptions}
        selectedGroup={selectedGroup}
        onModifyFilters={() => {
          setShowReportResults(false);
          setShowReportGenerator(true);
        }}
        onBackToPerformance={handleBackToPerformance}
      />
    );
  }

  if (selectedStudent) {
    const analytics = selectedStudent.analytics;
    const totalMarks = analytics?.total_marks || 0;
    const maxMarks = analytics?.max_total || 0;
    const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(1) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedStudent.student_details?.students?.name || 'N/A'}
                  </h1>
                  <p className="text-base text-gray-600">
                    Student ID: {selectedStudent.student_details?.students?.student_id || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Username: {selectedStudent.student_details?.students?.username || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 mb-1">{percentage}%</div>
                <p className="text-sm text-gray-600">Overall Performance</p>
                <button
                  onClick={handleBackToGroupPerformance}
                  className="mt-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-5 py-2.5 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Group
                </button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Enhanced Student Overview */}
            <div className="lg:col-span-1 space-y-6">
              {/* Performance Summary Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Performance Summary
                </h3>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">Total Marks</p>
                        <p className="text-xl font-bold text-green-600">{totalMarks}/{maxMarks}</p>
                      </div>
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-800">Assignments Completed</p>
                        <p className="text-xl font-bold text-blue-600">
                          {analytics?.assignments?.filter(a => a.status === 'reviewed').length || 0}/{analytics?.assignments?.length || 0}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-800">Completion Rate</p>
                        <p className="text-xl font-bold text-purple-600">
                          {analytics?.assignments?.length > 0 ? Math.round((analytics.assignments.filter(a => a.status === 'reviewed').length / analytics.assignments.length) * 100) : 0}%
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Enhanced Assignments Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3">
                  <h2 className="text-lg font-bold text-white flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Assignment Performance
                  </h2>
                </div>
                <div className="p-5">
                  {analytics?.assignments && analytics.assignments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {analytics.assignments.map((assignment, idx) => (
                        <div key={idx} className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-3 border border-slate-200 hover:shadow-lg transition-all duration-300 hover:transform hover:scale-102">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${
                                assignment.status === 'reviewed' ? 'bg-green-500' :
                                assignment.status === 'submitted' ? 'bg-blue-500' :
                                'bg-gray-500'
                              }`}></div>
                              <h4 className="text-sm font-semibold text-gray-900 flex-1 truncate">
                                {assignment.assignment_name}
                              </h4>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-xs">
                                <div className="flex items-center space-x-1">
                                  <span className="text-gray-600">marks</span>
                                  <span className="font-bold text-green-600">{assignment.marks}</span>
                                </div>
                              </div>
                              <div>
                                {assignment.status === 'reviewed' && (
                                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                )}
                                {assignment.status === 'submitted' && (
                                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                )}
                                {assignment.status === 'not submitted' && (
                                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments Found</h3>
                      <p className="text-gray-600">This student has no assignments in this group yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.student_details?.students?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_details?.students?.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedGroup) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {performanceLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-600 mx-auto"></div>
              <p className="mt-3 text-lg text-gray-600">Loading group performance data...</p>
              <p className="text-sm text-gray-500">This may take a few seconds</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Group Performance: {selectedGroup.group_name}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Performance analysis for {selectedGroup.group_code} - {selectedGroup.courses?.course_code}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleGenerateReport}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generate Report
                  </button>
                  <button
                    onClick={handleBackToGroups}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors duration-200 flex items-center text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Groups
                  </button>
                </div>
              </div>

              {students.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Students Found</h3>
                  <p className="text-gray-600">This group has no students assigned yet.</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Students Match Search</h3>
                  <p className="text-gray-600">Try adjusting your search terms or clear the search to see all students.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Group Overview Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Total Students Card */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition duration-300"></div>
                      <div className="relative bg-slate-50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-blue-600">{students.length}</div>
                            <div className="text-sm font-medium text-slate-600">Total Students</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">Students Enrolled</p>
                          <p className="text-xs text-slate-500">Active participants in this group</p>
                          <p className="text-xs text-slate-500">All enrolled students</p>
                        </div>
                        <div className="mt-2 flex items-center text-xs text-blue-600 font-medium">
                        </div>
                      </div>
                    </div>

                    {/* Average Performance Card */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition duration-300"></div>
                      <div className="relative bg-slate-50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-purple-600">
                              {students.length > 0 ? ((students.reduce((sum, student) => sum + (student.analytics?.total_marks || 0), 0) / students.length / (students[0]?.analytics?.max_total || 1)) * 100).toFixed(1) : 0}%
                            </div>
                            <div className="text-sm font-medium text-slate-600">Class Average</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">Overall Performance</p>
                          <p className="text-xs text-slate-500">Average score across all assignments</p>
                        </div>
                        <div className="mt-4">
                          {(() => {
                            const avg = students.length > 0 ? ((students.reduce((sum, student) => sum + (student.analytics?.total_marks || 0), 0) / students.length / (students[0]?.analytics?.max_total || 1)) * 100) : 0;
                            let color = 'bg-red-500';
                            if (avg >= 90) color = 'bg-green-500';
                            else if (avg >= 80) color = 'bg-blue-500';
                            else if (avg >= 70) color = 'bg-yellow-500';
                            else if (avg >= 60) color = 'bg-orange-500';

                            return (
                              <div className="flex items-center space-x-2">
                                <div className="w-full bg-purple-200 rounded-full h-2">
                                  <div
                                    className={`${color} h-2 rounded-full transition-all duration-500`}
                                    style={{ width: `${avg}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-purple-600 font-bold">
                                  {avg >= 90 ? 'Excellent' : avg >= 80 ? 'Good' : avg >= 70 ? 'Average' : avg >= 60 ? 'Below Avg' : 'Poor'}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Assignments Completed Card */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition duration-300"></div>
                      <div className="relative bg-slate-50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-green-600">
                              {(() => {
                                const totalReviewed = students.reduce((sum, student) => sum + (student.analytics?.assignments?.filter(a => a.status === 'reviewed').length || 0), 0);
                                return totalReviewed;
                              })()}
                            </div>
                            <div className="text-sm font-medium text-slate-600">Assignments Graded</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">Review Progress</p>
                          <p className="text-xs text-slate-500">Completed assignment evaluations</p>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-full bg-green-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${(() => {
                                    const totalReviewed = students.reduce((sum, student) => sum + (student.analytics?.assignments?.filter(a => a.status === 'reviewed').length || 0), 0);
                                    const totalAssignments = students.reduce((sum, student) => sum + (student.analytics?.assignments?.length || 0), 0);
                                    return totalAssignments > 0 ? (totalReviewed / totalAssignments) * 100 : 0;
                                  })()}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-green-600 font-bold">
                              {(() => {
                                const totalReviewed = students.reduce((sum, student) => sum + (student.analytics?.assignments?.filter(a => a.status === 'reviewed').length || 0), 0);
                                const totalAssignments = students.reduce((sum, student) => sum + (student.analytics?.assignments?.length || 0), 0);
                                return totalAssignments > 0 ? `${Math.round((totalReviewed / totalAssignments) * 100)}%` : '0%';
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Distribution Card */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition duration-300"></div>
                      <div className="relative bg-slate-50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-amber-600">
                              {(() => {
                                const excellentCount = students.filter(student => {
                                  const analytics = student.analytics;
                                  const totalMarks = analytics?.total_marks || 0;
                                  const maxMarks = analytics?.max_total || 0;
                                  const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100) : 0;
                                  return percentage >= 90;
                                }).length;
                                return excellentCount;
                              })()}
                            </div>
                            <div className="text-sm font-medium text-slate-600">Top Performers</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">Excellence Rate (≥90%)</p>
                          <p className="text-xs text-slate-500">Students achieving outstanding results</p>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-full bg-amber-200 rounded-full h-2">
                              <div
                                className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${(() => {
                                    const excellentCount = students.filter(student => {
                                      const analytics = student.analytics;
                                      const totalMarks = analytics?.total_marks || 0;
                                      const maxMarks = analytics?.max_total || 0;
                                      const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100) : 0;
                                      return percentage >= 90;
                                    }).length;
                                    return students.length > 0 ? (excellentCount / students.length) * 100 : 0;
                                  })()}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-amber-600 font-bold">
                              {(() => {
                                const excellentCount = students.filter(student => {
                                  const analytics = student.analytics;
                                  const totalMarks = analytics?.total_marks || 0;
                                  const maxMarks = analytics?.max_total || 0;
                                  const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100) : 0;
                                  return percentage >= 90;
                                }).length;
                                return students.length > 0 ? `${Math.round((excellentCount / students.length) * 100)}%` : '0%';
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Search and Filter */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 max-w-md">
                        <label htmlFor="student-search" className="block text-sm font-medium text-gray-700 mb-1">
                          Search Students
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="student-search"
                            placeholder="Search by name or student ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Showing {filteredStudents.length} of {students.length} students
                      </div>
                    </div>
                  </div>

                  {/* Student Performance Cards */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredStudents.map((student) => {
                      const analytics = student.analytics;
                      const totalMarks = analytics?.total_marks || 0;
                      const maxMarks = analytics?.max_total || 0;
                      const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(1) : 0;
                      const completedAssignments = analytics?.assignments?.filter(a => a.status === 'reviewed').length || 0;
                      const totalAssignments = analytics?.assignments?.length || 0;
                      
                      // Performance category with colors
                      const getPerformanceInfo = (percentage) => {
                        if (percentage >= 90) return { category: 'Excellent', color: 'from-green-100 to-green-200', solidColor: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
                        if (percentage >= 80) return { category: 'Good', color: 'from-blue-100 to-blue-200', solidColor: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
                        if (percentage >= 70) return { category: 'Average', color: 'from-yellow-100 to-yellow-200', solidColor: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
                        if (percentage >= 60) return { category: 'Below Avg', color: 'from-orange-100 to-orange-200', solidColor: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
                        return { category: 'Poor', color: 'from-red-100 to-red-200', solidColor: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
                      };
                      
                      const performanceInfo = getPerformanceInfo(parseFloat(percentage));

                      return (
                        <div
                          key={student.id}
                          className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-102 hover:-translate-y-0.5"
                          onClick={() => handleViewStudentDetails(student)}
                        >
                          {/* Header with student avatar and performance badge */}
                          <div className="bg-white p-4 text-gray-800 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base font-bold truncate text-gray-800">
                                    {student.student_details?.students?.name || 'N/A'}
                                  </h3>
                                  <p className="text-sm text-gray-600 truncate">
                                    {student.student_details?.students?.student_id || 'N/A'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`${performanceInfo.bgColor} rounded-lg px-3 py-1 border ${performanceInfo.borderColor}`}>
                                  <div className={`text-2xl font-bold ${performanceInfo.textColor}`}>{percentage}%</div>
                                  <div className="text-xs text-gray-600">{performanceInfo.category}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-4 space-y-4">
                            {/* Performance Progress Bar */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Overall Progress</span>
                                <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                  className={`${performanceInfo.solidColor} h-3 rounded-full transition-all duration-500 ease-out`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                              {/* Total Marks */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium text-gray-600">Total Marks</p>
                                  <p className="text-lg font-bold text-green-600">{totalMarks}/{maxMarks}</p>
                                </div>
                              </div>

                              {/* Assignments */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium text-gray-600">Assignments</p>
                                  <p className="text-lg font-bold text-blue-700">{completedAssignments}/{totalAssignments}</p>
                                  <p className="text-xs text-blue-600">completed</p>
                                </div>
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="pt-2 border-t border-gray-100">
                              <button className="w-full bg-blue-50 text-blue-700 font-medium py-2 px-4 rounded-lg hover:bg-blue-100 transition-all duration-200 flex items-center justify-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>View Details</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Filter groups based on selected course
  const filteredGroups = groups.filter(group => !selectedCourse || group.course_refer_id === selectedCourse);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-black mb-3">
              Performance Analysis
            </h1>
          </div>

        <div className="mb-10">
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Course
            </label>
            <div className="relative inline-block w-full max-w-md" ref={dropdownRef}>
              <div
                className="relative block w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 ease-in-out cursor-pointer shadow-sm"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className={selectedCourse ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedCourse ? (() => {
                    const group = groups.find(g => g.course_refer_id === selectedCourse);
                    return group?.courses?.course_code || selectedCourse;
                  })() : 'All Courses'}
                </span>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 border border-gray-200 overflow-auto focus:outline-none">
                  <div
                    className={`cursor-pointer select-none relative py-3 pl-4 pr-9 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-150 ${
                      !selectedCourse ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-900'
                    }`}
                    onClick={() => {
                      setSelectedCourse('');
                      setIsDropdownOpen(false);
                    }}
                  >
                    <span className="block truncate">All Courses</span>
                    {!selectedCourse && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className="h-4 w-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {[...new Set(groups.map(group => group.course_refer_id))].map((courseId) => {
                    const group = groups.find(g => g.course_refer_id === courseId);
                    const courseCode = group?.courses?.course_code || courseId;
                    const isSelected = selectedCourse === courseId;

                    return (
                      <div
                        key={courseId}
                        className={`cursor-pointer select-none relative py-3 pl-4 pr-9 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-150 ${
                          isSelected ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-900'
                        }`}
                        onClick={() => {
                          setSelectedCourse(courseId);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <span className="block truncate">{courseCode}</span>
                        {isSelected && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg className="h-4 w-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Groups Found</h3>
            <p className="text-gray-600">
              {selectedCourse ? 'No groups found for the selected course.' : "You don't have any student groups assigned yet."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <div key={group.id} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl blur-lg opacity-15 group-hover:opacity-25 transition duration-300"></div>
                <div className="relative bg-slate-50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">{group.group_code}</div>
                      <div className="text-sm font-medium text-slate-600">Group Code</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900 text-lg group-hover:text-orange-900 transition-colors">{group.group_name}</h3>
                    <p className="text-sm text-slate-500">Course: {group.courses?.course_code || 'N/A'}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => handleViewGroupPerformance(group)}
                      disabled={performanceLoading}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      {performanceLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          View Performance
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default FacultyPerformance;