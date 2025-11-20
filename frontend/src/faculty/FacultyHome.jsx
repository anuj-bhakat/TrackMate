import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultyNavbar from './FacultyNavbar';
import FacultyDashboard from './FacultyDashboard';
import FacultyGroups from './FacultyGroups';
import FacultyAssignments from './FacultyAssignments';
import FacultyPerformance from './FacultyPerformance';

const FacultyHome = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(localStorage.getItem('facultyActiveTab') || 'dashboard');

  const setActiveTabWithStorage = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('facultyActiveTab', tab);
  };

  useEffect(() => {
    // Check if facultyToken exists, if not redirect to login
    const token = localStorage.getItem('facultyToken');
    if (!token) {
      navigate('/faculty-login');
      return;
    }
  }, [navigate]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <FacultyDashboard />;
      case 'groups':
        return <FacultyGroups />;
      case 'assignments':
        return <FacultyAssignments />;
      case 'performance':
        return <FacultyPerformance />;
      default:
        return (
          <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h1>
              <p className="text-xl text-gray-600">
                This section is under development.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <FacultyNavbar activeTab={activeTab} setActiveTab={setActiveTabWithStorage} />
      {renderContent()}
    </div>
  );
};

export default FacultyHome;