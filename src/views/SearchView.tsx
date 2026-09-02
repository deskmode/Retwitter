import React, { useState, useEffect } from 'react';
import { Search, X, TrendingUp, Users, Hash, Check } from 'lucide-react';
import { HashtagTrend, UserProfile, Post } from '../types';
import { storageService } from '../services/storageService';
import { useTheme } from '../context/ThemeContext';
import { PostCard } from '../components/PostCard';

interface SearchViewProps {
  currentUser: UserProfile;
  initialTag?: string;
  onOpenComments: (post: Post) => void;
  onOpenProfile: (userId: string) => void;
  onEditPost: (post: Post) => void;
  onReport: (post: Post) => void;
  onBlock: (userId: string, username: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  currentUser,
  initialTag,
  onOpenComments,
  onOpenProfile,
  onEditPost,
  onReport,
  onBlock,
}) => {
  const { resolvedDark } = useTheme();
  const [query, setQuery] = useState(initialTag || '');
  const [trends, setTrends] = useState<HashtagTrend[]>([]);
  const [matchedUsers, setMatchedUsers] = useState<UserProfile[]>([]);
  const [matchedPosts, setMatchedPosts] = useState<Post[]>([]);
  const [searchTab, setSearchTab] = useState<'trends' | 'users' | 'posts'>('trends');

  useEffect(() => {
    setTrends(storageService.getTrends());
  }, []);

  useEffect(() => {
    if (initialTag) {
      setQuery(initialTag);
      setSearchTab('posts');
    }
  }, [initialTag]);

  useEffect(() => {
    if (!query.trim()) {
      setMatchedUsers([]);
      setMatchedPosts([]);
      if (!initialTag) setSearchTab('trends');
      return;
    }

    const cleanQuery = query.toLowerCase().trim();
    // Search users
    const users = storageService.getAllUsers().filter(
      u => u.username.toLowerCase().includes(cleanQuery) || u.displayName.toLowerCase().includes(cleanQuery)
    );
    setMatchedUsers(users);

    // Search posts
    const { posts } = storageService.getFeed({
      searchQuery: cleanQuery,
      limit: 25,
    });
    setMatchedPosts(posts);

    if (searchTab === 'trends') {
      setSearchTab('posts');
    }
  }, [query]);

  const handleFollowToggle = (userId: string) => {
    storageService.toggleFollow(userId);
    // Refresh user list
    const users = storageService.getAllUsers().filter(
      u => u.username.toLowerCase().includes(query.toLowerCase()) || u.displayName.toLowerCase().includes(query.toLowerCase())
    );
    setMatchedUsers(users);
  };

  const handleSelectTrend = (tag: string) => {
    setQuery(tag);
    setSearchTab('posts');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
      {/* Search Header */}
      <header className={`p-3 border-b shrink-0 transition-colors ${
        resolvedDark ? 'bg-[#111418] border-slate-800' : 'bg-[#FDFBFF] border-[#F0F2F5]'
      }`}>
        <div className="relative flex items-center">
          <Search size={17} className="absolute left-3.5 text-[#74777F] dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search ReTwitter, #hashtags, @users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`w-full pl-10 pr-9 py-2 rounded-full text-xs outline-none border transition-colors ${
              resolvedDark
                ? 'bg-[#18202D] border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#9ECAFF]'
                : 'bg-[#F0F2F5] border-[#E0E2EC] text-[#1A1C1E] placeholder-[#74777F] focus:border-[#0061A4]'
            }`}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 p-1 text-[#74777F] hover:text-[#1A1C1E] dark:hover:text-slate-200"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 mt-2.5 px-1 text-xs">
          <button
            onClick={() => setSearchTab('trends')}
            className={`flex-1 py-1.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-1 ${
              searchTab === 'trends'
                ? resolvedDark
                  ? 'bg-[#00497D] text-[#D1E4FF] border border-[#00497D]'
                  : 'bg-[#D1E4FF] text-[#001D36] border border-[#D1E4FF]'
                : 'text-[#74777F] dark:text-slate-400 hover:text-[#1A1C1E] dark:hover:text-slate-200'
            }`}
          >
            <TrendingUp size={13} />
            <span>Trending</span>
          </button>
          <button
            onClick={() => setSearchTab('posts')}
            className={`flex-1 py-1.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-1 ${
              searchTab === 'posts'
                ? resolvedDark
                  ? 'bg-[#00497D] text-[#D1E4FF] border border-[#00497D]'
                  : 'bg-[#D1E4FF] text-[#001D36] border border-[#D1E4FF]'
                : 'text-[#74777F] dark:text-slate-400 hover:text-[#1A1C1E] dark:hover:text-slate-200'
            }`}
          >
            <Hash size={13} />
            <span>Posts ({matchedPosts.length})</span>
          </button>
          <button
            onClick={() => setSearchTab('users')}
            className={`flex-1 py-1.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-1 ${
              searchTab === 'users'
                ? resolvedDark
                  ? 'bg-[#00497D] text-[#D1E4FF] border border-[#00497D]'
                  : 'bg-[#D1E4FF] text-[#001D36] border border-[#D1E4FF]'
                : 'text-[#74777F] dark:text-slate-400 hover:text-[#1A1C1E] dark:hover:text-slate-200'
            }`}
          >
            <Users size={13} />
            <span>Users ({matchedUsers.length})</span>
          </button>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#F0F2F5] dark:divide-slate-800/40">
        {/* Trending Hashtags Tab */}
        {searchTab === 'trends' && (
          <div className="p-3 space-y-1">
            <h3 className="text-xs font-bold text-[#74777F] dark:text-slate-400 uppercase tracking-wider px-2 py-1">
              Trends for you
            </h3>
            {trends.map((t, idx) => (
              <div
                key={t.tag}
                onClick={() => handleSelectTrend(t.tag)}
                className={`p-3 rounded-2xl cursor-pointer transition-colors flex items-center justify-between ${
                  resolvedDark ? 'hover:bg-slate-800/40' : 'hover:bg-[#F0F2F5]'
                }`}
              >
                <div>
                  <span className="text-[11px] text-[#535F70] dark:text-slate-500">{idx + 1} · {t.category}</span>
                  <p className="font-bold text-sm text-[#0061A4] dark:text-[#9ECAFF]">{t.tag}</p>
                  <span className="text-xs text-[#74777F] dark:text-slate-400">
                    {t.postCount.toLocaleString()} posts
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#D1E4FF]/40 dark:bg-[#00497D]/40 flex items-center justify-center text-[#0061A4] dark:text-[#9ECAFF]">
                  <TrendingUp size={16} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Matched Users Tab */}
        {searchTab === 'users' && (
          <div className="p-3 space-y-2">
            {matchedUsers.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No users found matching "{query}"
              </div>
            ) : (
              matchedUsers.map((u) => (
                <div
                  key={u.id}
                  className={`p-3 rounded-2xl flex items-center justify-between transition-colors ${
                    resolvedDark ? 'hover:bg-slate-800/30' : 'hover:bg-[#F0F2F5]'
                  }`}
                >
                  <div
                    onClick={() => onOpenProfile(u.id)}
                    className="flex items-center gap-3 cursor-pointer min-w-0"
                  >
                    <img
                      src={u.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={u.username}
                      className="w-10 h-10 rounded-full object-cover border border-[#E0E2EC] dark:border-slate-700/40"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[#1A1C1E] dark:text-[#E2E2E6] truncate">{u.displayName}</p>
                      <p className="text-[11px] text-[#535F70] dark:text-slate-400 truncate">@{u.username}</p>
                      {u.bio && (
                        <p className="text-xs text-[#74777F] dark:text-slate-400 line-clamp-1 mt-0.5">{u.bio}</p>
                      )}
                    </div>
                  </div>

                  {u.id !== currentUser.id && (
                    <button
                      onClick={() => handleFollowToggle(u.id)}
                      className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all active:scale-95 shrink-0 ${
                        u.isFollowing
                          ? 'border border-[#74777F] text-[#535F70] dark:text-slate-300 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500'
                          : 'bg-[#0061A4] text-white hover:bg-[#00518A] shadow-xs'
                      }`}
                    >
                      {u.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Matched Posts Tab */}
        {searchTab === 'posts' && (
          <div>
            {matchedPosts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No posts found for "{query}". Try another term or hashtag!
              </div>
            ) : (
              matchedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUser.id}
                  onOpenComments={onOpenComments}
                  onSelectHashtag={(tag) => setQuery(tag)}
                  onOpenProfile={onOpenProfile}
                  onEditPost={onEditPost}
                  onReport={onReport}
                  onBlock={onBlock}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
