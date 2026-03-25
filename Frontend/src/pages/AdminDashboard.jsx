import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Users, ShieldAlert, Activity } from 'lucide-react';
import API from '../services/api';

const AdminDashboard = ({ isDark, setIsDark }) => {
  // FEATURE: Initialized with empty arrays to prevent .map() errors
  const [data, setData] = useState({
    totalUsers: 0,
    pendingAlumni: [],
    alumniList: []
  });

  const userName = localStorage.getItem('userName') || 'Admin';

  async function fetchAdminData() {
    try {
      const res = await API.get('/admin/stats');
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch real-time stats", err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerify = async (id) => {
    try {
      // Logic: Approve user and immediately refresh the dashboard lists
      await API.put(`/admin/verify/${id}`);
      fetchAdminData(); 
    } catch (err) {
      alert(err.response?.data?.msg || "Verification failed");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject and delete this request?")) return;
    
    try {
      // Logic: Delete user and immediately refresh the dashboard lists
      await API.delete(`/admin/reject/${id}`);
      fetchAdminData(); 
    } catch (err) {
      alert(err.response?.data?.msg || "Rejection failed");
    }
  };

  const stats = [
    { label: 'Total Users', val: data.totalUsers, icon: <Users className="text-blue-400"/>, col: 'bg-blue-500/10' },
    { label: 'Pending Approvals', val: data.pendingAlumni.length, icon: <ShieldAlert className="text-red-400"/>, col: 'bg-red-500/10' },
    { label: 'System Health', val: '99.9%', icon: <Activity className="text-green-400"/>, col: 'bg-green-500/10' },
  ];

  return (
    <DashboardLayout isDark={isDark} role="Admin" userName={userName}>
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h2 className={`text-4xl font-black tracking-tight ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            Welcome, <span className="text-red-500">{userName}</span>
          </h2>
          <p className={`font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage users, approvals, and platform health.
          </p>
        </div>
        <button 
          onClick={() => setIsDark(!isDark)}
          className={`p-3 rounded-2xl border transition-all ${
            isDark ? 'bg-[#1a1a1a] border-white/10 text-white hover:bg-[#252525]' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
          }`}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </header>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((s, i) => (
          <div key={i} className={`p-8 rounded-[2.5rem] border transition-all ${
            isDark ? 'bg-[#0f0f12] border-white/10 shadow-2xl' : 'bg-white border-slate-100 shadow-xl'
          }`}>
            <div className={`w-12 h-12 rounded-2xl ${s.col} flex items-center justify-center mb-4`}>{s.icon}</div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</p>
            <h4 className={`text-3xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.val}</h4>
          </div>
        ))}
      </div>

      {/* Pending Approvals Section */}
      <div className={`p-8 rounded-[3rem] border mb-10 ${isDark ? 'bg-[#0f0f12] border-white/10 shadow-2xl' : 'bg-white border-slate-100 shadow-xl'}`}>
        <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Pending Approvals</h3>
        <div className="space-y-4">
          {data.pendingAlumni && data.pendingAlumni.length > 0 ? (
            data.pendingAlumni.map((alumni) => (
              <div key={alumni._id} className={`p-5 rounded-2xl flex items-center justify-between transition-all ${
                isDark ? 'bg-white/5 border-transparent hover:bg-white/[0.08]' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-black">
                    {alumni.name ? alumni.name[0] : 'A'}
                  </div>
                  <div>
                    <p className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{alumni.name}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{alumni.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleVerify(alumni._id)}
                    className="px-6 py-2.5 bg-green-600 text-white text-xs font-black rounded-xl hover:bg-green-700 active:scale-95 transition-all"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReject(alumni._id)}
                    className="px-6 py-2.5 bg-red-600 text-white text-xs font-black rounded-xl hover:bg-red-700 active:scale-95 transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 italic text-sm text-center py-4">No pending alumni requests.</p>
          )}
        </div>
      </div>


    </DashboardLayout>
  );
};

export default AdminDashboard;