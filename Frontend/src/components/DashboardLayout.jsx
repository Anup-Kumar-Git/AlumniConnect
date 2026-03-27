import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, FileText, User, LogOut, Menu, X } from 'lucide-react';

const DashboardLayout = ({ children, isDark, role, userName = "Abhishek Kumar" }) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const profilePicture = localStorage.getItem('profilePicture');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  const menuItems = [
    { name: 'Home', icon: <Home size={22} />, path: `/${role.toLowerCase()}-dashboard` },
    { name: role === 'Alumni' ? "Student's Request" : 'Alumni List', icon: <Users size={22} />, path: '/alumni-list' },
    { name: role === 'Admin' ? 'Pending Approvals' : 'Booked Sessions', icon: <Calendar size={22} />, path: role === 'Admin' ? '/admin-approvals' : '/sessions' },
    { name: role === 'Admin' ? 'Announcements' : (role === 'Alumni' ? 'Connected Students' : 'Resume'), icon: <FileText size={22} />, path: role === 'Admin' ? '/admin-posts' : (role === 'Alumni' ? '/connected-students' : `/${role.toLowerCase()}-resume`) },
    { name: 'Profile', icon: <User size={22} />, path: `/${role.toLowerCase()}-profile` },
  ];

  return (
    <div className={`flex min-h-screen transition-all duration-500 ${isDark ? 'bg-[#050505]' : 'bg-[#f8fafc]'}`}>
      
      {/* Sidebar with enhanced border contrast */}
      <aside className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 border-r ${
        isOpen ? 'w-72' : 'w-20'
      } ${isDark ? 'bg-[#000000] border-white/10' : 'bg-white border-slate-200 shadow-2xl'}`}>
        
        {/* Toggle Button & Logo */}
        <div className="flex items-center gap-4 p-5">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className={`flex items-center justify-center p-2 rounded-xl transition-all ${
              isDark ? 'bg-[#1a1a1a] text-slate-100 hover:bg-[#252525]' : 'bg-slate-100 text-slate-900 shadow-sm'
            }`}
          >
            {isOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
          </button>
          {isOpen && (
            <h1 className={`text-xl font-black tracking-tight whitespace-nowrap ${isDark ? 'text-indigo-400' : 'text-[#a78bfa]'}`}>
              AlumniConnect
            </h1>
          )}
        </div>

        {/* Profile Section - Brighter text for Dark Mode */}
        <div className={`flex flex-col items-center px-6 transition-all duration-300 overflow-hidden ${
          isOpen ? 'py-8 opacity-100 h-auto' : 'py-0 opacity-0 h-0 invisible'
        }`}>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#5c4dff] to-[#a78bfa] p-1 mb-4 shadow-lg shadow-indigo-500/20">
            <div className={`w-full h-full rounded-full border-4 overflow-hidden ${isDark ? 'border-[#000000]' : 'border-white'}`}>
              <img 
                src={profilePicture || `https://ui-avatars.com/api/?name=${userName}&background=5c4dff&color=fff&bold=true`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h3 className={`font-bold text-lg text-center ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{userName}</h3>
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{role}</p>
        </div>

        {/* Navigation - High contrast icons and text */}
        <nav className="mt-4 px-3 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all group font-bold text-sm ${
                  isActive 
                  ? 'bg-[#5c4dff] text-white shadow-lg' 
                  : isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-[#5c4dff]'
                }`}
              >
                <span className={isActive ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'}>
                  {item.icon}
                </span>
                {isOpen && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-0 w-full px-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 bg-[#b91c1c] hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-red-900/10"
          >
            <LogOut size={20} />
            {isOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-72' : 'ml-20'}`}>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;