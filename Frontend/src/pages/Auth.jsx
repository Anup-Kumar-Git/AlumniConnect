import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = ({ isDark, setIsDark }) => {
  const navigate = useNavigate();

  const handleRoleClick = (role) => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    
    // If they already have an active login for this role, auto-redirect!
    if (token && storedRole === role) {
      navigate(`/${role.toLowerCase()}-dashboard`);
    } else {
      // Otherwise, go to login screen
      navigate(`/${role.toLowerCase()}-auth`);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-500 ${
      isDark ? 'bg-[#050505] text-white' : 'bg-[#f8fafc] text-[#0f172a]'
    }`}>
      
      {/* Refined Theme Toggle */}
      <div className="absolute top-8 right-8">
        <button 
          onClick={() => setIsDark(!isDark)}
          className={`text-xs px-5 py-2.5 rounded-full flex items-center gap-2 border font-bold transition-all shadow-sm ${
            isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
          }`}
        >
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      <div className="text-center mb-16">
        <h1 className="text-7xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          AlumniConnect
        </h1>
        <p className={`text-lg font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Mentorship Portal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {['Student', 'Alumni', 'Admin'].map((role) => (
          <div
            key={role}
            onClick={() => handleRoleClick(role)}
            className={`p-10 rounded-[2.5rem] border transition-all cursor-pointer hover:scale-[1.02] ${
              isDark 
              ? 'bg-[#0f0f12] border-white/5 hover:bg-white/10' 
              : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50 hover:border-indigo-500'
            }`}
          >
            <h3 className={`text-2xl font-black mb-3 ${!isDark && 'text-slate-900'}`}>{role}</h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
              Access specialized tools for {role} tasks.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Auth;