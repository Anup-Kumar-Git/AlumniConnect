import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import API from '../services/api';

const AdminAuth = ({ isDark, setIsDark }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, msg: '', type: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAlertInfo({ show: false, msg: '', type: '' });
    try {
      const payload = { email: formData.email, password: formData.password, loginType: 'Admin' };
      const res = await API.post('/auth/login', payload);
      
      // FEATURE: Save the name you put at registration for the dashboard
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userName', res.data.name); 
      localStorage.setItem('role', res.data.role);
      if (res.data.profilePicture) {
        localStorage.setItem('profilePicture', res.data.profilePicture);
      } else {
        localStorage.removeItem('profilePicture');
      }
      
      navigate('/admin-dashboard'); 
    } catch (err) {
      setAlertInfo({ show: true, msg: err.response?.data?.msg || "Authentication Failed", type: 'error' });
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-500 ${
      isDark ? 'bg-[#050505] text-white' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      
      {/* Your Original Absolute Toggle */}
      <div className="absolute top-8 right-8">
        <button 
          onClick={() => setIsDark(!isDark)} 
          className={`text-xs px-4 py-2 rounded-full border font-bold ${
            isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 shadow-sm'
          }`}
        >
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      {/* Your Original Layout and Styling */}
      <div className={`w-full max-w-md p-10 rounded-[2.5rem] border transition-all ${
        isDark ? 'bg-[#0f0f12] border-white/5 shadow-2xl' : 'bg-white border-slate-100 shadow-2xl'
      }`}>
        <h2 className="text-3xl font-black text-center mb-2">Admin Login</h2>
        <p className="text-center text-slate-500 mb-8 text-sm">Enter Credentials</p>

        {alertInfo.show && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-300 ${alertInfo.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
            {alertInfo.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
            <p>{alertInfo.msg}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Email" 
            required 
            className={`w-full p-4 rounded-xl border outline-none ${isDark ? 'bg-white/5 border-transparent' : 'bg-slate-50 border-slate-200'} focus:border-[#5c4dff]`} 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            required 
            className={`w-full p-4 rounded-xl border outline-none ${isDark ? 'bg-white/5 border-transparent' : 'bg-slate-50 border-slate-200'} focus:border-[#5c4dff]`} 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />
          
          <button type="submit" disabled={isAuthLoading} className="w-full flex items-center justify-center gap-2 bg-[#5c4dff] text-white font-bold py-4 rounded-xl active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100">
            {isAuthLoading ? <><Loader2 className="w-5 h-5 animate-spin"/> Processing...</> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

// CRITICAL: This line prevents the SyntaxError
export default AdminAuth;