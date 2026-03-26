import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Send, Trash2, Megaphone, Clock, Image as ImageIcon, X } from 'lucide-react';
import axios from 'axios';

const AdminPosts = ({ isDark }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const userName = localStorage.getItem('userName') || 'Admin';

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('Image must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/posts', {
        headers: { 'x-auth-token': token }
      });
      setPosts(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/posts', 
        { title, content, image },
        { headers: { 'x-auth-token': token } }
      );
      setPosts([res.data, ...posts]);
      setTitle('');
      setContent('');
      setImage('');
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/posts/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setPosts(posts.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout isDark={isDark} role="Admin" userName={userName}>
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h2 className={`text-4xl font-black tracking-tight flex items-center gap-3 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            <Megaphone className="text-indigo-500" size={36} /> Announcements
          </h2>
          <p className={`font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Broadcast news, events, and updates to Students and Alumni.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Create Post Section */}
        <div className="xl:col-span-1">
          <div className={`p-8 rounded-[2.5rem] shadow-xl border sticky top-8 transition-all ${
            isDark ? 'bg-[#0f0f12] border-white/10' : 'bg-white border-slate-200'
          }`}>
            <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              <Edit2 size={20} className="text-indigo-500" /> Compose New
            </h3>
            
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Post Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Upcoming Tech Fair"
                  required
                  className={`w-full p-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                    isDark ? 'bg-[#1a1a1a] border-white/10 focus:border-indigo-500 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 focus:border-indigo-400 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Message Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your announcement here..."
                  required
                  rows="6"
                  className={`w-full p-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none ${
                    isDark ? 'bg-[#1a1a1a] border-white/10 focus:border-indigo-500 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 focus:border-indigo-400 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className={`flex items-center justify-center gap-2 w-full p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  isDark ? 'border-white/20 hover:border-indigo-500 hover:bg-white/5 text-slate-400' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50 text-slate-500'
                }`}>
                  <ImageIcon size={20} className={image ? "text-indigo-500" : ""} />
                  <span className="font-bold text-sm text-center">{image ? 'Image Attached' : 'Upload Optional Image (Max 2MB)'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                
                {image && (
                  <div className="mt-4 relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
                    <img src={image} alt="Preview" className="w-full h-40 object-cover" />
                    <button type="button" onClick={() => setImage('')} className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-lg transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full mt-2 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all active:scale-95 ${
                  submitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-[#5c4dff] hover:bg-[#4b3ede] shadow-lg shadow-[#5c4dff]/30'
                }`}
              >
                <Send size={18} /> {submitting ? 'Publishing...' : 'Publish Announcement'}
              </button>
            </form>
          </div>
        </div>

        {/* Live Posts List */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Active Broadcasts
            </h3>
            <span className={`px-3 py-1 rounded-full font-bold text-xs ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
              {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
            </span>
          </div>

          {loading ? (
            <div className={`p-10 rounded-[2.5rem] border text-center ${isDark ? 'bg-[#0f0f12] border-white/10 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
              Loading announcements...
            </div>
          ) : posts.length === 0 ? (
            <div className={`p-10 rounded-[2.5rem] border text-center border-dashed ${isDark ? 'bg-[#0f0f12] border-white/10 text-slate-500' : 'bg-slate-50 border-slate-300 text-slate-400'}`}>
              No announcements published yet.
            </div>
          ) : (
            posts.map(post => (
              <div key={post._id} className={`p-8 rounded-[2.5rem] border transition-all hover:shadow-lg hover:-translate-y-1 ${
                isDark ? 'bg-[#0f0f12] border-white/10' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <h4 className={`text-2xl font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{post.title}</h4>
                    <div className={`flex items-center gap-4 mt-2 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span className="flex items-center gap-1.5 opacity-80">
                        <User size={14} className="text-indigo-400" /> {post.authorName}
                      </span>
                      <span className="flex items-center gap-1.5 opacity-80">
                        <Clock size={14} className="text-indigo-400" /> {new Date(post.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeletePost(post._id)}
                    className={`p-3 rounded-xl transition-colors ${isDark ? 'bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-500' : 'bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-600'}`}
                    title="Delete Announcement"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className={`p-6 rounded-2xl whitespace-pre-wrap leading-relaxed ${isDark ? 'bg-black/20 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                  {post.image && (
                    <img src={post.image} alt="Cover" className="w-full max-h-80 object-cover rounded-xl mb-4 border border-slate-200 dark:border-white/5 shadow-sm" />
                  )}
                  {post.content}
                </div>
              </div>
            ))

          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

// For using standard icons like Edit2
import { Edit2, User } from 'lucide-react';

export default AdminPosts;
