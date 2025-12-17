import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageProgramGradesTab = ({ programs }) => {
  const [selectedProgramForProgramGrades, setSelectedProgramForProgramGrades] = useState('');
  const isGuest = localStorage.getItem('isGuest') === 'true';
  const [programStudents, setProgramStudents] = useState([]);
  const [programGrades, setProgramGrades] = useState([]);
  const [processingStatus, setProcessingStatus] = useState({}); // student_id: 'idle' | 'processing' | 'done' | 'error'

  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (selectedProgramForProgramGrades) {
      fetchProgramStudents(selectedProgramForProgramGrades);
      fetchProgramGrades(selectedProgramForProgramGrades);
      setProcessingStatus({});
    } else {
      setProgramStudents([]);
      setProgramGrades([]);
      setProcessingStatus({});
    }
  }, [selectedProgramForProgramGrades]);

  const fetchProgramStudents = async (programId) => {
    try {
      const token = localStorage.getItem('institutionToken');
      const response = await axios.get(`${baseUrl}/api/programs/by-program/${programId}/students`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProgramStudents(response.data);
    } catch (error) {
      console.error('Error fetching program students:', error);
      setProgramStudents([]);
    }
  };

  const fetchProgramGrades = async (programId) => {
    try {
      const token = localStorage.getItem('institutionToken');
      const response = await axios.get(`${baseUrl}/api/program-grades/program/${programId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProgramGrades(response.data);
    } catch (error) {
      console.error('Error fetching program grades:', error);
      setProgramGrades([]);
    }
  };

  const updateProgramGrades = async (studentId, programId) => {
    if (isGuest) return;
    setProcessingStatus(prev => ({ ...prev, [studentId]: 'processing' }));
    try {
      const token = localStorage.getItem('institutionToken');
      const response = await axios.post(`${baseUrl}/api/program-grades`, {
        student_id: studentId,
        program_id: programId
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Update local state by adding or replacing the grade
      setProgramGrades(prev => {
        const existingIndex = prev.findIndex(g => g.student_id === studentId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = response.data;
          return updated;
        } else {
          return [...prev, response.data];
        }
      });
      setProcessingStatus(prev => ({ ...prev, [studentId]: 'done' }));
    } catch (error) {
      console.error('Error updating program grades:', error);
      setProcessingStatus(prev => ({ ...prev, [studentId]: 'error' }));
      alert('Failed to update program grades. Please try again.');
    }
  };

  const deleteProgramGrades = async (gradeId) => {
    if (isGuest) return;
    if (!confirm('Are you sure you want to delete this program grade record?')) return;
    try {
      const token = localStorage.getItem('institutionToken');
      await axios.delete(`${baseUrl}/api/program-grades/${gradeId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Remove from local state
      setProgramGrades(prev => prev.filter(g => g.id !== gradeId));
      alert('Program grade deleted successfully.');
    } catch (error) {
      console.error('Error deleting program grades:', error);
      alert('Failed to delete program grade. Please try again.');
    }
  };

  const updateAllProgramGrades = async () => {
    if (isGuest) return;
    for (const student of programStudents) {
      await updateProgramGrades(student.id, selectedProgramForProgramGrades);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Program Grades</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
              value={selectedProgramForProgramGrades}
              onChange={(e) => setSelectedProgramForProgramGrades(e.target.value)}
            >
              <option value="">Select Program</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.program_name} ({program.program_code})
                </option>
              ))}
            </select>
            {selectedProgramForProgramGrades && programStudents.length > 0 && (
              <button
                onClick={updateAllProgramGrades}
                disabled={isGuest}
                className={`px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm sm:text-base ${isGuest ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}`}
              >
                Update All Grades
              </button>
            )}
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
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CGPA
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade Points
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Semester Grades
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {programStudents.map((student) => {
              const grade = programGrades.find(g => g.student_id === student.id);
              return (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 font-medium text-sm">
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
                    {grade ? grade.cgpa?.toFixed(2) : 'Grades not available'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {grade ? `${grade.grade_points}/${grade.max_grade_points}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {grade ? (
                      <div className="space-y-1">
                        {Object.entries(grade.semester_grades || {}).map(([sem, g]) => (
                          <div key={sem} className="text-xs">
                            {sem}: {g?.toFixed(2) || 'N/A'}
                          </div>
                        ))}
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {processingStatus[student.id] === 'processing' && (
                      <span className="text-blue-600">Processing...</span>
                    )}
                    {processingStatus[student.id] === 'done' && (
                      <span className="text-green-600">Done</span>
                    )}
                    {processingStatus[student.id] === 'error' && (
                      <span className="text-red-600">Error</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateProgramGrades(student.id, selectedProgramForProgramGrades)}
                        disabled={processingStatus[student.id] === 'processing' || isGuest}
                        className={`px-3 py-1 text-xs bg-blue-600 text-white rounded disabled:opacity-50 ${isGuest ? 'cursor-not-allowed opacity-50' : 'hover:bg-blue-700'}`}
                      >
                        {grade ? 'Update' : 'Get'}
                      </button>
                      {grade && (
                        <button
                          onClick={() => deleteProgramGrades(grade.id)}
                          disabled={isGuest}
                          className={`px-3 py-1 text-xs bg-red-600 text-white rounded ${isGuest ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}`}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {programStudents.length === 0 && selectedProgramForProgramGrades && (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <p className="text-gray-500">No students found for this program.</p>
                </td>
              </tr>
            )}
            {!selectedProgramForProgramGrades && (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <p className="text-gray-500">Please select a program to view student grades.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageProgramGradesTab;