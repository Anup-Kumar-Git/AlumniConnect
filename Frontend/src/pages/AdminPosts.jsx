import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Send, Megaphone, Image as ImageIcon, X, Edit2 } from 'lucide-react';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { toast } from 'react-hot-toast';

const AdminPosts = ({ isDark }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const userName = localStorage.getItem('userName') || 'Admin';

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



  const handleDeletePost = async (id) => {
    toast((t) => (
      <div>
        <p className="font-bold mb-3">Are you sure you want to delete this announcement?</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-sm bg-slate-200 text-slate-800 rounded-lg font-bold hover:bg-slate-300 transition-colors">Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              const token = localStorage.getItem('token');
              await axios.delete(`http://localhost:5000/api/admin/posts/${id}`, {
                headers: { 'x-auth-token': token }
              });
              fetchPosts();
              toast.success("Post deleted successfully!");
            } catch (err) {
              console.error(err);
              toast.error("Failed to delete post");
            }
          }} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </div>
    ), { duration: Infinity });
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

      <div className="max-w-5xl mx-auto mb-10">
        


        {/* Live Posts List */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-4 mb-4 mt-2">
            <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
            <span className={`text-[12px] font-semibold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'} flex items-center gap-2`}>
              <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                Latest Feed
              </span>
            </span>
            <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
          </div>

          {loading ? (
            <div className={`p-10 rounded-xl border text-center ${isDark ? 'bg-[#0f0f12] border-white/10 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
              Loading announcements...
            </div>
          ) : posts.length === 0 ? (
            <div className={`p-10 rounded-xl border text-center border-dashed ${isDark ? 'bg-[#0f0f12] border-white/10 text-slate-500' : 'bg-slate-50 border-slate-300 text-slate-400'}`}>
              No announcements published yet.
            </div>
          ) : (
            posts.map(post => (
              <PostCard 
                key={post._id} 
                post={post} 
                isDark={isDark} 
                onDelete={handleDeletePost} 
                currentUserRole="Admin" 
              />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPosts;
