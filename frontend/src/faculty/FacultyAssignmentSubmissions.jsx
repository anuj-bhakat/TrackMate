import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FacultyAssignmentReview from './FacultyAssignmentReview';

const FacultyAssignmentSubmissions = ({ assignment, onBack }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showReviewComponent, setShowReviewComponent] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem('facultyToken');
        const institutionId = localStorage.getItem('institutionId');

        if (!token || !institutionId) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${baseUrl}/api/assignment-submissions/assignment/${assignment.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Institution-Id': institutionId
          }
        });

        setSubmissions(response.data);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setError(error.response?.data?.message || 'Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };

    if (assignment) {
      fetchSubmissions();
    }
  }, [assignment]);

  const handleActionClick = (submission) => {
    setSelectedSubmission(submission);
    setShowReviewComponent(true);
  };

  const handleBackFromReview = () => {
    setShowReviewComponent(false);
    setSelectedSubmission(null);
  };

  const handleReviewSubmission = async (submissionId, marks, comments) => {
    try {
      const token = localStorage.getItem('facultyToken');
      const institutionId = localStorage.getItem('institutionId');
      const baseUrl = import.meta.env.VITE_API_URL;

      await axios.put(`${baseUrl}/api/assignment-submissions/review/${submissionId}`, {
        marks: parseInt(marks),
        comments: comments
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Institution-Id': institutionId
        }
      });

      // Refresh submissions
      const response = await axios.get(`${baseUrl}/api/assignment-submissions/assignment/${assignment.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Institution-Id': institutionId
        }
      });
      setSubmissions(response.data);
      // No modal to close since we use component navigation now
    } catch (error) {
      console.error('Error reviewing submission:', error);
      alert('Failed to save review');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reviewed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'reviewed':
        return 'Reviewed';
      case 'pending':
        return 'Pending Review';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="py-8 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-8 py-12 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-spin">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Loading Submissions</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">Please wait while we fetch the assignment submissions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-red-200 overflow-hidden">
            <div className="px-8 py-12 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Unable to Load Submissions</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry
                </button>
                <button
                  onClick={onBack}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showReviewComponent && selectedSubmission) {
    return <FacultyAssignmentReview submission={selectedSubmission} assignment={assignment} onBack={handleBackFromReview} onReviewComplete={() => {
      // Refresh submissions after review
      const fetchSubmissions = async () => {
        try {
          const token = localStorage.getItem('facultyToken');
          const institutionId = localStorage.getItem('institutionId');
          const baseUrl = import.meta.env.VITE_API_URL;
          const response = await axios.get(`${baseUrl}/api/assignment-submissions/assignment/${assignment.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Institution-Id': institutionId
            }
          });
          setSubmissions(response.data);
        } catch (error) {
          console.error('Error refreshing submissions:', error);
        }
      };
      fetchSubmissions();
      handleBackFromReview();
    }} />;
  }

  return (
    <div className="py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Assignments
              </button>
              <div className="border-l border-gray-200 pl-4">
                <div className="flex items-center space-x-2 mb-1">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h1 className="text-2xl font-bold text-blue-900 tracking-tight">
                    Assignment Submissions
                  </h1>
                </div>
                <p className="text-sm text-gray-500 ml-7">
                  {assignment.assignment_name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{submissions.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mt-1">Total Submissions</div>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {submissions.filter(s => s.status === 'reviewed').length}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mt-1">Reviewed</div>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">
                  {submissions.filter(s => s.status === 'pending').length}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mt-1">Pending Review</div>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        {submissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="text-center py-16 px-8">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No Submissions Received</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Students have not submitted assignments for this task yet. Submissions will appear here once students upload their work.
              </p>
              <div className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg bg-gray-50">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-600">Awaiting student submissions</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Student Information
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Submission Details
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Review Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Assessment Score
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Files
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {submissions.map((submission, index) => (
                    <tr key={submission.id} className={`transition-all duration-200 hover:shadow-md ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center shadow-sm">
                              <span className="text-sm font-bold text-blue-700">
                                {submission.students?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'ST'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {submission.students?.name || 'Student Name Not Available'}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">
                              Student ID: {submission.students?.student_id || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'Not submitted'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {submission.submitted_at ? new Date(submission.submitted_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(submission.status)}`}>
                          <span className={`w-2 h-2 rounded-full mr-2 ${submission.status === 'reviewed' ? 'bg-emerald-500' : submission.status === 'pending' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                          {getStatusText(submission.status)}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {submission.marks !== null ? (
                          <div className="text-sm font-bold">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${
                              submission.marks >= (assignment.marks * 0.8) ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                              submission.marks >= (assignment.marks * 0.6) ? 'bg-amber-100 text-amber-800 border border-amber-200' : 
                              'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {submission.marks}/{assignment.marks || 'N/A'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic font-medium">Not assessed</span>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center text-sm">
                          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg mr-3">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {Object.keys(submission.attachments || {}).length} file{Object.keys(submission.attachments || {}).length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleActionClick(submission)}
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md ${
                            submission.status !== 'reviewed'
                              ? 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                              : 'text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
                          }`}
                        >
                          {submission.status !== 'reviewed' ? 'Review Submission' : 'View Review'}
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

export default FacultyAssignmentSubmissions;