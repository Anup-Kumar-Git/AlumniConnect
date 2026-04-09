import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, FileText, User, LogOut, Menu, X, Search, Bell, ChevronDown, Settings, Sun, Moon, GraduationCap, UserCheck, MessageSquare, Clock } from 'lucide-react';
import { ThemeContext } from '../App';
import NotificationsDropdown from './NotificationsDropdown';

const DashboardLayout = ({ children, isDark, role, userName = "Abhishek Kumar" }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const { setIsDark } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const profilePicture = localStorage.getItem('profilePicture');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <Home size={20} />, path: `/${role.toLowerCase()}-dashboard` },
    { name: role === 'Alumni' ? "Pending Request" : 'Alumni List', icon: role === 'Alumni' ? <Users size={20} /> : <GraduationCap size={20} />, path: '/alumni-list' },
    ...(role === 'Student' ? [{ name: 'Connections', icon: <Users size={20} />, path: '/student-connections' }] : []),
    ...(role === 'Admin' ? [{ name: 'Student List', icon: <Users size={20} />, path: '/student-list' }] : []),
    { name: role === 'Admin' ? 'Pending Approvals' : 'Booked Sessions', icon: <Calendar size={20} />, path: role === 'Admin' ? '/admin-approvals' : '/sessions' },
    ...(role === 'Alumni' ? [{ name: 'Pending Sessions', icon: <Clock size={20} />, path: '/pending-sessions' }] : []),
    { name: role === 'Admin' ? 'Announcements' : (role === 'Alumni' ? 'Connections' : 'Resume'), icon: role === 'Admin' ? <FileText size={20} /> : (role === 'Alumni' ? <UserCheck size={20} /> : <FileText size={20} />), path: role === 'Admin' ? '/admin-posts' : (role === 'Alumni' ? '/connected-students' : `/${role.toLowerCase()}-resume`) },
    { name: 'My Posts', icon: <MessageSquare size={20} />, path: '/my-posts' },
    { name: 'Profile', icon: <User size={20} />, path: `/${role.toLowerCase()}-profile` },
  ];

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#0f1115] text-white' : 'bg-[#fcfcfd] text-slate-800'}`}>

      {/* Sidebar overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 border-r ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'
        } ${isDark ? 'bg-[#15181e] border-white/5' : 'bg-white border-slate-200'} `}>

        {/* Logo */}
        <div className={`h-16 flex items-center ${isSidebarOpen ? 'px-6' : 'justify-center px-0'} border-b border-transparent shrink-0`}>
          <div className={`flex items-center ${isSidebarOpen ? 'gap-2' : ''}`}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-700 dark:text-slate-300 md:cursor-pointer`}
              title="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>
            {isSidebarOpen && (
              <span className={`text-xl font-bold tracking-tight ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                AlumniConnect
              </span>
            )}
          </div>
          {isSidebarOpen && (
            <button className="md:hidden ml-auto p-1" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} className={isDark ? "text-slate-400" : "text-slate-500"} />
            </button>
          )}
        </div>

        {/* Navigation items */}
        <div className={`flex-1 overflow-y-auto py-6 space-y-1 ${isSidebarOpen ? 'px-4' : 'px-3'}`}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                title={!isSidebarOpen ? item.name : undefined}
                className={`flex items-center gap-3 py-2.5 rounded-lg transition-colors font-medium text-[15px] ${isSidebarOpen ? 'px-3' : 'justify-center px-0'
                  } ${isActive
                    ? (isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600')
                    : (isDark ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                  }`}
              >
                <span className={`${isActive ? '' : 'opacity-80'}`}>
                  {React.cloneElement(item.icon, { size: 20 })}
                </span>
                {isSidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Bottom Settings & Logout */}
        <div className={`border-t ${isDark ? 'border-white/5' : 'border-slate-100'} ${isSidebarOpen ? 'p-4' : 'p-3'}`}>
          <button
            title={!isSidebarOpen ? "Settings" : undefined}
            className={`w-full flex items-center gap-3 py-2.5 rounded-lg transition-colors font-medium text-[15px] mb-1 ${isSidebarOpen ? 'px-3' : 'justify-center px-0'
              } ${isDark ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Settings size={20} className="opacity-80 shrink-0" />
            {isSidebarOpen && <span>Settings</span>}
          </button>

          <button
            onClick={handleLogout}
            title={!isSidebarOpen ? "Logout" : undefined}
            className={`w-full flex items-center gap-3 py-2.5 rounded-lg transition-colors font-medium text-[15px] ${isSidebarOpen ? 'px-3' : 'justify-center px-0'
              } ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
          >
            <LogOut size={20} className="opacity-80 shrink-0" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20 ml-0'}`}>

        {/* Top Header */}
        <header className={`h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b transition-colors z-30 ${isDark ? 'bg-[#15181e] border-white/5' : 'bg-white border-slate-200'
          }`}>
          {/* Left side - Menu toggle and Search */}
          <div className="flex items-center flex-1 gap-4">
            {!isSidebarOpen && (
              <button
                className="p-2 -ml-2 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 transition-opacity md:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={20} className={isDark ? "text-slate-400" : "text-slate-600"} />
              </button>
            )}

          </div>

          {/* Right side - Notifications & Profile */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
              title="Toggle Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <NotificationsDropdown isDark={isDark} />

            {/* Divider */}
            <div className={`hidden sm:block w-px h-6 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>

            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img
                src={profilePicture || `https://ui-avatars.com/api/?name=${userName}&background=5c4dff&color=fff&bold=true`}
                alt="Profile"
                className={`w-8 h-8 rounded-full object-cover border ${isDark ? 'border-white/10' : 'border-slate-200'}`}
              />
              <span className={`hidden sm:block text-sm font-semibold tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                {userName.split(' ')[0]} {/* Show first name like "Tom" in design */}
              </span>
              <ChevronDown size={14} className={`hidden sm:block ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;