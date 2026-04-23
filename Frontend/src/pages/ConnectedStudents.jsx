import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';
import { Eye, Briefcase, Award, Linkedin, Github, FileText, Clock, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const isOnline = (lastActive) => {
  if (!lastActive) return false;
  return new Date() - new Date(lastActive) < 5 * 60 * 1000;
};

const ConnectedStudents = ({ isDark, setIsDark }) => {
  const [dataList, setDataList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const role = localStorage.getItem('role') || 'Alumni'; // Since it's an Alumni page
  const userName = localStorage.getItem('userName') || role;

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/requests/alumni', {
        headers: { 'x-auth-token': token }
      });
      // Filter only accepted requests
      const acceptedRequests = res.data.requests?.filter(req => req.status === 'Accepted') || [];
      setDataList(acceptedRequests);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
            Connected Students
          </h2>
          <p className={`font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            View the list of students whose mentorship requests you have accepted.
          </p>
        </div>
        
      </header>

      <div className="py-8">
        <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
          {dataList && dataList.length > 0 ? (
            dataList.map((item) => {
              const student = item.student;
              if (!student) return null;

              return (
                <li key={item._id} className={`flex flex-col p-6 rounded-[2rem] border transition-all ${isDark ? 'border-white/10 bg-[#0f0f12]/50 hover:bg-white/5' : 'border-slate-200 bg-white hover:shadow-xl'}`}>
                  {/* Top: Large Image */}
                  <div className="relative inline-block mx-auto mb-5">
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

                  {/* Info */}
                  <h3 className={`text-xl font-bold tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{student.name}</h3>
                  <p className="text-[15px] font-medium text-slate-500 mt-1 mb-4">{student.domain || 'Student'}</p>

                  {/* Social Icons */}
                  <div className="flex items-center gap-4 mb-6">
                    {student.github && (
                      <a href={student.github} target="_blank" rel="noreferrer" className={`transition-colors ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}>
                        <span className="sr-only">GitHub</span>
                        <Github size={20} className="opacity-80" strokeWidth={2.5} />
                      </a>
                    )}
                    {student.linkedin && (
                      <a href={student.linkedin} target="_blank" rel="noreferrer" className={`transition-colors ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}>
                        <span className="sr-only">LinkedIn</span>
                        <Linkedin size={20} className="opacity-80" strokeWidth={2.5} />
                      </a>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto flex flex-row gap-2">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className={`flex-1 px-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 border ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/10 hover:text-white' : 'border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold'}`}
                    >
                      View Profile
                    </button>
                    {student.resume && (
                      <button
                        onClick={() => handleViewResume(student.resume)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 bg-[#5c4dff] text-white hover:bg-[#4b3ce5]`}
                      >
                        <Eye size={16} /> View Resume
                      </button>
                    )}
                  </div>
                </li>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center">
              <p className="text-slate-500 italic text-sm">
                No connected students found.
              </p>
            </div>
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
                <ProfileDetailItem icon={<Briefcase />} label="Company/School" value={selectedStudent.company} isDark={isDark} />
                <ProfileDetailItem icon={<FileText />} label="Domain" value={selectedStudent.domain} isDark={isDark} />
                <ProfileDetailItem icon={<Award />} label="Skills/Expertise" value={selectedStudent.expertise} isDark={isDark} />
                <ProfileDetailItem icon={<Clock />} label="Experience" value={selectedStudent.experience ? `${selectedStudent.experience} Years` : null} isDark={isDark} />
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

export default ConnectedStudents;
