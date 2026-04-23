import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import PostCard from '../components/PostCard';
import { Loader2, ArrowLeft, Briefcase, Mail, Building, Github, Linkedin, Calendar } from 'lucide-react';

const isOnline = (lastActive) => {
  if (!lastActive) return false;
  return new Date() - new Date(lastActive) < 5 * 60 * 1000;
};

const UserProfile = ({ isDark, setIsDark }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const role = localStorage.getItem('role') || 'Student';
  const userName = localStorage.getItem('userName') || role;

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return navigate('/auth');

        const [profileRes, postsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/profile/user/${id}`, {
            headers: { 'x-auth-token': token }
          }),
          axios.get(`http://localhost:5000/api/posts/user/${id}`, {
            headers: { 'x-auth-token': token }
          })
        ]);

        setProfile(profileRes.data);
        setPosts(postsRes.data);
      } catch (err) {
        console.error("Failed to fetch user data", err);
        setError("User not found or an error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPosts();
  }, [id, navigate]);

  if (loading) {
    return (
      <DashboardLayout isDark={isDark} role={role} userName={userName}>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="animate-spin text-[#5c4dff] mb-4" size={48} />
          <p className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading Profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !profile) {
    return (
      <DashboardLayout isDark={isDark} role={role} userName={userName}>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <p className={`text-xl font-bold mb-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all">
            <ArrowLeft size={18} /> Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout isDark={isDark} role={role} userName={userName}>
      <div className="max-w-4xl mx-auto pb-10">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 mb-6 font-bold transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-indigo-600'}`}
        >
          <ArrowLeft size={18} /> Back
        </button>

        {/* Hero Section */}
        <div className={`relative rounded-[2.5rem] overflow-hidden mb-10 border shadow-2xl transition-all ${isDark ? 'bg-[#15181e] border-white/5' : 'bg-white border-slate-100'}`}>
          {/* Cover Photo */}
          <div className="h-48 w-full bg-gradient-to-r from-[#5c4dff] to-purple-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
          </div>
          
          {/* Profile Info */}
          <div className="px-8 pb-8 sm:px-12 relative">
            <div className="flex flex-col sm:flex-row gap-6 sm:items-end -mt-20 sm:-mt-24 mb-6">
              <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-8 shadow-xl flex items-center justify-center font-black text-5xl flex-shrink-0 relative ${isDark ? 'border-[#15181e] bg-indigo-600 text-white' : 'border-white bg-indigo-600 text-white'}`}>
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  profile.name ? profile.name[0] : 'U'
                )}
                {/* Status Dot */}
                {isOnline(profile.lastActive) && (
                  <span className={`absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 rounded-full ${isDark ? 'border-[#15181e]' : 'border-white'}`}></span>
                )}
              </div>
              
              <div className="flex-1 pb-2">
                <h1 className={`text-3xl sm:text-4xl font-black mb-1 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {profile.name}
                </h1>
                <p className={`text-lg font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {profile.role || 'Member'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {profile.email && (
                  <div className={`flex items-center gap-3 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <Mail size={18} className="text-slate-400" />
                    <span>{profile.email}</span>
                  </div>
                )}
                {profile.domain && (
                  <div className={`flex items-center gap-3 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <Briefcase size={18} className="text-slate-400" />
                    <span>{profile.domain}</span>
                  </div>
                )}
                {profile.company && (
                  <div className={`flex items-center gap-3 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <Building size={18} className="text-slate-400" />
                    <span>{profile.company}</span>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                 {profile.academicYear && (
                  <div className={`flex items-center gap-3 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <Calendar size={18} className="text-slate-400" />
                    <span>{profile.academicYear}</span>
                  </div>
                )}
                {profile.linkedin && (
                  <div className={`flex items-center gap-3 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <Linkedin size={18} className="text-slate-400" />
                    <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-indigo-500 hover:underline">LinkedIn Profile</a>
                  </div>
                )}
                {profile.github && (
                  <div className={`flex items-center gap-3 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <Github size={18} className="text-slate-400" />
                    <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-indigo-500 hover:underline">GitHub Profile</a>
                  </div>
                )}
              </div>
            </div>

            {profile.otherDetails && (
              <div className={`mt-8 p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                <h3 className={`text-sm font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>About</h3>
                <p className={`text-[15px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{profile.otherDetails}</p>
              </div>
            )}
          </div>
        </div>

        {/* Posts Section */}
        <div>
          <h2 className={`text-2xl font-black tracking-tight mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Posts by {profile.name.split(' ')[0]}
            <span className={`px-3 py-1 text-sm font-bold rounded-full ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
              {posts.length}
            </span>
          </h2>
          
          {posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map(post => (
                <PostCard 
                  key={post._id}
                  post={post}
                  isDark={isDark}
                  onDelete={null} // Can't delete posts from here unless admin/self, omitted for simplicity
                  currentUserRole={role}
                />
              ))}
            </div>
          ) : (
            <div className={`py-16 text-center border rounded-[2rem] ${isDark ? 'border-white/5 bg-[#15181e]/50' : 'border-slate-100 bg-white/50'}`}>
              <p className={`font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {profile.name.split(' ')[0]} hasn't published any posts yet.
              </p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default UserProfile;
