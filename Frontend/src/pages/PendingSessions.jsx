import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';
import { CheckCircle, XCircle, Eye, X, Book, FileText, Linkedin, Github } from 'lucide-react';
import { toast } from 'react-hot-toast';

const isOnline = (lastActive) => {
  if (!lastActive) return false;
  return new Date() - new Date(lastActive) < 5 * 60 * 1000;
};

const PendingSessions = ({ isDark, setIsDark }) => {
  const [dataList, setDataList] = useState([]);
  const [loadingAction, setLoadingAction] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [acceptingRequest, setAcceptingRequest] = useState(null);
  const [bookingData, setBookingData] = useState({ date: '', time: '', meetLink: '' });
  
  const role = localStorage.getItem('role') || 'Alumni'; 
  const userName = localStorage.getItem('userName') || role;

  const fetchData = async () => {
    try {
      if (role === 'Alumni') {
        const token = localStorage.getItem('token');
        if(!token) return;
        const res = await axios.get('http://localhost:5000/api/session-requests/alumni/pending', {
          headers: { 'x-auth-token': token }
        });
        const allRequests = res.data.requests || [];
        setDataList(allRequests.filter(req => req.status === 'Pending'));
      }
    } catch (err) {
      console.error("Failed to fetch session requests", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  const handleAction = async (requestId, status) => {
    try {
      setLoadingAction(requestId);
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/session-requests/${requestId}/status`, { status }, {
        headers: { 'x-auth-token': token }
      });
      fetchData(); // Refresh list to reflect updated status
      toast.success("Request rejected!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update session request");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAcceptSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoadingAction(acceptingRequest._id);
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/session-requests/${acceptingRequest._id}/status`, { 
        status: 'Accepted', 
        ...bookingData 
      }, {
        headers: { 'x-auth-token': token }
      });
      fetchData();
      setAcceptingRequest(null);
      setBookingData({ date: '', time: '', meetLink: '' });
      toast.success("Request accepted! A Google Meet link has been generated.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to accept session request");
    } finally {
      setLoadingAction(null);
    }
  };

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
            Pending Sessions
          </h2>
          <p className={`font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            View and manage specific session requests from your connected students.
          </p>
        </div>
      </header>

      <div className="py-8">
        <ul role="list" className="mx-auto grid grid-cols-2 gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {dataList && dataList.length > 0 ? (
            dataList.map((item) => {
              const displayData = item.student;
              if (!displayData) return null;

              return (
                <li key={item._id} className={`p-6 rounded-[2rem] border transition-all ${isDark ? 'border-white/10 bg-[#0f0f12]/50 hover:bg-white/5' : 'border-slate-200 bg-white hover:shadow-xl'}`}>
                  <div className="relative inline-block mx-auto">
                    {displayData.profilePicture ? (
                      <img className="h-24 w-24 rounded-full object-cover" src={displayData.profilePicture} alt={displayData.name} />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-3xl">
                        {displayData.name ? displayData.name[0] : 'S'}
                      </div>
                    )}
                    {isOnline(displayData.lastActive) && (
                      <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white dark:border-[#0f0f12] rounded-full shadow-sm"></span>
                    )}
                  </div>
                  <h3 className={`mt-6 text-base font-semibold leading-7 tracking-tight hover:underline cursor-pointer ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`} onClick={() => setSelectedStudent(displayData)}>{displayData.name}</h3>
                  <p className="text-sm leading-6 text-slate-500">{displayData.domain || 'Student'}</p>

                  <div className="mt-4 flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-yellow-500">
                      {item.status}
                    </span>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setAcceptingRequest(item)}
                        disabled={loadingAction === item._id}
                        className="bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white p-1.5 rounded-full transition-colors disabled:opacity-50"
                        title="Accept Session"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => handleAction(item._id, 'Rejected')}
                        disabled={loadingAction === item._id}
                        className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-1.5 rounded-full transition-colors disabled:opacity-50"
                        title="Reject Session"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>

                    {displayData.resume && (
                      <button 
                        onClick={() => handleViewResume(displayData.resume)}
                        className={`mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                          isDark ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                        }`}
                      >
                        <Eye size={12} /> Resume
                      </button>
                    )}
                  </div>
                </li>
              );
            })
          ) : (
            <p className="text-slate-500 italic text-sm col-span-full text-center py-8">
              No pending session requests found.
            </p>
          )}
        </ul>
      </div>

      {/* Profile Modal Overlay */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedStudent(null)}></div>
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl transition-all ${isDark ? 'bg-[#0f0f12] border border-white/10' : 'bg-white border border-slate-200'}`}>
            
            {/* Modal Header */}
            <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10 bg-[#0f0f12]/90' : 'border-slate-100 bg-white/90'} backdrop-blur-md`}>
              <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Student Profile
              </h3>
              <button 
                onClick={() => setSelectedStudent(null)}
                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
                <div className="shrink-0">
                  {selectedStudent.profilePicture ? (
                    <img src={selectedStudent.profilePicture} alt={selectedStudent.name} className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500/50 shadow-xl" />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-5xl font-black shadow-xl">
                      {selectedStudent.name ? selectedStudent.name[0] : 'S'}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedStudent.name}</h4>
                  <p className={`text-lg font-semibold mb-3 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{selectedStudent.email}</p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    {selectedStudent.linkedin && (
                      <a href={selectedStudent.linkedin} target="_blank" rel="noreferrer" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0077b5]/10 text-[#0077b5] hover:bg-[#0077b5] hover:text-white transition-all`}>
                        <Linkedin size={14} /> LinkedIn
                      </a>
                    )}
                    {selectedStudent.github && (
                      <a href={selectedStudent.github} target="_blank" rel="noreferrer" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isDark ? 'bg-white/10 text-white hover:bg-white hover:text-black' : 'bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white'}`}>
                        <Github size={14} /> GitHub
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ProfileDetailItem icon={<FileText />} label="Domain / Course" value={selectedStudent.domain} isDark={isDark} />
                <ProfileDetailItem icon={<Book />} label="Interested Subjects" value={selectedStudent.interestedSubject} isDark={isDark} />
                {selectedStudent.otherDetails && (
                  <div className="sm:col-span-2 mt-4">
                    <h5 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>About</h5>
                    <div className={`p-6 rounded-2xl text-sm leading-relaxed border ${isDark ? 'bg-white/5 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>
                      {selectedStudent.otherDetails}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal Overlay */}
      {acceptingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAcceptingRequest(null)}></div>
          <div className={`relative w-full max-w-md rounded-3xl shadow-2xl transition-all ${isDark ? 'bg-[#0f0f12] border border-white/10' : 'bg-white border border-slate-200'}`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
              <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Schedule Session
              </h3>
              <button 
                onClick={() => setAcceptingRequest(null)}
                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAcceptSubmit} className="p-6 flex flex-col gap-5">
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Date</label>
                <input 
                  type="date" 
                  required
                  value={bookingData.date}
                  onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#5c4dff] transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Time</label>
                <input 
                  type="time" 
                  required
                  value={bookingData.time}
                  onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#5c4dff] transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Meeting Link (Zoom/Meet)</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://zoom.us/j/..."
                  value={bookingData.meetLink}
                  onChange={(e) => setBookingData({...bookingData, meetLink: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#5c4dff] transition-all ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setAcceptingRequest(null)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loadingAction === acceptingRequest._id}
                  className="flex-1 py-3 rounded-xl font-bold bg-[#5c4dff] hover:bg-[#4b3ce5] text-white transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-70 flex items-center justify-center"
                >
                  {loadingAction === acceptingRequest._id ? 'Scheduling...' : 'Confirm'}
                </button>
              </div>
            </form>
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

export default PendingSessions;
