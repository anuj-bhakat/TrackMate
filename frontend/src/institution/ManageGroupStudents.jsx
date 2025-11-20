import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageGroupStudents = ({ group, onClose }) => {
  const [groupMembers, setGroupMembers] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFastLearnersModal, setShowFastLearnersModal] = useState(false);
  const [showSlowLearnersModal, setShowSlowLearnersModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedFastLearners, setSelectedFastLearners] = useState([]);
  const [selectedSlowLearners, setSelectedSlowLearners] = useState([]);
  const [addLoading, setAddLoading] = useState(false);
  const [addFastLearnersLoading, setAddFastLearnersLoading] = useState(false);
  const [addSlowLearnersLoading, setAddSlowLearnersLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(null);
  const [cgpaFilter, setCgpaFilter] = useState(8);
  const [backlogFilter, setBacklogFilter] = useState(0);
  const [slowLearnersCgpaFilter, setSlowLearnersCgpaFilter] = useState(6.5);
  const [slowLearnersBacklogFilter, setSlowLearnersBacklogFilter] = useState(2);

  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchGroupMembers();
    fetchAvailableStudents();
  }, [group.id]);

  const fetchGroupMembers = async () => {
    setMembersLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');
      const response = await axios.get(`${baseUrl}/api/group-details/group/${group.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setGroupMembers(response.data);
    } catch (error) {
      console.error('Error fetching group members:', error);
      setGroupMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      const token = localStorage.getItem('institutionToken');
      const response = await axios.get(`${baseUrl}/api/group-details/eligible-students-data/${group.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAvailableStudents(response.data);
    } catch (error) {
      console.error('Error fetching eligible students:', error);
      setAvailableStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student to add');
      return;
    }

    setAddLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');

      // Add multiple students to the group
      const promises = selectedStudents.map(student =>
        axios.post(`${baseUrl}/api/group-details`, {
          group_refer_id: group.id,
          student_details_refer_id: student.id
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      );

      await Promise.all(promises);

      setShowAddModal(false);
      setSelectedStudents([]);
      fetchGroupMembers(); // Refresh the list
      alert('Students added to group successfully!');
    } catch (error) {
      console.error('Error adding students to group:', error);
      alert('Failed to add students to group. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleAddFastLearners = async () => {
    if (selectedFastLearners.length === 0) {
      alert('Please select at least one fast learner to add');
      return;
    }

    setAddFastLearnersLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');

      // Add multiple fast learners to the group
      const promises = selectedFastLearners.map(student =>
        axios.post(`${baseUrl}/api/group-details`, {
          group_refer_id: group.id,
          student_details_refer_id: student.id
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      );

      await Promise.all(promises);

      setShowFastLearnersModal(false);
      setSelectedFastLearners([]);
      fetchGroupMembers(); // Refresh the list
      alert('Fast learners added to group successfully!');
    } catch (error) {
      console.error('Error adding fast learners to group:', error);
      alert('Failed to add fast learners to group. Please try again.');
    } finally {
      setAddFastLearnersLoading(false);
    }
  };

  const handleAddSlowLearners = async () => {
    if (selectedSlowLearners.length === 0) {
      alert('Please select at least one slow learner to add');
      return;
    }

    setAddSlowLearnersLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');

      // Add multiple slow learners to the group
      const promises = selectedSlowLearners.map(student =>
        axios.post(`${baseUrl}/api/group-details`, {
          group_refer_id: group.id,
          student_details_refer_id: student.id
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      );

      await Promise.all(promises);

      setShowSlowLearnersModal(false);
      setSelectedSlowLearners([]);
      fetchGroupMembers(); // Refresh the list
      alert('Slow learners added to group successfully!');
    } catch (error) {
      console.error('Error adding slow learners to group:', error);
      alert('Failed to add slow learners to group. Please try again.');
    } finally {
      setAddSlowLearnersLoading(false);
    }
  };

  const handleRemoveStudent = async (memberId) => {
    setRemoveLoading(memberId);
    try {
      const token = localStorage.getItem('institutionToken');
      await axios.delete(`${baseUrl}/api/group-details/${memberId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchGroupMembers(); // Refresh the list
      alert('Student removed from group successfully!');
    } catch (error) {
      console.error('Error removing student from group:', error);
      alert('Failed to remove student from group. Please try again.');
    } finally {
      setRemoveLoading(null);
    }
  };

  // Mark students who are already in the group
  const studentsForModal = availableStudents.map(student => {
    const isAlreadyAdded = groupMembers.some(member =>
      member.student_details_refer_id === student.id
    );
    return { ...student, isAlreadyAdded };
  });

  const filteredStudentsForModal = studentsForModal.filter(student =>
    student.students?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.students?.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.students?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter fast learners based on CGPA and backlog criteria
  const fastLearnersForModal = studentsForModal.filter(student =>
    !student.isAlreadyAdded &&
    (student.cgpa || 0) >= cgpaFilter &&
    (student.backlogs || 0) >= backlogFilter
  );

  const filteredFastLearnersForModal = fastLearnersForModal.filter(student =>
    student.students?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.students?.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.students?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter slow learners based on CGPA and backlog criteria
  const slowLearnersForModal = studentsForModal.filter(student =>
    !student.isAlreadyAdded &&
    (student.cgpa || 0) <= slowLearnersCgpaFilter &&
    (student.backlogs || 0) >= slowLearnersBacklogFilter
  );

  const filteredSlowLearnersForModal = slowLearnersForModal.filter(student =>
    student.students?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.students?.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.students?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroupMembers = groupMembers.filter(member =>
    member.student_details?.students?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.student_details?.students?.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.student_details?.students?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Manage Group: {group.group_name}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {group.courses ? `${group.courses.course_name} (${group.courses.course_code})` : 'No course assigned'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Groups
            </button>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by student name, student ID, or username..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm sm:text-base"
              >
                Add Students
              </button>
              <button
                onClick={() => setShowFastLearnersModal(true)}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base"
              >
                Add Fast Learners
              </button>
              <button
                onClick={() => setShowSlowLearnersModal(true)}
                className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm sm:text-base"
              >
                Add Slow Learners
              </button>
            </div>
          </div>
        </div>

        {/* Group Members Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Group Members ({filteredGroupMembers.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            {membersLoading ? (
              <div className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Student ID
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Program & Semester
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGroupMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-green-600 font-medium text-xs sm:text-sm">
                                {member.student_details?.students?.name?.charAt(0)?.toUpperCase() || 'S'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3 sm:ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.student_details?.students?.name}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500">
                              {member.student_details?.students?.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                        {member.student_details?.students?.student_id}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                        <div>
                          <div className="font-medium">{member.student_details?.program_code}</div>
                          <div className="text-gray-500">{member.student_details?.semester_code}</div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <button
                          onClick={() => handleRemoveStudent(member.id)}
                          disabled={removeLoading === member.id}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          {removeLoading === member.id ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-3 w-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Removing...
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                              Remove
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredGroupMembers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <p className="text-gray-500">No students in this group yet.</p>
                        <p className="text-sm text-gray-400 mt-1">Click "Add Students" to add members to this group.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Add Students Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add Students to Group</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search available students..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-md">
                    {filteredStudentsForModal.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {filteredStudentsForModal.map((student) => (
                          student.isAlreadyAdded ? (
                            // Already Added Students
                            <div key={`added-${student.id}`} className="flex items-center p-4 bg-gray-50 border-l-4 border-green-500">
                              <input
                                type="checkbox"
                                checked={true}
                                disabled={true}
                                className="rounded border-gray-300 text-gray-400 cursor-not-allowed"
                              />
                              <div className="ml-3 flex items-center">
                                <div className="flex-shrink-0 h-8 w-8">
                                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <span className="text-green-600 font-medium text-xs">
                                      {student.students?.name?.charAt(0)?.toUpperCase() || 'S'}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{student.students?.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {student.students?.student_id} • {student.students?.username}
                                  </div>
                                  <div className="flex gap-4 mt-1">
                                    <div className="text-xs">
                                      <span className="text-gray-600">CGPA:</span>
                                      <span className="font-medium text-green-600 ml-1">{student.cgpa || 'N/A'}</span>
                                    </div>
                                    <div className="text-xs">
                                      <span className="text-gray-600">Backlogs:</span>
                                      <span className={`font-medium ml-1 ${student.backlogs > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {student.backlogs || 0}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-xs text-green-600 font-medium mt-1">
                                    ✓ Already Added
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Eligible Students
                            <label key={`eligible-${student.id}`} className="flex items-center p-4 hover:bg-gray-50">
                              <input
                                type="checkbox"
                                checked={selectedStudents.some(s => s.id === student.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedStudents([...selectedStudents, student]);
                                  } else {
                                    setSelectedStudents(selectedStudents.filter(s => s.id !== student.id));
                                  }
                                }}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                              />
                              <div className="ml-3 flex items-center">
                                <div className="flex-shrink-0 h-8 w-8">
                                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                                    <span className="text-orange-600 font-medium text-xs">
                                      {student.students?.name?.charAt(0)?.toUpperCase() || 'S'}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{student.students?.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {student.students?.student_id} • {student.students?.username}
                                  </div>
                                  <div className="flex gap-4 mt-1">
                                    <div className="text-xs">
                                      <span className="text-gray-600">CGPA:</span>
                                      <span className="font-medium text-green-600 ml-1">{student.cgpa || 'N/A'}</span>
                                    </div>
                                    <div className="text-xs">
                                      <span className="text-gray-600">Backlogs:</span>
                                      <span className={`font-medium ml-1 ${student.backlogs > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {student.backlogs || 0}
                                      </span>
                                    </div>
                                  </div>
                                  {student.courses && Object.keys(student.courses).length > 0 && (
                                    <div className="text-xs text-blue-600 mt-1">
                                      Courses: {Object.keys(student.courses).join(', ')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </label>
                          )
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-gray-500">No students found.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {selectedStudents.length} student(s) selected
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddStudents}
                      disabled={addLoading || selectedStudents.length === 0}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addLoading ? 'Adding...' : 'Add Selected Students'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Fast Learners Modal */}
        {showFastLearnersModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add Fast Learners to Group</h3>
                  <button
                    onClick={() => setShowFastLearnersModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Filters */}
                <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Min CGPA</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={cgpaFilter}
                        onChange={(e) => setCgpaFilter(parseFloat(e.target.value) || 0)}
                        onWheel={(e) => e.target.blur()}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Min Backlogs</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={backlogFilter}
                        onChange={(e) => setBacklogFilter(parseInt(e.target.value) || 0)}
                        onWheel={(e) => e.target.blur()}
                      />
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      CGPA ≥ {cgpaFilter}, Backlogs ≥ {backlogFilter}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search fast learners..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-md">
                    {filteredFastLearnersForModal.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {/* Select All Header */}
                        <div className="flex items-center p-4 bg-gray-50 border-b border-gray-200">
                          <input
                            type="checkbox"
                            checked={filteredFastLearnersForModal.length > 0 && selectedFastLearners.length === filteredFastLearnersForModal.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                // Select all visible fast learners
                                const allVisible = filteredFastLearnersForModal.filter(student =>
                                  !selectedFastLearners.some(s => s.id === student.id)
                                );
                                setSelectedFastLearners([...selectedFastLearners, ...allVisible]);
                              } else {
                                // Deselect all visible fast learners
                                const visibleIds = filteredFastLearnersForModal.map(s => s.id);
                                setSelectedFastLearners(selectedFastLearners.filter(student =>
                                  !visibleIds.includes(student.id)
                                ));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-700">
                            Select All ({filteredFastLearnersForModal.length} students)
                          </span>
                        </div>
                        {filteredFastLearnersForModal.map((student) => (
                          <label key={`fast-${student.id}`} className="flex items-center p-4 hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={selectedFastLearners.some(s => s.id === student.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedFastLearners([...selectedFastLearners, student]);
                                } else {
                                  setSelectedFastLearners(selectedFastLearners.filter(s => s.id !== student.id));
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="ml-3 flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-medium text-xs">
                                    {student.students?.name?.charAt(0)?.toUpperCase() || 'S'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{student.students?.name}</div>
                                <div className="text-xs text-gray-500">
                                  {student.students?.student_id} • {student.students?.username}
                                </div>
                                <div className="flex gap-4 mt-1">
                                  <div className="text-xs">
                                    <span className="text-gray-600">CGPA:</span>
                                    <span className="font-medium text-green-600 ml-1">{student.cgpa || 'N/A'}</span>
                                  </div>
                                  <div className="text-xs">
                                    <span className="text-gray-600">Backlogs:</span>
                                    <span className={`font-medium ml-1 ${student.backlogs > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                      {student.backlogs || 0}
                                    </span>
                                  </div>
                                </div>
                                {student.courses && Object.keys(student.courses).length > 0 && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    Courses: {Object.keys(student.courses).join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-gray-500">No fast learners found matching the criteria.</p>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting the filter criteria.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {selectedFastLearners.length} fast learner(s) selected
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowFastLearnersModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddFastLearners}
                      disabled={addFastLearnersLoading || selectedFastLearners.length === 0}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addFastLearnersLoading ? 'Adding...' : 'Add Selected Fast Learners'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Slow Learners Modal */}
        {showSlowLearnersModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add Slow Learners to Group</h3>
                  <button
                    onClick={() => setShowSlowLearnersModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Filters */}
                <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Max CGPA</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={slowLearnersCgpaFilter}
                        onChange={(e) => setSlowLearnersCgpaFilter(parseFloat(e.target.value) || 0)}
                        onWheel={(e) => e.target.blur()}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Min Backlogs</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={slowLearnersBacklogFilter}
                        onChange={(e) => setSlowLearnersBacklogFilter(parseInt(e.target.value) || 0)}
                        onWheel={(e) => e.target.blur()}
                      />
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      CGPA ≤ {slowLearnersCgpaFilter}, Backlogs ≥ {slowLearnersBacklogFilter}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search slow learners..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-md">
                    {filteredSlowLearnersForModal.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {/* Select All Header */}
                        <div className="flex items-center p-4 bg-gray-50 border-b border-gray-200">
                          <input
                            type="checkbox"
                            checked={filteredSlowLearnersForModal.length > 0 && selectedSlowLearners.length === filteredSlowLearnersForModal.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                // Select all visible slow learners
                                const allVisible = filteredSlowLearnersForModal.filter(student =>
                                  !selectedSlowLearners.some(s => s.id === student.id)
                                );
                                setSelectedSlowLearners([...selectedSlowLearners, ...allVisible]);
                              } else {
                                // Deselect all visible slow learners
                                const visibleIds = filteredSlowLearnersForModal.map(s => s.id);
                                setSelectedSlowLearners(selectedSlowLearners.filter(student =>
                                  !visibleIds.includes(student.id)
                                ));
                              }
                            }}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-700">
                            Select All ({filteredSlowLearnersForModal.length} students)
                          </span>
                        </div>
                        {filteredSlowLearnersForModal.map((student) => (
                          <label key={`slow-${student.id}`} className="flex items-center p-4 hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={selectedSlowLearners.some(s => s.id === student.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSlowLearners([...selectedSlowLearners, student]);
                                } else {
                                  setSelectedSlowLearners(selectedSlowLearners.filter(s => s.id !== student.id));
                                }
                              }}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <div className="ml-3 flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                  <span className="text-red-600 font-medium text-xs">
                                    {student.students?.name?.charAt(0)?.toUpperCase() || 'S'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{student.students?.name}</div>
                                <div className="text-xs text-gray-500">
                                  {student.students?.student_id} • {student.students?.username}
                                </div>
                                <div className="flex gap-4 mt-1">
                                  <div className="text-xs">
                                    <span className="text-gray-600">CGPA:</span>
                                    <span className="font-medium text-orange-600 ml-1">{student.cgpa || 'N/A'}</span>
                                  </div>
                                  <div className="text-xs">
                                    <span className="text-gray-600">Backlogs:</span>
                                    <span className={`font-medium ml-1 ${student.backlogs > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                      {student.backlogs || 0}
                                    </span>
                                  </div>
                                </div>
                                {student.courses && Object.keys(student.courses).length > 0 && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    Courses: {Object.keys(student.courses).join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-gray-500">No slow learners found matching the criteria.</p>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting the filter criteria.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {selectedSlowLearners.length} slow learner(s) selected
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowSlowLearnersModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddSlowLearners}
                      disabled={addSlowLearnersLoading || selectedSlowLearners.length === 0}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addSlowLearnersLoading ? 'Adding...' : 'Add Selected Slow Learners'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageGroupStudents;