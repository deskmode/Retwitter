import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Edit3, 
  LogOut, 
  LogIn, 
  MessageSquare, 
  UserX, 
  ShieldAlert,
  Grid,
  Heart,
  FileText
} from 'lucide-react';
import { UserProfile, Post } from '../types';
import { storageService } from '../services/storageService';
import { PostCard } from '../components/PostCard';
import { useTheme } from '../context/ThemeContext';

interface ProfileViewProps {
  currentUser: UserProfile;
  profileUserId?: string;
  onOpenEditProfile: () => void;
  onOpenAuth: () => void;
  onOpenDirectChat: (otherUserId: string) => void;
  onOpenComments: (post: Post) => void;
  onSelectHashtag: (tag: string) => void;
  onOpenProfile: (userId: string) => void;
  onEditPost: (post: Post) => void;
  onReport: (post: Post) => void;
  onBlock: (userId: string, username: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  profileUserId,
  onOpenEditProfile,
  onOpenAuth,
  onOpenDirectChat,
  onOpenComments,
  onSelectHashtag,
  onOpenProfile,
  onEditPost,
  onReport,
  onBlock,
}) => {
  const { resolvedDark } = useTheme();
  const targetId = profileUserId || currentUser.id;
  const isSelf = targetId === currentUser.id;

  const [profile, setProfile] = useState<UserProfile>(() => {
    if (isSelf) return currentUser;
    const found = storageService.getAllUsers().find(u => u.id === targetId);
    return found || currentUser;
  });

  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'likes'>('posts');
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(profile.isFollowing || false);

  const loadProfileData = () => {
    if (isSelf) {
      const cur = storageService.getCurrentUser();
      setProfile(cur);
    } else {
      const found = storageService.getAllUsers().find(u => u.id === targetId);
      if (found) {
        setProfile(found);
        setIsFollowing(found.isFollowing || false);
      }
    }

    const { posts } = storageService.getFeed({ userId: targetId, limit: 50 });
    setUserPosts(posts);
  };

  useEffect(() => {
    loadProfileData();
    const unsub = storageService.subscribe('profile', loadProfileData);
    const unsubPosts = storageService.subscribe('posts', loadProfileData);
    return () => {
      unsub();
      unsubPosts();
    };
  }, [targetId, isSelf]);

  const handleFollowToggle = () => {
    const next = storageService.toggleFollow(profile.id);
    setIsFollowing(next);
    setProfile(prev => ({
      ...prev,
      followersCount: Math.max(0, prev.followersCount + (next ? 1 : -1))
    }));
  };

  const handleSignOut = () => {
    if (window.confirm('Sign out of your session?')) {
      storageService.loginWithGuest();
    }
  };

  const displayedPosts = activeTab === 'posts'
    ? userPosts
    : activeTab === 'media'
    ? userPosts.filter(p => p.imageUrl)
    : userPosts.filter(p => p.isLikedByMe);

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-y-auto">
      {/* Banner */}
      <div className="h-28 w-full bg-gradient-to-r from-[#0061A4] via-[#0B72BD] to-[#1A82D2] relative shrink-0">
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Profile Header & Stats */}
      <div className={`px-4 pb-4 border-b shrink-0 transition-colors ${
        resolvedDark ? 'bg-[#111418] border-slate-800' : 'bg-[#FDFBFF] border-[#F0F2F5]'
      }`}>
        {/* Avatar and Action Buttons row */}
        <div className="flex items-end justify-between -mt-10 mb-3">
          <div className="relative">
            <img
              src={profile.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
              alt={profile.username}
              className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-[#111418] shadow-lg"
            />
          </div>

          <div className="flex items-center gap-2">
            {isSelf ? (
              <>
                <button
                  onClick={onOpenEditProfile}
                  className="px-3.5 py-1.5 rounded-full border border-[#74777F]/60 hover:bg-[#F0F2F5] dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all text-[#1A1C1E] dark:text-[#E2E2E6]"
                >
                  <Edit3 size={13} />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={onOpenAuth}
                  className="p-2 rounded-full border border-[#74777F]/60 hover:bg-[#F0F2F5] dark:hover:bg-slate-800 text-[#535F70] dark:text-slate-300 transition-colors"
                  title="Switch accounts / Login"
                >
                  <LogIn size={15} />
                </button>

                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-full border border-[#74777F]/60 hover:bg-rose-500/15 hover:border-rose-500 text-rose-500 transition-colors"
                  title="Sign out"
                >
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onOpenDirectChat(profile.id)}
                  className="p-2 rounded-full border border-[#74777F]/60 hover:bg-[#D1E4FF]/30 text-[#0061A4] dark:text-[#9ECAFF]"
                  title={`Direct Message @${profile.username}`}
                >
                  <MessageSquare size={16} />
                </button>

                <button
                  onClick={handleFollowToggle}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 shadow-xs ${
                    isFollowing
                      ? 'border border-[#74777F] text-[#535F70] dark:text-slate-300 hover:border-rose-500 hover:text-rose-500'
                      : 'bg-[#0061A4] text-white hover:bg-[#00518A]'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>

                <button
                  onClick={() => onBlock(profile.id, profile.username)}
                  className="p-2 rounded-full border border-[#74777F]/60 hover:bg-rose-500/15 text-rose-500"
                  title="Block user"
                >
                  <UserX size={15} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* User identification */}
        <div>
          <h2 className="font-extrabold text-lg text-[#1A1C1E] dark:text-[#E2E2E6] leading-tight">
            {profile.displayName || profile.username}
          </h2>
          <p className="text-xs text-[#535F70] dark:text-slate-400">@{profile.username}</p>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-2.5 text-xs text-[#1A1C1E] dark:text-[#C4C7C5] leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Metadata (Joined date) */}
        <div className="flex items-center gap-4 mt-3 text-xs text-[#74777F] dark:text-slate-400">
          <div className="flex items-center gap-1">
            <Calendar size={13} />
            <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Followers / Following counts */}
        <div className="flex items-center gap-4 mt-3 text-xs">
          <div>
            <strong className="text-[#1A1C1E] dark:text-[#E2E2E6] font-bold">{profile.followingCount}</strong>{' '}
            <span className="text-[#74777F] dark:text-slate-400">Following</span>
          </div>
          <div>
            <strong className="text-[#1A1C1E] dark:text-[#E2E2E6] font-bold">{profile.followersCount}</strong>{' '}
            <span className="text-[#74777F] dark:text-slate-400">Followers</span>
          </div>
        </div>
      </div>

      {/* Tabs: Posts, Media, Likes */}
      <div className={`flex items-center border-b shrink-0 text-xs font-bold transition-colors ${
        resolvedDark ? 'bg-[#111418] border-slate-800' : 'bg-[#FDFBFF] border-[#F0F2F5]'
      }`}>
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-3 text-center transition-colors relative flex items-center justify-center gap-1.5 ${
            activeTab === 'posts' ? 'text-[#0061A4] dark:text-[#9ECAFF]' : 'text-[#74777F] dark:text-slate-400 hover:text-[#1A1C1E] dark:hover:text-slate-200'
          }`}
        >
          <FileText size={14} />
          <span>Posts ({userPosts.length})</span>
          {activeTab === 'posts' && (
            <div className="absolute bottom-0 inset-x-6 h-0.5 bg-[#0061A4] dark:bg-[#9ECAFF] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-3 text-center transition-colors relative flex items-center justify-center gap-1.5 ${
            activeTab === 'media' ? 'text-[#0061A4] dark:text-[#9ECAFF]' : 'text-[#74777F] dark:text-slate-400 hover:text-[#1A1C1E] dark:hover:text-slate-200'
          }`}
        >
          <Grid size={14} />
          <span>Media</span>
          {activeTab === 'media' && (
            <div className="absolute bottom-0 inset-x-6 h-0.5 bg-[#0061A4] dark:bg-[#9ECAFF] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('likes')}
          className={`flex-1 py-3 text-center transition-colors relative flex items-center justify-center gap-1.5 ${
            activeTab === 'likes' ? 'text-[#0061A4] dark:text-[#9ECAFF]' : 'text-[#74777F] dark:text-slate-400 hover:text-[#1A1C1E] dark:hover:text-slate-200'
          }`}
        >
          <Heart size={14} />
          <span>Likes</span>
          {activeTab === 'likes' && (
            <div className="absolute bottom-0 inset-x-6 h-0.5 bg-[#0061A4] dark:bg-[#9ECAFF] rounded-full" />
          )}
        </button>
      </div>

      {/* Posts list */}
      <div className="flex-1 divide-y divide-slate-800/30">
        {displayedPosts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No {activeTab} yet to show for @{profile.username}.
          </div>
        ) : (
          displayedPosts.map((post) => (
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
      </div>
    </div>
  );
};
