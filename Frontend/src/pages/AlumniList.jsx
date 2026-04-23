import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import API from '../services/api';
import axios from 'axios';
import { CheckCircle, XCircle, Eye, X, Briefcase, Award, Linkedin, Github, Book, FileText, Clock, Loader2, Phone, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

const isOnline = (lastActive) => {
  if (!lastActive) return false;
  return new Date() - new Date(lastActive) < 5 * 60 * 1000;
};

const AlumniList = ({ isDark, setIsDark }) => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  
  const role = localStorage.getItem('role') || 'Admin'; // Assuming Admin if not set for now
  const userName = localStorage.getItem('userName') || role;

  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (loading || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, isFetchingMore, hasMore]);

  const fetchData = async (pageNum) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setIsFetchingMore(true);

      if (role === 'Alumni') {
        const token = localStorage.getItem('token');
        if(!token) return;
        const res = await axios.get(`http://localhost:5000/api/requests/alumni?page=${pageNum}&limit=12`, {
          headers: { 'x-auth-token': token }
        });
        const newRequests = res.data.requests || [];
        setDataList(prev => pageNum === 1 ? newRequests : [...prev, ...newRequests]);
        setHasMore(res.data.hasMore);
      } else {
        // If Admin or other roles, use admin stats string.
        const res = await API.get(`/admin/stats?type=alumni&page=${pageNum}&limit=12`);
        const newAlumni = res.data.alumniList || [];
        setDataList(prev => pageNum === 1 ? newAlumni : [...prev, ...newAlumni]);
        setHasMore(res.data.hasMore);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [role, page]);

  const checkRequestStatus = async (alumniId) => {
    try {
      if (role !== 'Student') return;
      setRequestStatus('Loading...');
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/requests/status/${alumniId}`, {
        headers: { 'x-auth-token': token }
      });
      setRequestStatus(res.data.status); // 'None', 'Pending', 'Accepted', 'Rejected'
    } catch (err) {
      console.error("Failed to fetch request status", err);
      setRequestStatus('None');
    }
  };

  const handleSendRequest = async () => {
    try {
      setSendingRequest(true);
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/requests`, { alumniId: selectedAlumni._id }, {
        headers: { 'x-auth-token': token }
      });
      setRequestStatus('Pending');
      toast.success('Request sent successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || 'Failed to send request');
    } finally {
      setSendingRequest(false);
    }
  };

  const handleAction = async (requestId, status) => {
    try {
      setLoadingAction(requestId);
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/requests/${requestId}/status`, { status }, {
        headers: { 'x-auth-token': token }
      });
      setPage(1);
      fetchData(1); // Refresh list to reflect updated status
      toast.success("Request updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update request");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    toast((t) => (
      <div>
        <p className="font-bold mb-3">Are you sure you want to completely delete this user?</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-sm bg-slate-200 text-slate-800 rounded-lg font-bold hover:bg-slate-300 transition-colors">Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              const token = localStorage.getItem('token');
              await axios.delete(`http://localhost:5000/api/admin/${userId}`, {
                headers: { 'x-auth-token': token }
              });
              setPage(1);
              fetchData(1); // refresh list
              toast.success("User deleted successfully!");
            } catch (err) {
              console.error(err);
              toast.error(err.response?.data?.msg || "Failed to delete user");
            }
          }} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </div>
    ), { duration: Infinity });
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

  if (loading) {
    return (
      <DashboardLayout isDark={isDark} role={role} userName={userName}>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="animate-spin text-[#5c4dff] mb-4" size={48} />
          <p className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading Alumni Data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout isDark={isDark} role={role} userName={userName}>
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h2 className={`text-4xl font-black tracking-tight ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            {role === 'Alumni' ? "Pending Request" : "Active Alumni List"}
          </h2>
          <p className={`font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {role === 'Alumni' ? "View and manage mentorship requests from students." : "View verified alumni available for sessions."}
          </p>
        </div>
        
      </header>

      <div className="py-8">
        <ul role="list" className="mx-auto grid grid-cols-2 gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {dataList && dataList.length > 0 ? (
            dataList.map((item, index) => {
              const displayData = role === 'Alumni' ? item.student : item;
              if (!displayData) return null;
              const isLastElement = dataList.length === index + 1;

              return (
                <li ref={isLastElement ? lastElementRef : null} key={item._id} className={`p-6 rounded-[2rem] border transition-all ${isDark ? 'border-white/10 bg-[#0f0f12]/50 hover:bg-white/5' : 'border-slate-200 bg-white hover:shadow-xl'}`}>
                  <div className="relative inline-block mx-auto">
                    {displayData.profilePicture ? (
                      <img className="h-24 w-24 rounded-full object-cover" src={displayData.profilePicture} alt={displayData.name} />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-3xl">
                        {displayData.name ? displayData.name[0] : 'A'}
                      </div>
                    )}
                    {isOnline(displayData.lastActive) && (
                      <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white dark:border-[#0f0f12] rounded-full shadow-sm"></span>
                    )}
                  </div>
                  <h3 className={`mt-6 text-base font-semibold leading-7 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{displayData.name}</h3>
                  <p className="text-sm leading-6 text-slate-500">{displayData.domain || (role === 'Alumni' ? 'Student' : 'Mentor')}</p>

                  {role === 'Alumni' && (
                    <div className="mt-4 flex flex-col items-center gap-2">
                      <span className={`text-xs font-bold ${item.status === 'Pending' ? 'text-yellow-500' : item.status === 'Accepted' ? 'text-green-500' : 'text-red-500'}`}>
                        {item.status}
                      </span>
                      
                      {item.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleAction(item._id, 'Accepted')}
                            disabled={loadingAction === item._id}
                            className="bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white p-1.5 rounded-full transition-colors disabled:opacity-50"
                            title="Accept"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => handleAction(item._id, 'Rejected')}
                            disabled={loadingAction === item._id}
                            className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-1.5 rounded-full transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      )}

                      {item.student && item.student.resume && (
                        <button 
                          onClick={() => handleViewResume(item.student.resume)}
                          className={`mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                            isDark ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                          }`}
                        >
                          <Eye size={12} /> Resume
                        </button>
                      )}
                    </div>
                  )}

                  {role !== 'Alumni' && (
                    <div className="mt-4 flex gap-3 justify-center items-center">
                      <button 
                        onClick={() => {
                          setSelectedAlumni(displayData);
                          if (role === 'Student') checkRequestStatus(displayData._id);
                        }}
                        className={`text-xs font-bold hover:underline ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}
                      >
                        View Profile
                      </button>
                      {role === 'Admin' && (
                        <button 
                          onClick={() => handleDeleteUser(displayData._id)}
                          className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })
          ) : (
            <p className="text-slate-500 italic text-sm col-span-full text-center py-8">
              {role === 'Alumni' ? "No pending requests found." : "No verified alumni found."}
            </p>
          )}
        </ul>
        {isFetchingMore && (
          <div className="flex justify-center mt-8">
            <Loader2 className="animate-spin text-[#5c4dff]" size={32} />
          </div>
        )}
      </div>

      {/* Profile Modal Overlay */}
      {selectedAlumni && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedAlumni(null)}></div>
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl transition-all ${isDark ? 'bg-[#0f0f12] border border-white/10' : 'bg-white border border-slate-200'}`}>
            
            {/* Modal Header */}
            <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10 bg-[#0f0f12]/90' : 'border-slate-100 bg-white/90'} backdrop-blur-md`}>
              <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Alumni Profile
              </h3>
              <div className="flex items-center gap-4">
                {role === 'Student' && requestStatus && requestStatus !== 'Loading...' && (
                  <button 
                    onClick={handleSendRequest}
                    disabled={sendingRequest || requestStatus === 'Pending' || requestStatus === 'Accepted'}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      requestStatus === 'Accepted' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                      requestStatus === 'Pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                      'bg-[#5c4dff] text-white hover:bg-[#4839cc] hover:shadow-lg disabled:opacity-50'
                    }`}
                  >
                    {sendingRequest ? 'Sending...' : 
                     requestStatus === 'Accepted' ? '✓ Connected' : 
                     requestStatus === 'Pending' ? 'Request Pending' : 
                     'Send Request'}
                  </button>
                )}
                <button 
                  onClick={() => setSelectedAlumni(null)}
                  className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
                <div className="shrink-0">
                  {selectedAlumni.profilePicture ? (
                    <img src={selectedAlumni.profilePicture} alt={selectedAlumni.name} className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500/50 shadow-xl" />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-5xl font-black shadow-xl">
                      {selectedAlumni.name ? selectedAlumni.name[0] : 'A'}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedAlumni.name}</h4>
                  <p className={`text-lg font-semibold mb-3 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{selectedAlumni.email}</p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    {selectedAlumni.linkedin && (
                      <a href={selectedAlumni.linkedin} target="_blank" rel="noreferrer" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0077b5]/10 text-[#0077b5] hover:bg-[#0077b5] hover:text-white transition-all`}>
                        <Linkedin size={14} /> LinkedIn
                      </a>
                    )}
                    {selectedAlumni.github && (
                      <a href={selectedAlumni.github} target="_blank" rel="noreferrer" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isDark ? 'bg-white/10 text-white hover:bg-white hover:text-black' : 'bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white'}`}>
                        <Github size={14} /> GitHub
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ProfileDetailItem icon={<Briefcase />} label="Company" value={selectedAlumni.company} isDark={isDark} />
                <ProfileDetailItem icon={<FileText />} label="Domain" value={selectedAlumni.domain} isDark={isDark} />
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-white/5 mt-2">
                  <ProfileDetailItem icon={<Phone />} label="Contact No." value={selectedAlumni.contactNo} isDark={isDark} />
                  <ProfileDetailItem icon={<Calendar />} label="Academic Year" value={selectedAlumni.academicYear} isDark={isDark} />
                </div>
                <ProfileDetailItem icon={<Book />} label="Institute Name" value={selectedAlumni.instituteName} isDark={isDark} />
                <ProfileDetailItem icon={<Award />} label="Department" value={selectedAlumni.department} isDark={isDark} />
                <ProfileDetailItem icon={<FileText />} label="Degree/Program" value={selectedAlumni.degree} isDark={isDark} />
                <ProfileDetailItem icon={<Clock />} label="Session" value={selectedAlumni.session} isDark={isDark} />
                
                <ProfileDetailItem icon={<Award />} label="Expertise" value={selectedAlumni.expertise} isDark={isDark} />
                <ProfileDetailItem icon={<Clock />} label="Experience" value={selectedAlumni.experience ? `${selectedAlumni.experience} Years` : null} isDark={isDark} />
                
                <div className="sm:col-span-2">
                  <ProfileDetailItem icon={<Book />} label="Interested Subjects" value={selectedAlumni.interestedSubject} isDark={isDark} />
                </div>
                {selectedAlumni.otherDetails && (
                  <div className="sm:col-span-2 mt-4">
                    <h5 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>About / Other Details</h5>
                    <div className={`p-6 rounded-2xl text-sm leading-relaxed border ${isDark ? 'bg-white/5 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>
                      {selectedAlumni.otherDetails}
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

export default AlumniList;
