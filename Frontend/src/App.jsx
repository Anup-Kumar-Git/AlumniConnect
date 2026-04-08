import React, { useState, useEffect, createContext } from 'react';

export const ThemeContext = createContext();
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
import AdminProfile from './pages/AdminProfile.jsx';
import AdminPosts from './pages/AdminPosts.jsx';
import AlumniList from './pages/AlumniList.jsx';
import StudentList from './pages/StudentList.jsx';
import ConnectedStudents from './pages/ConnectedStudents.jsx';
import StudentConnections from './pages/StudentConnections.jsx';
import MyPosts from './pages/MyPosts.jsx';

import PendingSessions from './pages/PendingSessions.jsx';
import BookedSessions from './pages/BookedSessions.jsx';

function App() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', !isDark);
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
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
          <Route path="/admin-profile" element={<AdminProfile isDark={isDark} setIsDark={setIsDark} />} />
          <Route path="/admin-posts" element={<AdminPosts isDark={isDark} setIsDark={setIsDark} />} />
          <Route path="/admin-approvals" element={<AdminDashboard isDark={isDark} setIsDark={setIsDark} />} />
          <Route path="/alumni-list" element={<AlumniList isDark={isDark} setIsDark={setIsDark} />} />
          <Route path="/student-list" element={<StudentList isDark={isDark} setIsDark={setIsDark} />} />
          <Route path="/connected-students" element={<ConnectedStudents isDark={isDark} setIsDark={setIsDark} />} />
          <Route path="/student-connections" element={<StudentConnections isDark={isDark} setIsDark={setIsDark} />} />
          <Route path="/my-posts" element={<MyPosts isDark={isDark} />} />
          <Route path="/pending-sessions" element={<PendingSessions isDark={isDark} setIsDark={setIsDark} />} />
          <Route path="/sessions" element={<BookedSessions isDark={isDark} setIsDark={setIsDark} />} />

          <Route path="/" element={<Navigate to="/auth" />} />
        </Routes>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;