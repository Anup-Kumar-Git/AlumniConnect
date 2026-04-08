import React, { useState } from 'react';
import { User, Clock, Trash2, ThumbsUp, MessageCircle, Send, X, MoreHorizontal, Share2, Megaphone } from 'lucide-react';
import axios from 'axios';

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

  let currentUserId = null;
  try {
    const token = localStorage.getItem('token');
    if (token) currentUserId = JSON.parse(atob(token.split('.')[1])).user.id;
  } catch (e) { }

  // Derive logical props
  const likesCount = post.likes?.length || 0;
  const isLiked = post.likes?.some(l => l.user === currentUserId);
  const commentsCount = post.comments?.length || 0;

  // Handlers
  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/posts/like/${post._id}`, {}, {
        headers: { 'x-auth-token': token }
      });
      setPost({ ...post, likes: res.data });
    } catch (err) {
      console.error('Error toggling like', err);
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
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`http://localhost:5000/api/posts/comment/${post._id}/${commentId}`, {
        headers: { 'x-auth-token': token }
      });
      setPost({ ...post, comments: res.data });
    } catch (err) {
      console.error('Error deleting comment', err);
    }
  };

  return (
    <div className={`mb-4 sm:mb-6 rounded-xl border sm:overflow-hidden relative shadow-sm ${isDark ? 'bg-[#0f0f12] border-white/10' : 'bg-white border-slate-200'
      }`}>
      {/* Header Info */}
      <div className="flex justify-between items-start p-4 mb-1">
        <div className="flex gap-3 items-center">
          {/* Avatar */}
          <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xl text-white shadow-sm overflow-hidden ${isDark ? 'bg-indigo-600' : 'bg-indigo-600'
            }`}>
            {post.authorProfilePicture ? (
              <img src={post.authorProfilePicture} alt={post.authorName} className="w-full h-full object-cover" />
            ) : (
              post.authorName?.charAt(0).toUpperCase() || 'A'
            )}
          </div>
          <div className="leading-tight">
            <h4 className={`text-[15px] font-semibold hover:underline cursor-pointer ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {post.authorName || 'Anonymous'}
            </h4>
            <p className={`text-[12px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Alumni Connect Member
            </p>
            <div className={`text-[12px] flex items-center gap-1 mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {new Date(post.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} •
              <Clock size={12} className="opacity-70" />
            </div>
          </div>
        </div>

        {/* Action Menu (Delete) */}
        {(onDelete && (currentUserRole === 'Admin' || currentUserId === post.author)) && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
            >
              <MoreHorizontal size={20} />
            </button>
            {showActions && (
              <div className={`absolute right-0 mt-1 w-40 rounded-lg shadow-lg border z-10 overflow-hidden ${isDark ? 'bg-[#1a1a1f] border-white/10' : 'bg-white border-slate-200'
                }`}>
                <button
                  onClick={() => {
                    setShowActions(false);
                    onDelete(post._id);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-3 text-sm transition-colors ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600'
                    }`}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="px-4 pb-2">
        {post.title && (
          <h3 className={`text-[16px] font-semibold mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {post.title}
          </h3>
        )}
        <p className={`whitespace-pre-wrap text-[14px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {post.content}
        </p>
      </div>

      {/* Post Media */}
      {post.image && (
        <div className="w-full mt-2 bg-black/5 dark:bg-white/5">
          <img src={post.image} alt="Post Attachment" className="w-full max-h-[500px] object-cover sm:object-contain object-top" />
        </div>
      )}

      {/* Reaction Counts */}
      <div className={`px-4 py-3 flex justify-between items-center text-[13px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        <div className="flex items-center gap-1.5">
          {likesCount > 0 && (
            <>
              <div className="flex items-center justify-center w-[18px] h-[18px] rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-colors cursor-pointer shadow-sm">
                <ThumbsUp size={10} className="fill-white" />
              </div>
              <span className="hover:text-indigo-500 hover:underline cursor-pointer">{likesCount}</span>
            </>
          )}
        </div>
        <div className="flex gap-3">
          {commentsCount > 0 && (
            <span className="hover:underline hover:text-indigo-500 cursor-pointer transition-colors" onClick={() => setShowComments(!showComments)}>
              {commentsCount} comments
            </span>
          )}
        </div>
      </div>

      {/* Action Bar (Reactions / Comments / Share) */}
      <div className={`flex items-center justify-between border-t mb-1 mx-4 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 mt-1 rounded-md font-medium transition-colors ${isLiked
              ? 'text-indigo-600 dark:text-indigo-400'
              : isDark
                ? 'text-slate-300 hover:bg-white/5'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
          <ThumbsUp size={20} className={isLiked ? "fill-current" : ""} />
          <span className="text-sm">Like</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 mt-1 rounded-md font-medium transition-colors ${showComments
              ? 'text-indigo-600 dark:text-indigo-400'
              : isDark
                ? 'text-slate-300 hover:bg-white/5'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
          <MessageCircle size={20} />
          <span className="text-sm">Comment</span>
        </button>

        <button
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 mt-1 rounded-md font-medium transition-colors ${isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
          <Share2 size={20} />
          <span className="text-sm">Share</span>
        </button>
      </div>

      {/* Expanded Comments Section */}
      {showComments && (
        <div className={`px-4 pb-4 pt-1 ${isDark ? 'bg-[#0f0f12]' : 'bg-white'}`}>
          {/* Add a Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-3 mb-5 items-start mt-2">
            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm text-white ${isDark ? 'bg-slate-700' : 'bg-indigo-600'}`}>
              Me
            </div>
            <div className={`flex-1 flex flex-col rounded-2xl border transition-all ${isDark
                ? 'bg-transparent border-white/20 focus-within:border-indigo-500'
                : 'bg-transparent border-slate-300 focus-within:border-indigo-500'
              }`}>
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className={`w-full p-2.5 px-4 bg-transparent outline-none text-sm ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-500'
                  }`}
              />
              {commentText.trim() && (
                <div className="flex justify-end p-2 border-t border-transparent">
                  <button
                    type="submit"
                    disabled={postingComment}
                    className={`px-4 py-1.5 text-xs font-bold rounded-full text-white transition-colors flex items-center gap-1.5 ${postingComment
                        ? 'bg-indigo-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow active:scale-95'
                      }`}
                  >
                    <Send size={12} /> Post
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* List Comments */}
          <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
            {post.comments?.map((comment) => (
              <div key={comment._id} className="flex gap-3">
                <div className={`w-9 h-9 mt-1 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm text-white bg-indigo-500/80`}>
                  {comment.userName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 flex flex-col group">
                  <div className={`relative px-4 py-3 rounded-2xl rounded-tl-sm inline-block ${isDark ? 'bg-[#1a1a1f] text-slate-200' : 'bg-slate-100 text-slate-800'
                    }`}>
                    <div className="flex items-center justify-between gap-4">
                      <h6 className="font-semibold text-[13px] hover:underline cursor-pointer leading-tight">
                        {comment.userName}
                      </h6>
                      <span className={`text-[11px] whitespace-nowrap ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                        {new Date(comment.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed">
                      {comment.text}
                    </p>
                  </div>

                  {/* Delete comment (if author or admin) */}
                  {(currentUserRole === 'Admin' || currentUserId === comment.user) && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className={`text-[12px] font-medium mt-1 self-start opacity-0 group-hover:opacity-100 hover:underline transition-all ${isDark ? 'text-slate-500 hover:text-red-400' : 'text-slate-500 hover:text-red-600'
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
