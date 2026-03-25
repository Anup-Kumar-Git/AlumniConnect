import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import Auth from './pages/Auth.jsx';
import StudentAuth from './pages/StudentAuth.jsx';
import AlumniAuth from './pages/AlumniAuth.jsx';
import AdminAuth from './pages/AdminAuth.jsx';

// Dashboard Pages
import StudentDashboard from './pages/StudentDashboard.jsx';
import StudentProfile from './pages/StudentProfile.jsx';
import StudentResume from './pages/StudentResume.jsx';
import AlumniDashboard from './pages/AlumniDashboard.jsx';
import AlumniProfile from './pages/AlumniProfile.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AlumniList from './pages/AlumniList.jsx';

function App() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', !isDark);
  }, [isDark]);

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth isDark={isDark} setIsDark={setIsDark} />} />
        <Route path="/student-auth" element={<StudentAuth isDark={isDark} setIsDark={setIsDark} />} />
        <Route path="/alumni-auth" element={<AlumniAuth isDark={isDark} setIsDark={setIsDark} />} />
        <Route path="/admin-auth" element={<AdminAuth isDark={isDark} setIsDark={setIsDark} />} />

        {/* Dashboards - Ensure these paths match your navigate() calls */}
        <Route path="/student-dashboard" element={<StudentDashboard isDark={isDark} setIsDark={setIsDark} />} />
        <Route path="/student-profile" element={<StudentProfile isDark={isDark} setIsDark={setIsDark} />} />
        <Route path="/student-resume" element={<StudentResume isDark={isDark} setIsDark={setIsDark} />} />
        <Route path="/alumni-dashboard" element={<AlumniDashboard isDark={isDark} setIsDark={setIsDark} />} />
        <Route path="/alumni-profile" element={<AlumniProfile isDark={isDark} setIsDark={setIsDark} />} />
        <Route path="/admin-dashboard" element={<AdminDashboard isDark={isDark} setIsDark={setIsDark} />} />
        <Route path="/alumni-list" element={<AlumniList isDark={isDark} setIsDark={setIsDark} />} />

        <Route path="/" element={<Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
}

export default App;