import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, Check, UserCheck, AlertCircle, Heart, MessageSquare } from 'lucide-react';

const NotificationsDropdown = ({ isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { 'x-auth-token': token }
      });
      const fetched = res.data.notifications || [];
      setNotifications(fetched);
      setUnreadCount(fetched.filter(n => !n.read).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Check periodically for new notifications (e.g. every 30 seconds)
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id = null) => {
    try {
      const token = localStorage.getItem('token');
      const payload = id ? { notificationIds: [id] } : {};
      await axios.put('http://localhost:5000/api/notifications/read', payload, {
        headers: { 'x-auth-token': token }
      });
      // Optionally update local state instantly instead of re-fetching
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'CONNECTION_REQUEST':
      case 'SESSION_REQUEST':
        return <AlertCircle size={16} className="text-yellow-500" />;
      case 'CONNECTION_ACCEPTED':
      case 'SESSION_ACCEPTED':
        return <Check size={16} className="text-green-500" />;
      case 'POST_LIKED':
        return <Heart size={16} className="text-pink-500" />;
      case 'POST_COMMENTED':
        return <MessageSquare size={16} className="text-blue-500" />;
      default:
        return <UserCheck size={16} className="text-indigo-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-white dark:border-[#15181e]"></span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl z-50 overflow-hidden border ${isDark ? 'bg-[#15181e] border-white/10' : 'bg-white border-slate-200'}`}>
          <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
            <h3 className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleMarkAsRead(); }}
                className={`text-xs font-bold hover:underline ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <ul className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                {notifications.map((notif) => (
                  <li 
                    key={notif._id} 
                    onClick={() => {
                      if (!notif.read) handleMarkAsRead(notif._id);
                    }}
                    className={`flex gap-3 p-4 transition-colors cursor-pointer ${
                      !notif.read 
                        ? (isDark ? 'bg-indigo-500/5 hover:bg-white/5' : 'bg-indigo-50/50 hover:bg-slate-50') 
                        : (isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50')
                    }`}
                  >
                    <div className="shrink-0 mt-1">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.read ? 'font-semibold' : 'font-medium'} ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {notif.message}
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        {notif.sender && (
                          <span className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            From: {notif.sender.name}
                          </span>
                        )}
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center">
                <Bell size={24} className={`mx-auto mb-2 opacity-20 ${isDark ? 'text-white' : 'text-slate-900'}`} />
                <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
