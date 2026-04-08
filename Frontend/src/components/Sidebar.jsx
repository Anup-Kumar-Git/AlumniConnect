import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Users, Calendar, FileText, User, LogOut, GraduationCap, MessageSquare, Clock
} from 'lucide-react';

const Sidebar = ({ isDark, role, userName = "Student Name" }) => {
  const profilePicture = localStorage.getItem('profilePicture');
  
  // Navigation links based on the role
  const menuItems = [
    { name: 'Home', icon: <Home size={22} />, path: `/${role.toLowerCase()}-dashboard` },
    { name: role === 'Alumni' ? "Student's Request" : 'Alumni List', icon: role === 'Alumni' ? <Users size={22} /> : <GraduationCap size={22} />, path: '/alumni-list' },
    ...(role === 'Student' ? [{ name: 'Connections', icon: <Users size={22} />, path: '/student-connections' }] : []),
    { name: role === 'Admin' ? 'Pending Approvals' : 'Booked Sessions', icon: <Calendar size={22} />, path: role === 'Admin' ? '/admin-approvals' : '/sessions' },
    ...(role === 'Alumni' ? [{ name: 'Pending Sessions', icon: <Clock size={22} />, path: '/pending-sessions' }] : []),
    { name: role === 'Admin' ? 'Announcements' : 'Resume', icon: <FileText size={22} />, path: role === 'Admin' ? '/admin-posts' : `/${role.toLowerCase()}-resume` },
    { name: 'My Posts', icon: <MessageSquare size={22} />, path: '/my-posts' },
    { name: 'Profile', icon: <User size={22} />, path: `/${role.toLowerCase()}-profile` },
  ];

  return (
    <div className={`h-screen w-72 flex flex-col transition-all duration-500 border-r ${
      isDark ? 'bg-[#0f0f12] border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
    }`}>
      
      {/* 1. AlumniConnect Branding */}
      <div className="p-8">
        <h1 className="text-2xl font-black text-[#5c4dff] tracking-tight">
          AlumniConnect
        </h1>
      </div>

      {/* 2. Profile Section (Over Home) */}
      <div className="px-8 pb-10 flex flex-col items-center">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#5c4dff] to-purple-500 p-1 mb-4">
            <div className={`w-full h-full rounded-full border-4 overflow-hidden ${isDark ? 'border-[#0f0f12]' : 'border-white'}`}>
              <img 
                src={profilePicture || `https://ui-avatars.com/api/?name=${userName}&background=5c4dff&color=fff`} 
                alt="User Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        <h2 className="font-black text-lg text-center leading-tight">{userName}</h2>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{role}</p>
      </div>

      {/* 3. Navigation Links */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all group
              ${isActive 
                ? 'bg-[#5c4dff] text-white shadow-lg shadow-indigo-500/20' 
                : isDark ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-50 text-slate-600 hover:text-[#5c4dff]'
              }
            `}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* 4. Logout Button */}
      <div className="p-6">
        <button className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-red-500/20">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;