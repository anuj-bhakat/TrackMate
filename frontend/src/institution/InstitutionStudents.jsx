import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ManageGroupStudents from './ManageGroupStudents';

const InstitutionStudents = () => {
  const [students, setStudents] = useState([]);
  const [assignStudents, setAssignStudents] = useState([]);
  const [studentDetails, setStudentDetails] = useState([]);
  const [groups, setGroups] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignStudentsLoading, setAssignStudentsLoading] = useState(false);
  const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditAssignmentModal, setShowEditAssignmentModal] = useState(false);
  const [viewingFromAssignments, setViewingFromAssignments] = useState(false);
  const [editAssignmentFormData, setEditAssignmentFormData] = useState({
    programCode: '',
    programId: '',
    semesterCode: '',
    semesterId: '',
    selectedCourses: {}
  });
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('manageStudentsActiveSection') || 'students';
  });
  const [addFormData, setAddFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    studentId: '',
    password: '',
    confirmPassword: ''
  });
  const [assignFormData, setAssignFormData] = useState({
    programCode: '',
    programId: '',
    semesterCode: '',
    semesterId: '',
    selectedCourses: {}
  });
  const [addLoading, setAddLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [editAssignmentLoading, setEditAssignmentLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchStudents();
    fetchPrograms();
    fetchSemesters();
    fetchStudentDetails();
    fetchAssignStudents();
    fetchGroups();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');
      const response = await axios.get(`${baseUrl}/api/students/institution/${institutionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');
      const response = await axios.get(`${baseUrl}/api/programs/${institutionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPrograms(response.data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchSemesters = async () => {
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');
      const response = await axios.get(`${baseUrl}/api/semesters/${institutionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSemesters(response.data);
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  };

  const fetchStudentDetails = async () => {
    setStudentDetailsLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');
      const response = await axios.get(`${baseUrl}/api/student-details/institution/${institutionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStudentDetails(response.data);
    } catch (error) {
      console.error('Error fetching student details:', error);
      setStudentDetails([]);
    } finally {
      setStudentDetailsLoading(false);
    }
  };

  const fetchAssignStudents = async () => {
    setAssignStudentsLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');
      const response = await axios.get(`${baseUrl}/api/students/institution/${institutionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAssignStudents(response.data);
    } catch (error) {
      console.error('Error fetching assign students:', error);
      setAssignStudents([]);
    } finally {
      setAssignStudentsLoading(false);
    }
  };

  const fetchGroups = async () => {
    setGroupsLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');
      const response = await axios.get(`${baseUrl}/api/groups/institution/${institutionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  };

  const fetchCoursesForProgramSemester = async (programCode, semesterCode) => {
    if (!programCode || !semesterCode) return;

    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');
      const response = await axios.get(`${baseUrl}/api/courses/${institutionId}/${programCode}/${semesterCode}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if student is assigned by comparing with studentDetails
  const isStudentAssigned = (studentId) => {
    return studentDetails.some(detail => detail.refer_id === studentId);
  };

  // Get assignment details for a student
  const getStudentAssignment = (studentId) => {
    return studentDetails.find(detail => detail.refer_id === studentId);
  };

  const isGuest = localStorage.getItem('isGuest') === 'true';

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleViewStudentDetails = (student, fromAssignments = false) => {
    setSelectedStudentDetail(student);
    setViewingFromAssignments(fromAssignments);
    setShowModal(true);
  };

  const handleViewAssignmentDetails = (assignment) => {
    setSelectedStudentDetail(assignment);
    setViewingFromAssignments(true);
    setShowModal(true);
  };

  const handleAssignStudent = (student) => {
    setSelectedStudent(student);
    setShowAssignModal(true);
    // Reset form data
    setAssignFormData({
      programCode: '',
      programId: '',
      semesterCode: '',
      semesterId: '',
      selectedCourses: {}
    });
    setCourses([]);
  };

  const handleEditStudentAssignment = (assignment) => {
    setSelectedStudentDetail(assignment);
    setEditAssignmentFormData({
      programCode: assignment.program_code || '',
      programId: assignment.program_id || '',
      semesterCode: assignment.semester_code || '',
      semesterId: assignment.semester_id || '',
      selectedCourses: assignment.courses || {}
    });
    // Fetch courses for the current program and semester to show available options
    fetchCoursesForProgramSemester(assignment.program_code, assignment.semester_code);
    setShowEditAssignmentModal(true);
  };

  const handleEditAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (isGuest) return;
    if (!selectedStudentDetail) return;

    setEditAssignmentLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');

      // Update courses using the PATCH endpoint
      await axios.patch(`${baseUrl}/api/student-details/${selectedStudentDetail.refer_id}/courses`, {
        courses: editAssignmentFormData.selectedCourses
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setShowEditAssignmentModal(false);
      setSelectedStudentDetail(null);
      setEditAssignmentFormData({
        programCode: '',
        programId: '',
        semesterCode: '',
        semesterId: '',
        selectedCourses: {}
      });
      fetchStudentDetails(); // Refresh the list
      alert('Student courses updated successfully!');
    } catch (error) {
      console.error('Error updating courses:', error);
      alert('Failed to update student courses. Please try again.');
    } finally {
      setEditAssignmentLoading(false);
    }
  };




  const handleDeleteStudent = async (student) => {
    if (isGuest) return;
    setDeleteLoading(student.student_id);
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');
      await axios.delete(`${baseUrl}/api/students/${institutionId}/${student.student_id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchStudents(); // Refresh the students list
      alert('Student deleted successfully!');
    } catch (error) {
      console.error('Error deleting student:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to delete student. Please try again.';
      alert(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeleteAssignment = async (student) => {
    if (isGuest) return;
    setDeleteLoading(student.student_id);
    try {
      const token = localStorage.getItem('institutionToken');
      await axios.delete(`${baseUrl}/api/student-details/student/${student.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchStudentDetails(); // Refresh the assignment list
      alert('Student assignment deleted successfully!');
    } catch (error) {
      console.error('Error deleting student assignment:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to delete student assignment. Please try again.';
      alert(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (isGuest) return;
    if (!addFormData.firstName || !addFormData.lastName || !addFormData.username || !addFormData.studentId || !addFormData.password || !addFormData.confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    if (addFormData.password !== addFormData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setAddLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');

      await axios.post(`${baseUrl}/api/students/signup`, {
        institution_id: institutionId,
        student_id: addFormData.studentId,
        name: `${addFormData.firstName} ${addFormData.lastName}`,
        username: addFormData.username,
        password: addFormData.password
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setShowAddModal(false);
      setAddFormData({
        firstName: '',
        lastName: '',
        username: '',
        studentId: '',
        password: '',
        confirmPassword: ''
      });
      fetchStudents(); // Refresh the list
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Failed to add student. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleAssignStudentToProgram = async (e) => {
    e.preventDefault();
    if (isGuest) return;
    if (!selectedStudent) return;

    setAssignLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');

      const payload = {
        refer_id: selectedStudent.id
      };

      if (assignFormData.programCode) payload.program_code = assignFormData.programCode;
      if (assignFormData.programId) payload.program_id = assignFormData.programId;
      if (assignFormData.semesterCode) payload.semester_code = assignFormData.semesterCode;
      if (assignFormData.semesterId) payload.semester_id = assignFormData.semesterId;
      if (Object.keys(assignFormData.selectedCourses).length > 0) payload.courses = assignFormData.selectedCourses;

      await axios.post(`${baseUrl}/api/student-details`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setShowAssignModal(false);
      setSelectedStudent(null);
      setAssignFormData({
        programCode: '',
        programId: '',
        semesterCode: '',
        semesterId: '',
        selectedCourses: {}
      });
      fetchStudentDetails(); // Refresh the list
      alert('Student assigned successfully!');
    } catch (error) {
      console.error('Error assigning student:', error);
      alert('Failed to assign student. Please try again.');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUpdateStudentDetails = async (studentDetailId, updates) => {
    try {
      const token = localStorage.getItem('institutionToken');

      await axios.put(`${baseUrl}/api/student-details/${studentDetailId}`, updates, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchStudentDetails(); // Refresh the list
    } catch (error) {
      console.error('Error updating student details:', error);
      alert('Failed to update student details. Please try again.');
    }
  };

  const handleUpdateStudentCourses = async (studentDetailId, courses) => {
    try {
      const token = localStorage.getItem('institutionToken');

      await axios.patch(`${baseUrl}/api/student-details/${studentDetailId}/courses`, {
        courses: courses
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchStudentDetails(); // Refresh the list
    } catch (error) {
      console.error('Error updating student courses:', error);
      alert('Failed to update student courses. Please try again.');
    }
  };


  const handleDeleteStudentDetails = async (studentDetailId) => {
    try {
      const token = localStorage.getItem('institutionToken');

      await axios.delete(`${baseUrl}/api/students/${localStorage.getItem('institutionId')}/${studentDetailId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchStudents(); // Refresh the list
      fetchStudentDetails(); // Refresh the list
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student. Please try again.');
    }
  };

  const handleManageGroup = (group) => {
    setSelectedGroup(group);
  };

  const handleCloseGroupManagement = () => {
    setSelectedGroup(null);
  };

  if (selectedGroup) {
    return <ManageGroupStudents group={selectedGroup} onClose={handleCloseGroupManagement} />;
  }

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
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Students</h1>
        </div>

        {/* Section Toggle */}
        <div className="mb-8 flex justify-center">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => {
                setActiveSection('students');
                localStorage.setItem('manageStudentsActiveSection', 'students');
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${activeSection === 'students'
                ? 'bg-white text-orange-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Manage Students
            </button>
            <button
              onClick={() => {
                setActiveSection('assignments');
                localStorage.setItem('manageStudentsActiveSection', 'assignments');
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${activeSection === 'assignments'
                ? 'bg-white text-orange-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Assign Students
            </button>
            <button
              onClick={() => {
                setActiveSection('assignGroups');
                localStorage.setItem('manageStudentsActiveSection', 'assignGroups');
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${activeSection === 'assignGroups'
                ? 'bg-white text-orange-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Assign Groups
            </button>
          </div>
        </div>

        {/* Search and Filters - Students Section */}
        {activeSection === 'students' && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name, student ID, or email..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  disabled={isGuest}
                  className={`px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-sm sm:text-base ${isGuest ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-700'}`}
                >
                  Add Student
                </button>
                <select className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base">
                  <option value="">All Programs</option>
                  <option value="undergraduate">Undergraduate</option>
                  <option value="graduate">Graduate</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters - Assignments Section */}
        {activeSection === 'assignments' && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by student name, student ID, or email..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters - Assign Groups Section */}
        {activeSection === 'assignGroups' && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by group name, code, or course..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Students Table */}
        {activeSection === 'students' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Student ID
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-orange-100 flex items-center justify-center">
                              <span className="text-orange-600 font-medium text-xs sm:text-sm">
                                {student.name?.charAt(0)?.toUpperCase() || 'S'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3 sm:ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-xs sm:text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                        {student.student_id}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${student.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {student.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                          <button
                            onClick={() => handleViewDetails(student)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student)}
                            disabled={deleteLoading === student.student_id || isGuest}
                            className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 ${deleteLoading === student.student_id || isGuest ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}`}
                          >
                            {deleteLoading === student.student_id ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-3 w-3" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Student
                              </>
                            )}
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

        {/* Student Assignments Table */}
        {activeSection === 'assignments' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {studentDetailsLoading ? (
              <div className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                        Assignment Status
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => {
                      const assigned = isStudentAssigned(student.id);
                      const assignment = getStudentAssignment(student.id);
                      return (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 flex items-center justify-center">
                                  <span className="text-green-600 font-medium text-xs sm:text-sm">
                                    {student.name?.charAt(0)?.toUpperCase() || 'S'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3 sm:ml-4">
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                            {student.student_id}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                            {assigned ? (
                              <div className="space-y-1">
                                <div className="text-green-600 font-medium">Assigned</div>
                                <div className="text-gray-500">
                                  {assignment?.program_code} - {assignment?.semester_code}
                                </div>
                                {assignment?.courses && Object.keys(assignment.courses).length > 0 && (
                                  <div className="text-gray-500">
                                    {Object.keys(assignment.courses).length} course(s)
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500">Not Assigned</span>
                            )}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                              {assigned && (
                                <button
                                  onClick={() => handleViewAssignmentDetails(assignment)}
                                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View Assignment
                                </button>
                              )}
                              {assigned ? (
                                <button
                                  onClick={() => handleEditStudentAssignment(assignment)}
                                  disabled={isGuest}
                                  className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-purple-700 bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 ${isGuest ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-200'}`}
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Modify
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAssignStudent(student)}
                                  disabled={isGuest}
                                  className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${isGuest ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-200'}`}
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  Assign
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAssignment(student)}
                                disabled={deleteLoading === student.student_id || isGuest}
                                className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 ${deleteLoading === student.student_id || isGuest ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}`}
                              >
                                {deleteLoading === student.student_id ? (
                                  <>
                                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center">
                          <p className="text-gray-500">No students found matching your criteria.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Assign Groups Table */}
        {activeSection === 'assignGroups' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {groupsLoading ? (
              <div className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Group
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Code
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Course
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groups.filter(group =>
                      group.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      group.group_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      group.courses?.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      group.courses?.course_code?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((group) => (
                      <tr key={group.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-purple-600 font-medium text-xs sm:text-sm">
                                  {group.group_name?.charAt(0)?.toUpperCase() || 'G'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3 sm:ml-4">
                              <div className="text-sm font-medium text-gray-900">{group.group_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                          {group.group_code}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                          {group.courses ? (
                            <div>
                              <div className="font-medium">{group.courses.course_name}</div>
                              <div className="text-gray-500">({group.courses.course_code})</div>
                            </div>
                          ) : (
                            'Not assigned'
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                            <button
                              onClick={() => handleManageGroup(group)}
                              disabled={isGuest}
                              className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${isGuest ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-200'}`}
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Manage
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {groups.filter(group =>
                      group.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      group.group_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      group.courses?.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      group.courses?.course_code?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center">
                            <p className="text-gray-500">No groups found matching your criteria.</p>
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Student Details Modal */}
        {showModal && (selectedStudent || selectedStudentDetail) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {viewingFromAssignments ? 'Assignment Details' : 'Student Details'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-3">
                  {viewingFromAssignments && selectedStudentDetail ? (
                    <div className="space-y-4">
                      {/* Student Information Section */}
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="text-md font-semibold text-blue-900 mb-3">Student Information</h4>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">Name:</span>
                            <span className="text-sm text-gray-900">{selectedStudentDetail.students?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">Student ID:</span>
                            <span className="text-sm text-gray-900">{selectedStudentDetail.students?.student_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">Username:</span>
                            <span className="text-sm text-gray-900">{selectedStudentDetail.students?.username}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">Institution ID:</span>
                            <span className="text-sm text-gray-900">{selectedStudentDetail.students?.institution_id}</span>
                          </div>
                        </div>
                      </div>

                      {/* Assignment Information Section */}
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="text-md font-semibold text-green-900 mb-3">Assignment Information</h4>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">Program:</span>
                            <span className="text-sm text-gray-900 font-medium">{selectedStudentDetail.program_code}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">Semester:</span>
                            <span className="text-sm text-gray-900 font-medium">{selectedStudentDetail.semester_code}</span>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-700">Courses:</span>
                            <div className="text-right">
                              {selectedStudentDetail.courses && Object.keys(selectedStudentDetail.courses).length > 0 ? (
                                <div className="space-y-1">
                                  {Object.keys(selectedStudentDetail.courses).map((courseCode, index) => (
                                    <div key={courseCode} className="text-sm text-gray-900 font-medium">
                                      {courseCode}
                                      {index < Object.keys(selectedStudentDetail.courses).length - 1 && ','}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500 italic">No courses assigned</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Assignment Status */}
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Assignment Status:</span>
                          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="text-sm text-gray-900">{selectedStudent?.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Student ID</label>
                        <p className="text-sm text-gray-900">{selectedStudent?.student_id}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <p className="text-sm text-gray-900">{selectedStudent?.username}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Institution ID</label>
                        <p className="text-sm text-gray-900">{selectedStudent?.institution_id}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assign Student Modal */}
        {showAssignModal && selectedStudent && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Assign Student to Program</h3>
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleAssignStudentToProgram} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student: {selectedStudent.name}</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={assignFormData.programCode}
                      onChange={(e) => {
                        const selectedProgram = programs.find(p => p.program_code === e.target.value);
                        setAssignFormData({
                          ...assignFormData,
                          programCode: e.target.value,
                          programId: selectedProgram ? selectedProgram.id : '',
                          semesterCode: '',
                          semesterId: '',
                          selectedCourses: {}
                        });
                        setCourses([]);
                      }}
                    >
                      <option value="">Select Program</option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.program_code}>
                          {program.program_name} ({program.program_code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={assignFormData.semesterCode}
                      onChange={(e) => {
                        const selectedSemester = semesters.find(s => s.semester_code === e.target.value && s.program_code === assignFormData.programCode);
                        setAssignFormData({
                          ...assignFormData,
                          semesterCode: e.target.value,
                          semesterId: selectedSemester ? selectedSemester.id : ''
                        });
                        fetchCoursesForProgramSemester(assignFormData.programCode, e.target.value);
                      }}
                      disabled={!assignFormData.programCode}
                    >
                      <option value="">
                        {semesters.filter(s => s.program_code === assignFormData.programCode).length > 0
                          ? 'Select Semester'
                          : 'No semesters available'}
                      </option>
                      {semesters
                        .filter(semester => semester.program_code === assignFormData.programCode)
                        .map((semester) => (
                          <option key={semester.id} value={semester.semester_code}>
                            {semester.semester} ({semester.semester_code})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Courses (Optional)</label>
                    <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                      {courses.length > 0 ? (
                        courses.map((course) => (
                          <label key={course.id} className="flex items-center space-x-2 mb-1">
                            <input
                              type="checkbox"
                              checked={assignFormData.selectedCourses[course.course_code] === course.id}
                              onChange={(e) => {
                                const newSelectedCourses = { ...assignFormData.selectedCourses };
                                if (e.target.checked) {
                                  newSelectedCourses[course.course_code] = course.id;
                                } else {
                                  delete newSelectedCourses[course.course_code];
                                }
                                setAssignFormData({
                                  ...assignFormData,
                                  selectedCourses: newSelectedCourses
                                });
                              }}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                            <span className="text-sm">{course.course_name} ({course.course_code})</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">Select program and semester to view courses</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAssignModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={assignLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {assignLoading ? 'Assigning...' : 'Assign Student'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Assignment Modal */}
        {showEditAssignmentModal && selectedStudentDetail && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Modify Student Courses</h3>
                  <button
                    onClick={() => setShowEditAssignmentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleEditAssignmentSubmit} className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Student Information</h4>
                    <div className="text-sm text-gray-700">
                      <div><strong>Name:</strong> {selectedStudentDetail.students?.name}</div>
                      <div><strong>Student ID:</strong> {selectedStudentDetail.students?.student_id}</div>
                      <div><strong>Current Program:</strong> {selectedStudentDetail.program_code}</div>
                      <div><strong>Current Semester:</strong> {selectedStudentDetail.semester_code}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Courses</label>
                    <p className="text-xs text-gray-600 mb-3">Select or deselect courses for this student. Currently assigned courses are pre-selected.</p>
                    <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 bg-gray-50">
                      {courses.length > 0 ? (
                        <div className="space-y-2">
                          {courses.map((course) => (
                            <label key={course.id} className="flex items-center space-x-3 p-2 rounded hover:bg-white">
                              <input
                                type="checkbox"
                                checked={editAssignmentFormData.selectedCourses[course.course_code] === course.id}
                                onChange={(e) => {
                                  const newSelectedCourses = { ...editAssignmentFormData.selectedCourses };
                                  if (e.target.checked) {
                                    newSelectedCourses[course.course_code] = course.id;
                                  } else {
                                    delete newSelectedCourses[course.course_code];
                                  }
                                  setEditAssignmentFormData({
                                    ...editAssignmentFormData,
                                    selectedCourses: newSelectedCourses
                                  });
                                }}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                              />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">{course.course_name}</div>
                                <div className="text-xs text-gray-600">({course.course_code})</div>
                              </div>
                              {editAssignmentFormData.selectedCourses[course.course_code] === course.id && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Assigned</span>
                              )}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="text-sm text-gray-500">Loading courses...</div>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mx-auto mt-2"></div>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      {Object.keys(editAssignmentFormData.selectedCourses).length} course(s) selected
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditAssignmentModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editAssignmentLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editAssignmentLoading ? 'Updating...' : 'Update Courses'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Student Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add New Student</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleAddStudent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        value={addFormData.firstName}
                        onChange={(e) => setAddFormData({ ...addFormData, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        value={addFormData.lastName}
                        onChange={(e) => setAddFormData({ ...addFormData, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addFormData.username}
                      onChange={(e) => setAddFormData({ ...addFormData, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addFormData.studentId}
                      onChange={(e) => setAddFormData({ ...addFormData, studentId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addFormData.password}
                      onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addFormData.confirmPassword}
                      onChange={(e) => setAddFormData({ ...addFormData, confirmPassword: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addLoading ? 'Adding...' : 'Add Student'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionStudents;