import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Users, Calendar, Clock, Megaphone, User, Edit2, Image as ImageIcon, X, Send, Trash2 } from 'lucide-react';
import axios from 'axios';
import PostCard from '../components/PostCard';

const AlumniDashboard = ({ isDark, setIsDark }) => {
  const userName = localStorage.getItem('userName') || 'Mentor';
  const [dashboardStats, setDashboardStats] = useState({
    totalReceived: 0,
    acceptedMentorships: 0,
    pendingApprovals: 0
  });
  const [posts, setPosts] = useState([]);
  const currentUserId = localStorage.getItem('userId');

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



  const handleDeletePost = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/posts/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setPosts(posts.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const stats = [
    { label: 'Accepted Mentees', value: dashboardStats.acceptedMentorships, icon: <Users className="text-green-400" />, color: 'bg-green-500/10' },
    { label: 'Pending Approvals', value: dashboardStats.pendingApprovals, icon: <Clock className="text-yellow-400" />, color: 'bg-yellow-500/10' },
    { label: 'Total Received', value: dashboardStats.totalReceived, icon: <Calendar className="text-blue-400" />, color: 'bg-blue-500/10' },
  ];

  return (
    <DashboardLayout isDark={isDark} role="Alumni" userName={userName}>
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h2 className={`text-4xl font-black tracking-tight ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            {/* FEATURE: Personalized insights title */}
            {userName.split(' ')[0]}'s <span className="text-purple-400">Insights</span>
          </h2>
          <p className={`font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage your impact and mentorship requests.
          </p>
        </div>
        
      </header>

      {/* ... rest of your stats and request section ... */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className={`p-8 rounded-[2.5rem] border transition-all ${
            isDark ? 'bg-[#0f0f12] border-white/10 shadow-2xl' : 'bg-white border-slate-100 shadow-xl'
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
      </div>

      {/* Announcements Section */}
      <section className="mb-10 max-w-5xl mx-auto">
        <div className="flex flex-col gap-6">
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
                  onDelete={handleDeletePost}
                  currentUserRole="Alumni" 
                />
              ))
            )}
          </div>
        </div>
      </section>

    </DashboardLayout>
  );
};

export default AlumniDashboard;