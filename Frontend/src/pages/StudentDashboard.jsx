import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Calendar, CheckCircle, Clock, Megaphone, User } from 'lucide-react';
import axios from 'axios';

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
          <button 
            onClick={() => setIsDark(!isDark)}
            className={`p-3 rounded-2xl border transition-all ${
              isDark ? 'bg-[#1a1a1a] border-white/10 text-white hover:bg-[#252525]' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
            }`}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* ... rest of your stats and mentor card section ... */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className={`p-6 rounded-[2.5rem] border transition-all ${
            isDark ? 'bg-[#0f0f12] border-white/10 shadow-2xl' : 'bg-white border-slate-100 shadow-xl'
          }`}>
            <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mb-4`}>
              {stat.icon}
            </div>
            <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {stat.label}
            </p>
            <h4 className={`text-3xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {stat.value}
            </h4>
          </div>
        ))}
      </section>

      {/* Announcements Section */}
      {posts.length > 0 && (
        <section className="mb-10">
          <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            <Megaphone className="text-red-500" size={24} /> Recent Announcements
          </h3>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {posts.map(post => (
              <div key={post._id} className={`p-8 rounded-[2.5rem] border transition-all hover:shadow-lg hover:-translate-y-1 ${
                isDark ? 'bg-[#0f0f12] border-white/10' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <h4 className={`text-2xl font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{post.title}</h4>
                <div className={`flex items-center gap-4 mb-4 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span className="flex items-center gap-1.5 opacity-80">
                    <User size={14} className="text-indigo-400" /> {post.authorName}
                  </span>
                  <span className="flex items-center gap-1.5 opacity-80">
                    <Clock size={14} className="text-indigo-400" /> {new Date(post.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className={`p-5 rounded-xl leading-relaxed whitespace-pre-wrap ${isDark ? 'bg-black/20 text-slate-300' : 'bg-white border text-slate-700'}`}>
                  {post.image && (
                    <img src={post.image} alt="Announcement" className="w-full max-h-64 object-cover rounded-xl mb-4 border border-white/5 shadow-md" />
                  )}
                  {post.content}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </DashboardLayout>
  );
};

export default StudentDashboard;