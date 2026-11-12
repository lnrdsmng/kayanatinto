import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  FollowRecord,
  BlockedUserRecord,
  ReportRecord,
  ReportTargetType,
  PrivacySettings,
} from '../types/connection';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

interface ConnectionContextType {
  // Follows
  followUser: (targetUser: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    isSenior?: boolean;
  }) => void;
  unfollowUser: (targetUserId: string) => void;
  isFollowing: (targetUserId: string) => boolean;
  getFollowersCount: (userId: string) => number;
  getFollowingCount: (userId: string) => number;
  getFollowers: (userId: string) => FollowRecord[];
  getFollowing: (userId: string) => FollowRecord[];

  // Blocks
  blockUser: (targetUser: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  }) => void;
  unblockUser: (targetUserId: string) => void;
  isBlocked: (targetUserId: string) => boolean;
  blockedUsers: BlockedUserRecord[];

  // Reports
  submitReport: (report: {
    targetType: ReportTargetType;
    targetId: string;
    targetName: string;
    reason: string;
    details?: string;
  }) => boolean;
  reportedTargetIds: string[];
  isTargetReported: (targetId: string) => boolean;

  // Privacy Settings
  privacySettings: PrivacySettings;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
}

const FOLLOWS_STORAGE_KEY = 'kayanatin_follows';
const BLOCKS_STORAGE_KEY = 'kayanatin_blocked_users';
const REPORTS_STORAGE_KEY = 'kayanatin_reports';
const PRIVACY_STORAGE_KEY = 'kayanatin_privacy_settings';

// Initial Seeded Follows
const INITIAL_FOLLOWS: FollowRecord[] = [
  {
    id: 'fol-1',
    followerId: 'user-maria-santos',
    followerName: 'Maria Santos',
    followerUsername: 'mariasantos',
    targetUserId: 'user-nanay-lita',
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'fol-2',
    followerId: 'user-maria-santos',
    followerName: 'Maria Santos',
    followerUsername: 'mariasantos',
    targetUserId: 'user-kuya-jayson',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'fol-3',
    followerId: 'user-kuya-jayson',
    followerName: 'Jayson Bautista',
    followerUsername: 'kuyajayson',
    followerAvatarUrl: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    targetUserId: 'user-nanay-lita',
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'fol-4',
    followerId: 'user-lola-mercy',
    followerName: 'Mercedes Del Rosario',
    followerUsername: 'lolamercy',
    followerAvatarUrl: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    followerIsSenior: true,
    targetUserId: 'user-nanay-lita',
    createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
  },
];

const DEFAULT_PRIVACY: PrivacySettings = {
  profileVisibility: 'public',
  showAge: true,
  showLocation: true,
  allowMessagesFrom: 'everyone',
};

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();

  const [follows, setFollows] = useState<FollowRecord[]>(() => {
    try {
      const saved = localStorage.getItem(FOLLOWS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_FOLLOWS;
  });

  const [blockedUsers, setBlockedUsers] = useState<BlockedUserRecord[]>(() => {
    try {
      const saved = localStorage.getItem(BLOCKS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [reports, setReports] = useState<ReportRecord[]>(() => {
    try {
      const saved = localStorage.getItem(REPORTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() => {
    try {
      const saved = localStorage.getItem(PRIVACY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PRIVACY;
  });

  useEffect(() => {
    try {
      localStorage.setItem(FOLLOWS_STORAGE_KEY, JSON.stringify(follows));
    } catch {}
  }, [follows]);

  useEffect(() => {
    try {
      localStorage.setItem(BLOCKS_STORAGE_KEY, JSON.stringify(blockedUsers));
    } catch {}
  }, [blockedUsers]);

  useEffect(() => {
    try {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
    } catch {}
  }, [reports]);

  useEffect(() => {
    try {
      localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(privacySettings));
    } catch {}
  }, [privacySettings]);

  // FOLLOW ACTIONS
  const followUser = (targetUser: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    isSenior?: boolean;
  }) => {
    if (!currentUser) return;
    if (currentUser.id === targetUser.id || currentUser.username === targetUser.username) return;

    // Check if already following
    const already = follows.some(
      (f) =>
        f.followerId === currentUser.id &&
        (f.targetUserId === targetUser.id || f.targetUserId === targetUser.username)
    );
    if (already) return;

    const newRecord: FollowRecord = {
      id: `fol-${Date.now()}`,
      followerId: currentUser.id,
      followerName: currentUser.fullName,
      followerUsername: currentUser.username,
      followerAvatarUrl: currentUser.avatarUrl,
      followerIsSenior: currentUser.isSenior,
      targetUserId: targetUser.id,
      createdAt: new Date().toISOString(),
    };

    setFollows((prev) => [...prev, newRecord]);

    // Send notification to the target user
    addNotification({
      userId: targetUser.id,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorUsername: currentUser.username,
      actorAvatarUrl: currentUser.avatarUrl,
      actorIsSenior: currentUser.isSenior,
      type: 'follow',
      title: 'Bagong Tagasunod sa KayaNatinTo',
      message: `Nagsimula nang sumubaybay si ${currentUser.fullName} sa iyong profile.`,
      targetId: currentUser.id,
      targetType: 'profile',
    });
  };

  const unfollowUser = (targetUserId: string) => {
    if (!currentUser) return;
    setFollows((prev) =>
      prev.filter(
        (f) =>
          !(
            f.followerId === currentUser.id &&
            (f.targetUserId === targetUserId || f.targetUserId.toLowerCase() === targetUserId.toLowerCase())
          )
      )
    );
  };

  const isFollowing = (targetUserId: string): boolean => {
    if (!currentUser) return false;
    return follows.some(
      (f) =>
        f.followerId === currentUser.id &&
        (f.targetUserId === targetUserId || f.targetUserId.toLowerCase() === targetUserId.toLowerCase())
    );
  };

  const getFollowers = (userId: string): FollowRecord[] => {
    return follows.filter(
      (f) => f.targetUserId === userId || f.targetUserId.toLowerCase() === userId.toLowerCase()
    );
  };

  const getFollowing = (userId: string): FollowRecord[] => {
    return follows.filter((f) => f.followerId === userId);
  };

  const getFollowersCount = (userId: string): number => {
    return getFollowers(userId).length;
  };

  const getFollowingCount = (userId: string): number => {
    return getFollowing(userId).length;
  };

  // BLOCK ACTIONS
  const blockUser = (targetUser: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  }) => {
    if (!currentUser) return;
    if (isBlocked(targetUser.id)) return;

    const blockRecord: BlockedUserRecord = {
      id: `block-${Date.now()}`,
      userId: currentUser.id,
      blockedUserId: targetUser.id,
      blockedUserName: targetUser.name,
      blockedUsername: targetUser.username,
      blockedUserAvatarUrl: targetUser.avatarUrl,
      createdAt: new Date().toISOString(),
    };

    setBlockedUsers((prev) => [...prev, blockRecord]);
    // Also unfollow if following
    unfollowUser(targetUser.id);
  };

  const unblockUser = (targetUserId: string) => {
    if (!currentUser) return;
    setBlockedUsers((prev) =>
      prev.filter(
        (b) => !(b.userId === currentUser.id && (b.blockedUserId === targetUserId || b.blockedUsername === targetUserId))
      )
    );
  };

  const isBlocked = (targetUserId: string): boolean => {
    if (!currentUser) return false;
    return blockedUsers.some(
      (b) =>
        b.userId === currentUser.id &&
        (b.blockedUserId === targetUserId || b.blockedUsername.toLowerCase() === targetUserId.toLowerCase())
    );
  };

  // REPORT ACTIONS
  const submitReport = (report: {
    targetType: ReportTargetType;
    targetId: string;
    targetName: string;
    reason: string;
    details?: string;
  }): boolean => {
    const newReport: ReportRecord = {
      id: `rep-${Date.now()}`,
      reporterId: currentUser ? currentUser.id : 'guest',
      reporterUsername: currentUser ? currentUser.username : 'guest',
      targetType: report.targetType,
      targetId: report.targetId,
      targetName: report.targetName,
      reason: report.reason,
      details: report.details,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    setReports((prev) => [...prev, newReport]);
    return true;
  };

  const reportedTargetIds = reports.map((r) => r.targetId);

  const isTargetReported = (targetId: string): boolean => {
    return reportedTargetIds.includes(targetId);
  };

  const updatePrivacySettings = (settings: Partial<PrivacySettings>) => {
    setPrivacySettings((prev) => ({ ...prev, ...settings }));
  };

  return (
    <ConnectionContext.Provider
      value={{
        followUser,
        unfollowUser,
        isFollowing,
        getFollowersCount,
        getFollowingCount,
        getFollowers,
        getFollowing,
        blockUser,
        unblockUser,
        isBlocked,
        blockedUsers: currentUser ? blockedUsers.filter((b) => b.userId === currentUser.id) : [],
        submitReport,
        reportedTargetIds,
        isTargetReported,
        privacySettings,
        updatePrivacySettings,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnections = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnections must be used within a ConnectionProvider');
  }
  return context;
};
