import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Bookmark, 
  Share2, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  UserX, 
  Check,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Post } from '../types';
import { formatTimeAgo } from '../utils/themeTokens';
import { useTheme } from '../context/ThemeContext';
import { storageService } from '../services/storageService';

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onOpenComments: (post: Post) => void;
  onSelectHashtag: (tag: string) => void;
  onOpenProfile: (userId: string) => void;
  onEditPost: (post: Post) => void;
  onReport: (post: Post) => void;
  onBlock: (userId: string, username: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onOpenComments,
  onSelectHashtag,
  onOpenProfile,
  onEditPost,
  onReport,
  onBlock,
}) => {
  const { resolvedDark } = useTheme();
  const [isLiked, setIsLiked] = useState(post.isLikedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isReposted, setIsReposted] = useState(post.isRepostedByMe);
  const [repostCount, setRepostCount] = useState(post.repostCount);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarkedByMe);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const isOwnPost = post.userId === currentUserId;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikeCount(prev => Math.max(0, prev + (nextState ? 1 : -1)));

    if (nextState) {
      // Gentle mini confetti burst for like feedback
      try {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;
        confetti({
          particleCount: 18,
          spread: 40,
          origin: { x, y },
          colors: ['#EF4444', '#F43F5E', '#FB7185'],
          disableForReducedMotion: true,
        });
      } catch (_) {}
    }

    storageService.toggleLike(post.id);
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isReposted;
    setIsReposted(nextState);
    setRepostCount(prev => Math.max(0, prev + (nextState ? 1 : -1)));
    storageService.toggleRepost(post.id);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    storageService.toggleBookmark(post.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `Check out this post on ReTwitter: ${post.content || ''}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ReTwitter Post',
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch (_) {}
    }
    // Fallback: clipboard copy
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const renderContentWithTags = (content?: string) => {
    if (!content) return null;
    const parts = content.split(/(#[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              onSelectHashtag(part);
            }}
            className="text-[#0061A4] dark:text-[#9ECAFF] hover:underline font-medium inline-block mx-0.5"
          >
            {part}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      <article
        className={`px-4 py-3.5 border-b transition-colors relative ${
          resolvedDark
            ? 'bg-[#111418] border-slate-800/80 hover:bg-[#161B22]'
            : 'bg-[#FFFFFF] border-[#F0F2F5] hover:bg-slate-50/70'
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <button
            onClick={() => onOpenProfile(post.userId)}
            className="shrink-0 focus:outline-none focus:ring-2 focus:ring-[#0061A4] rounded-full transition-transform active:scale-95"
          >
            {post.user?.profilePhoto ? (
              <img
                src={post.user.profilePhoto}
                alt={post.user.username}
                className="w-10 h-10 rounded-full object-cover border border-[#E0E2EC] dark:border-slate-700/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#0061A4] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                {(post.user?.displayName || post.user?.username || 'U')[0].toUpperCase()}
              </div>
            )}
          </button>

          {/* Post Body */}
          <div className="flex-1 min-w-0">
            {/* Header: User & timestamp & 3-dots */}
            <div className="flex items-center justify-between">
              <div
                onClick={() => onOpenProfile(post.userId)}
                className="flex items-center gap-1.5 cursor-pointer truncate"
              >
                <span className="font-bold text-[14px] text-[#1A1C1E] dark:text-[#E2E2E6] truncate">
                  {post.user?.displayName || post.user?.username || 'User'}
                </span>
                <span className="text-[#535F70] dark:text-slate-400 text-xs truncate">
                  @{post.user?.username || 'anonymous'}
                </span>
                <span className="text-slate-400 text-xs">·</span>
                <span className="text-[#74777F] dark:text-slate-400 text-xs shrink-0">
                  {formatTimeAgo(post.createdAt)}
                </span>
              </div>

              {/* Action Menu button */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-500/15 transition-colors"
                  aria-label="Post actions"
                >
                  <MoreVertical size={16} />
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div
                    className={`absolute right-0 top-7 w-44 rounded-xl shadow-2xl py-1.5 z-40 border transition-all text-xs font-medium ${
                      resolvedDark
                        ? 'bg-[#18202D] border-slate-700 text-slate-200'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isOwnPost ? (
                      <>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            onEditPost(post);
                          }}
                          className="w-full px-3 py-2 flex items-center gap-2 hover:bg-sky-500/15 hover:text-sky-400 transition-colors text-left"
                        >
                          <Edit3 size={14} />
                          <span>Edit post</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            if (window.confirm('Delete this post?')) {
                              storageService.deletePost(post.id);
                            }
                          }}
                          className="w-full px-3 py-2 flex items-center gap-2 hover:bg-rose-500/15 text-rose-400 transition-colors text-left"
                        >
                          <Trash2 size={14} />
                          <span>Delete post</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            onBlock(post.userId, post.user?.username || 'user');
                          }}
                          className="w-full px-3 py-2 flex items-center gap-2 hover:bg-rose-500/15 text-rose-400 transition-colors text-left"
                        >
                          <UserX size={14} />
                          <span>Block @{post.user?.username}</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            onReport(post);
                          }}
                          className="w-full px-3 py-2 flex items-center gap-2 hover:bg-amber-500/15 text-amber-400 transition-colors text-left"
                        >
                          <ShieldAlert size={14} />
                          <span>Report post</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Post Content */}
            {post.content && (
              <p className="mt-1 text-[14.5px] leading-snug break-words whitespace-pre-wrap text-[#1A1C1E] dark:text-[#E2E2E6]">
                {renderContentWithTags(post.content)}
              </p>
            )}

            {/* Post Image with 12px radius */}
            {post.imageUrl && (
              <div className="mt-2.5 rounded-[12px] overflow-hidden border border-[#E0E2EC] dark:border-slate-800 max-h-80 bg-[#E5E7EB] dark:bg-slate-900/40">
                <img
                  src={post.imageUrl}
                  alt="Post attachment"
                  className="w-full h-auto max-h-80 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowImageModal(true);
                  }}
                  loading="lazy"
                />
              </div>
            )}

            {/* Action Bar (Comments, Reposts, Likes, Bookmarks, Share) */}
            <div className="flex items-center justify-between mt-3 text-[#74777F] dark:text-slate-400 text-xs">
              {/* Comment */}
              <button
                onClick={() => onOpenComments(post)}
                className="flex items-center gap-1.5 group p-1 -ml-1 hover:text-[#0061A4] dark:hover:text-[#9ECAFF] transition-colors"
                title="Comment"
              >
                <div className="p-1.5 rounded-full group-hover:bg-[#D1E4FF]/30 dark:group-hover:bg-[#00497D]/30">
                  <MessageCircle size={17} />
                </div>
                <span>{post.commentCount > 0 ? post.commentCount : ''}</span>
              </button>

              {/* Repost */}
              <button
                onClick={handleRepost}
                className={`flex items-center gap-1.5 group p-1 transition-colors ${
                  isReposted ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'hover:text-emerald-500'
                }`}
                title="Repost"
              >
                <div className="p-1.5 rounded-full group-hover:bg-emerald-500/10">
                  <Repeat2 size={18} className={isReposted ? 'stroke-[2.5]' : ''} />
                </div>
                <span>{repostCount > 0 ? repostCount : ''}</span>
              </button>

              {/* Like */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 group p-1 transition-colors ${
                  isLiked ? 'text-rose-500 font-bold' : 'hover:text-rose-400'
                }`}
                title="Like"
              >
                <div className="p-1.5 rounded-full group-hover:bg-rose-500/10">
                  <Heart
                    size={17}
                    className={`transition-transform duration-200 active:scale-125 ${
                      isLiked ? 'fill-rose-500 text-rose-500' : ''
                    }`}
                  />
                </div>
                <span>{likeCount > 0 ? likeCount : ''}</span>
              </button>

              {/* Bookmark */}
              <button
                onClick={handleBookmark}
                className={`flex items-center gap-1.5 group p-1 transition-colors ${
                  isBookmarked ? 'text-[#0061A4] dark:text-[#9ECAFF]' : 'hover:text-[#0061A4] dark:hover:text-[#9ECAFF]'
                }`}
                title="Bookmark"
              >
                <div className="p-1.5 rounded-full group-hover:bg-[#D1E4FF]/30 dark:group-hover:bg-[#00497D]/30">
                  <Bookmark
                    size={17}
                    className={isBookmarked ? 'fill-[#0061A4] dark:fill-[#9ECAFF] text-[#0061A4] dark:text-[#9ECAFF]' : ''}
                  />
                </div>
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 group p-1 hover:text-[#1A1C1E] dark:hover:text-slate-200 transition-colors relative"
                title="Share post"
              >
                <div className="p-1.5 rounded-full group-hover:bg-slate-500/10">
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={17} />}
                </div>
                {copied && (
                  <span className="absolute -top-7 right-0 text-[10px] bg-[#1A1C1E] text-white px-2 py-0.5 rounded shadow whitespace-nowrap">
                    Link copied!
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Image Lightbox Preview */}
      {showImageModal && post.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-2xl max-h-[85vh]">
            <img
              src={post.imageUrl}
              alt="Expanded view"
              className="w-full h-full object-contain rounded-xl shadow-2xl"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white p-2 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};
