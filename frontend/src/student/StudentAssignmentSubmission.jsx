import React, { useState, useRef } from 'react';
import axios from 'axios';

const StudentAssignmentSubmission = ({ assignment, onBack, onSuccess }) => {
  const [submissionForm, setSubmissionForm] = useState({
    textSubmission: '',
    files: []
  });
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const fileInputRef = useRef(null);

  const baseUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('studentToken');
  const studentId = localStorage.getItem('studentId');

  const handleSubmissionChange = (e) => {
    const { name, value } = e.target;
    setSubmissionForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Check if adding these files would exceed the limit
    if (submissionForm.files.length + files.length > 10) {
      setMessage(`Cannot add ${files.length} more file(s). Maximum 10 files allowed. You currently have ${submissionForm.files.length} file(s).`);
      setMessageType('error');
      return;
    }

    // Validate files
    const validFiles = files.filter(file => {
      if (file.type !== 'application/pdf') {
        setMessage(`${file.name} is not a PDF file`);
        setMessageType('error');
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setMessage(`${file.name} is larger than 10MB`);
        setMessageType('error');
        return false;
      }
      return true;
    });

    setSubmissionForm(prev => ({
      ...prev,
      files: [...prev.files, ...validFiles]
    }));
  };

  const removeFile = (indexToRemove) => {
    setSubmissionForm(prev => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== indexToRemove)
    }));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmissionSubmit = async (e) => {
    e.preventDefault();

    if (!assignment || !studentId) {
      alert('Invalid assignment or student data');
      return;
    }

    // Validate that at least one field is filled
    if (!submissionForm.textSubmission.trim() && submissionForm.files.length === 0) {
      setMessage('Please provide either text submission or upload at least one file');
      setMessageType('error');
      return;
    }

    setSubmissionLoading(true);

    try {
      const formData = new FormData();
      formData.append('assignment_refer_id', assignment.id);
      formData.append('student_refer_id', studentId);

      if (submissionForm.textSubmission.trim()) {
        formData.append('text_submission', submissionForm.textSubmission);
      }

      submissionForm.files.forEach((file, index) => {
        formData.append('files', file);
      });

      const response = await axios.post(`${baseUrl}/api/assignment-submissions`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Reset form
      setSubmissionForm({
        textSubmission: '',
        files: []
      });

      setMessage('Assignment submitted successfully!');
      setMessageType('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (error) {
      console.error('Error submitting assignment:', error);
      setMessage(error.response?.data?.error || 'Failed to submit assignment');
      setMessageType('error');
    } finally {
      setSubmissionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <button
              onClick={onBack}
              className="flex items-center bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg mb-6 transition-all duration-200 shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Assignments
            </button>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Submit Assignment
              </h1>
              <p className="text-lg text-gray-600">
                {assignment.assignment_name}
              </p>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg border ${
              messageType === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                <svg className={`w-5 h-5 mr-2 ${
                  messageType === 'success' ? 'text-green-600' : 'text-red-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {messageType === 'success' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}

          {/* Submission Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmissionSubmit} className="space-y-6">
              {/* Text Submission */}
              <div>
                <label htmlFor="textSubmission" className="block text-sm font-medium text-gray-700 mb-2">
                  Text Submission (Optional)
                </label>
                <textarea
                  id="textSubmission"
                  name="textSubmission"
                  rows={4}
                  disabled={submissionLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                  placeholder="Enter your text submission here..."
                  value={submissionForm.textSubmission}
                  onChange={handleSubmissionChange}
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Files (PDF only, max 10 files, 10MB each)
                </label>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    disabled={submissionForm.files.length >= 10 || submissionLoading}
                    className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg transition-colors ${
                      submissionForm.files.length >= 10 || submissionLoading
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                        : 'border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600'
                    }`}
                  >
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {submissionLoading ? 'Uploading in Progress...' : submissionForm.files.length >= 10 ? 'Maximum Files Reached' : 'Choose Files'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Selected Files Display */}
                  {submissionForm.files.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Selected Files ({submissionForm.files.length}):
                      </p>
                      <div className="max-h-40 overflow-y-auto">
                        <div className="flex flex-wrap gap-2">
                          {submissionForm.files.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8.5 2H15.5L19 8.5V22H5V8.5L8.5 2Z"/>
                                  <path d="M14 2V8H10V2H14Z"/>
                                  <text x="12" y="16" textAnchor="middle" className="text-white text-xs font-bold">PDF</text>
                                </svg>
                                <div>
                                  <p className="text-xs font-medium text-gray-900 truncate max-w-xs">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                disabled={submissionLoading}
                                className="text-red-500 hover:text-red-700 p-1 ml-2 disabled:text-gray-400 disabled:cursor-not-allowed"
                                title="Remove file"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submissionLoading}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submissionLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Uploading Files...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Submit Assignment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAssignmentSubmission;