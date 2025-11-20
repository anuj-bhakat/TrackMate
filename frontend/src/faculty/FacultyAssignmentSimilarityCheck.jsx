import React, { useState } from 'react';
import axios from 'axios';

const FacultyAssignmentSimilarityCheck = ({ currentStudentAttachments, otherStudentAttachments, assignment, onSimilarityUpdate, similarCurrentAttachments }) => {
  const [similarityLoading, setSimilarityLoading] = useState(false);

  const handleCheckSimilarity = async () => {
    if (currentStudentAttachments.length === 0) {
      alert('No current student attachments to check');
      return;
    }

    setSimilarityLoading(true);

    try {
      const token = localStorage.getItem('facultyToken');
      const baseUrl = import.meta.env.VITE_API_URL;

      const allSimilarFiles = new Set(); // Use Set to avoid duplicates
      const similarCurrentUrls = new Set(); // Track current student attachments with similarities
      const mappings = []; // Track which current file caused each similarity

      // Check each current student attachment against all others
      for (const currentAttachment of currentStudentAttachments) {
        const otherUrls = [
          ...currentStudentAttachments.filter(att => att.url !== currentAttachment.url).map(att => att.url), // Other current student files
          ...otherStudentAttachments.map(att => att.url) // All other student files
        ];

        const response = await axios.post(`${baseUrl}/check-similarity`, {
          targetUrl: currentAttachment.url,
          otherUrls
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Add similar files to the set and track mappings
        if (response.data.similarFiles && response.data.similarFiles.length > 0) {
          response.data.similarFiles.forEach(url => {
            allSimilarFiles.add(url);
            // Track which current file caused this similarity
            mappings.push({
              similarFileUrl: url,
              currentFileUrl: currentAttachment.url,
              currentFileName: currentAttachment.filename
            });
          });
          // Mark this current attachment as having similarities
          similarCurrentUrls.add(currentAttachment.url);
        }
      }

      // Notify parent component about similarity results
      if (onSimilarityUpdate) {
        onSimilarityUpdate({
          similarFiles: Array.from(allSimilarFiles),
          similarCurrentAttachments: Array.from(similarCurrentUrls),
          similarityMappings: mappings
        });
      }
    } catch (error) {
      console.error('Error checking similarity:', error);
      alert('Failed to check similarity');
    } finally {
      setSimilarityLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Check Similarity Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Current Student Attachments</h2>
          <p className="text-xs text-gray-600 mt-1">
            Files submitted by {currentStudentAttachments[0]?.studentName} ({currentStudentAttachments.length} files)
          </p>
        </div>
        <button
          onClick={handleCheckSimilarity}
          disabled={similarityLoading}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm font-medium"
        >
          {similarityLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-1.5 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking...
            </>
          ) : (
            <>
              <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Check Similarity
            </>
          )}
        </button>
      </div>

      {/* Current Student Attachments Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentStudentAttachments.map((attachment, index) => {
          const isSimilar = similarCurrentAttachments.includes(attachment.url);
          return (
            <div
              key={`${attachment.submissionId}-${index}`}
              className={`rounded-md border p-3 transition-all duration-200 ${isSimilar ? 'bg-red-50 border-red-300 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${isSimilar ? 'bg-red-500' : 'bg-blue-500'}`}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div
                      className={`text-xs font-medium text-gray-900 cursor-pointer hover:underline truncate ${isSimilar ? 'hover:text-red-600' : 'hover:text-blue-600'}`}
                      title={attachment.filename}
                      onClick={() => window.open(attachment.url, '_blank')}
                    >
                      {attachment.filename}
                    </div>
                    <div className="flex items-center space-x-1 ml-1 flex-shrink-0">
                      <span className="text-xs text-gray-500">
                        {attachment.submittedAt ? new Date(attachment.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                      </span>
                      {isSimilar && (
                        <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-gray-500">PDF</span>
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
  );
};

export default FacultyAssignmentSimilarityCheck;