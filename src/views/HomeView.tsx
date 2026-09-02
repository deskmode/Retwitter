import React, { useState, useEffect, useRef } from 'react';
import { 
  RefreshCw, 
  WifiOff, 
  Wifi, 
  MessageSquare, 
  FileCode, 
  Sun, 
  Moon, 
  Plus, 
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { Post, UserProfile } from '../types';
import { PostCard } from '../components/PostCard';
import { storageService } from '../services/storageService';
import { useTheme } from '../context/ThemeContext';
import { getTonalColors } from '../utils/themeTokens';

interface HomeViewProps {
  currentUser: UserProfile;
  unreadMessagesCount: number;
  onOpenMessages: () => void;
  onOpenCodeExplorer: () => void;
  onOpenComments: (post: Post) => void;
  onOpenCreatePost: () => void;
  onOpenProfile: (userId: string) => void;
  onSelectHashtag: (tag: string) => void;
  onEditPost: (post: Post) => void;
  onReport: (post: Post) => void;
  onBlock: (userId: string, username: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentUser,
  unreadMessagesCount,
  onOpenMessages,
  onOpenCodeExplorer,
  onOpenComments,
  onOpenCreatePost,
  onOpenProfile,
  onSelectHashtag,
  onEditPost,
  onReport,
  onBlock,
}) => {
  const { resolvedDark, setMode, mode, colorSeed } = useTheme();
  const colors = getTonalColors(colorSeed, resolvedDark);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(storageService.isOfflineMode());
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  const loadFeed = () => {
    const res = storageService.getFeed({
      hashtag: filterTag || undefined,
      limit: 30,
    });
    setPosts(res.posts);
    setAllUsers(storageService.getAllUsers());
  };

  useEffect(() => {
    loadFeed();
    const unsubPosts = storageService.subscribe('posts', loadFeed);
    const unsubUsers = storageService.subscribe('users', loadFeed);
    const unsubModeration = storageService.subscribe('moderation', loadFeed);
    return () => {
      unsubPosts();
      unsubUsers();
      unsubModeration();
    };
  }, [filterTag]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadFeed();
      setIsRefreshing(false);
    }, 600);
  };

  const toggleOffline = () => {
    const next = !isOffline;
    setIsOffline(next);
    storageService.setOfflineMode(next);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
      {/* Material Design 3 Top App Bar */}
      <header
        className={`h-14 px-4 flex items-center justify-between border-b shrink-0 z-20 transition-colors ${
          resolvedDark ? 'bg-[#111418] border-slate-800 text-[#E2E2E6]' : 'bg-[#FDFBFF] border-[#F0F2F5] text-[#1A1C1E]'
        }`}
      >
        {/* Left: User Avatar */}
        <button
          onClick={() => onOpenProfile(currentUser.id)}
          className="relative focus:outline-none ring-2 ring-transparent hover:ring-[#0061A4]/30 rounded-full transition-all"
          title="Open your profile"
        >
          <img
            src={currentUser.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt="My Profile"
            className="w-8 h-8 rounded-full object-cover border border-[#E0E2EC] dark:border-slate-700/50"
          />
        </button>

        {/* Center: Brand */}
        <div className="flex items-center gap-2 font-bold tracking-tight text-base select-none cursor-pointer" onClick={handleRefresh}>
          <div className="w-7 h-7 rounded-lg bg-[#0061A4] text-white flex items-center justify-center font-black text-sm shadow-2xs">
            R
          </div>
          <span className="text-[#1A1C1E] dark:text-white font-extrabold tracking-tight">ReTwitter</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          {/* Offline Cache Simulator Toggle */}
          <button
            onClick={toggleOffline}
            className={`p-2 rounded-full transition-colors ${
              isOffline ? 'text-amber-500 bg-amber-500/15' : 'text-[#74777F] dark:text-slate-400 hover:text-[#1A1C1E] dark:hover:text-slate-200'
            }`}
            title={isOffline ? 'Offline mode ON (serving SQLite cache)' : 'Network Connected'}
          >
            {isOffline ? <WifiOff size={17} /> : <Wifi size={17} />}
          </button>

          {/* Flutter Code Explorer */}
          <button
            onClick={onOpenCodeExplorer}
            className="p-2 rounded-full text-[#74777F] dark:text-slate-400 hover:text-[#0061A4] dark:hover:text-[#9ECAFF] hover:bg-[#D1E4FF]/30 transition-colors"
            title="Inspect Flutter & Supabase Code"
          >
            <FileCode size={18} />
          </button>

          {/* Direct Messages Shortcut */}
          <button
            onClick={onOpenMessages}
            className="p-2 rounded-full text-[#74777F] dark:text-slate-400 hover:text-[#0061A4] dark:hover:text-[#9ECAFF] hover:bg-[#D1E4FF]/30 transition-colors relative"
            title="Direct Messages"
          >
            <MessageSquare size={18} />
            {unreadMessagesCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#0061A4] dark:bg-[#9ECAFF]" />
            )}
          </button>

          {/* Theme Mode Toggle */}
          <button
            onClick={() => setMode(resolvedDark ? 'light' : 'dark')}
            className="p-2 rounded-full text-[#74777F] dark:text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={resolvedDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
          >
            {resolvedDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-1.5 text-xs text-amber-500 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <WifiOff size={13} />
            <span>Serving cached feed via SQLite (Offline Mode)</span>
          </div>
          <button
            onClick={toggleOffline}
            className="underline font-semibold hover:text-amber-600"
          >
            Go Online
          </button>
        </div>
      )}

      {/* Active Users / Community Stories Bar */}
      <div className={`py-2.5 px-3 border-b overflow-x-auto flex items-center gap-3 shrink-0 scrollbar-none ${
        resolvedDark ? 'bg-[#151922] border-slate-800' : 'bg-[#FDFBFF] border-[#F0F2F5]'
      }`}>
        {/* Your Story / Create Post prompt */}
        <button
          onClick={onOpenCreatePost}
          className="flex flex-col items-center space-y-1 shrink-0 group focus:outline-none"
        >
          <div className="relative w-12 h-12 rounded-full p-0.5 border-2 border-dashed border-[#0061A4] dark:border-[#9ECAFF] flex items-center justify-center">
            <img
              src={currentUser.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt="You"
              className="w-full h-full rounded-full object-cover"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#0061A4] dark:bg-[#9ECAFF] text-white dark:text-[#001D36] flex items-center justify-center shadow-xs">
              <Plus size={11} className="stroke-[3]" />
            </div>
          </div>
          <span className="text-[10px] text-[#535F70] dark:text-slate-400 truncate max-w-[54px]">You</span>
        </button>

        {/* Other Users */}
        {allUsers.filter(u => u.id !== currentUser.id).map(user => (
          <button
            key={user.id}
            onClick={() => onOpenProfile(user.id)}
            className="flex flex-col items-center space-y-1 shrink-0 group focus:outline-none"
          >
            <div className="w-12 h-12 rounded-full p-0.5 ring-2 ring-[#0061A4]/40 hover:ring-[#0061A4] transition-all">
              <img
                src={user.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                alt={user.username}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span className="text-[10px] text-[#535F70] dark:text-slate-300 group-hover:text-[#0061A4] dark:group-hover:text-[#9ECAFF] truncate max-w-[54px]">
              @{user.username}
            </span>
          </button>
        ))}
      </div>

      {/* Filter indicator if filtered by hashtag */}
      {filterTag && (
        <div className="px-4 py-2 bg-sky-500/10 border-b border-sky-500/20 flex items-center justify-between text-xs text-sky-400">
          <span>Filtering posts by <strong>{filterTag}</strong></span>
          <button
            onClick={() => setFilterTag(null)}
            className="hover:underline font-semibold"
          >
            Clear
          </button>
        </div>
      )}

      {/* Post Feed List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/20 scrollbar-none">
        {/* Pull-to-refresh status */}
        {isRefreshing && (
          <div className="py-2.5 text-center text-xs text-sky-400 flex items-center justify-center gap-1.5 animate-pulse">
            <RefreshCw size={13} className="animate-spin" />
            <span>Refreshing feed...</span>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <p className="text-sm font-medium">No posts in your feed.</p>
            <p className="text-xs text-slate-500">Tap below to compose your first post on ReTwitter!</p>
            <button
              onClick={onOpenCreatePost}
              className="mt-3 px-4 py-2 rounded-full bg-sky-500 text-white text-xs font-bold shadow-md"
            >
              Compose Post
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUser.id}
              onOpenComments={onOpenComments}
              onSelectHashtag={onSelectHashtag}
              onOpenProfile={onOpenProfile}
              onEditPost={onEditPost}
              onReport={onReport}
              onBlock={onBlock}
            />
          ))
        )}

        {/* End of feed indicator */}
        <div className="py-6 text-center text-slate-500 text-xs">
          <span>✓ You're all caught up</span>
        </div>
      </div>

      {/* Material 3 Floating Action Button (FAB) for Post Creation */}
      <button
        onClick={onOpenCreatePost}
        className={`absolute bottom-4 right-4 w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 hover:scale-105 z-30 shadow-[0_4px_8px_rgba(0,0,0,0.12)] ${
          resolvedDark
            ? 'bg-[#00497D] text-[#D1E4FF] hover:bg-[#005A99]'
            : 'bg-[#D1E4FF] text-[#001D36] hover:bg-[#BBD9FF]'
        }`}
        title="Compose new post"
      >
        <Plus size={26} className="stroke-[2.5]" />
      </button>
    </div>
  );
};
