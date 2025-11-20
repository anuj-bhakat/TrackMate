import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage'
import StudentHome from './student/StudentHome'
import StudentLogin from './student/StudentLogin'
import StudentSignup from './student/StudentSignup'
import StudentProfile from './student/StudentProfile'
import FacultyHome from './faculty/FacultyHome'
import FacultyLogin from './faculty/FacultyLogin'
import FacultySignup from './faculty/FacultySignup'
import FacultyProfile from './faculty/FacultyProfile'
import AdminHome from './admin/AdminHome'
import AdminLogin from './admin/AdminLogin'
import InstitutionHome from './institution/InstitutionHome'
import InstitutionLogin from './institution/InstitutionLogin'
import InstitutionSignup from './institution/InstitutionSignup'
import InstitutionProfile from './institution/InstitutionProfile'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/student" element={<StudentHome />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-signup" element={<StudentSignup />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/faculty" element={<FacultyHome />} />
        <Route path="/faculty-login" element={<FacultyLogin />} />
        <Route path="/faculty-signup" element={<FacultySignup />} />
        <Route path="/faculty-profile" element={<FacultyProfile />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/institution" element={<InstitutionHome />} />
        <Route path="/institution-login" element={<InstitutionLogin />} />
        <Route path="/institution-signup" element={<InstitutionSignup />} />
        <Route path="/institution-profile" element={<InstitutionProfile />} />
      </Routes>
    </Router>
  )
}

export default App