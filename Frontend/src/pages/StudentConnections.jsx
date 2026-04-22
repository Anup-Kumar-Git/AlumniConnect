import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';
import { Briefcase, Award, Linkedin, Github, FileText, X, User, Calendar } from 'lucide-react';

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
        <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dataList && dataList.length > 0 ? (
            dataList.map((item) => {
              const alumni = item.alumni;
              if (!alumni) return null;

              return (
                <li key={item._id} className={`col-span-1 flex flex-col divide-y rounded-lg shadow-sm border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isDark ? 'bg-[#151a25] divide-white/5 border-white/5 hover:border-white/10' : 'bg-white divide-gray-200 border-gray-200 hover:border-indigo-200 hover:shadow-indigo-100'}`}>
                  <div className="flex w-full items-center justify-between space-x-6 p-6">
                    <div className="flex-1 truncate">
                      <div className="flex items-center space-x-3">
                        <h3 className={`truncate text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{alumni.name}</h3>
                        <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-500/20">
                          Alumni
                        </span>
                      </div>
                      <p className={`mt-1 truncate text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{alumni.domain || 'Mentor'}</p>
                      <div className="mt-3 flex items-center gap-3">
                        {alumni.linkedin && (
                          <a href={alumni.linkedin} target="_blank" rel="noreferrer" className={`transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}>
                            <span className="sr-only">LinkedIn</span>
                            <Linkedin size={18} />
                          </a>
                        )}
                        {alumni.github && (
                          <a href={alumni.github} target="_blank" rel="noreferrer" className={`transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}>
                            <span className="sr-only">GitHub</span>
                            <Github size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                    {alumni.profilePicture ? (
                      <img className={`h-20 w-20 flex-shrink-0 rounded-full object-cover shadow-md ${isDark ? 'bg-gray-800' : 'bg-gray-300'}`} src={alumni.profilePicture} alt={alumni.name} />
                    ) : (
                      <div className={`h-20 w-20 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-2xl text-white shadow-md ${isDark ? 'bg-indigo-600' : 'bg-indigo-500'}`}>
                        {alumni.name ? alumni.name[0] : 'A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className={`-mt-px flex divide-x ${isDark ? 'divide-white/5' : 'divide-gray-200'}`}>
                      <div className="flex w-0 flex-1">
                        <button
                          onClick={() => setSelectedAlumni(alumni)}
                          className={`group relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-bold transition-colors ${isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'}`}
                        >
                          <User size={18} className={`transition-colors ${isDark ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-indigo-600'}`} aria-hidden="true" />
                          Profile
                        </button>
                      </div>
                      <div className="-ml-px flex w-0 flex-1">
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
                          className={`group relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-bold transition-colors ${
                            requestedAlumni[alumni._id]
                              ? (isDark ? 'text-yellow-500 bg-yellow-500/5 cursor-not-allowed' : 'text-yellow-600 bg-yellow-50 cursor-not-allowed')
                              : (isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700')
                          }`}
                        >
                          <Calendar size={18} className={`transition-colors ${requestedAlumni[alumni._id] ? (isDark ? 'text-yellow-500/70' : 'text-yellow-600/70') : (isDark ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-indigo-600')}`} aria-hidden="true" />
                          {requestedAlumni[alumni._id] ? 'Requested' : 'Session'}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center">
              <p className={`italic text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No accepted connections found yet.
              </p>
            </div>
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