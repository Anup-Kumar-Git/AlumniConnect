import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Clock, Trash2, ThumbsUp, MessageCircle, Send, X, MoreHorizontal, Share2, Megaphone, Edit } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const PostCard = ({
  post: initialPost,
  isDark,
  onDelete,
  currentUserRole
}) => {
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [showActions, setShowActions] = useState(false); // For three-dot menu
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(initialPost.title || '');
  const [editContent, setEditContent] = useState(initialPost.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  let currentUserId = null;
  try {
    const token = localStorage.getItem('token');
    if (token) currentUserId = JSON.parse(atob(token.split('.')[1])).user.id;
  } catch (e) { }

  // Derive logical props
  const likesCount = post.likes?.length || 0;
  const isLiked = post.likes?.some(l => l.user === currentUserId);
  const commentsCount = post.comments?.length || 0;

  const handleProfileClick = () => {
    if (post.author) {
      navigate(`/user/${post.author}`);
    }
  };

  // Handlers
  const handleLike = async () => {
    // Optimistic UI Update
    const previousLikes = [...(post.likes || [])];
    const currentlyLiked = previousLikes.some(l => l.user === currentUserId);
    
    let newLikes = [...previousLikes];
    if (currentlyLiked) {
      newLikes = newLikes.filter(l => l.user !== currentUserId);
    } else {
      newLikes.unshift({ user: currentUserId });
    }
    
    // Update state instantly for a snappy feel
    setPost({ ...post, likes: newLikes });

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/posts/like/${post._id}`, {}, {
        headers: { 'x-auth-token': token }
      });
      // We don't need to await and set the response data since we already updated it, 
      // but we could if we wanted absolute synchronization.
    } catch (err) {
      console.error('Error toggling like', err);
      // Revert to original state if the API fails
      setPost({ ...post, likes: previousLikes });
      toast.error("Network error. Like couldn't be saved.");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: post.title || `Post by ${post.authorName}`,
      text: post.content,
      url: `${window.location.origin}/user/${post.author}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\nView author: ${shareData.url}`);
        toast.success("Post link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy link.");
      }
    }
  };

  const handleEditSave = async () => {
    if (!editContent.trim()) {
      toast.error("Content cannot be empty.");
      return;
    }
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/posts/${post._id}`, 
        { title: editTitle, content: editContent },
        { headers: { 'x-auth-token': token } }
      );
      setPost({ ...post, title: res.data.title, content: res.data.content });
      setIsEditing(false);
      toast.success("Post updated successfully!");
    } catch (err) {
      console.error('Error updating post', err);
      toast.error("Failed to update post.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setPostingComment(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:5000/api/posts/comment/${post._id}`,
        { text: commentText },
        { headers: { 'x-auth-token': token } }
      );
      setPost({ ...post, comments: res.data });
      setCommentText('');
      setPostingComment(false);
    } catch (err) {
      console.error('Error adding comment', err);
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    toast((t) => (
      <div>
        <p className="font-bold mb-3">Are you sure you want to delete this comment?</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-sm bg-slate-200 text-slate-800 rounded-lg font-bold hover:bg-slate-300 transition-colors">Cancel</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              const token = localStorage.getItem('token');
              const res = await axios.delete(`http://localhost:5000/api/posts/comment/${post._id}/${commentId}`, {
                headers: { 'x-auth-token': token }
              });
              setPost({ ...post, comments: res.data });
              toast.success("Comment deleted successfully!");
            } catch (err) {
              console.error('Error deleting comment', err);
              toast.error("Failed to delete comment");
            }
          }} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  return (
    <div className={`mb-8 rounded-[2rem] border overflow-hidden relative transition-all duration-300 hover:shadow-xl ${isDark ? 'bg-[#15181e] border-white/5 shadow-2xl' : 'bg-white border-slate-100 shadow-md hover:border-slate-200'
      }`}>
      {/* Header Info */}
      <div className="flex justify-between items-start p-6 pb-4">
        <div className="flex gap-4 items-center cursor-pointer group" onClick={handleProfileClick}>
          <div className="relative">
            {post.authorProfilePicture ? (
              <img src={post.authorProfilePicture} alt={post.authorName} className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-indigo-500/50 transition-all" />
            ) : (
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl text-indigo-600 bg-indigo-50 group-hover:bg-indigo-100 transition-colors`}>
                {post.authorName?.charAt(0).toUpperCase() || 'A'}
              </div>
            )}
          </div>
          <div className="leading-tight">
            <h4 className={`text-base font-bold group-hover:text-indigo-500 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {post.authorName || 'Anonymous'}
            </h4>
            <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
              {post.authorRole || 'Alumni Connect Member'}
            </p>
            <div className={`text-[11px] font-bold flex items-center gap-1.5 mt-1 tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <Clock size={12} className="opacity-70" />
              {new Date(post.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Action Menu (Delete) */}
        {(onDelete && (currentUserRole === 'Admin' || currentUserId === post.author)) && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
            >
              <MoreHorizontal size={20} />
            </button>
            {showActions && (
              <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl border z-10 overflow-hidden ${isDark ? 'bg-[#1a1a1f] border-white/10' : 'bg-white border-slate-200'
                }`}>
                {currentUserId === post.author && (
                  <button
                    onClick={() => {
                      setShowActions(false);
                      setIsEditing(true);
                      setEditTitle(post.title || '');
                      setEditContent(post.content || '');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors ${isDark ? 'hover:bg-indigo-500/10 text-indigo-400' : 'hover:bg-indigo-50 text-indigo-600'
                      }`}
                  >
                    <Edit size={16} />
                    Edit Post
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowActions(false);
                    onDelete(post._id);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600'
                    }`}
                >
                  <Trash2 size={16} />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="px-6 pb-4">
        {isEditing ? (
          <div className="space-y-4">
            <input 
              type="text" 
              value={editTitle} 
              onChange={(e) => setEditTitle(e.target.value)} 
              placeholder="Post Title (Optional)"
              className={`w-full p-3 rounded-xl border ${isDark ? 'bg-[#0f1115] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} outline-none focus:border-indigo-500 transition-colors font-bold`}
            />
            <textarea 
              value={editContent} 
              onChange={(e) => setEditContent(e.target.value)} 
              placeholder="What do you want to talk about?"
              rows={4}
              className={`w-full p-3 rounded-xl border ${isDark ? 'bg-[#0f1115] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} outline-none focus:border-indigo-500 transition-colors`}
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsEditing(false)} 
                className={`px-4 py-2 rounded-xl text-sm font-bold ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'} transition-colors`}
              >
                Cancel
              </button>
              <button 
                onClick={handleEditSave} 
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {post.title && (
              <h3 className={`text-xl font-black mb-2 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {post.title}
              </h3>
            )}
            <p className={`whitespace-pre-wrap text-[15px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {post.content}
            </p>
          </>
        )}
      </div>

      {/* Post Media */}
      {post.image && (
        <div className="w-full bg-slate-50 dark:bg-black/20 border-y dark:border-white/5 border-slate-100">
          <img src={post.image} alt="Post Attachment" className="w-full max-h-[600px] object-cover sm:object-contain object-top" />
        </div>
      )}

      {/* Reaction Counts */}
      <div className={`px-6 py-4 flex justify-between items-center text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        <div className="flex items-center gap-2">
          {likesCount > 0 && (
            <>
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-[#5c4dff] to-purple-500 text-white shadow-md">
                <ThumbsUp size={12} className="fill-white" />
              </div>
              <span className="hover:text-indigo-500 transition-colors cursor-pointer">{likesCount} Likes</span>
            </>
          )}
        </div>
        <div className="flex gap-4">
          {commentsCount > 0 && (
            <span className="hover:text-indigo-500 cursor-pointer transition-colors" onClick={() => setShowComments(!showComments)}>
              {commentsCount} Comments
            </span>
          )}
        </div>
      </div>

      {/* Action Bar (Reactions / Comments / Share) */}
      <div className={`flex items-center justify-between mx-6 mb-6 p-1.5 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black transition-all ${isLiked
              ? 'text-indigo-600 bg-indigo-500/10 dark:text-indigo-400'
              : isDark
                ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                : 'text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-900'
            }`}
        >
          <ThumbsUp size={18} className={isLiked ? "fill-current" : ""} />
          <span className="text-[12px] uppercase tracking-widest">Like</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black transition-all ${showComments
              ? 'text-indigo-600 bg-indigo-500/10 dark:text-indigo-400'
              : isDark
                ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                : 'text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-900'
            }`}
        >
          <MessageCircle size={18} />
          <span className="text-[12px] uppercase tracking-widest">Comment</span>
        </button>

        <button
          onClick={handleShare}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black transition-all ${isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-900'
            }`}
        >
          <Share2 size={18} />
          <span className="text-[12px] uppercase tracking-widest">Share</span>
        </button>
      </div>

      {/* Expanded Comments Section */}
      {showComments && (
        <div className={`px-6 pb-6 pt-2 border-t ${isDark ? 'border-white/5 bg-[#15181e]' : 'border-slate-100 bg-white'}`}>
          {/* Add a Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-4 mb-8 items-start mt-6">
            <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-black text-sm text-indigo-600 bg-indigo-50`}>
              Me
            </div>
            <div className={`flex-1 flex flex-col rounded-[1.5rem] border-2 transition-all ${isDark
                ? 'bg-[#0f1115] border-white/5 focus-within:border-indigo-500/50'
                : 'bg-white border-slate-100 focus-within:border-indigo-500/50 focus-within:shadow-md'
              }`}>
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a public comment..."
                className={`w-full p-4 px-5 bg-transparent outline-none text-sm font-medium ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                  }`}
              />
              {commentText.trim() && (
                <div className="flex justify-end p-2 px-3 border-t border-transparent">
                  <button
                    type="submit"
                    disabled={postingComment}
                    className={`px-6 py-2.5 text-xs font-black rounded-full text-white transition-all flex items-center gap-2 ${postingComment
                        ? 'bg-indigo-400 cursor-not-allowed'
                        : 'bg-[#5c4dff] hover:bg-[#4b3ce5] shadow-lg shadow-indigo-500/20 active:scale-95'
                      }`}
                  >
                    <Send size={14} /> Post Comment
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* List Comments */}
          <div className="space-y-6 max-h-96 overflow-y-auto custom-scrollbar pr-2">
            {post.comments?.map((comment) => (
              <div key={comment._id} className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-black text-sm text-white bg-gradient-to-tr from-[#5c4dff] to-purple-500 shadow-md`}>
                  {comment.userName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 flex flex-col group">
                  <div className={`relative px-5 py-4 rounded-[1.5rem] rounded-tl-sm inline-block shadow-sm ${isDark ? 'bg-white/5 text-slate-200' : 'bg-slate-50 border border-slate-100 text-slate-800'
                    }`}>
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h6 className={`font-black text-sm hover:underline cursor-pointer ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {comment.userName}
                      </h6>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {new Date(comment.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[14px] leading-relaxed font-medium">
                      {comment.text}
                    </p>
                  </div>

                  {/* Delete comment (if author or admin) */}
                  {(currentUserRole === 'Admin' || currentUserId === comment.user) && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className={`text-xs font-black mt-2 ml-2 self-start opacity-0 group-hover:opacity-100 hover:underline transition-all ${isDark ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-600'
                        }`}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
