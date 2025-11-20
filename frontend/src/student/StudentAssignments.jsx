import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentAssignmentSubmission from './StudentAssignmentSubmission';

const StudentAssignments = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [showAssignments, setShowAssignments] = useState(false);
  const [view, setView] = useState('groups'); // 'groups', 'assignments', 'assignment-details', or 'submit-assignment'
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const baseUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('studentToken');
  const studentId = localStorage.getItem('studentId');

  useEffect(() => {
    const fetchGroups = async () => {
      if (!studentId || !token) {
        setError('Student not authenticated');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${baseUrl}/api/group-details/student-groups/${studentId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setGroups(response.data);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setError('Failed to load groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [baseUrl, token, studentId]);

  const fetchAssignments = async (groupId) => {
    setAssignmentsLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/api/assignments/group/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAssignments(response.data);
      setShowAssignments(true);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError('Failed to load assignments');
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const handleViewAssignments = (group) => {
    setSelectedGroup(group);
    setView('assignments');
    fetchAssignments(group.id);
  };

  const handleBackToGroups = () => {
    setView('groups');
    setSelectedGroup(null);
    setAssignments([]);
    setSelectedAssignment(null);
  };

  const handleViewAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setView('assignment-details');
  };

  const handleBackToAssignments = () => {
    setView('assignments');
    setSelectedAssignment(null);
  };

  const handleDeleteSubmission = async (submissionId) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      await axios.delete(`${baseUrl}/api/assignment-submissions/${submissionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Refresh submissions
      fetchSubmissions();
      alert('Submission deleted successfully');
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Failed to delete submission');
    }
  };


  const handleSubmitAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setView('submit-assignment');
  };

  const fetchSubmissions = async () => {
    if (!studentId || !token) return;

    try {
      const response = await axios.get(`${baseUrl}/api/assignment-submissions/student/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  useEffect(() => {
    if (view === 'assignments' && selectedGroup) {
      fetchSubmissions();
    }
  }, [view, selectedGroup, studentId, token, baseUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-16">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Something went wrong</h2>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  // Group by course
  const groupedByCourse = groups.reduce((acc, group) => {
    const courseId = group.groups.courses.id;
    if (!acc[courseId]) {
      acc[courseId] = {
        course: group.groups.courses,
        groups: []
      };
    }
    acc[courseId].groups.push(group.groups);
    return acc;
  }, {});

  // Check if assignment is submitted
  const isAssignmentSubmitted = (assignmentId) => {
    return submissions.some(submission => submission.assignment_refer_id === assignmentId);
  };

  // Get submission for assignment
  const getSubmissionForAssignment = (assignmentId) => {
    return submissions.find(submission => submission.assignment_refer_id === assignmentId);
  };

  // Filter courses and groups based on search term
  const filteredCourses = Object.values(groupedByCourse).filter((courseData) => {
    const courseMatches = courseData.course.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         courseData.course.course_code?.toLowerCase().includes(searchTerm.toLowerCase());

    const groupMatches = courseData.groups.some(group =>
      group.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.group_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return courseMatches || groupMatches;
  });

  if (view === 'assignment-details' && selectedAssignment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <button
                onClick={handleBackToAssignments}
                className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors duration-200 mb-6"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Assignments
              </button>

              {/* Professional Header Card */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">
                          {selectedAssignment.assignment_name}
                        </h1>
                        <p className="text-sm text-gray-600">Assignment Details</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="font-medium text-gray-700 text-sm">Assigned:</span>
                        <span className="text-sm font-semibold text-gray-800">
                          {new Date(selectedAssignment.assigned_on).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} {new Date(selectedAssignment.assigned_on).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <svg className={`w-4 h-4 ${
                          new Date(selectedAssignment.due) < new Date() ? 'text-red-600' : 'text-green-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={`font-medium text-sm ${
                          new Date(selectedAssignment.due) < new Date() ? 'text-red-700' : 'text-green-700'
                        }`}>
                          {new Date(selectedAssignment.due) < new Date() ? 'Deadline Passed:' : 'Due:'}
                        </span>
                        <span className={`text-sm font-semibold ${
                          new Date(selectedAssignment.due) < new Date() ? 'text-red-800' : 'text-green-800'
                        }`}>
                          {new Date(selectedAssignment.due).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} {new Date(selectedAssignment.due).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:ml-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-sm font-medium text-gray-700">Total Marks</div>
                      <div className="text-2xl font-bold text-gray-900">{selectedAssignment.marks || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 gap-8">
              {/* Main Content - Full Width */}
              <div className="space-y-8">
                {/* Description Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Assignment Description</h3>
                      <p className="text-gray-600 font-medium">Read the requirements carefully</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <p className="text-gray-700 leading-relaxed text-lg font-medium">{selectedAssignment.assignment_desc}</p>
                  </div>
                </div>

                {/* Attachments Section */}
                {selectedAssignment.attachments && Object.keys(selectedAssignment.attachments).length > 0 && (
                  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-sm">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a2 2 0 00-2.828-2.828z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2.25A6.988 6.988 0 005 9v9a3 3 0 006 0V9a.75.75 0 011.5 0v9a4.5 4.5 0 01-9 0V9c0-2.21 1.79-4 4-4s4 1.79 4 4v9a.75.75 0 001.5 0V9c0-2.21 1.79-4 4-4s4 1.79 4 4v9a3 3 0 01-6 0V9a.75.75 0 011.5 0v9a4.5 4.5 0 01-9 0V9z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Attachments & Resources</h3>
                          <p className="text-gray-600 text-xs">Supporting materials</p>
                        </div>
                      </div>
                      <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold">
                        {Object.keys(selectedAssignment.attachments).length} file{Object.keys(selectedAssignment.attachments).length > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {Object.entries(selectedAssignment.attachments).map(([filename, url]) => (
                        <a
                          key={filename}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group bg-gray-50 p-2 rounded border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-white rounded flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow border border-gray-200">
                              <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-gray-800 transition-colors">{filename}</p>
                            </div>
                            <svg className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submission Details Section */}
                {(() => {
                  const submission = getSubmissionForAssignment(selectedAssignment.id);
                  if (submission) {
                    return (
                      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center shadow-sm">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-1 sm:space-y-0">
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-semibold text-gray-700">Submitted:</span>
                                <span className="text-base font-medium text-gray-800">
                                  {new Date(submission.submitted_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} {new Date(submission.submitted_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                </span>
                              </div>
                              {submission.reviewed_at && (
                                <div className="flex items-center space-x-2">
                                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-sm font-semibold text-gray-700">Reviewed:</span>
                                  <span className="text-base font-medium text-gray-800">
                                    {new Date(submission.reviewed_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} {new Date(submission.reviewed_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {submission.reviewed_at && (
                              <div className="text-right">
                                <div className="text-sm font-semibold text-purple-900">Marks Obtained</div>
                                <div className="text-2xl font-bold text-purple-900">
                                  {submission.marks || 'N/A'}/{selectedAssignment.marks || 'N/A'}
                                </div>
                              </div>
                            )}
                            <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                              submission.reviewed_at
                                ? 'bg-green-100 text-green-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {submission.reviewed_at ? 'Reviewed' : 'Pending Review'}
                            </div>
                          </div>
                        </div>


                        {/* Comments Section */}
                        {submission.comments && (
                          <div className="mb-6 sm:px-4 md:px-8">
                            <div className="flex items-center space-x-2 mb-3">
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4z" />
                              </svg>
                              <span className="text-base font-semibold text-gray-900">Faculty Comments</span>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <p className="text-gray-700 leading-relaxed">{submission.comments}</p>
                            </div>
                          </div>
                        )}

                        {/* Submission Files */}
                        {submission.files && submission.files.length > 0 && (
                          <div>
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center shadow-sm">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <h4 className="text-xl font-semibold text-gray-900">Your Submitted Files</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {submission.files.map((file, index) => (
                                <a
                                  key={index}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group bg-cyan-50 p-4 rounded-lg border border-cyan-200 hover:border-cyan-300 hover:shadow-md transition-all duration-200"
                                >
                                  <div className="flex items-center space-x-3 mb-3">
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow border border-cyan-200">
                                      <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-cyan-900 truncate group-hover:text-cyan-800 transition-colors">{file.filename}</p>
                                      <p className="text-xs text-cyan-600">Click to view</p>
                                    </div>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center mt-12">
              {isAssignmentSubmitted(selectedAssignment.id) ? (
                (() => {
                  const submission = getSubmissionForAssignment(selectedAssignment.id);
                  return new Date(selectedAssignment.due) >= new Date() && !submission.reviewed_at ? (
                    <button
                      onClick={() => handleDeleteSubmission(submission.id)}
                      className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transform hover:scale-105"
                    >
                      <span className="flex items-center space-x-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete Submission</span>
                      </span>
                    </button>
                  ) : (
                    <div className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg font-bold rounded-2xl shadow-xl">
                      <span className="flex items-center space-x-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Assignment Submitted</span>
                      </span>
                    </div>
                  );
                })()
              ) : (
                <button
                  onClick={() => handleSubmitAssignment(selectedAssignment)}
                  disabled={new Date(selectedAssignment.due) < new Date()}
                  className={`px-8 py-4 text-lg font-bold rounded-2xl shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105 ${
                    new Date(selectedAssignment.due) < new Date()
                      ? 'bg-gradient-to-r from-slate-400 to-slate-500 text-slate-200 cursor-not-allowed shadow-lg'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white focus:ring-green-500 hover:shadow-2xl'
                  }`}
                >
                  <span className="flex items-center space-x-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>
                      {new Date(selectedAssignment.due) < new Date()
                        ? 'Submission Deadline Passed'
                        : 'Submit Assignment'
                      }
                    </span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'assignments' && selectedGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <button
              onClick={handleBackToGroups}
              className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 font-medium rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 mb-6"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Groups
            </button>

            {/* Modern Group Header */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {selectedGroup.group_name}
                    </h1>
                    <p className="text-gray-600 font-medium">
                      Group Code: <span className="font-bold text-gray-800">{selectedGroup.group_code}</span>
                    </p>
                  </div>
                </div>

                {/* Modern Group Stats */}
                <div className="flex items-center space-x-8">
                  <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                    <div className="text-3xl font-bold text-blue-600">{assignments.length}</div>
                    <div className="text-sm font-medium text-blue-700">Assignments</div>
                  </div>
                  <div className="text-center bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100">
                    <div className="text-3xl font-bold text-emerald-600">
                      {assignments.filter(a => getSubmissionForAssignment(a.id)).length}
                    </div>
                    <div className="text-sm font-medium text-emerald-700">Submitted</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {assignmentsLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading assignments...</p>
              </div>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No assignments found</h3>
              <p className="text-gray-600">There are no assignments for this group yet.</p>
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gradient-to-r from-slate-50 to-gray-50">
                    <tr>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Assignment
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                        Assigned
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                        Due Date
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                        Marks
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 divide-y divide-gray-100">
                    {assignments.map((assignment, index) => (
                      <tr key={assignment.id}>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-base font-bold text-gray-900 leading-tight">
                                {assignment.assignment_name}
                              </div>
                              {assignment.attachments && Object.keys(assignment.attachments).length > 0 && (
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a2 2 0 00-2.828-2.828z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2.25A6.988 6.988 0 005 9v9a3 3 0 006 0V9a.75.75 0 011.5 0v9a4.5 4.5 0 01-9 0V9c0-2.21 1.79-4 4-4s4 1.79 4 4v9a.75.75 0 001.5 0V9c0-2.21 1.79-4 4-4s4 1.79 4 4v9a3 3 0 01-6 0V9a.75.75 0 011.5 0v9a4.5 4.5 0 01-9 0V9z" />
                                  </svg>
                                  {Object.keys(assignment.attachments).length} attachment{Object.keys(assignment.attachments).length > 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-900">
                            {new Date(assignment.assigned_on).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(assignment.assigned_on).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className={`text-sm ${new Date(assignment.due) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                            {new Date(assignment.due).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(assignment.due).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const submission = getSubmissionForAssignment(assignment.id);
                            if (submission) {
                              if (submission.reviewed_at) {
                                return (
                                  <div className="text-center">
                                    <div className="text-lg font-bold text-green-600 mb-1">{submission.marks || 'N/A'}</div>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Reviewed
                                    </span>
                                  </div>
                                );
                              } else {
                                return (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    Pending Review
                                  </span>
                                );
                              }
                            } else {
                              return (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  Not Submitted
                                </span>
                              );
                            }
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                            {assignment.marks || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => handleViewAssignment(assignment)}
                              className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-xl hover:bg-blue-100 hover:cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                            {isAssignmentSubmitted(assignment.id) ? (
                              (() => {
                                const submission = getSubmissionForAssignment(assignment.id);
                                return new Date(assignment.due) >= new Date() && !submission.reviewed_at ? (
                                  <button
                                    onClick={() => handleDeleteSubmission(submission.id)}
                                    className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-xl hover:bg-red-100 hover:cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                  >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                  </button>
                                ) : (
                                  <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-emerald-700 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl shadow-sm">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Submitted
                                  </span>
                                );
                              })()
                            ) : new Date(assignment.due) >= new Date() ? (
                              <button
                                onClick={() => handleSubmitAssignment(assignment)}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-medium rounded-xl hover:from-emerald-600 hover:to-green-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Submit
                              </button>
                            ) : (
                              <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-500 bg-gradient-to-r from-gray-100 to-slate-100 rounded-xl shadow-sm cursor-not-allowed">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Overdue
                              </span>
                            )}
                          </div>
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
  }

  if (view === 'submit-assignment' && selectedAssignment) {
    return (
      <StudentAssignmentSubmission
        assignment={selectedAssignment}
        onBack={handleBackToAssignments}
        onSuccess={handleBackToAssignments}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-3 leading-tight">
            My Assignments
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed font-medium">
            View your course groups and assignments
          </p>
        </div>

        {/* Search Bar */}
        {Object.keys(groupedByCourse).length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20 mb-8">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by course name or group code..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="text-slate-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {Object.keys(filteredCourses).length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No groups found</h3>
            <p className="text-slate-600">You haven't been assigned to any course groups yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCourses.map((courseData) => (
              <div key={courseData.course.id} className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 leading-tight">
                      {courseData.course.course_name}
                    </h2>
                    <p className="text-slate-600 font-medium text-sm">{courseData.course.course_code}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courseData.groups.map((group) => (
                    <div key={group.id} className="group bg-gradient-to-br from-white to-slate-50 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 border border-slate-200/50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-800 group-hover:text-slate-900 transition-colors leading-tight">
                                {group.group_name}
                              </h3>
                              <p className="text-xs text-slate-600 font-medium">
                                Code: {group.group_code}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewAssignments(group)}
                        disabled={assignmentsLoading}
                        className="bg-blue-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-blue-600 hover:cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
                      >
                        {assignmentsLoading ? (
                          <span className="flex items-center justify-center space-x-1">
                            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Loading...</span>
                          </span>
                        ) : (
                          <span className="flex items-center justify-center space-x-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span>View Assignments</span>
                          </span>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentAssignments;