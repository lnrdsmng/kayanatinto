export interface FollowRecord {
  id: string;
  followerId: string;
  followerName: string;
  followerUsername: string;
  followerAvatarUrl?: string;
  followerIsSenior?: boolean;
  targetUserId: string;
  createdAt: string;
}

export interface BlockedUserRecord {
  id: string;
  userId: string;
  blockedUserId: string;
  blockedUserName: string;
  blockedUsername: string;
  blockedUserAvatarUrl?: string;
  createdAt: string;
}

export type ReportTargetType = 'user' | 'message' | 'comment' | 'post' | 'product' | 'service';

export interface ReportRecord {
  id: string;
  reporterId: string;
  reporterUsername: string;
  targetType: ReportTargetType;
  targetId: string;
  targetName: string;
  reason: string;
  details?: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'members-only';
  showAge: boolean;
  showLocation: boolean;
  allowMessagesFrom: 'everyone' | 'following';
}
