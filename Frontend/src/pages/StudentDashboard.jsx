import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Calendar, CheckCircle, Clock, Megaphone, User } from 'lucide-react';
import axios from 'axios';
import PostCard from '../components/PostCard';

const StudentDashboard = ({ isDark, setIsDark }) => {
  const userName = localStorage.getItem('userName') || 'Student';
  const [dashboardStats, setDashboardStats] = useState({
    totalRequests: 0,
    acceptedRequests: 0,
    pendingRequests: 0
  });
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('http://localhost:5000/api/posts', {
          headers: { 'x-auth-token': token }
        });
        setPosts(res.data);
      } catch (err) {
        console.error('Failed to fetch posts', err);
      }
    };
    fetchPosts();
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('http://localhost:5000/api/requests/stats/dashboard', {
          headers: { 'x-auth-token': token }
        });
        setDashboardStats(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: 'Accepted Mentorships', value: dashboardStats.acceptedRequests, icon: <CheckCircle className="text-green-400" />, color: 'bg-green-500/10' },
    { label: 'Pending Requests', value: dashboardStats.pendingRequests, icon: <Clock className="text-yellow-400" />, color: 'bg-yellow-500/10' },
    { label: 'Total Requests Sent', value: dashboardStats.totalRequests, icon: <Calendar className="text-blue-400" />, color: 'bg-blue-500/10' },
  ];

  return (
    <DashboardLayout isDark={isDark} role="Student" userName={userName}>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className={`text-4xl font-black tracking-tight ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            {/* FEATURE: Personalized greeting */}
            Welcome, <span className="text-indigo-400">{userName.split(' ')[0]}!</span>
          </h2>
          <p className={`font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            You have {dashboardStats.acceptedRequests} accepted requests available.
          </p>
        </div>

        <div className="flex items-center gap-3">

        </div>
      </header>

      {/* ... rest of your stats and mentor card section ... */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className={`p-8 rounded-[2.5rem] border transition-all ${isDark ? 'bg-[#0f0f12] border-white/10 shadow-2xl' : 'bg-white border-slate-100 shadow-xl'
            }`}>
            <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mb-4`}>
              {stat.icon}
            </div>
            <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {stat.label}
            </p>
            <h4 className={`text-3xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {stat.value}
            </h4>
          </div>
        ))}
      </section>

      {/* Announcements Section */}
      <section className="mb-10 max-w-3xl mx-auto mt-12">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-4 mb-4 mt-2">
            <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
            <span className={`text-[12px] font-semibold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'} flex items-center gap-2`}>
              <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                Latest Feed
              </span>
            </span>
            <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
          </div>

          {posts.length === 0 ? (
            <div className={`p-10 rounded-xl border text-center border-dashed ${isDark ? 'bg-[#0f0f12] border-white/10 text-slate-500' : 'bg-slate-50 border-slate-300 text-slate-400'}`}>
              No announcements visible yet.
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                isDark={isDark}
                currentUserRole="Student"
              />
            ))
          )}
        </div>
      </section>

    </DashboardLayout>
  );
};

export default StudentDashboard;