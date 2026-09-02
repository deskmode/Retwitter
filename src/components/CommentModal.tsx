import React, { useState, useEffect } from 'react';
import { X, Send, Trash2 } from 'lucide-react';
import { Post, Comment } from '../types';
import { storageService } from '../services/storageService';
import { formatTimeAgo } from '../utils/themeTokens';
import { useTheme } from '../context/ThemeContext';

interface CommentModalProps {
  post: Post | null;
  currentUserId: string;
  onClose: () => void;
  onCommentAdded?: () => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  post,
  currentUserId,
  onClose,
  onCommentAdded,
}) => {
  const { resolvedDark } = useTheme();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (post) {
      setComments(storageService.getComments(post.id));
    }
  }, [post]);

  if (!post) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const created = storageService.addComment(post.id, newComment.trim());
    setComments(prev => [...prev, created]);
    setNewComment('');
    setIsSubmitting(false);
    onCommentAdded?.();
  };

  const handleDelete = (commentId: string) => {
    if (window.confirm('Delete this comment?')) {
      storageService.deleteComment(post.id, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      onCommentAdded?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex flex-col justify-end backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`w-full max-h-[80vh] flex flex-col rounded-t-3xl shadow-2xl transition-transform ${
          resolvedDark ? 'bg-[#111418] text-[#E2E2E6] border border-slate-800' : 'bg-[#FDFBFF] text-[#1A1C1E] border border-[#E0E2EC]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="w-12 h-1.5 rounded-full bg-[#74777F]/30 mx-auto mt-3 mb-1" />

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-2.5 border-b ${
          resolvedDark ? 'border-slate-800' : 'border-[#F0F2F5]'
        }`}>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-[#1A1C1E] dark:text-[#E2E2E6]">Comments</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#D1E4FF] text-[#001D36] dark:bg-[#00497D] dark:text-[#D1E4FF] font-semibold">
              {comments.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#74777F] hover:text-[#1A1C1E] dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Post snippet */}
        <div className={`px-5 py-2.5 text-xs border-b ${
          resolvedDark ? 'bg-[#18202D] border-slate-800 text-slate-300' : 'bg-[#F0F2F5] border-[#F0F2F5] text-[#535F70]'
        }`}>
          <span className="font-semibold text-[#0061A4] dark:text-[#9ECAFF]">@{post.user?.username}: </span>
          <span className="line-clamp-2">{post.content || 'Photo post'}</span>
        </div>

        {/* Comment List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-[#F0F2F5] dark:divide-slate-800/40">
          {comments.length === 0 ? (
            <div className="py-12 text-center text-[#74777F] dark:text-slate-400 text-sm">
              <p>No comments yet.</p>
              <p className="text-xs text-[#74777F] dark:text-slate-500 mt-1">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="pt-3 first:pt-0 flex items-start gap-3">
                <img
                  src={c.user?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt={c.user?.username}
                  className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-[#E0E2EC] dark:border-slate-700/50"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-[#1A1C1E] dark:text-[#E2E2E6]">
                        {c.user?.displayName || c.user?.username}
                      </span>
                      <span className="text-[11px] text-[#535F70] dark:text-slate-400">
                        @{c.user?.username} · {formatTimeAgo(c.createdAt)}
                      </span>
                    </div>
                    {c.userId === currentUserId && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-[#74777F] hover:text-rose-500 p-1"
                        title="Delete comment"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm mt-0.5 text-[#1A1C1E] dark:text-[#C4C7C5] whitespace-pre-wrap break-words">
                    {c.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add comment input bar */}
        <form
          onSubmit={handleSubmit}
          className={`p-3 border-t flex items-center gap-2 ${
            resolvedDark ? 'border-slate-800 bg-[#111418]' : 'border-[#F0F2F5] bg-[#FDFBFF]'
          }`}
        >
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className={`flex-1 px-4 py-2 rounded-full text-sm outline-none transition-colors border ${
              resolvedDark
                ? 'bg-[#18202E] text-slate-100 placeholder-slate-500 border-slate-700 focus:border-[#9ECAFF]'
                : 'bg-[#F0F2F5] text-[#1A1C1E] placeholder-[#74777F] border-[#E0E2EC] focus:border-[#0061A4]'
            }`}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="p-2.5 rounded-full bg-[#0061A4] hover:bg-[#00518A] disabled:opacity-40 text-white transition-transform active:scale-95 shadow-xs flex items-center justify-center shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
