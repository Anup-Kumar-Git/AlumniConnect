import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Users, ShieldAlert, Activity } from 'lucide-react';
import API from '../services/api';
import { useLocation } from 'react-router-dom';

const AdminDashboard = ({ isDark, setIsDark }) => {
  // FEATURE: Initialized with empty arrays to prevent .map() errors
  const [data, setData] = useState({
    totalUsers: 0,
    pendingAlumni: [],
    alumniList: []
  });
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const handleViewProfile = (alumni) => {
    setSelectedProfile(alumni);
    setShowModal(true);
  };

  const stats = [
    { label: 'Total Users', value: data.totalUsers, icon: <Users className="text-blue-400"/>, color: 'bg-blue-500/10' },
    { label: 'Pending Approvals', value: data.pendingAlumni.length, icon: <ShieldAlert className="text-red-400"/>, color: 'bg-red-500/10' },
    { label: 'System Health', value: '99.9%', icon: <Activity className="text-green-400"/>, color: 'bg-green-500/10' },
  ];

  const location = useLocation();

  return (
    <DashboardLayout isDark={isDark} role="Admin" userName={userName}>
      {location.pathname !== '/admin-approvals' && (
        <>
          <header className="mb-10 flex justify-between items-center">
        <div>
          <h2 className={`text-4xl font-black tracking-tight ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            Welcome, <span className="text-red-500">{userName}</span>
          </h2>
          <p className={`font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage users, approvals, and platform health.
          </p>
        </div>
        
      </header>

      {/* Stats Section */}
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
        </>
      )}

      {/* Pending Approvals Section */}
      {location.pathname === '/admin-approvals' && (
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
                      onClick={() => handleViewProfile(alumni)}
                      className="px-6 py-2.5 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 active:scale-95 transition-all"
                    >
                      View Profile
                    </button>
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
      )}

      {/* View Profile Modal */}
      {showModal && selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-lg p-8 rounded-[2.5rem] shadow-2xl relative ${isDark ? 'bg-[#0f0f12] text-white border border-white/10' : 'bg-white text-slate-900 border border-slate-100'}`}>
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-all font-bold"
            >
              ✕
            </button>
            <h3 className="text-2xl font-black mb-6">Alumni Profile</h3>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <p className={`text-xs uppercase font-bold tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Full Name</p>
                <p className="font-medium text-lg">{selectedProfile.name}</p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <p className={`text-xs uppercase font-bold tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Email Address</p>
                <p className="font-medium">{selectedProfile.email}</p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <p className={`text-xs uppercase font-bold tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Institute Name</p>
                <p className="font-medium">{selectedProfile.instituteName || 'Not specified'}</p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <p className={`text-xs uppercase font-bold tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Department</p>
                <p className="font-medium">{selectedProfile.department || 'Not specified'}</p>
              </div>
              <div className="flex gap-4">
                <div className={`flex-1 p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <p className={`text-xs uppercase font-bold tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Degree/Program</p>
                  <p className="font-medium">{selectedProfile.degree || 'Not specified'}</p>
                </div>
                <div className={`w-1/3 p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <p className={`text-xs uppercase font-bold tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Session</p>
                  <p className="font-medium">{selectedProfile.session || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => { handleVerify(selectedProfile._id); setShowModal(false); }}
                className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all"
              >
                Approve Allowed
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default AdminDashboard;