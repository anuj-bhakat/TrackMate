import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ManageGradeTab from './ManageGradeTab';
import ManageProgramGradesTab from './ManageProgramGradesTab';

const InstitutionGrades = () => {
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('manageGradesActiveSection') || 'semesters';
  });
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgramForSemesters, setSelectedProgramForSemesters] = useState('');
  const [programSemesters, setProgramSemesters] = useState([]);
  const [showAddSemesterModal, setShowAddSemesterModal] = useState(false);
  const [showEditSemesterModal, setShowEditSemesterModal] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [addSemesterFormData, setAddSemesterFormData] = useState({
    programs_refer_id: '',
    semester_name: '',
    semester_sequence: ''
  });
  const [editSemesterFormData, setEditSemesterFormData] = useState({
    semester_name: '',
    semester_sequence: ''
  });
  const [addSemesterLoading, setAddSemesterLoading] = useState(false);
  const [editSemesterLoading, setEditSemesterLoading] = useState(false);
  const [deleteSemesterLoading, setDeleteSemesterLoading] = useState(null);
  const [selectedProgramForCourses, setSelectedProgramForCourses] = useState('');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState('');
  const [programSemestersForCourses, setProgramSemestersForCourses] = useState([]);
  const [coursesByProgram, setCoursesByProgram] = useState([]);
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState('');
  const [courseStudentsMarks, setCourseStudentsMarks] = useState([]);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showAddMarksModal, setShowAddMarksModal] = useState(false);
  const [showEditMarksModal, setShowEditMarksModal] = useState(false);
  const [selectedStudentForMarks, setSelectedStudentForMarks] = useState(null);
  const [addMarksFormData, setAddMarksFormData] = useState({
    semester_courses_refer_id: '',
    student_refer_id: '',
    marks: []
  });
  const [editMarksFormData, setEditMarksFormData] = useState({
    marks: []
  });
  const [addMarksLoading, setAddMarksLoading] = useState(false);
  const [editMarksLoading, setEditMarksLoading] = useState(false);
  const [deleteMarksLoading, setDeleteMarksLoading] = useState(null);
  const [courseWeightage, setCourseWeightage] = useState({});
  const [addCourseFormData, setAddCourseFormData] = useState({
    semester_refer_id: '',
    course_code: '',
    course_name: '',
    credits: '',
    weightage: []
  });
  const [editCourseFormData, setEditCourseFormData] = useState({
    course_name: '',
    credits: '',
    weightage: []
  });
  const [addCourseLoading, setAddCourseLoading] = useState(false);
  const [editCourseLoading, setEditCourseLoading] = useState(false);
  const [deleteCourseLoading, setDeleteCourseLoading] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchPrograms();
    fetchSemesters();
    fetchCourses();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedProgramForSemesters) {
      fetchProgramSemesters(selectedProgramForSemesters);
    } else {
      setProgramSemesters([]);
    }
  }, [selectedProgramForSemesters]);

  useEffect(() => {
    if (selectedProgramForCourses) {
      fetchProgramSemestersForCourses(selectedProgramForCourses);
      fetchCoursesByProgram(selectedProgramForCourses);
    } else {
      setProgramSemestersForCourses([]);
      setCoursesByProgram([]);
    }
  }, [selectedProgramForCourses]);

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

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');
      const response = await axios.get(`${baseUrl}/api/courses/institution/${institutionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

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

  const fetchProgramSemesters = async (programId) => {
    try {
      const token = localStorage.getItem('institutionToken');
      const response = await axios.get(`${baseUrl}/api/program-semesters/by-program/${programId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProgramSemesters(response.data);
    } catch (error) {
      console.error('Error fetching program semesters:', error);
      setProgramSemesters([]);
    }
  };

  const fetchCoursesByProgram = async (programId) => {
    try {
      const token = localStorage.getItem('institutionToken');
      const response = await axios.get(`${baseUrl}/api/semester-courses/by-program/${programId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCoursesByProgram(response.data);
    } catch (error) {
      console.error('Error fetching courses by program:', error);
      setCoursesByProgram([]);
    }
  };

  const fetchProgramSemestersForCourses = async (programId) => {
    try {
      const token = localStorage.getItem('institutionToken');
      const response = await axios.get(`${baseUrl}/api/program-semesters/by-program/${programId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProgramSemestersForCourses(response.data);
    } catch (error) {
      console.error('Error fetching program semesters for courses:', error);
      setProgramSemestersForCourses([]);
    }
  };

  const fetchCourseStudentsMarks = async (courseId, programId) => {
    try {
      const token = localStorage.getItem('institutionToken');
      const response = await axios.get(`${baseUrl}/api/course-students-marks/by-course-and-program/${courseId}/${programId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCourseStudentsMarks(response.data);
    } catch (error) {
      console.error('Error fetching course students marks:', error);
      setCourseStudentsMarks([]);
    }
  };

  const fetchCourseDetails = async (courseId) => {
    try {
      const token = localStorage.getItem('institutionToken');
      const response = await axios.get(`${baseUrl}/api/semester-courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCourseWeightage(response.data.weightage || {});
    } catch (error) {
      console.error('Error fetching course details:', error);
      setCourseWeightage({});
    }
  };

  const handleAddSemester = async (e) => {
    e.preventDefault();
    if (!addSemesterFormData.programs_refer_id || !addSemesterFormData.semester_name || !addSemesterFormData.semester_sequence) {
      alert('Please fill in all fields');
      return;
    }

    setAddSemesterLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');
      await axios.post(`${baseUrl}/api/program-semesters`, addSemesterFormData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setShowAddSemesterModal(false);
      setAddSemesterFormData({
        programs_refer_id: '',
        semester_name: '',
        semester_sequence: ''
      });
      fetchProgramSemesters(selectedProgramForSemesters);
      alert('Semester added successfully!');
    } catch (error) {
      console.error('Error adding semester:', error);
      alert('Failed to add semester. Please try again.');
    } finally {
      setAddSemesterLoading(false);
    }
  };

  const handleEditSemester = async (e) => {
    e.preventDefault();
    if (!selectedSemester || !editSemesterFormData.semester_name || !editSemesterFormData.semester_sequence) {
      alert('Please fill in all fields');
      return;
    }

    setEditSemesterLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');
      await axios.put(`${baseUrl}/api/program-semesters/${selectedSemester.id}`, editSemesterFormData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setShowEditSemesterModal(false);
      setSelectedSemester(null);
      setEditSemesterFormData({
        semester_name: '',
        semester_sequence: ''
      });
      fetchProgramSemesters(selectedProgramForSemesters);
      alert('Semester updated successfully!');
    } catch (error) {
      console.error('Error updating semester:', error);
      alert('Failed to update semester. Please try again.');
    } finally {
      setEditSemesterLoading(false);
    }
  };

  const handleDeleteSemester = async (semester) => {
    if (!confirm('Are you sure you want to delete this semester?')) return;

    setDeleteSemesterLoading(semester.id);
    try {
      const token = localStorage.getItem('institutionToken');
      await axios.delete(`${baseUrl}/api/program-semesters/${semester.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchProgramSemesters(selectedProgramForSemesters);
      alert('Semester deleted successfully!');
    } catch (error) {
      console.error('Error deleting semester:', error);
      alert('Failed to delete semester. Please try again.');
    } finally {
      setDeleteSemesterLoading(null);
    }
  };

  const handleEditSemesterClick = (semester) => {
    setSelectedSemester(semester);
    setEditSemesterFormData({
      semester_name: semester.semester_name,
      semester_sequence: semester.semester_sequence
    });
    setShowEditSemesterModal(true);
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!addCourseFormData.semester_refer_id || !addCourseFormData.course_code || !addCourseFormData.course_name || !addCourseFormData.credits) {
      alert('Please fill in all required fields');
      return;
    }

    setAddCourseLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');
      const weightageObj = {};
      addCourseFormData.weightage.forEach(item => {
        if (item.key && item.value) {
          weightageObj[item.key] = parseInt(item.value);
        }
      });
      const payload = {
        ...addCourseFormData,
        weightage: weightageObj
      };

      await axios.post(`${baseUrl}/api/semester-courses`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setShowAddCourseModal(false);
      setAddCourseFormData({
        semester_refer_id: '',
        course_code: '',
        course_name: '',
        credits: '',
        weightage: []
      });
      fetchCoursesByProgram(selectedProgramForCourses);
      alert('Course added successfully!');
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Failed to add course. Please try again.');
    } finally {
      setAddCourseLoading(false);
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setEditCourseLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');
      const weightageObj = {};
      editCourseFormData.weightage.forEach(item => {
        if (item.key && item.value) {
          weightageObj[item.key] = parseInt(item.value);
        }
      });
      const payload = {
        ...editCourseFormData,
        weightage: weightageObj
      };

      await axios.put(`${baseUrl}/api/semester-courses/${selectedCourse.id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setShowEditCourseModal(false);
      setSelectedCourse(null);
      setEditCourseFormData({
        course_name: '',
        credits: '',
        weightage: []
      });
      fetchCoursesByProgram(selectedProgramForCourses);
      alert('Course updated successfully!');
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course. Please try again.');
    } finally {
      setEditCourseLoading(false);
    }
  };

  const handleDeleteCourse = async (course) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    setDeleteCourseLoading(course.id);
    try {
      const token = localStorage.getItem('institutionToken');
      await axios.delete(`${baseUrl}/api/semester-courses/${course.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchCoursesByProgram(selectedProgramForCourses);
      alert('Course deleted successfully!');
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    } finally {
      setDeleteCourseLoading(null);
    }
  };

  const handleEditCourseClick = (course) => {
    setSelectedCourse(course);
    const weightageArray = course.weightage ? Object.entries(course.weightage).map(([key, value]) => ({ key, value: value.toString() })) : [];
    setEditCourseFormData({
      course_name: course.course_name,
      credits: course.credits,
      weightage: weightageArray
    });
    setShowEditCourseModal(true);
  };

  const handleAddMarksClick = (student) => {
    setSelectedStudentForMarks(student);
    // Initialize marks with weightage keys and 0 values
    const initialMarks = Object.keys(courseWeightage).map(key => ({
      key,
      value: '0'
    }));
    setAddMarksFormData({
      semester_courses_refer_id: selectedCourseForStudents,
      student_refer_id: student.id,
      marks: initialMarks
    });
    setShowAddMarksModal(true);
  };

  const handleEditMarksClick = (student) => {
    setSelectedStudentForMarks(student);
    // Initialize with all weightage keys, using existing marks where available
    const marksArray = Object.keys(courseWeightage).map(key => ({
      key,
      value: student.marks && student.marks[key] != null ? student.marks[key].toString() : '0'
    }));
    setEditMarksFormData({
      marks: marksArray
    });
    setShowEditMarksModal(true);
  };

  const handleDeleteMarks = async (student) => {
    if (!confirm('Are you sure you want to delete marks for this student?')) return;

    setDeleteMarksLoading(student.id);
    try {
      const token = localStorage.getItem('institutionToken');
      // Assuming the student record has an id for the marks record, but in the API, it's by id, but we don't have it.
      // The GET returns id, so we need to store it or find it.
      // For simplicity, since the response has id, but in the table, we need to add it.
      // Actually, the student object from GET has id, which is the marks record id.
      await axios.delete(`${baseUrl}/api/course-students-marks/${student.marks_id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchCourseStudentsMarks(selectedCourseForStudents, selectedProgramForCourses);
      alert('Marks deleted successfully!');
    } catch (error) {
      console.error('Error deleting marks:', error);
      alert('Failed to delete marks. Please try again.');
    } finally {
      setDeleteMarksLoading(null);
    }
  };

  const handleAddMarks = async (e) => {
    e.preventDefault();
    if (!addMarksFormData.marks.length) {
      alert('Please add at least one mark');
      return;
    }

    setAddMarksLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');
      const marksObj = {};
      addMarksFormData.marks.forEach(item => {
        if (item.key) {
          marksObj[item.key] = item.value ? parseFloat(item.value) : 0;
        }
      });
      const payload = {
        ...addMarksFormData,
        marks: marksObj
      };

      await axios.post(`${baseUrl}/api/course-students-marks`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setShowAddMarksModal(false);
      setSelectedStudentForMarks(null);
      setAddMarksFormData({
        semester_courses_refer_id: '',
        student_refer_id: '',
        marks: []
      });
      fetchCourseStudentsMarks(selectedCourseForStudents, selectedProgramForCourses);
      alert('Marks added successfully!');
    } catch (error) {
      console.error('Error adding marks:', error);
      alert('Failed to add marks. Please try again.');
    } finally {
      setAddMarksLoading(false);
    }
  };

  const handleEditMarks = async (e) => {
    e.preventDefault();
    if (!selectedStudentForMarks) return;

    setEditMarksLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');
      const marksObj = {};
      editMarksFormData.marks.forEach(item => {
        if (item.key) {
          marksObj[item.key] = item.value ? parseFloat(item.value) : 0;
        }
      });
      const payload = {
        marks: marksObj
      };

      await axios.put(`${baseUrl}/api/course-students-marks/${selectedStudentForMarks.marks_id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setShowEditMarksModal(false);
      setSelectedStudentForMarks(null);
      setEditMarksFormData({
        marks: []
      });
      fetchCourseStudentsMarks(selectedCourseForStudents, selectedProgramForCourses);
      alert('Marks updated successfully!');
    } catch (error) {
      console.error('Error updating marks:', error);
      alert('Failed to update marks. Please try again.');
    } finally {
      setEditMarksLoading(false);
    }
  };

  const addWeightageItem = (formData, setFormData) => {
    setFormData(prev => ({
      ...prev,
      weightage: [...prev.weightage, { key: '', value: '' }]
    }));
  };

  const removeWeightageItem = (index, formData, setFormData) => {
    setFormData(prev => ({
      ...prev,
      weightage: prev.weightage.filter((_, i) => i !== index)
    }));
  };

  const updateWeightageItem = (index, field, value, formData, setFormData) => {
    setFormData(prev => ({
      ...prev,
      weightage: prev.weightage.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  };

  const updateMarksItem = (index, field, value, formData, setFormData) => {
    setFormData(prev => ({
      ...prev,
      marks: prev.marks.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  };

  const filteredCourses = selectedSemesterFilter ? coursesByProgram.filter(course => course.program_semesters?.id === selectedSemesterFilter) : coursesByProgram;

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
        <div className="mb-4 sm:mb-6 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Manage Grades</h1>
        </div>

        {/* Section Toggle */}
        <div className="mb-4 flex justify-center">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => {
                setActiveSection('semesters');
                localStorage.setItem('manageGradesActiveSection', 'semesters');
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
                localStorage.setItem('manageGradesActiveSection', 'courses');
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
                setActiveSection('students');
                localStorage.setItem('manageGradesActiveSection', 'students');
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeSection === 'students'
                  ? 'bg-white text-orange-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => {
                setActiveSection('manage-grade');
                localStorage.setItem('manageGradesActiveSection', 'manage-grade');
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeSection === 'manage-grade'
                  ? 'bg-white text-orange-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Manage Grade
            </button>
            <button
              onClick={() => {
                setActiveSection('program-grades');
                localStorage.setItem('manageGradesActiveSection', 'program-grades');
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeSection === 'program-grades'
                  ? 'bg-white text-orange-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Program Grades
            </button>
          </div>
        </div>

        {/* Semesters Section */}
        {activeSection === 'semesters' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Manage Semesters</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                    value={selectedProgramForSemesters}
                    onChange={(e) => setSelectedProgramForSemesters(e.target.value)}
                  >
                    <option value="">Select Program</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.program_name} ({program.program_code})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setAddSemesterFormData({ ...addSemesterFormData, programs_refer_id: selectedProgramForSemesters });
                      setShowAddSemesterModal(true);
                    }}
                    disabled={!selectedProgramForSemesters}
                    className="px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Semester
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Semester Name
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Sequence
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {programSemesters.map((semester) => (
                    <tr key={semester.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {semester.semester_name?.charAt(0)?.toUpperCase() || 'S'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{semester.semester_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {semester.semester_sequence}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSemesterClick(semester)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSemester(semester)}
                            disabled={deleteSemesterLoading === semester.id}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deleteSemesterLoading === semester.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {programSemesters.length === 0 && selectedProgramForSemesters && (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center">
                        <p className="text-gray-500">No semesters found for this program.</p>
                        <p className="text-sm text-gray-400 mt-1">Click "Add Semester" to add the first semester.</p>
                      </td>
                    </tr>
                  )}
                  {!selectedProgramForSemesters && (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center">
                        <p className="text-gray-500">Please select a program to view semesters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Courses Section */}
        {activeSection === 'courses' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Manage Courses</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                    value={selectedProgramForCourses}
                    onChange={(e) => {
                      setSelectedProgramForCourses(e.target.value);
                      setSelectedSemesterFilter('');
                    }}
                  >
                    <option value="">Select Program</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.program_name} ({program.program_code})
                      </option>
                    ))}
                  </select>
                  <select
                    className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                    value={selectedSemesterFilter}
                    onChange={(e) => setSelectedSemesterFilter(e.target.value)}
                    disabled={!selectedProgramForCourses}
                  >
                    <option value="">All Semesters</option>
                    {programSemestersForCourses.map((semester) => (
                      <option key={semester.id} value={semester.id}>
                        {semester.semester_name} (Seq: {semester.semester_sequence})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowAddCourseModal(true)}
                    disabled={!selectedProgramForCourses}
                    className="px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Course
                  </button>
                </div>
              </div>
            </div>
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
                      Semester
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Credits
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                      Weightage
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCourses.map((course) => (
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
                        {course.program_semesters?.semester_name} (Seq: {course.program_semesters?.semester_sequence})
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden lg:table-cell">
                        {course.credits}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden xl:table-cell">
                        {course.weightage ? (
                          <div className="space-y-1">
                            {Object.entries(course.weightage).map(([key, value]) => (
                              <div key={key} className="capitalize">
                                {key}: {value}%
                              </div>
                            ))}
                          </div>
                        ) : (
                          'Not set'
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditCourseClick(course)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course)}
                            disabled={deleteCourseLoading === course.id}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deleteCourseLoading === course.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCourses.length === 0 && selectedProgramForCourses && (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <p className="text-gray-500">
                          {selectedSemesterFilter ? 'No courses found for this semester.' : 'No courses found for this program.'}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">Click "Add Course" to add the first course.</p>
                      </td>
                    </tr>
                  )}
                  {!selectedProgramForCourses && (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <p className="text-gray-500">Please select a program to view courses.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Students Section */}
        {activeSection === 'students' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Manage Student Grades</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                    value={selectedProgramForCourses}
                    onChange={(e) => {
                      setSelectedProgramForCourses(e.target.value);
                      setSelectedCourseForStudents('');
                      setCourseStudentsMarks([]);
                    }}
                  >
                    <option value="">Select Program</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.program_name} ({program.program_code})
                      </option>
                    ))}
                  </select>
                  <select
                    className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                    value={selectedCourseForStudents}
                    onChange={(e) => {
                      setSelectedCourseForStudents(e.target.value);
                      fetchCourseDetails(e.target.value);
                      fetchCourseStudentsMarks(e.target.value, selectedProgramForCourses);
                    }}
                    disabled={!selectedProgramForCourses}
                  >
                    <option value="">
                      {coursesByProgram.length > 0
                        ? 'Select Course'
                        : 'No courses available'}
                    </option>
                    {coursesByProgram.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.course_name} ({course.course_code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
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
                      Username
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marks
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courseStudentsMarks.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {student.name?.charAt(0)?.toUpperCase() || 'S'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.student_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.marks ? (
                          <div className="font-medium">
                            {(() => {
                              const total = Object.values(student.marks).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
                              const breakdown = Object.values(student.marks).join('+');
                              return `${total.toFixed(1)}% (${breakdown})`;
                            })()}
                          </div>
                        ) : (
                          'No marks'
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <div className="flex gap-2">
                          {student.marks ? (
                            <>
                              <button
                                onClick={() => handleEditMarksClick(student)}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteMarks(student)}
                                disabled={deleteMarksLoading === student.id}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deleteMarksLoading === student.id ? 'Deleting...' : 'Delete'}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleAddMarksClick(student)}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                            >
                              Add Marks
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {courseStudentsMarks.length === 0 && selectedCourseForStudents && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <p className="text-gray-500">No students found for this course.</p>
                      </td>
                    </tr>
                  )}
                  {!selectedCourseForStudents && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <p className="text-gray-500">Please select a program and course to view student grades.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Manage Grade Section */}
        {activeSection === 'manage-grade' && (
          <ManageGradeTab />
        )}

        {/* Program Grades Section */}
        {activeSection === 'program-grades' && (
          <ManageProgramGradesTab programs={programs} />
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addCourseFormData.semester_refer_id}
                      onChange={(e) => setAddCourseFormData({...addCourseFormData, semester_refer_id: e.target.value})}
                    >
                      <option value="">Select Semester</option>
                      {programSemestersForCourses.map((semester) => (
                        <option key={semester.id} value={semester.id}>
                          {semester.semester_name} (Seq: {semester.semester_sequence})
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
                      value={addCourseFormData.course_code}
                      onChange={(e) => setAddCourseFormData({...addCourseFormData, course_code: e.target.value})}
                      placeholder="e.g., CS101"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addCourseFormData.course_name}
                      onChange={(e) => setAddCourseFormData({...addCourseFormData, course_name: e.target.value})}
                      placeholder="e.g., Introduction to Programming"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credits *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addCourseFormData.credits}
                      onChange={(e) => setAddCourseFormData({...addCourseFormData, credits: e.target.value})}
                      placeholder="e.g., 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weightage (%)</label>
                    {addCourseFormData.weightage.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Key e.g., assignments"
                          className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                          value={item.key}
                          onChange={(e) => updateWeightageItem(index, 'key', e.target.value, addCourseFormData, setAddCourseFormData)}
                        />
                        <input
                          type="number"
                          placeholder="Value"
                          min="0"
                          max="100"
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={item.value}
                          onChange={(e) => updateWeightageItem(index, 'value', e.target.value, addCourseFormData, setAddCourseFormData)}
                          onWheel={(e) => e.target.blur()}
                        />
                        <button
                          type="button"
                          onClick={() => removeWeightageItem(index, addCourseFormData, setAddCourseFormData)}
                          className="px-2 py-1 text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addWeightageItem(addCourseFormData, setAddCourseFormData)}
                      className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Add Weightage Item
                    </button>
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
        {showEditCourseModal && selectedCourse && (
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
                      value={editCourseFormData.course_name}
                      onChange={(e) => setEditCourseFormData({...editCourseFormData, course_name: e.target.value})}
                      placeholder="e.g., Introduction to Programming"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credits *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={editCourseFormData.credits}
                      onChange={(e) => setEditCourseFormData({...editCourseFormData, credits: e.target.value})}
                      placeholder="e.g., 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weightage (%)</label>
                    {editCourseFormData.weightage.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Key e.g., assignments"
                          className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                          value={item.key}
                          onChange={(e) => updateWeightageItem(index, 'key', e.target.value, editCourseFormData, setEditCourseFormData)}
                        />
                        <input
                          type="number"
                          placeholder="Value"
                          min="0"
                          max="100"
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={item.value}
                          onChange={(e) => updateWeightageItem(index, 'value', e.target.value, editCourseFormData, setEditCourseFormData)}
                          onWheel={(e) => e.target.blur()}
                        />
                        <button
                          type="button"
                          onClick={() => removeWeightageItem(index, editCourseFormData, setEditCourseFormData)}
                          className="px-2 py-1 text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addWeightageItem(editCourseFormData, setEditCourseFormData)}
                      className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Add Weightage Item
                    </button>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addSemesterFormData.programs_refer_id}
                      onChange={(e) => setAddSemesterFormData({...addSemesterFormData, programs_refer_id: e.target.value})}
                    >
                      <option value="">Select Program</option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.id}>
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
                      value={addSemesterFormData.semester_name}
                      onChange={(e) => setAddSemesterFormData({...addSemesterFormData, semester_name: e.target.value})}
                      placeholder="e.g., Semester 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester Sequence *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={addSemesterFormData.semester_sequence}
                      onChange={(e) => setAddSemesterFormData({...addSemesterFormData, semester_sequence: parseInt(e.target.value)})}
                      placeholder="e.g., 1"
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
        {showEditSemesterModal && selectedSemester && (
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
                      value={editSemesterFormData.semester_name}
                      onChange={(e) => setEditSemesterFormData({...editSemesterFormData, semester_name: e.target.value})}
                      placeholder="e.g., Semester 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester Sequence *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={editSemesterFormData.semester_sequence}
                      onChange={(e) => setEditSemesterFormData({...editSemesterFormData, semester_sequence: parseInt(e.target.value)})}
                      placeholder="e.g., 1"
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

        {/* Add Marks Modal */}
        {showAddMarksModal && selectedStudentForMarks && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add Marks</h3>
                  <button
                    onClick={() => setShowAddMarksModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Student: <span className="font-medium">{selectedStudentForMarks.name}</span></p>
                </div>
                <form onSubmit={handleAddMarks} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Marks Distribution (%)</label>
                    <div className="space-y-3">
                      {addMarksFormData.marks.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-700 capitalize">{item.key}</span>
                            <span className="text-xs text-gray-500 ml-2">(Max: {courseWeightage[item.key]}%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="0"
                              className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                              value={item.value}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Allow only numbers and decimal point
                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                  const numValue = parseFloat(value) || 0;
                                  const maxValue = courseWeightage[item.key] || 100;
                                  // Prevent values from exceeding the weightage max
                                  if (numValue <= maxValue) {
                                    updateMarksItem(index, 'value', value, addMarksFormData, setAddMarksFormData);
                                  }
                                }
                              }}
                            />
                            <span className="text-sm text-gray-500">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowAddMarksModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addMarksLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addMarksLoading ? 'Adding...' : 'Add Marks'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Marks Modal */}
        {showEditMarksModal && selectedStudentForMarks && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit Marks</h3>
                  <button
                    onClick={() => setShowEditMarksModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Student: <span className="font-medium">{selectedStudentForMarks.name}</span></p>
                </div>
                <form onSubmit={handleEditMarks} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Marks Distribution (%)</label>
                    <div className="space-y-3">
                      {editMarksFormData.marks.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-700 capitalize">{item.key}</span>
                            <span className="text-xs text-gray-500 ml-2">(Max: {courseWeightage[item.key]}%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="0"
                              className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                              value={item.value}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Allow only numbers and decimal point
                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                  const numValue = parseFloat(value) || 0;
                                  const maxValue = courseWeightage[item.key] || 100;
                                  // Prevent values from exceeding the weightage max
                                  if (numValue <= maxValue) {
                                    updateMarksItem(index, 'value', value, editMarksFormData, setEditMarksFormData);
                                  }
                                }
                              }}
                            />
                            <span className="text-sm text-gray-500">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowEditMarksModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editMarksLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editMarksLoading ? 'Updating...' : 'Update Marks'}
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

export default InstitutionGrades;