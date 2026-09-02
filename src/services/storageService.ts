import { UserProfile, Post, Comment, NotificationItem, DirectMessage, HashtagTrend } from '../types';
import { INITIAL_USERS, INITIAL_POSTS, INITIAL_TRENDS, INITIAL_NOTIFICATIONS, INITIAL_MESSAGES } from '../data/mockData';

const STORAGE_KEYS = {
  CURRENT_USER: 'retwitter_current_user',
  USERS: 'retwitter_users',
  POSTS: 'retwitter_posts',
  COMMENTS: 'retwitter_comments',
  NOTIFICATIONS: 'retwitter_notifications',
  MESSAGES: 'retwitter_messages',
  BLOCKED_USERS: 'retwitter_blocked_users',
  REPORTS: 'retwitter_reports',
  OFFLINE_MODE: 'retwitter_offline_mode',
  SUPABASE_CONFIG: 'retwitter_supabase_config',
};

class StorageService {
  private listeners: Map<string, Set<() => void>> = new Map();

  constructor() {
    this.initDefaults();
  }

  private initDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BLOCKED_USERS)) {
      localStorage.setItem(STORAGE_KEYS.BLOCKED_USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
      const initialComments: Record<string, Comment[]> = {
        'post-1': [
          {
            id: 'c-1',
            postId: 'post-1',
            userId: 'usr-supabase',
            content: 'Awesome architecture! PostgreSQL RLS and Flutter MD3 are the perfect combo 💯',
            createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
            user: INITIAL_USERS[2],
          },
          {
            id: 'c-2',
            postId: 'post-1',
            userId: 'usr-elena',
            content: 'The Material 3 dynamic color scheme and bottom navigation feel native to Android 15.',
            createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
            user: INITIAL_USERS[3],
          },
        ],
        'post-2': [
          {
            id: 'c-3',
            postId: 'post-2',
            userId: 'usr-dash',
            content: 'RLS policies keep our Dart code super concise!',
            createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            user: INITIAL_USERS[1],
          }
        ]
      };
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(initialComments));
    }
  }

  public subscribe(channel: string, callback: () => void): () => void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(callback);
    return () => {
      this.listeners.get(channel)?.delete(callback);
    };
  }

  private notify(channel: string) {
    const channelListeners = this.listeners.get(channel);
    if (channelListeners) {
      channelListeners.forEach(cb => cb());
    }
  }

  // --- Current User & Auth ---
  public getCurrentUser(): UserProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : INITIAL_USERS[0];
  }

  public setCurrentUser(user: UserProfile) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.notify('auth');
    this.notify('posts');
  }

  public loginWithGuest(): UserProfile {
    const guestUser: UserProfile = {
      id: 'usr-guest-' + Math.floor(Math.random() * 10000),
      username: 'guest_user',
      displayName: 'Guest Explorer',
      bio: 'Exploring ReTwitter in anonymous mode.',
      profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      followersCount: 0,
      followingCount: 1,
      isFollowing: false,
    };
    this.setCurrentUser(guestUser);
    return guestUser;
  }

  public loginWithEmail(email: string, _password?: string): UserProfile {
    const username = email.split('@')[0] || 'retwitter_fan';
    const users = this.getAllUsers();
    let existing = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!existing) {
      existing = {
        id: 'usr-' + Date.now(),
        username: username,
        displayName: username.charAt(0).toUpperCase() + username.slice(1),
        bio: 'ReTwitter user powered by Supabase & Flutter.',
        profilePhoto: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80`,
        createdAt: new Date().toISOString(),
        followersCount: 1,
        followingCount: 2,
        isFollowing: false,
      };
      users.push(existing);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    this.setCurrentUser(existing);
    return existing;
  }

  public updateProfile(updates: Partial<UserProfile>): UserProfile {
    const current = this.getCurrentUser();
    const updated: UserProfile = { ...current, ...updates };
    this.setCurrentUser(updated);

    // Also update in all users list
    const users = this.getAllUsers().map(u => u.id === updated.id ? updated : u);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Update in posts where user authored
    const posts = this.getAllPosts().map(p => {
      if (p.userId === updated.id) {
        return { ...p, user: updated };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));

    this.notify('posts');
    this.notify('profile');
    return updated;
  }

  // --- Offline Mode ---
  public isOfflineMode(): boolean {
    return localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE) === 'true';
  }

  public setOfflineMode(enabled: boolean) {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, enabled ? 'true' : 'false');
    this.notify('network');
  }

  // --- Users & Moderation ---
  public getAllUsers(): UserProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : INITIAL_USERS;
  }

  public getBlockedUserIds(): string[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BLOCKED_USERS);
    return raw ? JSON.parse(raw) : [];
  }

  public blockUser(targetUserId: string) {
    const blocked = this.getBlockedUserIds();
    if (!blocked.includes(targetUserId)) {
      blocked.push(targetUserId);
      localStorage.setItem(STORAGE_KEYS.BLOCKED_USERS, JSON.stringify(blocked));
      this.notify('posts');
      this.notify('moderation');
    }
  }

  public unblockUser(targetUserId: string) {
    const blocked = this.getBlockedUserIds().filter(id => id !== targetUserId);
    localStorage.setItem(STORAGE_KEYS.BLOCKED_USERS, JSON.stringify(blocked));
    this.notify('posts');
    this.notify('moderation');
  }

  public reportContent(params: { reportedUserId?: string; reportedPostId?: string; reason: string }) {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    const reports = raw ? JSON.parse(raw) : [];
    reports.push({
      id: 'rep-' + Date.now(),
      reporterId: this.getCurrentUser().id,
      ...params,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }

  public toggleFollow(targetUserId: string): boolean {
    const currentUser = this.getCurrentUser();
    const users = this.getAllUsers();
    let isNowFollowing = false;

    const updatedUsers = users.map(u => {
      if (u.id === targetUserId) {
        isNowFollowing = !u.isFollowing;
        return {
          ...u,
          isFollowing: isNowFollowing,
          followersCount: Math.max(0, u.followersCount + (isNowFollowing ? 1 : -1))
        };
      }
      return u;
    });

    currentUser.followingCount = Math.max(0, currentUser.followingCount + (isNowFollowing ? 1 : -1));
    this.setCurrentUser(currentUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

    if (isNowFollowing) {
      this.createNotification({
        userId: targetUserId,
        actorId: currentUser.id,
        actor: currentUser,
        type: 'follow',
      });
    }

    this.notify('profile');
    this.notify('users');
    return isNowFollowing;
  }

  // --- Posts ---
  public getAllPosts(): Post[] {
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    return raw ? JSON.parse(raw) : INITIAL_POSTS;
  }

  public getFeed(params?: { offset?: number; limit?: number; hashtag?: string; searchQuery?: string; userId?: string }): { posts: Post[]; hasMore: boolean } {
    const blocked = this.getBlockedUserIds();
    let posts = this.getAllPosts().filter(p => !blocked.includes(p.userId));

    if (params?.userId) {
      posts = posts.filter(p => p.userId === params.userId);
    }

    if (params?.hashtag) {
      const cleanTag = params.hashtag.startsWith('#') ? params.hashtag.toLowerCase() : `#${params.hashtag.toLowerCase()}`;
      posts = posts.filter(p => p.tags?.some(t => t.toLowerCase() === cleanTag) || p.content?.toLowerCase().includes(cleanTag));
    }

    if (params?.searchQuery) {
      const query = params.searchQuery.toLowerCase().trim();
      posts = posts.filter(p =>
        p.content?.toLowerCase().includes(query) ||
        p.user.username.toLowerCase().includes(query) ||
        p.user.displayName.toLowerCase().includes(query)
      );
    }

    // Sort newest first
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const offset = params?.offset || 0;
    const limit = params?.limit || 10;
    const sliced = posts.slice(offset, offset + limit);
    const hasMore = offset + limit < posts.length;

    return { posts: sliced, hasMore };
  }

  public createPost(content: string, imageUrl?: string): Post {
    const currentUser = this.getCurrentUser();
    // Extract hashtags
    const matchedTags = content.match(/#[a-zA-Z0-9_]+/g) || [];

    const newPost: Post = {
      id: 'post-' + Date.now(),
      userId: currentUser.id,
      content: content.trim() || undefined,
      imageUrl: imageUrl || undefined,
      createdAt: new Date().toISOString(),
      user: currentUser,
      likeCount: 0,
      isLikedByMe: false,
      commentCount: 0,
      repostCount: 0,
      isRepostedByMe: false,
      isBookmarkedByMe: false,
      tags: matchedTags,
    };

    const posts = [newPost, ...this.getAllPosts()];
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    this.notify('posts');
    return newPost;
  }

  public editPost(postId: string, newContent: string): boolean {
    const posts = this.getAllPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1 && posts[index].userId === this.getCurrentUser().id) {
      posts[index].content = newContent;
      posts[index].tags = newContent.match(/#[a-zA-Z0-9_]+/g) || [];
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
      this.notify('posts');
      return true;
    }
    return false;
  }

  public deletePost(postId: string): boolean {
    const posts = this.getAllPosts();
    const filtered = posts.filter(p => p.id !== postId);
    if (filtered.length !== posts.length) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(filtered));
      this.notify('posts');
      return true;
    }
    return false;
  }

  public toggleLike(postId: string): { isLiked: boolean; count: number } {
    const posts = this.getAllPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return { isLiked: false, count: 0 };

    post.isLikedByMe = !post.isLikedByMe;
    post.likeCount = Math.max(0, post.likeCount + (post.isLikedByMe ? 1 : -1));
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));

    if (post.isLikedByMe && post.userId !== this.getCurrentUser().id) {
      this.createNotification({
        userId: post.userId,
        actorId: this.getCurrentUser().id,
        actor: this.getCurrentUser(),
        type: 'like',
        postId: post.id,
        postSnippet: post.content?.slice(0, 45) || 'Photo post',
      });
    }

    this.notify('posts');
    return { isLiked: post.isLikedByMe, count: post.likeCount };
  }

  public toggleRepost(postId: string): { isReposted: boolean; count: number } {
    const posts = this.getAllPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return { isReposted: false, count: 0 };

    post.isRepostedByMe = !post.isRepostedByMe;
    post.repostCount = Math.max(0, post.repostCount + (post.isRepostedByMe ? 1 : -1));
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));

    if (post.isRepostedByMe && post.userId !== this.getCurrentUser().id) {
      this.createNotification({
        userId: post.userId,
        actorId: this.getCurrentUser().id,
        actor: this.getCurrentUser(),
        type: 'repost',
        postId: post.id,
        postSnippet: post.content?.slice(0, 45) || 'Photo post',
      });
    }

    this.notify('posts');
    return { isReposted: post.isRepostedByMe, count: post.repostCount };
  }

  public toggleBookmark(postId: string): boolean {
    const posts = this.getAllPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return false;

    post.isBookmarkedByMe = !post.isBookmarkedByMe;
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    this.notify('posts');
    return post.isBookmarkedByMe;
  }

  // --- Comments ---
  public getComments(postId: string): Comment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const commentsMap: Record<string, Comment[]> = raw ? JSON.parse(raw) : {};
    return commentsMap[postId] || [];
  }

  public addComment(postId: string, content: string): Comment {
    const currentUser = this.getCurrentUser();
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const commentsMap: Record<string, Comment[]> = raw ? JSON.parse(raw) : {};

    const newComment: Comment = {
      id: 'c-' + Date.now(),
      postId,
      userId: currentUser.id,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      user: currentUser,
    };

    if (!commentsMap[postId]) {
      commentsMap[postId] = [];
    }
    commentsMap[postId].push(newComment);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(commentsMap));

    // Update post comment count
    const posts = this.getAllPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.commentCount += 1;
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));

      if (post.userId !== currentUser.id) {
        this.createNotification({
          userId: post.userId,
          actorId: currentUser.id,
          actor: currentUser,
          type: 'comment',
          postId: post.id,
          postSnippet: content.slice(0, 45),
        });
      }
    }

    this.notify('comments');
    this.notify('posts');
    return newComment;
  }

  public deleteComment(postId: string, commentId: string): boolean {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const commentsMap: Record<string, Comment[]> = raw ? JSON.parse(raw) : {};
    if (!commentsMap[postId]) return false;

    commentsMap[postId] = commentsMap[postId].filter(c => c.id !== commentId);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(commentsMap));

    // Update post count
    const posts = this.getAllPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.commentCount = Math.max(0, post.commentCount - 1);
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    }

    this.notify('comments');
    this.notify('posts');
    return true;
  }

  // --- Notifications ---
  public getNotifications(): NotificationItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const all: NotificationItem[] = raw ? JSON.parse(raw) : [];
    const currentId = this.getCurrentUser().id;
    return all.filter(n => n.userId === currentId);
  }

  public createNotification(params: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const all: NotificationItem[] = raw ? JSON.parse(raw) : [];
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      ...params,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    all.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
    this.notify('notifications');
  }

  public markNotificationRead(id: string) {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const all: NotificationItem[] = raw ? JSON.parse(raw) : [];
    const updated = all.map(n => n.id === id ? { ...n, isRead: true } : n);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    this.notify('notifications');
  }

  public markAllNotificationsRead() {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const all: NotificationItem[] = raw ? JSON.parse(raw) : [];
    const currentId = this.getCurrentUser().id;
    const updated = all.map(n => n.userId === currentId ? { ...n, isRead: true } : n);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    this.notify('notifications');
  }

  // --- Direct Messages ---
  public getAllMessages(): DirectMessage[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return raw ? JSON.parse(raw) : INITIAL_MESSAGES;
  }

  public getMessagesWithUser(otherUserId: string): DirectMessage[] {
    const currentId = this.getCurrentUser().id;
    const messages = this.getAllMessages();
    return messages.filter(
      m => (m.senderId === currentId && m.receiverId === otherUserId) ||
           (m.senderId === otherUserId && m.receiverId === currentId)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public sendMessage(receiverId: string, content: string): DirectMessage {
    const currentId = this.getCurrentUser().id;
    const all = this.getAllMessages();
    const newMsg: DirectMessage = {
      id: 'msg-' + Date.now(),
      senderId: currentId,
      receiverId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    all.push(newMsg);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(all));
    this.notify('messages');

    // Friendly auto-reply simulation after 1.2 seconds if texting Dash or Supabase
    if (receiverId === 'usr-dash' || receiverId === 'usr-supabase') {
      setTimeout(() => {
        const replyText = receiverId === 'usr-dash'
          ? "Flutter's hot reload & Material 3 dynamic widgets make iterating super swift! 🐦 Let me know if you need any widget tips."
          : "Real-time subscriptions in Supabase broadcast changes via PostgreSQL CDC seamlessly! ⚡";
        const replyMsg: DirectMessage = {
          id: 'msg-' + Date.now(),
          senderId: receiverId,
          receiverId: currentId,
          content: replyText,
          createdAt: new Date().toISOString(),
          isRead: false,
        };
        const curAll = this.getAllMessages();
        curAll.push(replyMsg);
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(curAll));
        this.notify('messages');
      }, 1200);
    }

    return newMsg;
  }

  // --- Trends ---
  public getTrends(): HashtagTrend[] {
    return INITIAL_TRENDS;
  }
}

export const storageService = new StorageService();
