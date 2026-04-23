import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import API from '../services/api';
import axios from 'axios';
import { Eye, Briefcase, Award, Linkedin, Github, FileText, Clock, X, Book, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const isOnline = (lastActive) => {
  if (!lastActive) return false;
  return new Date() - new Date(lastActive) < 5 * 60 * 1000;
};

const StudentList = ({ isDark, setIsDark }) => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deletionTarget, setDeletionTarget] = useState(null);
  const [deletionReason, setDeletionReason] = useState("");
  const [isSending, setIsSending] = useState(false);
  const role = localStorage.getItem('role') || 'Admin';
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

      const res = await API.get(`/admin/stats?type=students&page=${pageNum}&limit=12`);
      
      setDataList(prev => pageNum === 1 ? (res.data.studentList || []) : [...prev, ...(res.data.studentList || [])]);
      setHasMore(res.data.hasMore);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const executeDeletionAndMail = async () => {
    if (!deletionTarget) return;
    setIsSending(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/${deletionTarget._id}`, {
        headers: { 'x-auth-token': token },
        data: { reason: deletionReason }
      });
      
      setDeletionTarget(null);
      setDeletionReason("");
      // Reset list to page 1 and fetch again
      setPage(1);
      fetchData(1); // refresh list
      toast.success("Deletion email sent and user removed!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Failed to delete user");
    } finally {
      setIsSending(false);
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

  if (role !== 'Admin') {
    return <DashboardLayout isDark={isDark} role={role} userName={userName}><div className="p-8 text-red-500 font-bold text-xl">Access Denied</div></DashboardLayout>;
  }

  if (loading) {
    return (
      <DashboardLayout isDark={isDark} role={role} userName={userName}>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="animate-spin text-[#5c4dff] mb-4" size={48} />
          <p className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading Student Data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout isDark={isDark} role={role} userName={userName}>
      <header className="mb-10">
        <h2 className={`text-4xl font-black tracking-tight ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
          Active Student List
        </h2>
        <p className={`font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          View all registered students and manage their profiles on the platform.
        </p>
      </header>

      <div className="py-8">
        <ul role="list" className="mx-auto grid grid-cols-2 gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {dataList && dataList.length > 0 ? (
            dataList.map((student, index) => {
              const isLastElement = dataList.length === index + 1;
              return (
                <li ref={isLastElement ? lastElementRef : null} key={student._id} className={`flex flex-col p-6 rounded-[2rem] border transition-all ${isDark ? 'border-white/10 bg-[#0f0f12]/50 hover:bg-white/5' : 'border-slate-200 bg-white hover:shadow-xl'}`}>
                  <div className="relative inline-block mx-auto">
                    {student.profilePicture ? (
                      <img className="h-24 w-24 rounded-full object-cover" src={student.profilePicture} alt={student.name} />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-3xl">
                        {student.name ? student.name[0] : 'S'}
                      </div>
                    )}
                    {isOnline(student.lastActive) && (
                      <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white dark:border-[#0f0f12] rounded-full shadow-sm"></span>
                    )}
                  </div>
                  
                  <h3 className={`mt-6 text-base font-semibold leading-7 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{student.name}</h3>
                  <p className="text-sm leading-6 text-slate-500">{student.academicYear ? `Year: ${student.academicYear}` : 'Student'}</p>

                  <div className={`mt-2 text-xs truncate mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`} title={student.email}>
                    {student.email}
                  </div>

                  <div className="mt-4 flex flex-col items-center justify-center gap-2">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className={`text-xs font-bold hover:underline ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => setDeletionTarget(student)}
                      className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center">
              <p className="text-slate-500 italic text-sm">
                No students found.
              </p>
            </div>
          )}
        </ul>
        {isFetchingMore && (
          <div className="flex justify-center mt-8">
            <Loader2 className="animate-spin text-[#5c4dff]" size={32} />
          </div>
        )}
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
                    {selectedStudent.resume && (
                      <button 
                        onClick={() => handleViewResume(selectedStudent.resume)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isDark ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                        }`}
                      >
                        <Eye size={14} /> View Resume
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ProfileDetailItem icon={<Briefcase />} label="Company/College" value={selectedStudent.company} isDark={isDark} />
                <ProfileDetailItem icon={<FileText />} label="Domain" value={selectedStudent.domain} isDark={isDark} />
                <ProfileDetailItem icon={<Award />} label="Mastery/Skills" value={selectedStudent.expertise} isDark={isDark} />
                <ProfileDetailItem icon={<Book />} label="Academic Year" value={selectedStudent.academicYear ? `Year ${selectedStudent.academicYear}` : null} isDark={isDark} />
                
                {selectedStudent.interestedSubject && (
                  <div className="sm:col-span-2">
                    <ProfileDetailItem icon={<Book />} label="Interested Subjects" value={selectedStudent.interestedSubject} isDark={isDark} />
                  </div>
                )}
                
                {selectedStudent.otherDetails && (
                  <div className="sm:col-span-2 mt-4">
                    <h5 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>About / Other Details</h5>
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
      {/* Deletion Email Modal Overlay */}
      {deletionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeletionTarget(null)}></div>
          <div className={`relative w-full max-w-lg p-8 rounded-3xl shadow-2xl transition-all ${isDark ? 'bg-[#0f0f12] border border-red-500/30' : 'bg-white border border-red-200'}`}>
            <h3 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Delete Student</h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Please provide a reason to email the student before permanently deleting their account.</p>

            <div className="mb-4">
              <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>To:</label>
              <input type="text" readOnly value={deletionTarget.email} className={`w-full p-3 rounded-xl border opacity-70 cursor-not-allowed ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
            </div>

            <div className="mb-6">
              <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Reason for Deletion:</label>
              <textarea 
                rows="4"
                className={`w-full p-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-600' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'}`}
                placeholder="Type the violation or reason..."
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setDeletionTarget(null)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                Cancel
              </button>
              <button 
                onClick={executeDeletionAndMail}
                disabled={isSending}
                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Sending...
                  </>
                ) : (
                  "Send Email & Delete"
                )}
              </button>
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

export default StudentList;
