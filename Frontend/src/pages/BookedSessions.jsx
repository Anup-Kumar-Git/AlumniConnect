import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';
import { Calendar, Clock, Video, Eye, X, Book, FileText, Linkedin, Github } from 'lucide-react';
import { toast } from 'react-hot-toast';

const isOnline = (lastActive) => {
  if (!lastActive) return false;
  return new Date() - new Date(lastActive) < 5 * 60 * 1000;
};

const BookedSessions = ({ isDark, setIsDark }) => {
  const [dataList, setDataList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const role = localStorage.getItem('role') || 'Student'; 
  const userName = localStorage.getItem('userName') || role;

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const endpoint = role === 'Alumni' 
        ? 'http://localhost:5000/api/session-requests/alumni/booked'
        : 'http://localhost:5000/api/session-requests/student/booked';

      const res = await axios.get(endpoint, {
        headers: { 'x-auth-token': token }
      });
      setDataList(res.data.requests || []);
    } catch (err) {
      console.error("Failed to fetch booked sessions", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  const handleViewResume = (resumeData) => {
    if (!resumeData) return;
    if (!resumeData.startsWith('data:')) {
      window.open(resumeData, '_blank');
      return;
    }
    try {
      const byteString = atob(resumeData.split(',')[1]);
      const mimeString = resumeData.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], {type: mimeString});
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Failed to create object URL for resume', err);
      toast.error('Unable to load resume');
    }
  };

  return (
    <DashboardLayout isDark={isDark} role={role} userName={userName}>
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h2 className={`text-4xl font-black tracking-tight ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            Booked Sessions
          </h2>
          <p className={`font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            View your scheduled upcoming mentorship sessions.
          </p>
        </div>
      </header>

      <div className="py-8">
        <ul role="list" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {dataList && dataList.length > 0 ? (
            dataList.map((item) => {
              const displayData = role === 'Alumni' ? item.student : item.alumni;
              if (!displayData) return null;

              return (
                <li key={item._id} className={`p-6 rounded-[2rem] border transition-all ${isDark ? 'border-white/10 bg-[#0f0f12]/50 hover:bg-white/5' : 'border-slate-200 bg-white hover:shadow-xl'}`}>
                  <div className="flex items-center gap-4 mb-6 cursor-pointer" onClick={() => setSelectedUser(displayData)}>
                    <div className="relative inline-block">
                      {displayData.profilePicture ? (
                        <img className="h-16 w-16 rounded-full object-cover shadow-md" src={displayData.profilePicture} alt={displayData.name} />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-2xl shadow-inner">
                          {displayData.name ? displayData.name[0] : 'U'}
                        </div>
                      )}
                      {isOnline(displayData.lastActive) && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#0f0f12] rounded-full shadow-sm"></span>
                      )}
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold tracking-tight hover:underline ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        {displayData.name}
                      </h3>
                      <p className="text-sm font-semibold text-slate-500">{displayData.domain || (role === 'Alumni' ? 'Student' : 'Alumni')}</p>
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'} flex flex-col gap-3`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                        <Calendar size={18} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Date</p>
                        <p className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.date || 'Not specified'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>
                        <Clock size={18} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Time</p>
                        <p className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.time || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3">
                    {item.meetLink && (
                      <a 
                        href={item.meetLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-[#5c4dff] hover:bg-[#4b3ce5] text-white transition-all shadow-lg shadow-indigo-500/20"
                      >
                        <Video size={18} /> Join Meeting
                      </a>
                    )}

                    {displayData.resume && role === 'Alumni' && (
                      <button 
                        onClick={() => handleViewResume(displayData.resume)}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                      >
                        <Eye size={18} /> View Resume
                      </button>
                    )}
                  </div>
                </li>
              );
            })
          ) : (
            <div className="md:col-span-2 xl:col-span-3 py-16 flex flex-col items-center justify-center text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-white/5 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
                <Calendar size={32} />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>No Booked Sessions</h3>
              <p className="text-slate-500 text-sm max-w-sm">
                You don't have any upcoming mentorship sessions scheduled at the moment.
              </p>
            </div>
          )}
        </ul>
      </div>

      {/* Profile Modal Overlay */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)}></div>
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl transition-all ${isDark ? 'bg-[#0f0f12] border border-white/10' : 'bg-white border border-slate-200'}`}>
            
            <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10 bg-[#0f0f12]/90' : 'border-slate-100 bg-white/90'} backdrop-blur-md`}>
              <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {role === 'Alumni' ? 'Student Profile' : 'Alumni Profile'}
              </h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
                <div className="shrink-0">
                  {selectedUser.profilePicture ? (
                    <img src={selectedUser.profilePicture} alt={selectedUser.name} className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500/50 shadow-xl" />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-5xl font-black shadow-xl">
                      {selectedUser.name ? selectedUser.name[0] : 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedUser.name}</h4>
                  <p className={`text-lg font-semibold mb-3 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{selectedUser.email}</p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    {selectedUser.linkedin && (
                      <a href={selectedUser.linkedin} target="_blank" rel="noreferrer" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0077b5]/10 text-[#0077b5] hover:bg-[#0077b5] hover:text-white transition-all`}>
                        <Linkedin size={14} /> LinkedIn
                      </a>
                    )}
                    {selectedUser.github && (
                      <a href={selectedUser.github} target="_blank" rel="noreferrer" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isDark ? 'bg-white/10 text-white hover:bg-white hover:text-black' : 'bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white'}`}>
                        <Github size={14} /> GitHub
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ProfileDetailItem icon={<FileText />} label={role === 'Alumni' ? "Domain / Course" : "Domain"} value={selectedUser.domain} isDark={isDark} />
                {role === 'Alumni' ? (
                  <ProfileDetailItem icon={<Book />} label="Interested Subjects" value={selectedUser.interestedSubject} isDark={isDark} />
                ) : (
                  <>
                    <ProfileDetailItem icon={<FileText />} label="Company" value={selectedUser.company} isDark={isDark} />
                    <ProfileDetailItem icon={<Book />} label="Expertise" value={selectedUser.expertise} isDark={isDark} />
                  </>
                )}
                
                {selectedUser.otherDetails && (
                  <div className="sm:col-span-2 mt-4">
                    <h5 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>About</h5>
                    <div className={`p-6 rounded-2xl text-sm leading-relaxed border ${isDark ? 'bg-white/5 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>
                      {selectedUser.otherDetails}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

const ProfileDetailItem = ({ icon, label, value, isDark }) => {
  if (!value) return null;
  return (
    <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
          {React.cloneElement(icon, { size: 18 })}
        </div>
        <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</span>
      </div>
      <p className={`font-semibold pl-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{value}</p>
    </div>
  );
};

export default BookedSessions;
