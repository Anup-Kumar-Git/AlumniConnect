import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';
import { Briefcase, Award, Linkedin, Github, FileText, X } from 'lucide-react';

const StudentConnections = ({ isDark, setIsDark }) => {
  const [dataList, setDataList] = useState([]);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [requestedAlumni, setRequestedAlumni] = useState({});

  const role = localStorage.getItem('role') || 'Student';
  const userName = localStorage.getItem('userName') || role;

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/requests/student/connections', {
        headers: { 'x-auth-token': token }
      });
      // Requests populated with alumni
      setDataList(res.data.connections || []);

      // Fetch the student's existing session requests
      const sessionRes = await axios.get('http://localhost:5000/api/session-requests/student', {
        headers: { 'x-auth-token': token }
      });
      const sessions = sessionRes.data.requests || [];
      const initRequested = {};
      sessions.forEach(req => {
        // req.alumni is the Alumni's ID
        initRequested[req.alumni] = true;
      });
      setRequestedAlumni(initRequested);

    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DashboardLayout isDark={isDark} role={role} userName={userName}>
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h2 className={`text-4xl font-black tracking-tight ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            Connections
          </h2>
          <p className={`font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            View the Alumni who have accepted your mentorship requests.
          </p>
        </div>

      </header>

      <div className="py-4">
        <ul role="list" className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
          {dataList && dataList.length > 0 ? (
            dataList.map((item) => {
              const alumni = item.alumni;
              if (!alumni) return null;

              return (
                <li key={item._id} className="py-10 flex flex-col sm:flex-row gap-8 items-start">
                  {/* Left: Avatar */}
                  <div className="shrink-0">
                    {alumni.profilePicture ? (
                      <img className="h-40 w-40 sm:h-48 sm:w-48 rounded-2xl object-cover shadow-lg" src={alumni.profilePicture} alt={alumni.name} />
                    ) : (
                      <div className="h-40 w-40 sm:h-48 sm:w-48 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-6xl shadow-inner">
                        {alumni.name ? alumni.name[0] : 'A'}
                      </div>
                    )}
                  </div>

                  {/* Right: Info */}
                  <div className="flex-1 flex flex-col justify-center pt-2">
                    <h3 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{alumni.name}</h3>
                    <p className="text-sm font-semibold text-slate-500 mt-1">{alumni.domain || 'Mentor'}</p>

                    <p className={`mt-4 text-base leading-relaxed max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {alumni.otherDetails || "This member has not provided a detailed biography. However, they possess valuable experience and are ready to mentor students in their specific domain."}
                    </p>

                    <div className="mt-6 flex flex-col gap-4">
                      <div className="flex items-center gap-x-5">
                        {alumni.github && (
                          <a href={alumni.github} target="_blank" rel="noreferrer" className={`transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                            <span className="sr-only">GitHub</span>
                            <Github size={20} />
                          </a>
                        )}
                        {alumni.linkedin && (
                          <a href={alumni.linkedin} target="_blank" rel="noreferrer" className={`transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                            <span className="sr-only">LinkedIn</span>
                            <Linkedin size={20} />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedAlumni(alumni)}
                          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 hover:-translate-y-1 border ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/10 hover:shadow-white/5 hover:text-white hover:border-white/30 hover:shadow-lg' : 'border-slate-200 text-slate-700 hover:bg-white hover:shadow-slate-200/50 hover:shadow-lg hover:border-slate-400 font-semibold'
                            }`}
                        >
                          View Profile
                        </button>
                        <button
                          onClick={async () => {
                            if (requestedAlumni[alumni._id]) return;
                            try {
                              const token = localStorage.getItem('token');
                              const res = await axios.post('http://localhost:5000/api/session-requests', { alumniId: alumni._id }, {
                                headers: { 'x-auth-token': token }
                              });
                              alert(res.data.msg);
                              setRequestedAlumni(prev => ({ ...prev, [alumni._id]: true }));
                            } catch (err) {
                              if (err.response?.data?.msg === 'You already requested a session with this Alumni') {
                                setRequestedAlumni(prev => ({ ...prev, [alumni._id]: true }));
                              }
                              alert(err.response?.data?.msg || 'Failed to request session');
                            }
                          }}
                          disabled={requestedAlumni[alumni._id]}
                          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                            requestedAlumni[alumni._id] 
                            ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 cursor-not-allowed border border-yellow-500/20' 
                            : 'hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/30 bg-[#5c4dff] text-white hover:bg-[#4b3ce5]'
                          }`}
                        >
                          {requestedAlumni[alumni._id] ? 'Requested' : 'Request Session'}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="py-12">
              <p className="text-slate-500 italic text-sm text-center">
                No accepted connections found yet.
              </p>
            </li>
          )}
        </ul>
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
              <button
                onClick={() => setSelectedAlumni(null)}
                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
              >
                <X size={24} />
              </button>
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
                <ProfileDetailItem icon={<Award />} label="Skills/Expertise" value={selectedAlumni.expertise} isDark={isDark} />
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

export default StudentConnections;
