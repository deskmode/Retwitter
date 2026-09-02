import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AndroidFrame } from './components/AndroidFrame';
import { MainNavigation } from './components/MainNavigation';
import { SplashScreen } from './components/SplashScreen';
import { CommentModal } from './components/CommentModal';
import { CreatePostModal } from './components/CreatePostModal';
import { ModerationModal } from './components/ModerationModal';
import { CodeExportModal } from './components/CodeExportModal';
import { AuthModal } from './components/AuthModal';
import { EditProfileModal } from './components/EditProfileModal';
import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { NotificationsView } from './views/NotificationsView';
import { ProfileView } from './views/ProfileView';
import { MessagesView } from './views/MessagesView';
import { storageService } from './services/storageService';
import { ActiveTab, Post, UserProfile } from './types';

function ReTwitterApp() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => storageService.getCurrentUser());
  const [showCodeExplorer, setShowCodeExplorer] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [commentingPost, setCommentingPost] = useState<Post | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Moderation modal state
  const [moderationState, setModerationState] = useState<{
    type: 'report' | 'block';
    post?: Post | null;
    targetUserId?: string;
    targetUsername?: string;
  } | null>(null);

  // Navigation payload states
  const [searchInitialTag, setSearchInitialTag] = useState<string | undefined>(undefined);
  const [selectedProfileId, setSelectedProfileId] = useState<string | undefined>(undefined);
  const [directChatUserId, setDirectChatUserId] = useState<string | undefined>(undefined);

  // Counters
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const refreshUserData = () => {
    setCurrentUser(storageService.getCurrentUser());
    const notifs = storageService.getNotifications();
    setUnreadNotifs(notifs.filter(n => !n.isRead).length);

    const msgs = storageService.getAllMessages();
    const curId = storageService.getCurrentUser().id;
    setUnreadMessages(msgs.filter(m => m.receiverId === curId && !m.isRead).length);
  };

  useEffect(() => {
    refreshUserData();
    const unsubAuth = storageService.subscribe('auth', refreshUserData);
    const unsubNotif = storageService.subscribe('notifications', refreshUserData);
    const unsubMsg = storageService.subscribe('messages', refreshUserData);
    return () => {
      unsubAuth();
      unsubNotif();
      unsubMsg();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTabChange = (tab: ActiveTab) => {
    if (tab === 'post') {
      setEditingPost(null);
      setShowCreatePost(true);
      return;
    }
    if (tab === 'profile') {
      setSelectedProfileId(currentUser.id);
    }
    setActiveTab(tab);
  };

  const handleOpenProfile = (userId: string) => {
    setSelectedProfileId(userId);
    setActiveTab('profile');
  };

  const handleSelectHashtag = (tag: string) => {
    setSearchInitialTag(tag);
    setActiveTab('search');
  };

  const handleOpenDirectChat = (otherUserId: string) => {
    setDirectChatUserId(otherUserId);
    setActiveTab('messages');
  };

  return (
    <AndroidFrame>
      {/* Optional Material 3 Splash Screen */}
      {showSplash && (
        <SplashScreen onDismiss={() => setShowSplash(false)} />
      )}

      {/* Main Screen Views */}
      <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        {activeTab === 'home' && (
          <HomeView
            currentUser={currentUser}
            unreadMessagesCount={unreadMessages}
            onOpenMessages={() => {
              setDirectChatUserId(undefined);
              setActiveTab('messages');
            }}
            onOpenCodeExplorer={() => setShowCodeExplorer(true)}
            onOpenComments={(post) => setCommentingPost(post)}
            onOpenCreatePost={() => {
              setEditingPost(null);
              setShowCreatePost(true);
            }}
            onOpenProfile={handleOpenProfile}
            onSelectHashtag={handleSelectHashtag}
            onEditPost={(post) => {
              setEditingPost(post);
              setShowCreatePost(true);
            }}
            onReport={(post) => {
              setModerationState({ type: 'report', post });
            }}
            onBlock={(userId, username) => {
              setModerationState({ type: 'block', targetUserId: userId, targetUsername: username });
            }}
          />
        )}

        {activeTab === 'search' && (
          <SearchView
            currentUser={currentUser}
            initialTag={searchInitialTag}
            onOpenComments={(post) => setCommentingPost(post)}
            onOpenProfile={handleOpenProfile}
            onEditPost={(post) => {
              setEditingPost(post);
              setShowCreatePost(true);
            }}
            onReport={(post) => {
              setModerationState({ type: 'report', post });
            }}
            onBlock={(userId, username) => {
              setModerationState({ type: 'block', targetUserId: userId, targetUsername: username });
            }}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsView
            onOpenProfile={handleOpenProfile}
            onOpenPostSnippet={(postId) => {
              const p = storageService.getAllPosts().find(item => item.id === postId);
              if (p) setCommentingPost(p);
            }}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            profileUserId={selectedProfileId}
            onOpenEditProfile={() => setShowEditProfile(true)}
            onOpenAuth={() => setShowAuthModal(true)}
            onOpenDirectChat={handleOpenDirectChat}
            onOpenComments={(post) => setCommentingPost(post)}
            onSelectHashtag={handleSelectHashtag}
            onOpenProfile={handleOpenProfile}
            onEditPost={(post) => {
              setEditingPost(post);
              setShowCreatePost(true);
            }}
            onReport={(post) => {
              setModerationState({ type: 'report', post });
            }}
            onBlock={(userId, username) => {
              setModerationState({ type: 'block', targetUserId: userId, targetUsername: username });
            }}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesView
            currentUser={currentUser}
            initialChatUserId={directChatUserId}
            onBackToHome={() => setActiveTab('home')}
            onOpenProfile={handleOpenProfile}
          />
        )}
      </div>

      {/* Material 3 Bottom Navigation Bar */}
      <MainNavigation
        activeTab={activeTab === 'messages' ? 'home' : activeTab}
        onSelectTab={handleTabChange}
        unreadCount={unreadNotifs}
      />

      {/* Comments Bottom Sheet Modal */}
      {commentingPost && (
        <CommentModal
          post={commentingPost}
          currentUserId={currentUser.id}
          onClose={() => setCommentingPost(null)}
          onCommentAdded={refreshUserData}
        />
      )}

      {/* Compose / Edit Post Modal */}
      {showCreatePost && (
        <CreatePostModal
          currentUser={currentUser}
          editingPost={editingPost}
          onClose={() => {
            setShowCreatePost(false);
            setEditingPost(null);
          }}
          onPostCreated={() => {
            showToast(editingPost ? 'Post updated successfully' : 'Post published to ReTwitter feed');
            refreshUserData();
          }}
        />
      )}

      {/* Moderation Modal (Report or Block) */}
      {moderationState && (
        <ModerationModal
          type={moderationState.type}
          post={moderationState.post}
          targetUserId={moderationState.targetUserId}
          targetUsername={moderationState.targetUsername}
          onClose={() => setModerationState(null)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      {/* Flutter Code Explorer Modal */}
      {showCodeExplorer && (
        <CodeExportModal onClose={() => setShowCodeExplorer(false)} />
      )}

      {/* Auth / Account Switcher Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            showToast(`Logged in as @${user.username}`);
          }}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfileModal
          user={currentUser}
          onClose={() => setShowEditProfile(false)}
          onSaved={(updated) => {
            setCurrentUser(updated);
            showToast('Profile updated');
          }}
        />
      )}

      {/* Temporary Toast Notification */}
      {toastMessage && (
        <div className="absolute bottom-20 inset-x-6 z-50 pointer-events-none flex justify-center animate-fadeIn">
          <div className="bg-slate-900/95 text-white border border-slate-700/80 px-4 py-2.5 rounded-2xl text-xs font-medium shadow-2xl flex items-center gap-2 max-w-sm backdrop-blur-md">
            <span>✓</span>
            <span className="truncate">{toastMessage}</span>
          </div>
        </div>
      )}
    </AndroidFrame>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ReTwitterApp />
    </ThemeProvider>
  );
}
