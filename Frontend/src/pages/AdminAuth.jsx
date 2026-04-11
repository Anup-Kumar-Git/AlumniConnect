import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const AdminAuth = ({ isDark, setIsDark }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      
      // FEATURE: loginType tells backend to verify the user role is 'Admin'
      const payload = isLogin 
        ? { email: formData.email, password: formData.password, loginType: 'Admin' } 
        : { ...formData, role: 'Admin' };

      const res = await API.post(endpoint, payload);
      
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
      alert(err.response?.data?.msg || "Authentication Failed");
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
        <h2 className="text-3xl font-black text-center mb-2">Admin {isLogin ? 'Login' : 'Registration'}</h2>
        <p className="text-center text-slate-500 mb-8 text-sm">{isLogin ? 'Enter Credentials' : 'Create Account'}</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Full Name" 
              required 
              className={`w-full p-4 rounded-xl border outline-none ${isDark ? 'bg-white/5 border-transparent' : 'bg-slate-50 border-slate-200'} focus:border-[#5c4dff]`} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          )}
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
          
          <button type="submit" className="w-full bg-[#5c4dff] text-white font-bold py-4 rounded-xl active:scale-95 transition-all">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm font-medium text-[#5c4dff] hover:underline">
            {isLogin ? "Need an admin account? Register here" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

// CRITICAL: This line prevents the SyntaxError
export default AdminAuth;