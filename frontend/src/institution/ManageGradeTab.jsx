import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageGradeTab = () => {
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [data, setData] = useState([]);
  const [semesterGrades, setSemesterGrades] = useState([]);
  const [courseGrades, setCourseGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingPrograms, setFetchingPrograms] = useState(true);
  const [fetchingSemesters, setFetchingSemesters] = useState(false);
  const [checkedStudents, setCheckedStudents] = useState(new Set());
  const [checkingAll, setCheckingAll] = useState(false);
  const [uploadedStudents, setUploadedStudents] = useState(new Set());
  const [updatedStudents, setUpdatedStudents] = useState(new Set());
  const [uploadingAll, setUploadingAll] = useState(false);
  const [updatingAll, setUpdatingAll] = useState(false);

  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      fetchSemesters(selectedProgram);
    } else {
      setSemesters([]);
      setSelectedSemester('');
    }
  }, [selectedProgram]);

  useEffect(() => {
    if (selectedProgram && selectedSemester) {
      fetchData(selectedProgram, selectedSemester);
      setCheckedStudents(new Set()); // Reset checked students when semester changes
      setUploadedStudents(new Set());
      setUpdatedStudents(new Set());
    } else {
      setData([]);
      setSemesterGrades([]);
      setCourseGrades({});
      setCheckedStudents(new Set());
      setUploadedStudents(new Set());
      setUpdatedStudents(new Set());
    }
  }, [selectedProgram, selectedSemester]);

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
      setPrograms([]);
    } finally {
      setFetchingPrograms(false);
    }
  };

  const fetchSemesters = async (programId) => {
    setFetchingSemesters(true);
    try {
      const token = localStorage.getItem('institutionToken');
      const response = await axios.get(`${baseUrl}/api/program-semesters/by-program/${programId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSemesters(response.data);
    } catch (error) {
      console.error('Error fetching semesters:', error);
      setSemesters([]);
    } finally {
      setFetchingSemesters(false);
    }
  };

  const fetchSemesterGrades = async (semesterId) => {
    try {
      const token = localStorage.getItem('institutionToken');
      const response = await axios.get(`${baseUrl}/api/semester-grades/semester/${semesterId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSemesterGrades(response.data);
    } catch (error) {
      console.error('Error fetching semester grades:', error);
      setSemesterGrades([]);
    }
  };

  const fetchData = async (programId, semesterId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');
      const response = await axios.get(`${baseUrl}/api/course-students-marks/summary/by-program-semester/${programId}/${semesterId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setData(response.data);
      // Also fetch semester grades
      await fetchSemesterGrades(semesterId);
    } catch (error) {
      console.error('Error fetching grade summary:', error);
      setData([]);
      setSemesterGrades([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateGradePoint = (marks) => {
    if (marks >= 91) return 10;
    if (marks >= 81) return 9;
    if (marks >= 71) return 8;
    if (marks >= 61) return 7;
    if (marks >= 51) return 6;
    if (marks >= 41) return 5;
    if (marks >= 35) return 4;
    return 0;
  };

  const getGradeLetter = (gradePoint) => {
    if (gradePoint === 10) return 'O';
    if (gradePoint === 9) return 'A+';
    if (gradePoint === 8) return 'A';
    if (gradePoint === 7) return 'B+';
    if (gradePoint === 6) return 'B';
    if (gradePoint === 5) return 'C';
    if (gradePoint === 4) return 'P';
    return 'F';
  };

  const initializeSemesterGrade = async (studentId, semesterId) => {
    try {
      const token = localStorage.getItem('institutionToken');
      await axios.post(`${baseUrl}/api/semester-grades`, {
        semester_id: semesterId,
        student_id: studentId,
        sgpa: 0,
        grade_points: 0,
        max_grade_points: 0
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Refresh the semester grades
      await fetchSemesterGrades(semesterId);
    } catch (error) {
      console.error('Error initializing semester grade:', error);
    }
  };

  const checkCourseGrades = async (studentId, semesterId) => {
    try {
      const token = localStorage.getItem('institutionToken');
      const response = await axios.get(`${baseUrl}/api/course-grades/by-student-semester/${studentId}/${semesterId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCourseGrades(prev => ({
        ...prev,
        [studentId]: response.data
      }));
      setCheckedStudents(prev => new Set([...prev, studentId]));
    } catch (error) {
      console.error('Error fetching course grades:', error);
      setCourseGrades(prev => ({
        ...prev,
        [studentId]: []
      }));
      setCheckedStudents(prev => new Set([...prev, studentId]));
    }
  };

  const checkAllCourseGrades = async () => {
    if (!selectedSemester || data.length === 0) return;

    setCheckingAll(true);
    try {
      const promises = data.map(studentData =>
        checkCourseGrades(studentData.student.id, selectedSemester)
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error checking all course grades:', error);
    } finally {
      setCheckingAll(false);
    }
  };

  const uploadCourseMarks = async (studentId, course, semesterId) => {
    try {
      const token = localStorage.getItem('institutionToken');
      const studentGrade = semesterGrades.find(sg => sg.student_id === studentId);
      const gradePoint = calculateGradePoint(course.total_marks);
      const gradeLetter = getGradeLetter(gradePoint);
      const status = gradePoint === 0 ? 'failed' : 'passed';

      // First, add course grade
      await axios.post(`${baseUrl}/api/course-grades`, {
        sem_refer_id: studentGrade.id,
        course_code: course.course_code,
        course_id: course.course_id,
        grade: gradeLetter,
        status: status,
        grade_points: gradePoint * course.credits,
        max_grade_points: 10 * course.credits
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Then, update semester grade
      const newMaxGradePoints = studentGrade.max_grade_points + (10 * course.credits);
      const newGradePoints = studentGrade.grade_points + (gradePoint * course.credits);
      const newSgpa = newGradePoints / (newMaxGradePoints / 10);

      await axios.put(`${baseUrl}/api/semester-grades/${studentGrade.id}`, {
        sgpa: newSgpa,
        grade_points: newGradePoints,
        max_grade_points: newMaxGradePoints
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update local state instead of refetching
      const updatedSemesterGrades = semesterGrades.map(sg =>
        sg.student_id === studentId
          ? { ...sg, sgpa: newSgpa, grade_points: newGradePoints, max_grade_points: newMaxGradePoints }
          : sg
      );
      setSemesterGrades(updatedSemesterGrades);

      // Add the uploaded course to courseGrades
      const newCourseGrade = {
        id: 'temp', // temporary id
        sem_refer_id: studentGrade.id,
        course_code: course.course_code,
        course_id: course.course_id,
        grade: gradeLetter,
        status: status,
        grade_points: gradePoint * course.credits,
        max_grade_points: 10 * course.credits
      };
      setCourseGrades(prev => ({
        ...prev,
        [studentId]: [...(prev[studentId] || []), newCourseGrade]
      }));

      // Mark student as uploaded
      setUploadedStudents(prev => new Set([...prev, studentId]));
    } catch (error) {
      console.error('Error uploading course marks:', error);
    }
  };

  const updateCourseMarks = async (studentId, course, semesterId) => {
    try {
      const token = localStorage.getItem('institutionToken');
      const studentGrade = semesterGrades.find(sg => sg.student_id === studentId);
      const existingCourseGrade = courseGrades[studentId].find(cg => cg.course_id === course.course_id);
      const gradePoint = calculateGradePoint(course.total_marks);
      const gradeLetter = getGradeLetter(gradePoint);
      const status = gradePoint === 0 ? 'failed' : 'passed';

      // Update course grade
      await axios.put(`${baseUrl}/api/course-grades/${existingCourseGrade.id}`, {
        grade: gradeLetter,
        status: status,
        grade_points: gradePoint * course.credits,
        max_grade_points: 10 * course.credits
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Recalculate semester grade based on all course grades
      const allCourseGrades = courseGrades[studentId].map(cg =>
        cg.course_id === course.course_id ? { ...cg, grade_points: gradePoint * course.credits } : cg
      );
      
      const studentCourses = data.find(sd => sd.student.id === studentId).courses;
      const totalMaxGradePoints = studentCourses.reduce((sum, c) => sum + (c.credits * 10), 0);
      const totalGradePoints = allCourseGrades.reduce((sum, cg) => sum + cg.grade_points, 0);
      const newSgpa = totalGradePoints / (totalMaxGradePoints / 10);

      await axios.put(`${baseUrl}/api/semester-grades/${studentGrade.id}`, {
        sgpa: newSgpa,
        grade_points: totalGradePoints,
        max_grade_points: totalMaxGradePoints
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update local state
      const updatedSemesterGrades = semesterGrades.map(sg =>
        sg.student_id === studentId
          ? { ...sg, sgpa: newSgpa, grade_points: totalGradePoints, max_grade_points: totalMaxGradePoints }
          : sg
      );
      setSemesterGrades(updatedSemesterGrades);

      // Update courseGrades
      const updatedCourseGrades = courseGrades[studentId].map(cg =>
        cg.course_id === course.course_id ? { ...cg, grade: gradeLetter, status: status, grade_points: gradePoint * course.credits, max_grade_points: 10 * course.credits } : cg
      );
      setCourseGrades(prev => ({
        ...prev,
        [studentId]: updatedCourseGrades
      }));

      // Mark student as updated
      setUpdatedStudents(prev => new Set([...prev, studentId]));
    } catch (error) {
      console.error('Error updating course marks:', error);
    }
  };

  const uploadAllCourseMarks = async () => {
    if (!selectedSemester || data.length === 0) return;

    setUploadingAll(true);
    try {
      const promises = data.flatMap(studentData =>
        studentData.courses
          .filter(course => course.marks && semesterGrades.find(sg => sg.student_id === studentData.student.id))
          .filter(course => !courseGrades[studentData.student.id] || !courseGrades[studentData.student.id].some(cg => cg.course_id === course.course_id))
          .map(course => uploadCourseMarks(studentData.student.id, course, selectedSemester))
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error uploading all course marks:', error);
    } finally {
      setUploadingAll(false);
    }
  };

  const updateAllCourseMarks = async () => {
    if (!selectedSemester || data.length === 0) return;

    setUpdatingAll(true);
    try {
      const promises = data.flatMap(studentData =>
        studentData.courses
          .filter(course => course.marks && semesterGrades.find(sg => sg.student_id === studentData.student.id))
          .filter(course => courseGrades[studentData.student.id] && courseGrades[studentData.student.id].some(cg => cg.course_id === course.course_id))
          .map(course => updateCourseMarks(studentData.student.id, course, selectedSemester))
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error updating all course marks:', error);
    } finally {
      setUpdatingAll(false);
    }
  };

  const getGradeColor = (gradePoint) => {
    if (gradePoint >= 9) return 'text-green-600 bg-green-100';
    if (gradePoint >= 8) return 'text-blue-600 bg-blue-100';
    if (gradePoint >= 7) return 'text-yellow-600 bg-yellow-100';
    if (gradePoint >= 6) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (fetchingPrograms) {
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

        {/* Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
              >
                <option value="">Select Program</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.program_name} ({program.program_code})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                disabled={!selectedProgram || fetchingSemesters}
              >
                <option value="">
                  {fetchingSemesters ? 'Loading semesters...' : selectedProgram ? 'Select Semester' : 'Select Program first'}
                </option>
                {semesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.semester_name} (Seq - {semester.semester_sequence})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Operations */}
        {selectedProgram && selectedSemester && data.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Bulk Grade Operations</h3>
                <p className="text-xs text-gray-600">Perform operations on all students at once</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={checkAllCourseGrades}
                disabled={checkingAll}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
              >
                {checkingAll ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking All...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Check All
                  </>
                )}
              </button>
              <button
                onClick={uploadAllCourseMarks}
                disabled={uploadingAll}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
              >
                {uploadingAll ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading All...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload All
                  </>
                )}
              </button>
              <button
                onClick={updateAllCourseMarks}
                disabled={updatingAll}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
              >
                {updatingAll ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating All...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Update All
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Data Display */}
        {loading ? (
          <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <p className="text-gray-500">
              {selectedProgram && selectedSemester ? 'No grade data found for this program and semester.' : 'Please select a program and semester to view grade summary.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((studentData) => (
              <div key={studentData.student.id} className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-orange-600 font-semibold text-sm">
                        {studentData.student.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{studentData.student.name}</h3>
                      <p className="text-xs text-gray-500">ID: {studentData.student.student_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => checkCourseGrades(studentData.student.id, selectedSemester)}
                      disabled={checkedStudents.has(studentData.student.id)}
                      className={`px-3 py-1 text-xs rounded flex items-center ${
                        checkedStudents.has(studentData.student.id)
                          ? 'bg-green-600 text-white cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {checkedStudents.has(studentData.student.id) ? (
                        <>
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Checked
                        </>
                      ) : (
                        'Check'
                      )}
                    </button>
                    {checkedStudents.has(studentData.student.id) && courseGrades[studentData.student.id] && (
                      <span className="text-xs text-gray-600">
                        ({courseGrades[studentData.student.id].length} courses)
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {studentData.courses.map((course) => (
                    <div key={course.course_id} className="border border-gray-200 rounded-lg p-2">
                      <div className="flex justify-between items-start mb-1">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 text-xs truncate">{course.course_name}</h4>
                          <p className="text-xs text-gray-500 truncate">{course.course_code} • {course.credits}cr</p>
                        </div>
                        <div className="flex items-center justify-end ml-1">
                          <span className={`px-1 py-0.5 rounded text-xs font-medium ${getGradeColor(course.marks ? calculateGradePoint(course.total_marks) : course.grade_point)}`}>
                            {course.marks ? `${getGradeLetter(calculateGradePoint(course.total_marks))} (${calculateGradePoint(course.total_marks) * course.credits})` : (course.grade_point !== null && course.grade_point !== undefined ? `${getGradeLetter(course.grade_point)} (${course.grade_point * course.credits})` : 'Pending')}
                          </span>
                          {course.marks && semesterGrades.find(sg => sg.student_id === studentData.student.id) && courseGrades[studentData.student.id] && (
                            courseGrades[studentData.student.id].some(cg => cg.course_id === course.course_id) ? (
                              <div className="flex items-center">
                                <button
                                  onClick={() => updateCourseMarks(studentData.student.id, course, selectedSemester)}
                                  disabled={updatedStudents.has(studentData.student.id)}
                                  className={`ml-1 px-1 py-0.5 text-xs rounded flex items-center ${
                                    updatedStudents.has(studentData.student.id)
                                      ? 'bg-purple-600 text-white cursor-not-allowed'
                                      : 'bg-blue-600 text-white hover:bg-blue-700'
                                  }`}
                                >
                                  {updatedStudents.has(studentData.student.id) ? (
                                    <>
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Updated
                                    </>
                                  ) : (
                                    'Update'
                                  )}
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <button
                                  onClick={() => uploadCourseMarks(studentData.student.id, course, selectedSemester)}
                                  disabled={uploadedStudents.has(studentData.student.id)}
                                  className={`ml-1 px-1 py-0.5 text-xs rounded flex items-center ${
                                    uploadedStudents.has(studentData.student.id)
                                      ? 'bg-green-700 text-white cursor-not-allowed'
                                      : 'bg-green-600 text-white hover:bg-green-700'
                                  }`}
                                >
                                  {uploadedStudents.has(studentData.student.id) ? (
                                    <>
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Uploaded
                                    </>
                                  ) : (
                                    'Upload'
                                  )}
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {course.marks ? (
                        <div className="space-y-0.5">
                          <div className="text-xs">
                            <span className="text-gray-600">Total: </span>
                            <span className="font-medium">{course.total_marks}/100</span>
                          </div>

                          <div className="space-y-0.5">
                            {Object.entries(course.marks).map(([component, mark]) => {
                              const weightage = course.weightage[component] || 0;
                              return (
                                <div key={component} className="flex justify-between text-xs">
                                  <span className="capitalize text-gray-600 truncate">{component}:</span>
                                  <span className="text-right">{mark}({weightage}%)</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 italic">No marks</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Semester Grade Info */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  {(() => {
                    const studentGrade = semesterGrades.find(sg => sg.student_id === studentData.student.id);
                    if (studentGrade) {
                      return (
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">SGPA:</span>
                            <span className="font-medium">{studentGrade.sgpa}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Grade Points:</span>
                            <span className="font-medium">{studentGrade.grade_points}/{studentGrade.max_grade_points}</span>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <button
                          onClick={() => initializeSemesterGrade(studentData.student.id, selectedSemester)}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Initialize Semester Grade
                        </button>
                      );
                    }
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageGradeTab;