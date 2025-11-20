import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InstitutionPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [groupCourses, setGroupCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupCoursesLoading, setGroupCoursesLoading] = useState(false);
  const [facultiesLoading, setFacultiesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedProgramForCourses, setSelectedProgramForCourses] = useState('');
  const [selectedSemesterForCourses, setSelectedSemesterForCourses] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddSemesterModal, setShowAddSemesterModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditSemesterModal, setShowEditSemesterModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [showAssignFacultyModal, setShowAssignFacultyModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [selectedCourseForFaculty, setSelectedCourseForFaculty] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('manageProgramsActiveSection') || 'programs';
  });
  const [addFormData, setAddFormData] = useState({
    programName: '',
    programCode: '',
    department: '',
    duration: '',
    description: ''
  });
  const [addSemesterFormData, setAddSemesterFormData] = useState({
    programCode: '',
    semester: '',
    semesterCode: ''
  });
  const [addCourseFormData, setAddCourseFormData] = useState({
    programCode: '',
    semesterCode: '',
    courseCode: '',
    courseName: ''
  });
  const [addGroupFormData, setAddGroupFormData] = useState({
    programCode: '',
    semesterCode: '',
    courseReferId: '',
    groupCode: '',
    groupName: ''
  });
  const [editGroupFormData, setEditGroupFormData] = useState({
    groupName: ''
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addSemesterLoading, setAddSemesterLoading] = useState(false);
  const [addCourseLoading, setAddCourseLoading] = useState(false);
  const [addGroupLoading, setAddGroupLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSemesterLoading, setEditSemesterLoading] = useState(false);
  const [editCourseLoading, setEditCourseLoading] = useState(false);
  const [editGroupLoading, setEditGroupLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [deleteSemesterLoading, setDeleteSemesterLoading] = useState(null);
  const [deleteCourseLoading, setDeleteCourseLoading] = useState(null);
  const [deleteGroupLoading, setDeleteGroupLoading] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchPrograms();
    fetchSemesters();
    fetchFaculties();
    fetchAllCourses();
    fetchGroups();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async (programCode, semesterCode) => {
    if (!programCode || !semesterCode) return;

    setCoursesLoading(true);
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
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchFaculties = async () => {
    setFacultiesLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');
      const response = await axios.get(`${baseUrl}/api/faculties/institution/${institutionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFaculties(response.data);
    } catch (error) {
      console.error('Error fetching faculties:', error);
      setFaculties([]);
    } finally {
      setFacultiesLoading(false);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');
      const response = await axios.get(`${baseUrl}/api/courses/institution/${institutionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAllCourses(response.data);
    } catch (error) {
      console.error('Error fetching all courses:', error);
      setAllCourses([]);
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

  const filteredPrograms = programs.filter(program =>
    program.program_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.program_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (program) => {
    setSelectedProgram(program);
    setShowModal(true);
  };

  const handleEditProgramClick = (program) => {
    setSelectedProgram(program);
    setAddFormData({
      programName: program.program_name,
      programCode: program.program_code,
      department: program.department || '',
      duration: program.duration || '',
      description: program.description || ''
    });
    setShowEditModal(true);
  };

  const handleViewSemesterDetails = (semester) => {
    setSelectedSemester(semester);
    setShowModal(true);
  };

  const handleEditSemesterClick = (semester) => {
    setSelectedSemester(semester);
    setAddSemesterFormData({
      programCode: semester.program_code,
      semester: semester.semester,
      semesterCode: semester.semester_code
    });
    setShowEditSemesterModal(true);
  };

  const handleViewCourseDetails = (course) => {
    setSelectedProgram(course);
    setShowModal(true);
  };

  const handleEditCourseClick = (course) => {
    setSelectedProgram(course);
    setAddCourseFormData({
      programCode: course.program_code,
      semesterCode: course.semester_code,
      courseCode: course.course_code,
      courseName: course.course_name
    });
    setShowEditCourseModal(true);
  };

  const handleAssignFacultyClick = (course) => {
    setSelectedCourseForFaculty(course);
    setShowAssignFacultyModal(true);
  };

  const handleDeactivate = async (program) => {
    setDeleteLoading(program.program_code);
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');
      const response = await axios.delete(`${baseUrl}/api/programs/${institutionId}/${program.program_code}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response);
      fetchPrograms(); // Refresh the list
    } catch (error) {
      console.error('Error deleting program:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to delete program. Please try again.';
      alert(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeleteSemester = async (semester) => {
    setDeleteSemesterLoading(`${semester.program_code}-${semester.semester_code}`);
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');
      const response = await axios.delete(`${baseUrl}/api/semesters/${institutionId}/${semester.program_code}/${semester.semester_code}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response);
      fetchSemesters(); // Refresh the list
    } catch (error) {
      console.error('Error deleting semester:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to delete semester. Please try again.';
      alert(errorMessage);
    } finally {
      setDeleteSemesterLoading(null);
    }
  };

  const handleDeleteCourse = async (course) => {
    setDeleteCourseLoading(course.id);
    try {
      const token = localStorage.getItem('institutionToken');
      const response = await axios.delete(`${baseUrl}/api/courses/${course.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response);
      fetchCourses(selectedProgramForCourses, selectedSemesterForCourses); // Refresh the list
    } catch (error) {
      console.error('Error deleting course:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to delete course. Please try again.';
      alert(errorMessage);
    } finally {
      setDeleteCourseLoading(null);
    }
  };

  const handleAddProgram = async (e) => {
    e.preventDefault();
    if (!addFormData.programName || !addFormData.programCode || !addFormData.department || !addFormData.duration) {
      alert('Please fill in all required fields');
      return;
    }

    setAddLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');

      await axios.post(`${baseUrl}/api/programs`, {
        institution_id: institutionId,
        program_code: addFormData.programCode,
        program_name: addFormData.programName
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setShowAddModal(false);
      setAddFormData({
        programName: '',
        programCode: '',
        department: '',
        duration: '',
        description: ''
      });
      fetchPrograms(); // Refresh the list
    } catch (error) {
      console.error('Error adding program:', error);
      alert('Failed to add program. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleAddSemester = async (e) => {
    e.preventDefault();
    if (!addSemesterFormData.programCode || !addSemesterFormData.semester || !addSemesterFormData.semesterCode) {
      alert('Please fill in all required fields');
      return;
    }

    setAddSemesterLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');

      await axios.post(`${baseUrl}/api/semesters`, {
        institution_id: institutionId,
        program_code: addSemesterFormData.programCode,
        semester: addSemesterFormData.semester,
        semester_code: addSemesterFormData.semesterCode
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setShowAddSemesterModal(false);
      setAddSemesterFormData({
        programCode: '',
        semester: '',
        semesterCode: ''
      });
      fetchSemesters(); // Refresh the list
    } catch (error) {
      console.error('Error adding semester:', error);
      alert('Failed to add semester. Please try again.');
    } finally {
      setAddSemesterLoading(false);
    }
  };

  const handleEditProgram = async (e) => {
    e.preventDefault();
    if (!addFormData.programName || !addFormData.programCode) {
      alert('Please fill in required fields');
      return;
    }

    setEditLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');

      await axios.put(`${baseUrl}/api/programs/${institutionId}/${selectedProgram.program_code}`, {
        program_name: addFormData.programName,
        program_code: addFormData.programCode
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setShowEditModal(false);
      setSelectedProgram(null);
      setAddFormData({
        programName: '',
        programCode: '',
        department: '',
        duration: '',
        description: ''
      });
      fetchPrograms(); // Refresh the list
    } catch (error) {
      console.error('Error editing program:', error);
      alert('Failed to edit program. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditSemester = async (e) => {
    e.preventDefault();
    if (!addSemesterFormData.semester || !addSemesterFormData.semesterCode) {
      alert('Please fill in required fields');
      return;
    }

    setEditSemesterLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');

      await axios.put(`${baseUrl}/api/semesters/${institutionId}/${selectedSemester.program_code}/${selectedSemester.semester_code}`, {
        semester: addSemesterFormData.semester,
        semester_code: addSemesterFormData.semesterCode
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setShowEditSemesterModal(false);
      setSelectedSemester(null);
      setAddSemesterFormData({
        programCode: '',
        semester: '',
        semesterCode: ''
      });
      fetchSemesters(); // Refresh the list
    } catch (error) {
      console.error('Error editing semester:', error);
      alert('Failed to edit semester. Please try again.');
    } finally {
      setEditSemesterLoading(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!addCourseFormData.programCode || !addCourseFormData.semesterCode || !addCourseFormData.courseCode || !addCourseFormData.courseName) {
      alert('Please fill in all required fields');
      return;
    }

    setAddCourseLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');

      await axios.post(`${baseUrl}/api/courses`, {
        institution_id: institutionId,
        program_code: addCourseFormData.programCode,
        semester_code: addCourseFormData.semesterCode,
        course_code: addCourseFormData.courseCode,
        course_name: addCourseFormData.courseName
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setShowAddCourseModal(false);
      setAddCourseFormData({
        programCode: '',
        semesterCode: '',
        courseCode: '',
        courseName: ''
      });
      fetchCourses(selectedProgramForCourses, selectedSemesterForCourses); // Refresh the list
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Failed to add course. Please try again.');
    } finally {
      setAddCourseLoading(false);
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    if (!addCourseFormData.courseName) {
      alert('Please fill in required fields');
      return;
    }

    setEditCourseLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');

      await axios.put(`${baseUrl}/api/courses/${selectedProgram.id}`, {
        course_name: addCourseFormData.courseName
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setShowEditCourseModal(false);
      setSelectedProgram(null);
      setAddCourseFormData({
        programCode: '',
        semesterCode: '',
        courseCode: '',
        courseName: ''
      });
      fetchCourses(selectedProgramForCourses, selectedSemesterForCourses); // Refresh the list
    } catch (error) {
      console.error('Error editing course:', error);
      alert('Failed to edit course. Please try again.');
    } finally {
      setEditCourseLoading(false);
    }
  };

  const fetchGroupCourses = async (programCode, semesterCode) => {
    if (!programCode || !semesterCode) {
      setGroupCourses([]);
      return;
    }

    setGroupCoursesLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');
      const response = await axios.get(`${baseUrl}/api/courses/${institutionId}/${programCode}/${semesterCode}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setGroupCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses for group:', error);
      setGroupCourses([]);
    } finally {
      setGroupCoursesLoading(false);
    }
  };

  const handleAssignFaculty = async (facultyId) => {
    if (!selectedCourseForFaculty || !facultyId) return;

    try {
      const token = localStorage.getItem('institutionToken');
      await axios.patch(`${baseUrl}/api/courses/${selectedCourseForFaculty.id}/assign-faculty`, {
        faculty_id: facultyId
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setShowAssignFacultyModal(false);
      setSelectedCourseForFaculty(null);
      fetchCourses(selectedProgramForCourses, selectedSemesterForCourses); // Refresh the list
      alert('Faculty assigned successfully!');
    } catch (error) {
      console.error('Error assigning faculty:', error);
      alert('Failed to assign faculty. Please try again.');
    }
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    if (!addGroupFormData.programCode || !addGroupFormData.semesterCode || !addGroupFormData.courseReferId || !addGroupFormData.groupCode || !addGroupFormData.groupName) {
      alert('Please fill in all required fields');
      return;
    }

    setAddGroupLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');

      await axios.post(`${baseUrl}/api/groups`, {
        course_refer_id: addGroupFormData.courseReferId,
        group_code: addGroupFormData.groupCode,
        group_name: addGroupFormData.groupName
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setShowAddGroupModal(false);
      setAddGroupFormData({
        programCode: '',
        semesterCode: '',
        courseReferId: '',
        groupCode: '',
        groupName: ''
      });
      setGroupCourses([]);
      fetchGroups(); // Refresh the list
      alert('Group added successfully!');
    } catch (error) {
      console.error('Error adding group:', error);
      alert('Failed to add group. Please try again.');
    } finally {
      setAddGroupLoading(false);
    }
  };

  const handleEditGroup = async (e) => {
    e.preventDefault();
    if (!selectedGroup || !editGroupFormData.groupName) {
      alert('Please fill in required fields');
      return;
    }

    setEditGroupLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');

      await axios.put(`${baseUrl}/api/groups/${selectedGroup.id}`, {
        group_name: editGroupFormData.groupName
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setShowEditGroupModal(false);
      setSelectedGroup(null);
      setEditGroupFormData({
        groupName: ''
      });
      fetchGroups(); // Refresh the list
      alert('Group updated successfully!');
    } catch (error) {
      console.error('Error updating group:', error);
      alert('Failed to update group. Please try again.');
    } finally {
      setEditGroupLoading(false);
    }
  };

  const handleDeleteGroup = async (group) => {
    setDeleteGroupLoading(group.id);
    try {
      const token = localStorage.getItem('institutionToken');
      await axios.delete(`${baseUrl}/api/groups/${group.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchGroups(); // Refresh the list
      alert('Group deleted successfully!');
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Failed to delete group. Please try again.');
    } finally {
      setDeleteGroupLoading(null);
    }
  };

  const handleEditGroupClick = (group) => {
    setSelectedGroup(group);
    setEditGroupFormData({
      groupName: group.group_name
    });
    setShowEditGroupModal(true);
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
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Programs & Semesters</h1>
        </div>

        {/* Section Toggle */}
        <div className="mb-8 flex justify-center">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => {
                setActiveSection('programs');
                localStorage.setItem('manageProgramsActiveSection', 'programs');
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeSection === 'programs'
                  ? 'bg-white text-orange-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Programs
            </button>
            <button
              onClick={() => {
                setActiveSection('semesters');
                localStorage.setItem('manageProgramsActiveSection', 'semesters');
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeSection === 'semesters'
                  ? 'bg-white text-orange-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Semesters
            </button>
            <button
              onClick={() => {
                setActiveSection('courses');
                localStorage.setItem('manageProgramsActiveSection', 'courses');
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeSection === 'courses'
                  ? 'bg-white text-orange-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Courses
            </button>
            <button
              onClick={() => {
                setActiveSection('groups');
                localStorage.setItem('manageProgramsActiveSection', 'groups');
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeSection === 'groups'
                  ? 'bg-white text-orange-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Groups
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        {activeSection === 'programs' && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by program name, code, or department..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-sm sm:text-base"
                >
                  Add Program
                </button>
                <select className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base">
                  <option value="">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Semesters Search and Filters */}
        {activeSection === 'semesters' && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by semester name, code, or program..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowAddSemesterModal(true)}
                  className="px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-sm sm:text-base"
                >
                  Add Semester
                </button>
                <select
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                  value={selectedProgramForCourses}
                  onChange={(e) => setSelectedProgramForCourses(e.target.value)}
                >
                  <option value="">All Programs</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.program_code}>
                      {program.program_name} ({program.program_code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Courses Search and Filters */}
        {activeSection === 'courses' && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by course name or code..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowAddCourseModal(true)}
                  className="px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-sm sm:text-base"
                >
                  Add Course
                </button>
                <select
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                  value={selectedProgramForCourses}
                  onChange={(e) => {
                    setSelectedProgramForCourses(e.target.value);
                    setSelectedSemesterForCourses('');
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
                <select
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                  value={selectedSemesterForCourses}
                  onChange={(e) => {
                    setSelectedSemesterForCourses(e.target.value);
                    fetchCourses(selectedProgramForCourses, e.target.value);
                  }}
                  disabled={!selectedProgramForCourses}
                >
                  <option value="">
                    {semesters.filter(semester => semester.program_code === selectedProgramForCourses).length > 0
                      ? 'Select Semester'
                      : 'No semesters available'}
                  </option>
                  {semesters
                    .filter(semester => semester.program_code === selectedProgramForCourses)
                    .map((semester) => (
                      <option key={semester.id} value={semester.semester_code}>
                        {semester.semester} ({semester.semester_code})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Groups Search and Filters */}
        {activeSection === 'groups' && (
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
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowAddGroupModal(true)}
                  className="px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-sm sm:text-base"
                >
                  Add Group
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Programs Table */}
        {activeSection === 'programs' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Code
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Department
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Duration
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPrograms.map((program) => (
                    <tr key={program.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                              <span className="text-orange-600 font-medium text-sm">
                                {program.program_name?.charAt(0)?.toUpperCase() || 'P'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{program.program_name}</div>
                            <div className="text-sm text-gray-500">{program.description || 'No description'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {program.program_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {program.department || 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {program.duration || 'Not specified'}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                          <button
                            onClick={() => handleViewDetails(program)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          <button
                            onClick={() => handleEditProgramClick(program)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeactivate(program)}
                            disabled={deleteLoading === program.program_code}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            {deleteLoading === program.program_code ? (
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
                  ))}
                  {semesters
                    .filter(semester =>
                      selectedProgramForCourses === '' ||
                      semester.program_code === selectedProgramForCourses
                    )
                    .filter(semester =>
                      semester.semester?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      semester.semester_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      programs.find(p => p.program_code === semester.program_code)?.program_name?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <p className="text-gray-500">No semesters found matching your criteria.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Semesters Table */}
        {activeSection === 'semesters' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Semester
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Code
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Program
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {semesters
                    .filter(semester =>
                      selectedProgramForCourses === '' ||
                      semester.program_code === selectedProgramForCourses
                    )
                    .filter(semester =>
                      semester.semester?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      semester.semester_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      programs.find(p => p.program_code === semester.program_code)?.program_name?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((semester) => (
                    <tr key={semester.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {semester.semester?.charAt(0)?.toUpperCase() || 'S'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{semester.semester}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {semester.semester_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {programs.find(p => p.program_code === semester.program_code)?.program_name || semester.program_code}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                          <button
                            onClick={() => handleViewSemesterDetails(semester)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          <button
                            onClick={() => handleEditSemesterClick(semester)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSemester(semester)}
                            disabled={deleteSemesterLoading === `${semester.program_code}-${semester.semester_code}`}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            {deleteSemesterLoading === `${semester.program_code}-${semester.semester_code}` ? (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Courses Table */}
        {activeSection === 'courses' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {coursesLoading ? (
              <div className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
              </div>
            ) : selectedProgramForCourses && selectedSemesterForCourses ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Code
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Assigned Faculty
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courses.filter(course =>
                      course.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      course.course_code?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-green-600 font-medium text-xs sm:text-sm">
                                  {course.course_name?.charAt(0)?.toUpperCase() || 'C'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3 sm:ml-4">
                              <div className="text-sm font-medium text-gray-900">{course.course_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                          {course.course_code}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                          {course.assigned_faculty ? (
                            faculties.find(f => f.id === course.assigned_faculty) ?
                              `${faculties.find(f => f.id === course.assigned_faculty).name} (${faculties.find(f => f.id === course.assigned_faculty).faculty_id})` :
                              'Loading...'
                          ) : 'Not assigned'}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                            <button
                              onClick={() => handleViewCourseDetails(course)}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                            <button
                              onClick={() => handleEditCourseClick(course)}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleAssignFacultyClick(course)}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              Assign
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course)}
                              disabled={deleteCourseLoading === course.id}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                              {deleteCourseLoading === course.id ? (
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
                    ))}
                  </tbody>
                </table>
                {courses.filter(course =>
                  course.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  course.course_code?.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 && (
                  <div className="py-12 px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-500">No courses found for the selected program and semester.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-gray-500">Please select a program and semester to view courses.</p>
              </div>
            )}
          </div>
        )}

        {/* Groups Table */}
        {activeSection === 'groups' && (
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
                              onClick={() => handleEditGroupClick(group)}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteGroup(group)}
                              disabled={deleteGroupLoading === group.id}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                              {deleteGroupLoading === group.id ? (
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

        {/* Program/Semester/Course Details Modal */}
        {showModal && (selectedProgram || selectedSemester) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedProgram && selectedProgram.program_name ? 'Program Details' :
                     selectedProgram && selectedProgram.course_name ? 'Course Details' : 'Semester Details'}
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
                  {selectedProgram && selectedProgram.program_name && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Program Name</label>
                        <p className="text-sm text-gray-900">{selectedProgram.program_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Program Code</label>
                        <p className="text-sm text-gray-900">{selectedProgram.program_code}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        <p className="text-sm text-gray-900">{selectedProgram.department || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Duration</label>
                        <p className="text-sm text-gray-900">{selectedProgram.duration || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <p className="text-sm text-gray-900">{selectedProgram.description || 'No description available'}</p>
                      </div>
                    </>
                  )}
                  {selectedProgram && selectedProgram.course_name && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Course Name</label>
                        <p className="text-sm text-gray-900">{selectedProgram.course_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Course Code</label>
                        <p className="text-sm text-gray-900">{selectedProgram.course_code}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Program</label>
                        <p className="text-sm text-gray-900">
                          {programs.find(p => p.program_code === selectedProgram.program_code)?.program_name || selectedProgram.program_code}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Semester</label>
                        <p className="text-sm text-gray-900">
                          {semesters.find(s => s.semester_code === selectedProgram.semester_code)?.semester || selectedProgram.semester_code}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Assigned Faculty</label>
                        <p className="text-sm text-gray-900">
                          {selectedProgram.assigned_faculty ? (
                            faculties.find(f => f.id === selectedProgram.assigned_faculty) ?
                              `${faculties.find(f => f.id === selectedProgram.assigned_faculty).name} (${faculties.find(f => f.id === selectedProgram.assigned_faculty).faculty_id})` :
                              'Loading...'
                          ) : 'Not assigned'}
                        </p>
                      </div>
                    </>
                  )}
                  {selectedSemester && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Semester Name</label>
                        <p className="text-sm text-gray-900">{selectedSemester.semester}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Semester Code</label>
                        <p className="text-sm text-gray-900">{selectedSemester.semester_code}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Program</label>
                        <p className="text-sm text-gray-900">
                          {programs.find(p => p.program_code === selectedSemester.program_code)?.program_name || selectedSemester.program_code}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Institution ID</label>
                        <p className="text-sm text-gray-900">{selectedSemester.institution_id}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Program Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add New Program</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleAddProgram} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addFormData.programName}
                      onChange={(e) => setAddFormData({...addFormData, programName: e.target.value})}
                      placeholder="e.g., Bachelor of Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program Code *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addFormData.programCode}
                      onChange={(e) => setAddFormData({...addFormData, programCode: e.target.value})}
                      placeholder="e.g., BCS-2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addFormData.department}
                      onChange={(e) => setAddFormData({...addFormData, department: e.target.value})}
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Engineering">Engineering</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addFormData.duration}
                      onChange={(e) => setAddFormData({...addFormData, duration: e.target.value})}
                      placeholder="e.g., 4 years"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      rows="3"
                      value={addFormData.description}
                      onChange={(e) => setAddFormData({...addFormData, description: e.target.value})}
                      placeholder="Program description (optional)"
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
                      {addLoading ? 'Adding...' : 'Add Program'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Program Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit Program</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleEditProgram} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addFormData.programName}
                      onChange={(e) => setAddFormData({...addFormData, programName: e.target.value})}
                      placeholder="e.g., Bachelor of Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program Code *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addFormData.programCode}
                      onChange={(e) => setAddFormData({...addFormData, programCode: e.target.value})}
                      placeholder="e.g., BCS-2024"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editLoading ? 'Updating...' : 'Update Program'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Semester Modal */}
        {showAddSemesterModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add New Semester</h3>
                  <button
                    onClick={() => setShowAddSemesterModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleAddSemester} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addSemesterFormData.programCode}
                      onChange={(e) => setAddSemesterFormData({...addSemesterFormData, programCode: e.target.value})}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addSemesterFormData.semester}
                      onChange={(e) => setAddSemesterFormData({...addSemesterFormData, semester: e.target.value})}
                      placeholder="e.g., Fall 2025"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester Code *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addSemesterFormData.semesterCode}
                      onChange={(e) => setAddSemesterFormData({...addSemesterFormData, semesterCode: e.target.value})}
                      placeholder="e.g., F25"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddSemesterModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addSemesterLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addSemesterLoading ? 'Adding...' : 'Add Semester'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Semester Modal */}
        {showEditSemesterModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit Semester</h3>
                  <button
                    onClick={() => setShowEditSemesterModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleEditSemester} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addSemesterFormData.semester}
                      onChange={(e) => setAddSemesterFormData({...addSemesterFormData, semester: e.target.value})}
                      placeholder="e.g., Fall 2025"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester Code *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addSemesterFormData.semesterCode}
                      onChange={(e) => setAddSemesterFormData({...addSemesterFormData, semesterCode: e.target.value})}
                      placeholder="e.g., F25"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditSemesterModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editSemesterLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editSemesterLoading ? 'Updating...' : 'Update Semester'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Course Modal */}
        {showAddCourseModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add New Course</h3>
                  <button
                    onClick={() => setShowAddCourseModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleAddCourse} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addCourseFormData.programCode}
                      onChange={(e) => setAddCourseFormData({...addCourseFormData, programCode: e.target.value, semesterCode: ''})}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addCourseFormData.semesterCode}
                      onChange={(e) => setAddCourseFormData({...addCourseFormData, semesterCode: e.target.value})}
                      disabled={!addCourseFormData.programCode}
                    >
                      <option value="">Select Semester</option>
                      {semesters
                        .filter(semester => semester.program_code === addCourseFormData.programCode)
                        .map((semester) => (
                          <option key={semester.id} value={semester.semester_code}>
                            {semester.semester} ({semester.semester_code})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Code *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addCourseFormData.courseCode}
                      onChange={(e) => setAddCourseFormData({...addCourseFormData, courseCode: e.target.value})}
                      placeholder="e.g., CS101A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addCourseFormData.courseName}
                      onChange={(e) => setAddCourseFormData({...addCourseFormData, courseName: e.target.value})}
                      placeholder="e.g., Data Structures"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddCourseModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addCourseLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addCourseLoading ? 'Adding...' : 'Add Course'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Course Modal */}
        {showEditCourseModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit Course</h3>
                  <button
                    onClick={() => setShowEditCourseModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleEditCourse} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addCourseFormData.courseName}
                      onChange={(e) => setAddCourseFormData({...addCourseFormData, courseName: e.target.value})}
                      placeholder="e.g., Advanced Data Structures"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditCourseModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editCourseLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editCourseLoading ? 'Updating...' : 'Update Course'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Assign Faculty Modal */}
        {showAssignFacultyModal && selectedCourseForFaculty && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Assign Faculty to Course</h3>
                  <button
                    onClick={() => setShowAssignFacultyModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course: {selectedCourseForFaculty.course_name}</label>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Faculty *</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      onChange={(e) => handleAssignFaculty(e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>Select a faculty member</option>
                      {faculties.map((faculty) => (
                        <option key={faculty.id} value={faculty.id}>
                          {faculty.name} ({faculty.faculty_id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAssignFacultyModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Group Modal */}
        {showAddGroupModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add New Group</h3>
                  <button
                    onClick={() => setShowAddGroupModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleAddGroup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addGroupFormData.programCode}
                      onChange={(e) => {
                        setAddGroupFormData({
                          ...addGroupFormData,
                          programCode: e.target.value,
                          semesterCode: '',
                          courseReferId: ''
                        });
                        setGroupCourses([]);
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addGroupFormData.semesterCode}
                      onChange={(e) => {
                        setAddGroupFormData({
                          ...addGroupFormData,
                          semesterCode: e.target.value,
                          courseReferId: ''
                        });
                        fetchGroupCourses(addGroupFormData.programCode, e.target.value);
                      }}
                      disabled={!addGroupFormData.programCode}
                    >
                      <option value="">
                        {semesters.filter(s => s.program_code === addGroupFormData.programCode).length > 0
                          ? 'Select Semester'
                          : 'No semesters available'}
                      </option>
                      {semesters
                        .filter(semester => semester.program_code === addGroupFormData.programCode)
                        .map((semester) => (
                          <option key={semester.id} value={semester.semester_code}>
                            {semester.semester} ({semester.semester_code})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addGroupFormData.courseReferId}
                      onChange={(e) => setAddGroupFormData({...addGroupFormData, courseReferId: e.target.value})}
                      disabled={!addGroupFormData.semesterCode || groupCoursesLoading}
                    >
                      <option value="">
                        {groupCoursesLoading
                          ? 'Loading courses...'
                          : groupCourses.length > 0
                            ? 'Select Course'
                            : 'No courses available'}
                      </option>
                      {groupCourses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.course_name} ({course.course_code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Group Code *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addGroupFormData.groupCode}
                      onChange={(e) => setAddGroupFormData({...addGroupFormData, groupCode: e.target.value})}
                      placeholder="e.g., A01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addGroupFormData.groupName}
                      onChange={(e) => setAddGroupFormData({...addGroupFormData, groupName: e.target.value})}
                      placeholder="e.g., Batch A"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddGroupModal(false);
                        setAddGroupFormData({
                          programCode: '',
                          semesterCode: '',
                          courseReferId: '',
                          groupCode: '',
                          groupName: ''
                        });
                        setGroupCourses([]);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addGroupLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addGroupLoading ? 'Adding...' : 'Add Group'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Group Modal */}
        {showEditGroupModal && selectedGroup && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit Group</h3>
                  <button
                    onClick={() => setShowEditGroupModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleEditGroup} className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Group Information</h4>
                    <div className="text-sm text-gray-700">
                      <div><strong>Group Code:</strong> {selectedGroup.group_code}</div>
                      <div><strong>Course:</strong> {selectedGroup.courses?.course_name} ({selectedGroup.courses?.course_code})</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={editGroupFormData.groupName}
                      onChange={(e) => setEditGroupFormData({...editGroupFormData, groupName: e.target.value})}
                      placeholder="e.g., Updated Batch Name"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditGroupModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editGroupLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editGroupLoading ? 'Updating...' : 'Update Group'}
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

export default InstitutionPrograms;