import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { toast } from 'react-hot-toast';
import { Megaphone, PlusCircle, X, Image as ImageIcon, Send, MessageSquare } from 'lucide-react';
import axios from 'axios';
import PostCard from '../components/PostCard';

const MyPosts = ({ isDark }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const userName = localStorage.getItem('userName') || 'User';
  
  let currentUserId = null;
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      currentUserId = decoded.user.id;
    }
  } catch (e) {}

  const currentRole = localStorage.getItem('role') || 'Student';

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be less than 2MB');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/posts', {
        headers: { 'x-auth-token': token }
      });
      // Filter only user's posts
      const myPosts = res.data.filter(p => p.author === currentUserId);
      setPosts(myPosts);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentUserId]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

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
      setShowComposer(false);
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    toast((t) => (
      <div>
        <p className="font-bold mb-3">Are you sure you want to delete this post?</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-sm bg-slate-200 text-slate-800 rounded-lg font-bold hover:bg-slate-300 transition-colors">Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              const token = localStorage.getItem('token');
              await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
                headers: { 'x-auth-token': token }
              });
              fetchPosts();
              toast.success("Post deleted successfully!");
            } catch (err) {
              console.error('Failed to delete post:', err);
              toast.error("Failed to delete post");
            }
          }} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  return (
    <DashboardLayout isDark={isDark} role={currentRole} userName={userName}>
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={`text-4xl font-black tracking-tight flex items-center gap-3 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            <MessageSquare className="text-indigo-500" size={36} /> My Posts
          </h2>
          <p className={`font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage your personal announcements and view your feed activity.
          </p>
        </div>
        
        {/* Toggle Button for New Post aligned with Header */}
        {!showComposer && (
          <button 
            onClick={() => setShowComposer(true)}
            className="flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg active:scale-95 shrink-0"
          >
            <PlusCircle size={20} />
            Create New Post
          </button>
        )}
      </header>

      <div className="max-w-5xl mx-auto mb-10">

        {/* Composer Form visible only when showComposer is true */}
        {showComposer && (
          <div className={`p-4 sm:p-5 rounded-xl border shadow-sm mb-6 ${
            isDark ? 'bg-[#0f0f12] border-white/10' : 'bg-white border-slate-200'
          }`}>
            <div className="flex justify-between items-start mb-3">
              <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                New Post
              </h3>
              <button 
                onClick={() => setShowComposer(false)}
                className={`p-1 rounded-full transition-colors ${isDark ? 'text-slate-400 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-3">
              <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xl text-white ${isDark ? 'bg-indigo-600' : 'bg-indigo-600'}`}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 w-full">
                <form onSubmit={handleCreatePost} className="space-y-3">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Subject or Title (e.g. Upcoming Tech Fair)"
                    className={`w-full px-4 py-2.5 text-sm rounded-lg border font-semibold outline-none focus:ring-1 focus:ring-indigo-500 transition-colors ${
                      isDark ? 'bg-[#1a1a1f] border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500'
                    }`}
                  />
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start a post..."
                    required
                    rows="3"
                    className={`w-full px-4 py-3 rounded-lg border outline-none focus:ring-1 focus:ring-indigo-500 transition-colors resize-none ${
                        isDark ? 'bg-[#1a1a1f] border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500'
                    }`}
                  />
                  
                  {image && (
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 max-h-60 mt-2">
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setImage('')} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <label className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors font-semibold text-[14px] ${
                      isDark ? 'text-indigo-400 hover:bg-white/5' : 'text-indigo-600 hover:bg-indigo-50'
                    }`}>
                      <ImageIcon size={20} />
                      Photo
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    <button
                      type="submit"
                      disabled={submitting || !content.trim()}
                      className={`px-5 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
                        submitting || !content.trim() 
                          ? 'bg-slate-200 text-slate-400 dark:bg-white/10 dark:text-slate-500 cursor-not-allowed' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-sm hover:shadow'
                      }`}
                    >
                      {submitting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Live Posts List */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
            <span className={`text-[12px] font-semibold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'} flex items-center gap-2`}>
              <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
              </span>
            </span>
            <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
          </div>

          {loading ? (
            <div className={`p-10 rounded-[2.5rem] border text-center ${isDark ? 'bg-[#0f0f12] border-white/10 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
              Loading your activity...
            </div>
          ) : posts.length === 0 ? (
            <div className={`p-10 rounded-[2.5rem] border text-center border-dashed ${isDark ? 'bg-[#0f0f12] border-white/10 text-slate-500' : 'bg-slate-50 border-slate-300 text-slate-400'}`}>
              You haven't posted anything yet.
            </div>
          ) : (
            posts.map(post => (
              <PostCard 
                key={post._id} 
                post={post} 
                isDark={isDark} 
                onDelete={handleDeletePost} 
                currentUserRole={currentRole} 
              />
            ))
          )}
        </div>
      </div>

    </DashboardLayout>
  );
};

export default MyPosts;
