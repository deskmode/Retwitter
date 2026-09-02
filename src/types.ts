export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  profilePhoto?: string;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

export interface Post {
  id: string;
  userId: string;
  content?: string;
  imageUrl?: string;
  createdAt: string;
  user: UserProfile;
  likeCount: number;
  isLikedByMe: boolean;
  commentCount: number;
  repostCount: number;
  isRepostedByMe: boolean;
  isBookmarkedByMe: boolean;
  tags?: string[];
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: UserProfile;
}

export type NotificationType = 'like' | 'comment' | 'follow' | 'repost';

export interface NotificationItem {
  id: string;
  userId: string; // receiver
  actorId: string; // sender
  actor: UserProfile;
  type: NotificationType;
  postId?: string;
  postSnippet?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface HashtagTrend {
  tag: string;
  postCount: number;
  category: string;
}

export type ActiveTab = 'home' | 'search' | 'post' | 'notifications' | 'profile' | 'messages';

export type ThemeMode = 'light' | 'dark' | 'system';

export type ColorSeed = 'blue' | 'emerald' | 'purple' | 'amber';
