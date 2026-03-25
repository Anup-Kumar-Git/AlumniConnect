import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Upload, FileText, Trash2, Eye, FileUp, Sparkles, Briefcase, Award, ArrowRight } from 'lucide-react';
import axios from 'axios';

const StudentResume = ({ isDark }) => {
  const [resume, setResume] = useState(null); // Will store base64 string
  const [pdfUrl, setPdfUrl] = useState(null); // Will store object URL for the PDF
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [userName, setUserName] = useState('Student');
  
  // AI Recommendation States
  const [recommendations, setRecommendations] = useState([]);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [requestingId, setRequestingId] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (resume) {
      if (!resume.startsWith('data:')) {
        setPdfUrl(resume);
        return;
      }
      try {
        const byteString = atob(resume.split(',')[1]);
        const mimeString = resume.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], {type: mimeString});
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        
        return () => URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Failed to create object URL', err);
        setPdfUrl(resume);
      }
    } else {
      setPdfUrl(null);
      setRecommendations([]);
      setExtractedSkills([]);
    }
  }, [resume]);

  const fetchRecommendations = async () => {
    try {
      setLoadingRecs(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/profile/recommendations', {
        headers: { 'x-auth-token': token }
      });
      setRecommendations(res.data.recommendations || []);
      setExtractedSkills(res.data.extractedSkills || []);
    } catch (err) {
      console.error('Failed to fetch recommendations', err);
    } finally {
      setLoadingRecs(false);
    }
  };

  useEffect(() => {
    if (resume) fetchRecommendations();
  }, [resume]);

  const handleRequest = async (alumniId) => {
    try {
      setRequestingId(alumniId);
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/requests', { alumniId }, {
         headers: { 'x-auth-token': token }
      });
      setSuccessMsg('Appointment requested successfully!');
      
      // Update local state to immediately show 'Pending'
      setRecommendations(prev => prev.map(al => 
        al._id === alumniId ? { ...al, requestStatus: 'Pending' } : al
      ));

      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Failed to request appointment');
      setTimeout(() => setError(null), 3000);
    } finally {
      setRequestingId(null);
    }
  };

  async function fetchProfile() {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/profile', {
        headers: { 'x-auth-token': token }
      });
      setResume(res.data.resume || null);
      setUserName(res.data.name || 'Student');
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch profile.');
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
       setError('Only PDF files are allowed.');
       return;
    }
    
    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }

    setUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        const token = localStorage.getItem('token');
        await axios.put('http://localhost:5000/api/profile', { resume: base64String }, {
          headers: { 'x-auth-token': token }
        });
        setResume(base64String);
        setSuccessMsg('Resume uploaded successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        console.error(err);
        setError('Failed to upload resume.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;
    
    setUploading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      // Sending an empty string to clear the field
      await axios.put('http://localhost:5000/api/profile', { resume: '' }, {
        headers: { 'x-auth-token': token }
      });
      setResume(null);
      setSuccessMsg('Resume deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to delete resume.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout isDark={isDark} role="Student" userName={userName}>
        <div className="flex h-full items-center justify-center">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout isDark={isDark} role="Student" userName={userName}>
      <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col relative z-10">
      
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <header className="mb-8 shrink-0 relative z-10">
          <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            Career Profile
          </div>
          <h2 className={`text-4xl md:text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 drop-shadow-sm">Resume</span>
          </h2>
          <p className={`font-medium mt-3 text-lg ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Showcase your journey. Upload your most recent ATS-friendly PDF.
          </p>
        </header>

        {error && <div className="mb-6 animate-pulse p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold shrink-0 shadow-[0_0_20px_rgba(239,68,68,0.1)]">{error}</div>}
        {successMsg && <div className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 font-bold shrink-0 shadow-[0_0_20px_rgba(34,197,94,0.1)]">{successMsg}</div>}

        <div className={`flex-1 relative group rounded-[2.5rem] overflow-hidden transition-all duration-500 flex flex-col ${
          isDark 
            ? 'bg-white/[0.02] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]' 
            : 'bg-white/50 border border-slate-200 shadow-2xl backdrop-blur-3xl'
        }`}>
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          {!resume ? (
            // Upload UI
            <div className="flex-1 flex flex-col items-center justify-center p-12 relative z-10">
              <label className={`
                relative flex flex-col items-center justify-center w-full max-w-2xl p-16 rounded-[3rem] 
                border-2 border-dashed transition-all duration-500 cursor-pointer group/dropzone
                ${uploading 
                  ? 'border-slate-500/30 bg-slate-500/5' 
                  : isDark 
                    ? 'border-indigo-500/30 hover:border-indigo-400/60 hover:bg-indigo-500/5 shadow-[0_0_30px_rgba(99,102,241,0.05)] hover:shadow-[0_0_50px_rgba(99,102,241,0.1)]' 
                    : 'border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 shadow-xl hover:shadow-2xl'}
              `}>
                {uploading && (
                  <div className="absolute inset-0 bg-[#0f0f12]/50 backdrop-blur-sm rounded-[3rem] flex items-center justify-center z-20">
                    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  </div>
                )}
                
                <div className={`
                  w-28 h-28 mb-8 rounded-[2rem] flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover/dropzone:scale-110 group-hover/dropzone:-translate-y-2
                  ${isDark ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 text-indigo-300' : 'bg-gradient-to-br from-indigo-100 to-purple-100 border border-white text-indigo-600'}
                `}>
                  <FileUp size={56} className="drop-shadow-lg" />
                </div>
                
                <h3 className={`text-3xl font-black mb-4 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Drag & Drop <span className="font-light text-indigo-400">or Click</span>
                </h3>
                <p className={`mb-10 text-center max-w-sm text-lg font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Upload your professional resume in PDF format (max 5MB).
                </p>
                
                <div className={`
                  flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all duration-300
                  ${isDark 
                    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/5' 
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-indigo-500/10'}
                `}>
                  <Upload size={20} className="transition-transform group-hover/dropzone:-translate-y-1" />
                  <span>Choose File</span>
                </div>
                
                <input 
                  type="file" 
                  accept="application/pdf" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                  disabled={uploading} 
                />
              </label>
            </div>
          ) : (
            // Split View UI: Resume Actions & AI Connections
            <div className={`flex-1 flex flex-col lg:flex-row gap-8 p-12 relative z-10 ${isDark ? 'bg-white/[0.01]' : 'bg-white/50'}`}>
              
              {/* Left Column: Existing File View */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className={`relative flex items-center justify-center w-36 h-36 mb-8 rounded-[2.5rem] shadow-2xl transition-all ${
                  isDark ? 'bg-gradient-to-br from-indigo-500/20 to-green-500/20 text-green-400 border border-white/5' : 'bg-gradient-to-br from-green-50 to-indigo-50 text-green-600 border border-white'
                }`}>
                  <div className="absolute inset-0 bg-green-500/10 rounded-[2.5rem] animate-ping" style={{ animationDuration: '3s' }} />
                  <FileText size={64} className="relative z-10 drop-shadow-md" />
                </div>
                
                <h3 className={`text-4xl font-black mb-3 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Resume Uploaded
                </h3>
                <p className={`mb-12 text-center max-w-sm text-lg font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Your professional profile document is successfully loaded and parsed.
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <a 
                    href={pdfUrl} 
                    target="_blank"
                    rel="noreferrer"
                    className={`group flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl hover:-translate-y-1 ${
                      isDark ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10' : 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200'
                    }`}
                  >
                    <Eye size={20} className="transition-transform group-hover:scale-110" /> Preview
                  </a>
                  
                  <button 
                    onClick={handleDelete}
                    disabled={uploading}
                    className="group flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:-translate-y-1 bg-transparent hover:bg-red-500/10 text-red-500 border border-transparent hover:border-red-500/30"
                  >
                    <Trash2 size={20} className="transition-transform group-hover:rotate-12" /> {uploading ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>

              {/* Right Column: AI Recommendations */}
              <div className="flex-[1.5] flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg shadow-indigo-500/30 text-white">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      AI Suggested Connections
                    </h3>
                    <p className={`text-sm font-medium ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>
                      Based on your {extractedSkills.length} extracted skills
                    </p>
                  </div>
                </div>

                {/* Display extracted tags */}
                {extractedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {extractedSkills.map((skill, i) => (
                      <span key={i} className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                        isDark ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                      }`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto pr-2 space-y-4 font-sans custom-scrollbar">
                  {loadingRecs ? (
                    <div className="flex flex-col items-center justify-center p-12 text-indigo-400">
                      <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                      <p className="font-bold">Analyzing profiles...</p>
                    </div>
                  ) : recommendations.length === 0 ? (
                    <div className={`p-8 rounded-3xl text-center border border-dashed ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-300 bg-slate-50'}`}>
                      <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>We couldn't find any direct alumni matches yet. Add more skills to your resume!</p>
                    </div>
                  ) : (
                    recommendations.map((alumni) => (
                      <div key={alumni._id} className={`group flex flex-col sm:flex-row items-center gap-6 p-5 rounded-3xl transition-all duration-300 cursor-pointer border ${
                        isDark 
                          ? 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-indigo-500/30 shadow-lg' 
                          : 'bg-white hover:bg-slate-50 border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl'
                      }`}>
                        <div className="shrink-0 relative">
                          {alumni.profilePicture ? (
                            <img src={alumni.profilePicture} alt={alumni.name} className="w-16 h-16 rounded-full object-cover border-2 border-indigo-400/50" />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                              {alumni.name.charAt(0)}
                            </div>
                          )}
                          <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-[0.65rem] font-black px-2 py-0.5 rounded-full border border-white/20 shadow-lg">
                            {alumni.score * 25}% MATCH
                          </div>
                        </div>
                        
                        <div className="flex-1 text-center sm:text-left">
                          <h4 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} group-hover:text-indigo-400 transition-colors`}>{alumni.name}</h4>
                          <span className={`block text-sm font-semibold mb-2 ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>{alumni.company || 'Alumni'}</span>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm font-medium">
                            <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              <Briefcase size={14} /> <span className="truncate max-w-[120px]">{alumni.domain || 'General'}</span>
                            </div>
                            <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              <Award size={14} /> <span className="truncate max-w-[120px]">{alumni.expertise || 'Various'}</span>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleRequest(alumni._id)}
                          disabled={requestingId === alumni._id || alumni.requestStatus}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                            alumni.requestStatus === 'Pending' 
                              ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                              : alumni.requestStatus === 'Accepted'
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                              : alumni.requestStatus === 'Rejected'
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                              : isDark 
                                ? 'bg-white/5 hover:bg-indigo-500 text-white/70 hover:text-white disabled:opacity-50' 
                                : 'bg-slate-100 hover:bg-indigo-600 text-slate-600 hover:text-white disabled:opacity-50'
                          }`}
                        >
                          {requestingId === alumni._id 
                            ? 'Requesting...' 
                            : alumni.requestStatus 
                              ? alumni.requestStatus 
                              : 'Request Appointment'}
                          {!alumni.requestStatus && <ArrowRight size={16} className={`transition-transform ${requestingId !== alumni._id ? 'group-hover:translate-x-1' : ''}`} />}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentResume;
