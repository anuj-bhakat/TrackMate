import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InstitutionNavbar from './InstitutionNavbar';
import InstitutionDashboard from './InstitutionDashboard';
import InstitutionAnalytics from './InstitutionAnalytics';
import InstitutionPrograms from './InstitutionPrograms';
import InstitutionStudents from './InstitutionStudents';
import InstitutionFaculties from './InstitutionFaculties';
import InstitutionGrades from './InstitutionGrades';

const InstitutionHome = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('institutionActiveTab') || 'dashboard';
  });

  useEffect(() => {
    // Check if institutionToken exists, if not redirect to login
    const token = localStorage.getItem('institutionToken');
    if (!token) {
      navigate('/institution-login');
      return;
    }
  }, [navigate]);

  const renderContent = () => {
    switch (activeTab) {
      case 'programs':
        return <InstitutionPrograms />;
      case 'grades':
        return <InstitutionGrades />;
      case 'students':
        return <InstitutionStudents />;
      case 'faculties':
        return <InstitutionFaculties />;
      case 'analytics':
        return <InstitutionAnalytics />;
      default:
        return <InstitutionDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <InstitutionNavbar onTabChange={setActiveTab} />
      {renderContent()}
    </div>
  );
};

export default InstitutionHome;