import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import FacultyGroupStudents from './FacultyGroupStudents';

const FacultyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem('facultyToken');
        const institutionId = localStorage.getItem('institutionId');

        if (!token || !institutionId) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const facultyId = localStorage.getItem('facultyId');

        if (!facultyId) {
          setError('Faculty ID not found');
          setLoading(false);
          return;
        }

        const baseUrl = import.meta.env.VITE_API_URL;

        const response = await axios.get(`${baseUrl}/api/groups/faculty/${facultyId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Institution-Id': institutionId
          }
        });

        setGroups(response.data);

        // Extract unique courses from groups data
        const uniqueCourses = [...new Set(response.data.map(group => group.course_refer_id))];

        // Set default selected course if available
        if (uniqueCourses.length > 0) {
          setSelectedCourse(uniqueCourses[0]);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
        setError(error.response?.data?.message || 'Failed to load groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter groups based on selected course
  const filteredGroups = groups.filter(group => group.course_refer_id === selectedCourse);

  const handleViewStudents = (group) => {
    setSelectedGroup(group);
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
  };

  if (loading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading groups...</p>
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
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Groups</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedGroup) {
    return <FacultyGroupStudents groupId={selectedGroup.id} onBack={handleBackToGroups} groupName={selectedGroup.group_name} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-5">
            <h1 className="text-3xl font-bold text-black mb-3">
              My Groups
            </h1>
          </div>


          {/* Course Selection */}
          <div className="mb-8">
            <div className="text-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course
              </label>
              <div className="relative inline-block w-full max-w-md" ref={dropdownRef}>
                <div
                  className="relative block w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 ease-in-out cursor-pointer shadow-sm"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className={selectedCourse ? 'text-gray-900' : 'text-gray-500'}>
                    {selectedCourse ? (() => {
                      const group = groups.find(g => g.course_refer_id === selectedCourse);
                      return group?.courses?.course_code || selectedCourse;
                    })() : 'Select a course'}
                  </span>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg
                      className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 border border-gray-200 overflow-auto focus:outline-none">
                    {[...new Set(groups.map(group => group.course_refer_id))].map((courseId) => {
                      const group = groups.find(g => g.course_refer_id === courseId);
                      const courseCode = group?.courses?.course_code || courseId;
                      const isSelected = selectedCourse === courseId;

                      return (
                        <div
                          key={courseId}
                          className={`cursor-pointer select-none relative py-3 pl-4 pr-9 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-150 ${
                            isSelected ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-900'
                          }`}
                          onClick={() => {
                            setSelectedCourse(courseId);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <span className="block truncate">{courseCode}</span>
                          {isSelected && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <svg className="h-4 w-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Groups Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Student Groups
            </h2>
          </div>

          {/* Groups Grid */}
          {filteredGroups.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-slate-900 mb-2">No Groups Found</h3>
              <p className="text-slate-600">No student groups found for this course.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGroups.map((group) => (
                <div key={group.id} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-slate-50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-purple-600">{group.group_code}</div>
                        <div className="text-xs text-slate-500">Group Code</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-900">{group.group_name}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">Course:</span>
                          <span className="text-sm font-medium text-slate-700">{group.courses?.course_code || 'N/A'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewStudents(group)}
                        className="w-full bg-purple-600 text-white py-2.5 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View Students</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyGroups;