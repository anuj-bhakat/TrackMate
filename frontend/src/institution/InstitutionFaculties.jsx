import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InstitutionFaculties = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    facultyId: '',
    department: '',
    password: '',
    confirmPassword: ''
  });
  const [addLoading, setAddLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculties = faculties.filter(faculty =>
    faculty.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.faculty_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (faculty) => {
    setSelectedFaculty(faculty);
    setShowModal(true);
  };

  const isGuest = localStorage.getItem('isGuest') === 'true';

  const handleDeactivate = async (faculty) => {
    if (isGuest) return;
    setDeleteLoading(faculty.faculty_id);
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');
      const response = await axios.delete(`${baseUrl}/api/faculties/${institutionId}/${faculty.faculty_id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response);
      fetchFaculties(); // Refresh the list
    } catch (error) {
      console.error('Error deleting faculty:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to delete faculty. Please try again.';
      alert(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (isGuest) return;
    if (!addFormData.firstName || !addFormData.lastName || !addFormData.username || !addFormData.facultyId || !addFormData.department || !addFormData.password || !addFormData.confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    if (addFormData.password !== addFormData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // ... existing code ...

    setAddLoading(true);
    try {
      const token = localStorage.getItem('institutionToken');
      const institutionId = localStorage.getItem('institutionId');

      await axios.post(`${baseUrl}/api/faculties/signup`, {
        institution_id: institutionId,
        faculty_id: addFormData.facultyId,
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
        facultyId: '',
        department: '',
        password: '',
        confirmPassword: ''
      });
      fetchFaculties(); // Refresh the list
    } catch (error) {
      console.error('Error adding faculty:', error);
      alert('Failed to add faculty. Please try again.');
    } finally {
      setAddLoading(false);
    }
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
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Manage Faculties</h1>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, faculty ID, email, or department..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                disabled={isGuest}
                className={`px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm sm:text-base ${isGuest ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}`}
              >
                Add Faculty
              </button>
              <select className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base">
                <option value="">All Departments</option>
                <option value="computer_science">Computer Science</option>
                <option value="mathematics">Mathematics</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
              </select>
            </div>
          </div>
        </div>

        {/* Faculties Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faculty
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Faculty ID
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Department
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
                {filteredFaculties.map((faculty) => (
                  <tr key={faculty.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-600 font-medium text-xs sm:text-sm">
                              {faculty.name?.charAt(0)?.toUpperCase() || 'F'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 sm:ml-4">
                          <div className="text-sm font-medium text-gray-900">{faculty.name}</div>
                          <div className="text-xs sm:text-sm text-gray-500">{faculty.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                      {faculty.faculty_id}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                      {faculty.department || 'Not specified'}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${faculty.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {faculty.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <button
                          onClick={() => handleViewDetails(faculty)}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button
                          onClick={() => handleDeactivate(faculty)}
                          disabled={deleteLoading === faculty.faculty_id || isGuest}
                          className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 ${deleteLoading === faculty.faculty_id || isGuest ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}`}
                        >
                          {deleteLoading === faculty.faculty_id ? (
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

        {/* Faculty Details Modal */}
        {showModal && selectedFaculty && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Faculty Details</h3>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">{selectedFaculty.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Faculty ID</label>
                    <p className="text-sm text-gray-900">{selectedFaculty.faculty_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedFaculty.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <p className="text-sm text-gray-900">{selectedFaculty.department || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Courses</label>
                    <p className="text-sm text-gray-900">{selectedFaculty.courses_count || 0} courses assigned</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedFaculty.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {selectedFaculty.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Faculty Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add New Faculty</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleAddFaculty} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={addFormData.firstName}
                        onChange={(e) => setAddFormData({ ...addFormData, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={addFormData.username}
                      onChange={(e) => setAddFormData({ ...addFormData, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Faculty ID</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={addFormData.facultyId}
                      onChange={(e) => setAddFormData({ ...addFormData, facultyId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={addFormData.department}
                      onChange={(e) => setAddFormData({ ...addFormData, department: e.target.value })}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={addFormData.password}
                      onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addLoading ? 'Adding...' : 'Add Faculty'}
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

export default InstitutionFaculties;