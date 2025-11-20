import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FacultyAssignmentSimilarityCheck from './FacultyAssignmentSimilarityCheck';

const FacultyAssignmentAllAttachments = ({ assignment, onBack, currentSubmission }) => {
  const [currentStudentAttachments, setCurrentStudentAttachments] = useState([]);
  const [otherStudentAttachments, setOtherStudentAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [similarFiles, setSimilarFiles] = useState([]);
  const [similarCurrentAttachments, setSimilarCurrentAttachments] = useState([]);
  const [activeView, setActiveView] = useState('current'); // 'current' or 'others'
  const [showSimilarityResults, setShowSimilarityResults] = useState(false);
  const [similarityMappings, setSimilarityMappings] = useState([]);

  useEffect(() => {
    const fetchAllAttachments = async () => {
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

        // Separate attachments by current student vs others
        const currentAttachments = [];
        const otherAttachments = [];

        response.data.forEach(submission => {
          if (submission.attachments && Object.keys(submission.attachments).length > 0) {
            const isCurrentStudent = submission.student_refer_id === currentSubmission.student_refer_id;
            const targetArray = isCurrentStudent ? currentAttachments : otherAttachments;

            Object.entries(submission.attachments).forEach(([filename, url]) => {
              targetArray.push({
                filename,
                url,
                studentName: submission.students?.name || `Student ${submission.student_refer_id.slice(-4)}`,
                studentId: submission.students?.student_id || submission.student_refer_id.slice(-4),
                submittedAt: submission.submitted_at,
                submissionId: submission.id
              });
            });
          }
        });

        setCurrentStudentAttachments(currentAttachments);
        setOtherStudentAttachments(otherAttachments);
      } catch (error) {
        console.error('Error fetching attachments:', error);
        setError(error.response?.data?.message || 'Failed to load attachments');
      } finally {
        setLoading(false);
      }
    };

    if (assignment) {
      fetchAllAttachments();
    }
  }, [assignment]);

  const handleSimilarityUpdate = (similarityData) => {
    setSimilarFiles(similarityData.similarFiles);
    setSimilarCurrentAttachments(similarityData.similarCurrentAttachments);
    setSimilarityMappings(similarityData.similarityMappings);
    setShowSimilarityResults(true);
  };


  if (loading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading all attachments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Attachments</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <button
                  onClick={onBack}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Review
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-blue-900 tracking-tight">
                    All Assignment Attachments
                  </h1>
                  <p className="text-lg text-gray-600">
                    {assignment.assignment_name}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="bg-blue-50 rounded-md px-3 py-2 shadow-sm border border-blue-200">
                <div className="text-lg font-bold text-blue-900">
                  {currentStudentAttachments.length + otherStudentAttachments.length}
                </div>
                <div className="text-xs text-blue-600">
                  Total Files
                </div>
              </div>
            </div>
          </div>
        </div>

        {(currentStudentAttachments.length + otherStudentAttachments.length) === 0 ? (
          <div className="bg-white shadow-xl rounded-xl p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Attachments Found</h3>
              <p className="text-lg text-gray-600 mb-8">No files have been submitted for this assignment yet.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* View Toggle Tabs */}
            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-3">
              <div className="flex justify-center">
                <div className="inline-flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveView('current')}
                    className={`px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm ${
                      activeView === 'current'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Current ({currentStudentAttachments.length})</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveView('others')}
                    className={`px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm ${
                      activeView === 'others'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Others ({otherStudentAttachments.length})</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Current Student Attachments */}
              {activeView === 'current' && currentStudentAttachments.length > 0 && (
                <FacultyAssignmentSimilarityCheck
                  currentStudentAttachments={currentStudentAttachments}
                  otherStudentAttachments={otherStudentAttachments}
                  assignment={assignment}
                  onSimilarityUpdate={handleSimilarityUpdate}
                  similarCurrentAttachments={similarCurrentAttachments}
                />
              )}

              {/* Other Student Attachments */}
              {activeView === 'others' && otherStudentAttachments.length > 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Other Student Attachments</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Files submitted by other students ({otherStudentAttachments.length} files)
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {otherStudentAttachments.map((attachment, index) => {
                    const isSimilar = similarFiles.includes(attachment.url);
                    return (
                      <div
                        key={`${attachment.submissionId}-${index}`}
                        className={`rounded-lg border-2 p-3 transition-all duration-200 ${isSimilar ? 'bg-red-100 border-red-400 border-l-4 border-l-red-600 shadow-lg ring-2 ring-red-200' : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isSimilar ? 'bg-red-600 shadow-md' : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}>
                            <svg className={`w-5 h-5 ${isSimilar ? 'text-white' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <div
                                className={`text-sm font-semibold text-gray-900 cursor-pointer hover:underline truncate ${isSimilar ? 'hover:text-red-600' : 'hover:text-blue-600'}`}
                                title={attachment.filename}
                                onClick={() => window.open(attachment.url, '_blank')}
                              >
                                {attachment.filename}
                              </div>
                              <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                                <span className="text-xs text-gray-500">
                                  {attachment.submittedAt ? new Date(attachment.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                                </span>
                                {isSimilar && (
                                  <div className="flex items-center">
                                    <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">PDF Document</span>
                                <span className="text-xs text-gray-600">•</span>
                                <span className="text-xs text-gray-900">{attachment.studentName}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {attachment.submittedAt ? new Date(attachment.submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              )}

              {/* Show message when no attachments in current view */}
              {activeView === 'current' && currentStudentAttachments.length === 0 && (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Current Student Attachments</h3>
                  <p className="text-gray-600">The current student has not submitted any files for this assignment.</p>
                </div>
              )}

              {activeView === 'others' && otherStudentAttachments.length === 0 && (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Other Student Attachments</h3>
                  <p className="text-gray-600">No other students have submitted files for this assignment yet.</p>
                </div>
              )}
            </div>
       {/* Similarity Results */}
       {showSimilarityResults && (
         <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
           <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
             <div className="flex items-center justify-between">
               <div>
                 <h2 className="text-lg font-semibold text-gray-900">Similarity Check Results</h2>
                 <p className="text-xs text-gray-600">
                   {similarFiles.length > 0
                     ? `Found ${similarFiles.length} similar file${similarFiles.length > 1 ? 's' : ''}`
                     : 'No similar files detected'
                   }
                 </p>
               </div>
               <div className="flex items-center text-red-600">
                 <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                 </svg>
               </div>
             </div>
           </div>
           <div className="p-4">
             {similarFiles.length > 0 ? (
               <div className="space-y-4">
                 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                   <div className="flex items-center">
                     <svg className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                     </svg>
                     <div>
                       <h4 className="text-sm font-semibold text-red-800">Potential Similarity Detected</h4>
                       <p className="text-red-700 text-sm mt-1">
                         Files from current student were checked against all other submissions. Review the pairs below carefully.
                       </p>
                     </div>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                   {similarityMappings.map((mapping, index) => {
                     const similarAttachment = otherStudentAttachments.find(att => att.url === mapping.similarFileUrl);
                     const currentAttachment = currentStudentAttachments.find(att => att.url === mapping.currentFileUrl);
                     return (
                       <div key={index} className="bg-red-50 border border-red-300 rounded-md p-2 shadow-sm w-full">
                         <div className="flex items-center mb-1.5">
                           <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-1.5 flex-shrink-0">
                             <svg className="w-2.5 h-2.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                             </svg>
                           </div>
                           <h6 className="text-xs font-bold text-red-800">#{index + 1}</h6>
                         </div>

                         <div className="space-y-1.5">
                           {/* Current File */}
                           <div className="bg-white rounded border border-gray-200 p-1.5">
                             <div className="flex items-center mb-0.5">
                               <div className="w-3 h-3 bg-blue-100 rounded flex items-center justify-center mr-1 flex-shrink-0">
                                 <svg className="w-2 h-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                 </svg>
                               </div>
                               <span className="text-xs font-medium text-gray-700">Current</span>
                             </div>
                             <div
                               className="text-xs font-medium text-gray-900 cursor-pointer hover:text-blue-600 hover:underline truncate leading-tight"
                               title={mapping.currentFileName}
                               onClick={() => window.open(mapping.currentFileUrl, '_blank')}
                             >
                               {mapping.currentFileName}
                             </div>
                             <div className="text-xs text-gray-500 leading-tight">
                               {currentAttachment?.submittedAt ? new Date(currentAttachment.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                             </div>
                           </div>

                           {/* Similar File */}
                           <div className="bg-white rounded border border-gray-200 p-1.5">
                             <div className="flex items-center mb-0.5">
                               <div className="w-3 h-3 bg-red-100 rounded flex items-center justify-center mr-1 flex-shrink-0">
                                 <svg className="w-2 h-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                 </svg>
                               </div>
                               <span className="text-xs font-medium text-gray-700">Similar</span>
                             </div>
                             <div
                               className="text-xs font-medium text-gray-900 cursor-pointer hover:text-red-600 hover:underline truncate leading-tight"
                               title={similarAttachment?.filename}
                               onClick={() => window.open(mapping.similarFileUrl, '_blank')}
                             >
                               {similarAttachment ? similarAttachment.filename : 'Unknown file'}
                             </div>
                             <div className="text-xs text-gray-600 leading-tight">
                               <div className="font-medium truncate">{similarAttachment?.studentName || 'N/A'}</div>
                               <div className="text-gray-500">{similarAttachment?.submittedAt ? new Date(similarAttachment.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</div>
                             </div>
                           </div>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
             ) : (
               <div className="text-center py-8">
                 <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                 </div>
                 <h3 className="text-lg font-semibold text-gray-900 mb-2">No Similarity Detected</h3>
                 <p className="text-gray-600">The current student's submission appears to be original.</p>
               </div>
             )}
           </div>
         </div>
       )}

          </div>
        )}
      </div>
    </div>
  );
};

const FacultyAssignmentReview = ({ submission, assignment, onBack, onReviewComplete }) => {
  const [marks, setMarks] = useState(submission.marks || '');
  const [comments, setComments] = useState(submission.comments || '');
  const [loading, setLoading] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showAllAttachments, setShowAllAttachments] = useState(false);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (marks === '' || marks === null || marks === undefined) {
      alert('Please enter marks');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('facultyToken');
      const institutionId = localStorage.getItem('institutionId');
      const baseUrl = import.meta.env.VITE_API_URL;

      await axios.put(`${baseUrl}/api/assignment-submissions/review/${submission.id}`, {
        marks: marks,
        comments: comments
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Institution-Id': institutionId
        }
      });

      if (onReviewComplete) {
        onReviewComplete();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reviewed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (showAllAttachments) {
    return <FacultyAssignmentAllAttachments assignment={assignment} onBack={() => setShowAllAttachments(false)} currentSubmission={submission} />;
  }

  return (
    <div className="py-10 px-6 sm:px-8 lg:px-10 xl:px-14">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-blue-900 tracking-tight">
                Review Submission
              </h1>
              <p className="text-sm text-gray-600">
                {assignment.assignment_name} - {submission.students?.name || `Student ${submission.student_refer_id.slice(-4)}`}
              </p>
            </div>
            <button
              onClick={() => setShowAllAttachments(true)}
              className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Check Similarity
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Submission Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Status and Marks */}
            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Submission Overview
              </h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-gray-600">Status:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                    {getStatusText(submission.status)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-gray-600">Submitted At:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {submission.submitted_at ? `${new Date(submission.submitted_at).toLocaleDateString()} ${new Date(submission.submitted_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Text Submission */}
            {submission.text_submission && (
              <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Text Submission
                </h3>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{submission.text_submission}</p>
                </div>
              </div>
            )}

            {/* Attachments */}
            {Object.keys(submission.attachments || {}).length > 0 && (
              <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100">
                <h3 className="text-base font-bold text-blue-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Submitted Files ({Object.keys(submission.attachments || {}).length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(submission.attachments).map(([filename, url]) => (
                    <div
                      key={filename}
                      onClick={() => window.open(url, '_blank')}
                      className="flex items-center p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-sm transition-all duration-200 cursor-pointer hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200"
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center mr-2 flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-900 truncate" title={filename}>{filename}</p>
                        <p className="text-xs text-gray-600">PDF</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No content */}
            {(!submission.text_submission && Object.keys(submission.attachments || {}).length === 0) && (
              <div className="bg-white shadow-xl rounded-xl p-10 border border-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Submission Content</h3>
                  <p className="text-gray-600">This submission doesn't contain any text or files.</p>
                </div>
              </div>
            )}

            {/* Previous Comments */}
            {submission.comments && (
              <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Faculty Feedback
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-blue-900 font-medium mb-2">Faculty Comments</p>
                      <p className="text-blue-800 leading-relaxed">{submission.comments}</p>
                      {submission.reviewed_at && (
                        <p className="text-xs text-blue-600 mt-3 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Reviewed on {new Date(submission.reviewed_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Review Form */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-lg rounded-lg p-6 sticky top-6 border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-4 h-4 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Review Submission
              </h3>

              {submission.status === 'reviewed' ? (
                <div className="space-y-4">
                  {!showUpdateForm ? (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mb-2">Already Reviewed</h4>
                      <p className="text-xs text-gray-600 leading-relaxed mb-4">This submission has been reviewed. You can update the marks and comments if needed.</p>

                      <button
                        onClick={() => setShowUpdateForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all duration-200 flex items-center shadow-sm hover:shadow-md text-sm mx-auto block"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Update Review
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                          Marks <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min="0"
                            value={marks}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
                                setMarks(value);
                              }
                            }}
                            className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm font-semibold"
                            placeholder="Marks"
                            required
                          />
                          <span className="text-sm font-bold text-gray-500">/</span>
                          <span className="text-sm font-bold text-gray-700 px-2 py-1 bg-gray-100 rounded">
                            {assignment.marks || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                          Comments
                        </label>
                        <textarea
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none text-sm"
                          rows="4"
                          placeholder="Add your detailed feedback here..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Provide constructive feedback
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || marks === '' || marks === null || marks === undefined}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm hover:shadow-md text-sm"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Update Review
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Marks <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-1">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={marks}
                        onChange={(e) => setMarks(e.target.value)}
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 text-sm font-semibold"
                        placeholder="Marks"
                        required
                      />
                      <span className="text-sm font-bold text-gray-500">/</span>
                      <span className="text-sm font-bold text-gray-700 px-2 py-1 bg-gray-100 rounded">
                        {assignment.marks || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Comments
                    </label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 resize-none text-sm"
                      rows="4"
                      placeholder="Add your detailed feedback here..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Provide constructive feedback
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !marks.trim()}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm hover:shadow-md text-sm"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Submit Review
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyAssignmentReview;