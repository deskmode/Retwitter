import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  Repeat2, 
  UserPlus, 
  CheckCheck, 
  Sparkles 
} from 'lucide-react';
import { NotificationItem, NotificationType } from '../types';
import { storageService } from '../services/storageService';
import { formatTimeAgo } from '../utils/themeTokens';
import { useTheme } from '../context/ThemeContext';

interface NotificationsViewProps {
  onOpenProfile: (userId: string) => void;
  onOpenPostSnippet?: (postId: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onOpenProfile,
  onOpenPostSnippet,
}) => {
  const { resolvedDark } = useTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'likes' | 'mentions'>('all');

  const loadNotifications = () => {
    setNotifications(storageService.getNotifications());
  };

  useEffect(() => {
    loadNotifications();
    const unsub = storageService.subscribe('notifications', loadNotifications);
    return () => unsub();
  }, []);

  const handleMarkAllRead = () => {
    storageService.markAllNotificationsRead();
  };

  const handleItemClick = (notif: NotificationItem) => {
    storageService.markNotificationRead(notif.id);
    if (notif.postId && onOpenPostSnippet) {
      onOpenPostSnippet(notif.postId);
    } else {
      onOpenProfile(notif.actorId);
    }
  };

  const filtered = notifications.filter(n => {
    if (activeFilter === 'likes') return n.type === 'like';
    if (activeFilter === 'mentions') return n.type === 'comment' || n.type === 'repost';
    return true;
  });

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'like':
        return <Heart size={16} className="text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageCircle size={16} className="text-[#0061A4] dark:text-[#9ECAFF] fill-[#0061A4] dark:fill-[#9ECAFF]" />;
      case 'repost':
        return <Repeat2 size={16} className="text-emerald-500" />;
      case 'follow':
        return <UserPlus size={16} className="text-[#0061A4] dark:text-[#9ECAFF]" />;
    }
  };

  const getMessageForType = (type: NotificationType) => {
    switch (type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'repost':
        return 'reposted your thought';
      case 'follow':
        return 'started following you';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
      {/* Header */}
      <header className={`px-4 py-3 border-b flex items-center justify-between shrink-0 transition-colors ${
        resolvedDark ? 'bg-[#111418] border-slate-800 text-[#E2E2E6]' : 'bg-[#FDFBFF] border-[#F0F2F5] text-[#1A1C1E]'
      }`}>
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-[#0061A4] dark:text-[#9ECAFF]" />
          <h2 className="font-bold text-base">Notifications</h2>
        </div>

        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-xs text-[#0061A4] dark:text-[#9ECAFF] hover:underline font-semibold"
            title="Mark all notifications read"
          >
            <CheckCheck size={14} />
            <span>Mark all read</span>
          </button>
        )}
      </header>

      {/* Filter Tabs */}
      <div className={`px-4 py-2 border-b flex items-center gap-2 text-xs font-semibold shrink-0 ${
        resolvedDark ? 'bg-[#141923] border-slate-800' : 'bg-[#FDFBFF] border-[#F0F2F5]'
      }`}>
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-full transition-colors ${
            activeFilter === 'all'
              ? resolvedDark
                ? 'bg-[#00497D] text-[#D1E4FF] border border-[#00497D]'
                : 'bg-[#D1E4FF] text-[#001D36] border border-[#D1E4FF]'
              : 'text-[#74777F] dark:text-slate-400 hover:text-[#1A1C1E] dark:hover:text-slate-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveFilter('likes')}
          className={`px-3 py-1 rounded-full transition-colors ${
            activeFilter === 'likes'
              ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40'
              : 'text-[#74777F] dark:text-slate-400 hover:text-[#1A1C1E] dark:hover:text-slate-200'
          }`}
        >
          Likes
        </button>
        <button
          onClick={() => setActiveFilter('mentions')}
          className={`px-3 py-1 rounded-full transition-colors ${
            activeFilter === 'mentions'
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
              : 'text-[#74777F] dark:text-slate-400 hover:text-[#1A1C1E] dark:hover:text-slate-200'
          }`}
        >
          Mentions & Reposts
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#F0F2F5] dark:divide-slate-800/30">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Sparkles size={32} className="mx-auto text-slate-500" />
            <p className="text-sm font-medium text-[#1A1C1E] dark:text-slate-200">No alerts right now</p>
            <p className="text-xs text-[#74777F] dark:text-slate-400">
              When other users like, comment, or repost your content, you'll be notified here in real-time.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                !item.isRead
                  ? resolvedDark ? 'bg-[#00497D]/20 hover:bg-[#00497D]/30' : 'bg-[#D1E4FF]/30 hover:bg-[#D1E4FF]/40'
                  : resolvedDark ? 'hover:bg-slate-800/30' : 'hover:bg-[#F0F2F5]'
              }`}
            >
              {/* Type Badge Icon */}
              <div className="shrink-0 mt-1">
                {getIconForType(item.type)}
              </div>

              {/* Actor Avatar */}
              <img
                src={item.actor?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                alt={item.actor?.username}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#E0E2EC] dark:border-slate-700/40"
              />

              {/* Notification Text */}
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-relaxed text-[#1A1C1E] dark:text-[#E2E2E6]">
                  <span className="font-bold hover:underline">
                    {item.actor?.displayName || item.actor?.username}
                  </span>{' '}
                  <span className="text-[#535F70] dark:text-slate-400">@{item.actor?.username}</span>{' '}
                  <span>{getMessageForType(item.type)}</span>
                </p>

                {item.postSnippet && (
                  <p className="text-xs text-[#535F70] dark:text-slate-400 mt-1 bg-[#F0F2F5] dark:bg-slate-800/50 p-2 rounded-xl border border-[#E0E2EC] dark:border-slate-700/40 line-clamp-2">
                    "{item.postSnippet}"
                  </p>
                )}

                <span className="text-[10px] text-[#74777F] dark:text-slate-500 mt-1 block">
                  {formatTimeAgo(item.createdAt)}
                </span>
              </div>

              {/* Unread dot */}
              {!item.isRead && (
                <div className="w-2 h-2 rounded-full bg-[#0061A4] dark:bg-[#9ECAFF] shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
