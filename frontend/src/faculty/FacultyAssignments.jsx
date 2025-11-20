import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FacultyAssignmentSubmissions from './FacultyAssignmentSubmissions';

const FacultyAssignments = () => {
  const [groups, setGroups] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditAssignment, setShowEditAssignment] = useState(false);
  const [showViewAssignment, setShowViewAssignment] = useState(false);
  const [showSubmissionsView, setShowSubmissionsView] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState(null);
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    group_refer_id: '',
    assignment_name: '',
    assignment_desc: '',
    assigned_on: '',
    due: '',
    marks: '',
    files: []
  });

  useEffect(() => {
    const fetchData = async () => {
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

        // Fetch groups and assignments in parallel
        const [groupsResponse] = await Promise.all([
          axios.get(`${baseUrl}/api/groups/faculty/${facultyId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Institution-Id': institutionId
            }
          })
        ]);

        setGroups(groupsResponse.data);

        // Extract unique courses from groups data
        const uniqueCourses = [...new Set(groupsResponse.data.map(group => group.course_refer_id))];

        // Set default selected course if available
        if (uniqueCourses.length > 0) {
          setSelectedCourse(uniqueCourses[0]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      // Reset group selection when course changes
      setSelectedGroup('');
      // Filter groups for the selected course
      const courseGroups = groups.filter(group => group.course_refer_id === selectedCourse);
      if (courseGroups.length > 0) {
        setSelectedGroup(courseGroups[0].id);
      }
    }
  }, [selectedCourse, groups]);

  useEffect(() => {
    if (selectedGroup) {
      fetchAssignments(selectedGroup);
    }
  }, [selectedGroup]);

  const fetchAssignments = async (groupId) => {
    try {
      const token = localStorage.getItem('facultyToken');
      const institutionId = localStorage.getItem('institutionId');

      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${baseUrl}/api/assignments/group/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Institution-Id': institutionId
        }
      });

      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError(error.response?.data?.message || 'Failed to load assignments');
    }
  };

  if (loading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assignments...</p>
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
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Assignments</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateAssignment = () => {
    setFormData({
      group_refer_id: '',
      assignment_name: '',
      assignment_desc: '',
      assigned_on: new Date().toISOString().slice(0, 16),
      due: '',
      marks: '',
      files: []
    });
    setShowCreateModal(true);
  };

  const handleViewAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setShowViewAssignment(true);
  };

  const handleViewSubmissions = (assignment) => {
    setSelectedAssignmentForSubmissions(assignment);
    setShowSubmissionsView(true);
  };

  const handleBackFromSubmissions = () => {
    setShowSubmissionsView(false);
    setSelectedAssignmentForSubmissions(null);
  };

  const handleEditAssignment = (assignment) => {
    setFormData({
      group_refer_id: assignment.group_refer_id,
      assignment_name: assignment.assignment_name,
      assignment_desc: assignment.assignment_desc || '',
      assigned_on: assignment.assigned_on ? new Date(assignment.assigned_on).toISOString().slice(0, 16) : '',
      due: assignment.due ? new Date(assignment.due).toISOString().slice(0, 16) : '',
      marks: assignment.marks || '',
      files: []
    });
    setEditingAssignment(assignment);
    setShowEditAssignment(true);
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('facultyToken');
      const institutionId = localStorage.getItem('institutionId');
      const baseUrl = import.meta.env.VITE_API_URL;

      await axios.delete(`${baseUrl}/api/assignments/${assignmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Institution-Id': institutionId
        }
      });

      // Refresh assignments
      fetchAssignments(selectedGroup);
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setError(error.response?.data?.message || 'Failed to delete assignment');
    }
  };

  const handleSubmitAssignment = async (e, isEdit = false) => {
    e.preventDefault();

    setCreatingAssignment(true);

    try {
      const token = localStorage.getItem('facultyToken');
      const institutionId = localStorage.getItem('institutionId');
      const baseUrl = import.meta.env.VITE_API_URL;

      const formDataToSend = new FormData();
      formDataToSend.append('group_refer_id', formData.group_refer_id);
      formDataToSend.append('assignment_name', formData.assignment_name);
      formDataToSend.append('assignment_desc', formData.assignment_desc);
      formDataToSend.append('assigned_on', formData.assigned_on);
      formDataToSend.append('due', formData.due);
      formDataToSend.append('marks', formData.marks);

      // Add files if any
      formData.files.forEach((file, index) => {
        formDataToSend.append('files', file);
      });

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Institution-Id': institutionId,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (isEdit) {
        await axios.put(`${baseUrl}/api/assignments/${editingAssignment.id}`, {
          group_refer_id: formData.group_refer_id,
          assignment_name: formData.assignment_name,
          assignment_desc: formData.assignment_desc,
          assigned_on: formData.assigned_on,
          due: formData.due,
          marks: formData.marks,
          attachments: editingAssignment.attachments || {}
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Institution-Id': institutionId
          }
        });
      } else {
        await axios.post(`${baseUrl}/api/assignments`, formDataToSend, config);
      }

      // Success
      const message = isEdit ? 'Assignment updated successfully!' : 'Assignment created successfully!';
      setSuccessMessage(message);
      setTimeout(() => {
        setSuccessMessage('');
        if (isEdit) {
          setShowEditAssignment(false);
        } else {
          setShowCreateModal(false);
        }
        // Refresh assignments
        fetchAssignments(selectedGroup);
      }, 2000);

    } catch (error) {
      console.error('Error saving assignment:', error);
      setError(error.response?.data?.message || 'Failed to save assignment');
    } finally {
      setCreatingAssignment(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Validate files (PDF only, max 10MB each, max 10 files)
    const validFiles = files.filter(file => {
      if (file.type !== 'application/pdf') {
        alert(`${file.name} is not a PDF file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        alert(`${file.name} is larger than 10MB`);
        return false;
      }
      return true;
    });

    const currentFiles = formData.files || [];
    const newFiles = [...currentFiles, ...validFiles];

    if (newFiles.length > 10) {
      alert('Maximum 10 files allowed');
      return;
    }

    setFormData({ ...formData, files: newFiles });
  };

  const removeFile = (indexToRemove) => {
    const updatedFiles = formData.files.filter((_, index) => index !== indexToRemove);
    setFormData({ ...formData, files: updatedFiles });
  };

  // Filter groups based on selected course
  const filteredGroups = groups.filter(group => group.course_refer_id === selectedCourse);

  if (showSubmissionsView && selectedAssignmentForSubmissions) {
    return <FacultyAssignmentSubmissions assignment={selectedAssignmentForSubmissions} onBack={handleBackFromSubmissions} />;
  }

  if (showEditAssignment && editingAssignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => setShowEditAssignment(false)}
              className="bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700 px-4 py-2 rounded-lg shadow border border-gray-200 flex items-center transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Assignments
            </button>
          </div>
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-blue-800 mb-6">Edit Assignment</h2>
            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-800 font-medium">{successMessage}</span>
                </div>
              </div>
            )}
            <form onSubmit={(e) => handleSubmitAssignment(e, true)}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Group</label>
                  <select
                    value={formData.group_refer_id}
                    onChange={(e) => setFormData({ ...formData, group_refer_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 appearance-none cursor-pointer hover:border-slate-300"
                    required
                  >
                    <option value="">Select Group</option>
                    {filteredGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.group_name} ({group.group_code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Assignment Name</label>
                  <input
                    type="text"
                    value={formData.assignment_name}
                    onChange={(e) => setFormData({ ...formData, assignment_name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={formData.assignment_desc}
                    onChange={(e) => {
                      setFormData({ ...formData, assignment_desc: e.target.value });
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 resize-none overflow-hidden"
                    rows="3"
                    ref={(el) => {
                      if (el) {
                        el.style.height = 'auto';
                        el.style.height = el.scrollHeight + 'px';
                      }
                    }}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Assigned On</label>
                    <input
                      type="datetime-local"
                      value={formData.assigned_on}
                      onChange={(e) => setFormData({ ...formData, assigned_on: e.target.value })}
                      className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Due Date</label>
                    <input
                      type="datetime-local"
                      value={formData.due}
                      onChange={(e) => setFormData({ ...formData, due: e.target.value })}
                      className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Total Marks</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.marks}
                      onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                      className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 appearance-none"
                      placeholder="Enter total marks"
                      onWheel={(e) => e.preventDefault()}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowEditAssignment(false)}
                  disabled={creatingAssignment}
                  className="px-6 py-3 text-slate-600 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAssignment}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {creatingAssignment ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Update Assignment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (showViewAssignment && selectedAssignment) {
    const isOverdue = selectedAssignment.due ? new Date(selectedAssignment.due) < new Date() : false;
    const isDueSoon = selectedAssignment.due ? (new Date(selectedAssignment.due) - new Date()) < (7 * 24 * 60 * 60 * 1000) : false;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="mb-6">
            <button
              onClick={() => setShowViewAssignment(false)}
              className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow border border-gray-200 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium text-sm">Back to Assignments</span>
            </button>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* Assignment Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-6 text-gray-900">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold mb-1">{selectedAssignment.assignment_name}</h1>
                      <div className="flex items-center space-x-3 text-gray-600">
                        <span className="flex items-center text-sm">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {groups.find(g => g.id === selectedAssignment.group_refer_id)?.group_name || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assignment Details */}
                <div className="mt-3 lg:mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <div className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Assigned On</div>
                      <div className="text-sm font-medium text-blue-900 mt-1">
                        {selectedAssignment.assigned_on ? new Date(selectedAssignment.assigned_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <div className="text-xs font-semibold text-green-800 uppercase tracking-wide">Due Date</div>
                      <div className="text-sm font-medium text-green-900 mt-1">
                        {selectedAssignment.due ? new Date(selectedAssignment.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                      <div className="text-xs font-semibold text-purple-800 uppercase tracking-wide">Total Marks</div>
                      <div className="text-sm font-medium text-purple-900 mt-1">
                        {selectedAssignment.marks || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6">

              {/* Description Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Assignment Description</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {selectedAssignment.assignment_desc || 'No description provided for this assignment.'}
                </p>
              </div>

              {/* Attachments Section */}
              {Object.keys(selectedAssignment.attachments || {}).length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-3">Attachments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    {Object.entries(selectedAssignment.attachments).map(([filename, url]) => (
                      <div key={filename}
                           className="p-3 bg-white rounded border border-gray-200 cursor-pointer hover:bg-gray-50"
                           onClick={() => window.open(url, '_blank')}>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="ml-2 flex-1">
                            <h4 className="text-xs font-medium text-gray-800 truncate" title={filename}>
                              {filename}
                            </h4>
                            <p className="text-xs text-gray-500">Click to open</p>
                          </div>
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-xs text-gray-600">
                  Last updated: {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setShowViewAssignment(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 font-medium text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Close
                  </button>
                  <button
                    onClick={() => handleEditAssignment(selectedAssignment)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Assignment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showCreateModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => setShowCreateModal(false)}
              className="bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700 px-4 py-2 rounded-lg shadow border border-gray-200 flex items-center transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Assignments
            </button>
          </div>
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-blue-800 mb-6">Create New Assignment</h2>
            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-800 font-medium">{successMessage}</span>
                </div>
              </div>
            )}
            <form onSubmit={(e) => handleSubmitAssignment(e, false)}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Group</label>
                  <select
                    value={formData.group_refer_id}
                    onChange={(e) => setFormData({ ...formData, group_refer_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 appearance-none cursor-pointer hover:border-slate-300"
                    required
                  >
                    <option value="">Select Group</option>
                    {filteredGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.group_name} ({group.group_code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Assignment Name</label>
                  <input
                    type="text"
                    value={formData.assignment_name}
                    onChange={(e) => setFormData({ ...formData, assignment_name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={formData.assignment_desc}
                    onChange={(e) => setFormData({ ...formData, assignment_desc: e.target.value })}
                    className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 resize-none overflow-hidden"
                    rows="3"
                    ref={(el) => {
                      if (el) {
                        el.style.height = 'auto';
                        el.style.height = el.scrollHeight + 'px';
                      }
                    }}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Assigned On</label>
                    <input
                      type="datetime-local"
                      value={formData.assigned_on}
                      onChange={(e) => setFormData({ ...formData, assigned_on: e.target.value })}
                      className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Due Date</label>
                    <input
                      type="datetime-local"
                      value={formData.due}
                      onChange={(e) => setFormData({ ...formData, due: e.target.value })}
                      className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Total Marks <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="0"
                      value={formData.marks}
                      onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                      className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 appearance-none"
                      placeholder="Enter total marks"
                      onWheel={(e) => e.preventDefault()}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Attachments (PDF only, max 10MB each, max 10 files)</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="file"
                      multiple
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Choose Files
                    </label>
                    <span className="text-sm text-slate-600">
                      {formData.files?.length || 0} file(s) selected
                    </span>
                  </div>
                  {formData.files && formData.files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm text-slate-900">{file.name}</span>
                            <span className="text-xs text-slate-500 ml-2">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creatingAssignment}
                  className="px-6 py-3 text-slate-600 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAssignment}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {creatingAssignment ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Assignment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Professional Header Section */}
        <div className="mb-8">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 break-words"
                  style={{
                    background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 50%, #581c87 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    display: 'inline-block'
                  }}>
                Assignment Management
              </h1>
            </div>
        </div>

        {/* Filters and Controls */}
        <div className="mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label htmlFor="course-select" className="block text-sm font-semibold text-slate-700 mb-2">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Academic Course
                  </div>
                </label>
                <div className="relative">
                  <select
                    id="course-select"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer hover:border-slate-300"
                  >
                    <option value="" disabled>Select Course</option>
                    {[...new Set(groups.map(group => group.course_refer_id))].map((courseId) => {
                      const group = groups.find(g => g.course_refer_id === courseId);
                      return (
                        <option key={courseId} value={courseId}>
                          {group?.courses?.course_code || `Course ${courseId}`}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="group-select" className="block text-sm font-semibold text-slate-700 mb-2">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Study Group
                  </div>
                </label>
                <div className="relative">
                  <select
                    id="group-select"
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 appearance-none cursor-pointer hover:border-slate-300"
                  >
                    <option value="" disabled>Select Group</option>
                    {filteredGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.group_name} ({group.group_code})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-200">
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <div className="flex items-center">

                </div>
              </div>
              <button
                onClick={handleCreateAssignment}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create New Assignment</span>
              </button>
            </div>
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-16">
            <div className="text-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900 mb-4">
                No Assignments Created Yet
              </h3>
              <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
                Start building your course content by creating your first assignment. You can add descriptions, due dates, and supporting materials.
              </p>
              <button
                onClick={handleCreateAssignment}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Your First Assignment</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 via-blue-50/30 to-indigo-50/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-blue-800">
                      Assignments
                    </h2>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-xl px-4 py-2 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="text-sm font-semibold text-blue-800">
                        {assignments.length} Total Assignments
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/50">
                  <tr>
                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <span>Assignment Name</span>
                      </div>
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider w-48">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span>Timeline</span>
                      </div>
                    </th>
                    <th className="px-4 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider w-24">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </div>
                        <span>Marks</span>
                      </div>
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                        </div>
                        <span>Resources</span>
                      </div>
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <span>Management</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-slate-200/60">
                  {assignments.map((assignment, index) => (
                    <tr key={assignment.id} className="group hover:bg-gradient-to-r hover:from-slate-50/80 hover:via-blue-50/30 hover:to-indigo-50/30 transition-all duration-300">
                      {/* Assignment Name Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="pl-12">
                            <div className="text-base font-semibold text-slate-800 group-hover:text-blue-700 transition-colors duration-200">
                              {assignment.assignment_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Timeline Column */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-slate-700">
                            <span className="font-semibold text-emerald-700">Assigned:</span> {assignment.assigned_on ? new Date(assignment.assigned_on).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'N/A'}
                          </div>
                          <div className="text-sm text-slate-700">
                            <span className="font-semibold text-red-700">Due:</span> {assignment.due ? new Date(assignment.due).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'N/A'}
                          </div>
                        </div>
                      </td>
                      
                      {/* Evaluation Column */}
                      <td className="px-4 py-4">
                            <div className="text-lg font-bold text-amber-600 text-center">
                              {assignment.marks || 'N/A'}
                            </div>
                      </td>

                      {/* Resources Column */}
                      <td className="px-6 py-4">
                        <div className="text-center">
                          <div className="text-base font-semibold text-purple-600">
                            {Object.keys(assignment.attachments || {}).length} Files
                          </div>
                        </div>
                      </td>
                      
                      {/* Management Column */}
                      <td className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-1.5">
                          {/* Top row */}
                          <button
                            onClick={() => handleViewAssignment(assignment)}
                            className="inline-flex items-center justify-center px-2.5 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-md text-xs font-semibold transition-all duration-200 hover:shadow-sm transform hover:scale-105"
                          >
                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            View
                          </button>
                          <button
                            onClick={() => handleViewSubmissions(assignment)}
                            className="inline-flex items-center justify-center px-2.5 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-md text-xs font-semibold transition-all duration-200 hover:shadow-sm transform hover:scale-105"
                          >
                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Submissions
                          </button>
                          {/* Bottom row */}
                          <button
                            onClick={() => handleEditAssignment(assignment)}
                            className="inline-flex items-center justify-center px-2.5 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-md text-xs font-semibold transition-all duration-200 hover:shadow-sm transform hover:scale-105"
                          >
                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            className="inline-flex items-center justify-center px-2.5 py-1.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-md text-xs font-semibold transition-all duration-200 hover:shadow-sm transform hover:scale-105"
                          >
                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
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
};

export default FacultyAssignments;