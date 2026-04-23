import React, { useState, useEffect, createContext } from 'react';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';

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
import UserProfile from './pages/UserProfile.jsx';

import PendingSessions from './pages/PendingSessions.jsx';
import BookedSessions from './pages/BookedSessions.jsx';

function App() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', !isDark);
  }, [isDark]);

  useEffect(() => {
    const pingHeartbeat = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await axios.post('http://localhost:5000/api/auth/heartbeat', {}, {
            headers: { 'x-auth-token': token }
          });
        } catch (err) {
          console.error("Heartbeat failed", err);
        }
      }
    };

    // Ping immediately on load
    pingHeartbeat();

    // Ping every 2 minutes
    const interval = setInterval(pingHeartbeat, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      <Router>
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 3000,
            style: {
              background: isDark ? '#0f0f12' : '#ffffff',
              color: isDark ? '#ffffff' : '#0f0f12',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
              borderRadius: '1rem',
              padding: '16px',
              fontWeight: 'bold',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            },
          }}
        />
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
          <Route path="/user/:id" element={<UserProfile isDark={isDark} setIsDark={setIsDark} />} />

          <Route path="/" element={<Navigate to="/auth" />} />
        </Routes>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;