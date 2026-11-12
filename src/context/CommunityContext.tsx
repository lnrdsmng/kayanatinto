import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Message,
  Conversation,
  NotificationItem,
  UserConnectionProfile,
  ModerationReport,
  MessageContextItem,
  ConversationParticipant,
} from '../types/community';
import { useAuth } from './AuthContext';

interface CommunityContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  activeMessages: Message[];
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
  notifications: NotificationItem[];
  followedUserIds: string[];
  blockedUserIds: string[];
  isLoading: boolean;

  // Messaging operations
  getOrCreateConversation: (
    otherUser: ConversationParticipant,
    contextItem?: MessageContextItem,
    initialMessageText?: string
  ) => Conversation;
  openConversationById: (conversationId: string) => void;
  closeConversation: () => void;
  sendMessage: (text: string, imageUrl?: string) => Promise<boolean>;
  markConversationAsRead: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;

  // Social Connections & Following
  isFollowing: (userId: string) => boolean;
  toggleFollow: (user: ConversationParticipant) => boolean;
  getFollowersCount: (userId: string) => number;
  getFollowingCount: (userId: string) => number;
  getConnectionsList: (userId?: string) => { followers: UserConnectionProfile[]; following: UserConnectionProfile[] };

  // Blocking & Safety
  isUserBlocked: (userId: string) => boolean;
  blockUser: (userId: string, reason?: string) => void;
  unblockUser: (userId: string) => void;

  // Moderation & Reporting
  submitReport: (
    report: Omit<ModerationReport, 'id' | 'createdAt' | 'status'>
  ) => Promise<{ success: boolean; message: string }>;

  // Notifications
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

const CONVERSATIONS_STORAGE_KEY = 'kayanatin_conversations';
const MESSAGES_STORAGE_KEY = 'kayanatin_messages';
const NOTIFICATIONS_STORAGE_KEY = 'kayanatin_notifications';
const FOLLOWED_STORAGE_KEY = 'kayanatin_followed_user_ids';
const BLOCKED_STORAGE_KEY = 'kayanatin_blocked_user_ids';
const REPORTS_STORAGE_KEY = 'kayanatin_moderation_reports';

// Initial Seed Conversations
const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-nanay-lita',
    participantIds: ['user-maria-santos', 'user-nanay-lita'],
    participants: [
      {
        id: 'user-maria-santos',
        fullName: 'Maria Santos',
        username: 'mariasantos',
        avatarUrl: '',
        roleTitle: 'Mamimili at Tagatangkilik',
        city: 'Quezon City',
      },
      {
        id: 'user-nanay-lita',
        fullName: 'Lita Rodriguez (Nanay Lita)',
        username: 'nanaylita',
        avatarUrl: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
        isSenior: true,
        roleTitle: 'Master Cook & Kakanin Artisan',
        city: 'Majayjay, Laguna',
      },
    ],
    lastMessage: {
      text: 'Opo ineng! Available ang 5 packs ng Homemade Lumpia para sa Linggo. Fresh na fresh nating ibabalot.',
      senderId: 'user-nanay-lita',
      senderName: 'Nanay Lita',
      createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      isRead: false,
    },
    unreadCount: {
      'user-maria-santos': 1,
      'user-nanay-lita': 0,
    },
    createdAt: '2026-11-06T10:00:00Z',
    updatedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'conv-kuya-jayson',
    participantIds: ['user-maria-santos', 'user-kuya-jayson'],
    participants: [
      {
        id: 'user-maria-santos',
        fullName: 'Maria Santos',
        username: 'mariasantos',
        avatarUrl: '',
        roleTitle: 'Mamimili at Tagatangkilik',
        city: 'Quezon City',
      },
      {
        id: 'user-kuya-jayson',
        fullName: 'Jayson Bautista',
        username: 'kuyajayson',
        avatarUrl: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
        isSenior: false,
        roleTitle: 'Musician & Guitar Mentor',
        city: 'San Pablo, Laguna',
      },
    ],
    lastMessage: {
      text: 'Salamat po sa pakikinig sa aking acoustic Harana! Pwede po kitang turuan ng basic chords sa Sabado.',
      senderId: 'user-kuya-jayson',
      senderName: 'Jayson Bautista',
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      isRead: true,
    },
    unreadCount: {
      'user-maria-santos': 0,
      'user-kuya-jayson': 0,
    },
    createdAt: '2026-11-05T14:30:00Z',
    updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'conv-lola-mercy',
    participantIds: ['user-maria-santos', 'user-lola-mercy'],
    participants: [
      {
        id: 'user-maria-santos',
        fullName: 'Maria Santos',
        username: 'mariasantos',
        avatarUrl: '',
        roleTitle: 'Mamimili at Tagatangkilik',
        city: 'Quezon City',
      },
      {
        id: 'user-lola-mercy',
        fullName: 'Mercedes Del Rosario (Lola Mercy)',
        username: 'lolamercy',
        avatarUrl: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
        isSenior: true,
        roleTitle: 'Master Seamstress & Barong Artisan',
        city: 'Pila, Laguna',
      },
    ],
    lastMessage: {
      text: 'Dalhin ninyo po ang barong sa aming tahanan sa Brgy. Santa Clara, aayusin natin ang manggas bago ang pista.',
      senderId: 'user-lola-mercy',
      senderName: 'Lola Mercy',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      isRead: true,
    },
    unreadCount: {
      'user-maria-santos': 0,
      'user-lola-mercy': 0,
    },
    createdAt: '2026-11-04T09:15:00Z',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

// Initial Seed Messages
const INITIAL_MESSAGES: Message[] = [
  // Conversation with Nanay Lita
  {
    id: 'msg-001',
    conversationId: 'conv-nanay-lita',
    senderId: 'user-maria-santos',
    senderName: 'Maria Santos',
    senderUsername: 'mariasantos',
    recipientId: 'user-nanay-lita',
    text: 'Magandang araw po Nanay Lita! Nais ko po sanang magtanong tungkol sa inyong Homemade Lumpia.',
    contextItem: {
      type: 'product',
      id: 'prod-001',
      title: 'Homemade Lumpia Shanghai (Pre-order)',
      priceOrCategory: '₱100 / pack',
      thumbnailUrl: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    status: 'read',
    isRead: true,
  },
  {
    id: 'msg-002',
    conversationId: 'conv-nanay-lita',
    senderId: 'user-maria-santos',
    senderName: 'Maria Santos',
    senderUsername: 'mariasantos',
    recipientId: 'user-nanay-lita',
    text: 'Kaya po ba ng 5 packs para sa salu-salo ng aming pamilya sa Linggo?',
    createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    status: 'read',
    isRead: true,
  },
  {
    id: 'msg-003',
    conversationId: 'conv-nanay-lita',
    senderId: 'user-nanay-lita',
    senderName: 'Lita Rodriguez (Nanay Lita)',
    senderUsername: 'nanaylita',
    senderAvatarUrl: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    recipientId: 'user-maria-santos',
    text: 'Opo ineng! Available ang 5 packs ng Homemade Lumpia para sa Linggo. Fresh na fresh nating ibabalot.',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    status: 'sent',
    isRead: false,
  },

  // Conversation with Kuya Jayson
  {
    id: 'msg-101',
    conversationId: 'conv-kuya-jayson',
    senderId: 'user-maria-santos',
    senderName: 'Maria Santos',
    senderUsername: 'mariasantos',
    recipientId: 'user-kuya-jayson',
    text: 'Sobrang ganda po ng acoustic rendition niyo sa talent showcase! Nagtuturo po ba kayo ng beginners?',
    contextItem: {
      type: 'talent',
      id: 'post-002',
      title: 'Acoustic Harana & OPM Melody (Live Guitar)',
      priceOrCategory: 'Pagkanta at Musika',
      thumbnailUrl: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    status: 'read',
    isRead: true,
  },
  {
    id: 'msg-102',
    conversationId: 'conv-kuya-jayson',
    senderId: 'user-kuya-jayson',
    senderName: 'Jayson Bautista',
    senderUsername: 'kuyajayson',
    senderAvatarUrl: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    recipientId: 'user-maria-santos',
    text: 'Salamat po sa pakikinig sa aking acoustic Harana! Pwede po kitang turuan ng basic chords sa Sabado.',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    status: 'read',
    isRead: true,
  },

  // Conversation with Lola Mercy
  {
    id: 'msg-201',
    conversationId: 'conv-lola-mercy',
    senderId: 'user-maria-santos',
    senderName: 'Maria Santos',
    senderUsername: 'mariasantos',
    recipientId: 'user-lola-mercy',
    text: 'Magandang araw po Lola Mercy, nag-aayos po ba kayo ng barong tagalog bago ang pista sa Pila?',
    contextItem: {
      type: 'service',
      id: 'srv-002',
      title: 'Barong Alteration & Filipiniana Repair',
      priceOrCategory: '₱150 / hr',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    status: 'read',
    isRead: true,
  },
  {
    id: 'msg-202',
    conversationId: 'conv-lola-mercy',
    senderId: 'user-lola-mercy',
    senderName: 'Mercedes Del Rosario (Lola Mercy)',
    senderUsername: 'lolamercy',
    senderAvatarUrl: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    recipientId: 'user-maria-santos',
    text: 'Dalhin ninyo po ang barong sa aming tahanan sa Brgy. Santa Clara, aayusin natin ang manggas bago ang pista.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: 'read',
    isRead: true,
  },
];

// Initial Seed Notifications
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    recipientUserId: 'user-maria-santos',
    actor: {
      id: 'user-nanay-lita',
      name: 'Nanay Lita Ramos',
      username: 'nanaylita',
      avatarUrl: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
      isSenior: true,
    },
    type: 'message',
    title: 'Bagong Mensahe mula kay Nanay Lita',
    description: 'Nag-reply si Nanay Lita tungkol sa iyong order ng Homemade Lumpia.',
    targetType: 'conversation',
    targetId: 'conv-nanay-lita',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'notif-2',
    recipientUserId: 'user-maria-santos',
    actor: {
      id: 'user-kuya-jayson',
      name: 'Jayson Bautista',
      username: 'kuyajayson',
      avatarUrl: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
      isSenior: false,
    },
    type: 'follow',
    title: 'Bagong Tagasubaybay (New Follower)',
    description: 'Sinimulan kang sundan ni Kuya Jayson sa KayaNatinTo.',
    targetType: 'user',
    targetId: 'user-kuya-jayson',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'notif-3',
    recipientUserId: 'user-maria-santos',
    actor: {
      id: 'user-lola-mercy',
      name: 'Lola Mercy',
      username: 'lolamercy',
      avatarUrl: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
      isSenior: true,
    },
    type: 'like',
    title: 'Nagustuhan ang iyong kumento',
    description: 'Pinasalamatan ni Lola Mercy ang iyong suporta sa gawang-kamay na pagbuburda.',
    targetType: 'post',
    targetId: 'post-003',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'notif-4',
    recipientUserId: 'user-maria-santos',
    actor: {
      id: 'system',
      name: 'KayaNatinTo Pamayanan',
      username: 'kayanatin_official',
      isSenior: false,
    },
    type: 'system',
    title: '18+ Ligtas at Pantay na Pamayanan',
    description: 'Welcome sa KayaNatinTo! Pantay ang pagkakataon para sa lahat, bata man o lolo at lola.',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(MESSAGES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [followedUserIds, setFollowedUserIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FOLLOWED_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['user-nanay-lita', 'user-kuya-jayson'];
    } catch {
      return ['user-nanay-lita', 'user-kuya-jayson'];
    }
  });

  const [blockedUserIds, setBlockedUserIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(BLOCKED_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [reports, setReports] = useState<ModerationReport[]>(() => {
    try {
      const saved = localStorage.getItem(REPORTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading] = useState(false);

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
    } catch (err) {
      console.error('Error saving conversations:', err);
    }
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    } catch (err) {
      console.error('Error saving messages:', err);
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch (err) {
      console.error('Error saving notifications:', err);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(FOLLOWED_STORAGE_KEY, JSON.stringify(followedUserIds));
    } catch (err) {
      console.error('Error saving followed users:', err);
    }
  }, [followedUserIds]);

  useEffect(() => {
    try {
      localStorage.setItem(BLOCKED_STORAGE_KEY, JSON.stringify(blockedUserIds));
    } catch (err) {
      console.error('Error saving blocked users:', err);
    }
  }, [blockedUserIds]);

  useEffect(() => {
    try {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
    } catch (err) {
      console.error('Error saving reports:', err);
    }
  }, [reports]);

  // Cross-tab real-time sync with BroadcastChannel
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('kayanatin_community_sync');
        channel.onmessage = (event) => {
          if (event.data?.type === 'SYNC_COMMUNITY') {
            const savedConvs = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
            const savedMsgs = localStorage.getItem(MESSAGES_STORAGE_KEY);
            const savedNotifs = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
            if (savedConvs) setConversations(JSON.parse(savedConvs));
            if (savedMsgs) setMessages(JSON.parse(savedMsgs));
            if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel sync unavailable:', e);
    }

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === CONVERSATIONS_STORAGE_KEY && e.newValue) {
        setConversations(JSON.parse(e.newValue));
      } else if (e.key === MESSAGES_STORAGE_KEY && e.newValue) {
        setMessages(JSON.parse(e.newValue));
      } else if (e.key === NOTIFICATIONS_STORAGE_KEY && e.newValue) {
        setNotifications(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  const broadcastChange = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('kayanatin_community_sync');
        bc.postMessage({ type: 'SYNC_COMMUNITY', timestamp: Date.now() });
        bc.close();
      }
    } catch {
      // fallback
    }
  }, []);

  // Compute Active Conversation
  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null;
    return conversations.find((c) => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  // Compute Active Messages
  const activeMessages = useMemo(() => {
    if (!activeConversationId) return [];
    return messages
      .filter((m) => m.conversationId === activeConversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages, activeConversationId]);

  // Unread counts for current user
  const effectiveUserId = currentUser?.id || 'user-maria-santos';

  const unreadMessagesCount = useMemo(() => {
    return conversations.reduce((total, conv) => {
      // Don't count blocked conversations
      if (conv.isBlocked) return total;
      const count = conv.unreadCount?.[effectiveUserId] || 0;
      return total + count;
    }, 0);
  }, [conversations, effectiveUserId]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(
      (n) => n.recipientUserId === effectiveUserId && !n.isRead
    ).length;
  }, [notifications, effectiveUserId]);

  // Open Conversation By ID
  const openConversationById = useCallback(
    (convId: string) => {
      setActiveConversationId(convId);
      // Mark as read immediately for current user
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === convId) {
            return {
              ...c,
              unreadCount: {
                ...c.unreadCount,
                [effectiveUserId]: 0,
              },
            };
          }
          return c;
        })
      );
      setMessages((prev) =>
        prev.map((m) => {
          if (m.conversationId === convId && m.recipientId === effectiveUserId) {
            return { ...m, isRead: true, status: 'read' };
          }
          return m;
        })
      );
      broadcastChange();
    },
    [effectiveUserId, broadcastChange]
  );

  const closeConversation = useCallback(() => {
    setActiveConversationId(null);
  }, []);

  // Get or Create Conversation
  const getOrCreateConversation = useCallback(
    (
      otherUser: ConversationParticipant,
      contextItem?: MessageContextItem,
      initialMessageText?: string
    ): Conversation => {
      const myId = effectiveUserId;
      const myName = currentUser?.fullName || 'Maria Santos';
      const myUsername = currentUser?.username || 'mariasantos';
      const myAvatar = currentUser?.avatarUrl || '';
      const mySenior = currentUser?.isSenior || false;
      const myCity = currentUser?.location?.city || 'Quezon City';

      const myParticipant: ConversationParticipant = {
        id: myId,
        fullName: myName,
        username: myUsername,
        avatarUrl: myAvatar,
        isSenior: mySenior,
        city: myCity,
      };

      // Check if conversation already exists between these 2 users
      const existing = conversations.find((c) => {
        return (
          c.participantIds.includes(myId) &&
          (c.participantIds.includes(otherUser.id) ||
            c.participants.some(
              (p) =>
                p.username.toLowerCase() === otherUser.username.toLowerCase() ||
                p.id === otherUser.id
            ))
        );
      });

      if (existing) {
        // If an initial text or contextItem is provided and no recent matching message exists
        if (initialMessageText || contextItem) {
          const autoMsgId = `msg-${Date.now()}`;
          const newMsg: Message = {
            id: autoMsgId,
            conversationId: existing.id,
            senderId: myId,
            senderName: myName,
            senderUsername: myUsername,
            senderAvatarUrl: myAvatar,
            recipientId: otherUser.id,
            text:
              initialMessageText ||
              `Magandang araw po! Nais ko sanang magtanong tungkol sa inyong ${
                contextItem?.type === 'product'
                  ? 'produkto'
                  : contextItem?.type === 'service'
                  ? 'serbisyo'
                  : 'talento'
              }: ${contextItem?.title}.`,
            contextItem,
            createdAt: new Date().toISOString(),
            status: 'sent',
            isRead: false,
          };

          setMessages((prev) => [...prev, newMsg]);

          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === existing.id) {
                return {
                  ...c,
                  lastMessage: {
                    text: newMsg.text,
                    senderId: myId,
                    senderName: myName,
                    createdAt: newMsg.createdAt,
                    isRead: false,
                  },
                  unreadCount: {
                    ...c.unreadCount,
                    [otherUser.id]: (c.unreadCount?.[otherUser.id] || 0) + 1,
                  },
                  updatedAt: new Date().toISOString(),
                };
              }
              return c;
            })
          );
        }

        setActiveConversationId(existing.id);
        broadcastChange();
        return existing;
      }

      // Create new conversation
      const newConvId = `conv-${Date.now()}`;
      const newConv: Conversation = {
        id: newConvId,
        participantIds: [myId, otherUser.id],
        participants: [myParticipant, otherUser],
        unreadCount: {
          [myId]: 0,
          [otherUser.id]: initialMessageText || contextItem ? 1 : 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (initialMessageText || contextItem) {
        const firstMsg: Message = {
          id: `msg-${Date.now()}`,
          conversationId: newConvId,
          senderId: myId,
          senderName: myName,
          senderUsername: myUsername,
          senderAvatarUrl: myAvatar,
          recipientId: otherUser.id,
          text:
            initialMessageText ||
            `Magandang araw po! Nais ko po sanang magtanong ukol sa: ${contextItem?.title}.`,
          contextItem,
          createdAt: new Date().toISOString(),
          status: 'sent',
          isRead: false,
        };

        newConv.lastMessage = {
          text: firstMsg.text,
          senderId: myId,
          senderName: myName,
          createdAt: firstMsg.createdAt,
          isRead: false,
        };

        setMessages((prev) => [...prev, firstMsg]);
      }

      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConvId);
      broadcastChange();
      return newConv;
    },
    [effectiveUserId, currentUser, conversations, broadcastChange]
  );

  // Send Message
  const sendMessage = useCallback(
    async (text: string, imageUrl?: string): Promise<boolean> => {
      if (!activeConversationId || (!text.trim() && !imageUrl)) return false;

      const currentConv = conversations.find((c) => c.id === activeConversationId);
      if (!currentConv) return false;

      if (currentConv.isBlocked) {
        return false;
      }

      const myId = effectiveUserId;
      const myName = currentUser?.fullName || 'Maria Santos';
      const myUsername = currentUser?.username || 'mariasantos';
      const myAvatar = currentUser?.avatarUrl || '';

      const otherParticipant = currentConv.participants.find((p) => p.id !== myId);
      const recipientId = otherParticipant ? otherParticipant.id : currentConv.participantIds.find((id) => id !== myId) || 'unknown';

      const newMsgId = `msg-${Date.now()}`;
      const newMsg: Message = {
        id: newMsgId,
        conversationId: activeConversationId,
        senderId: myId,
        senderName: myName,
        senderUsername: myUsername,
        senderAvatarUrl: myAvatar,
        recipientId,
        text: text.trim(),
        imageUrl,
        createdAt: new Date().toISOString(),
        status: 'sent',
        isRead: false,
      };

      // Update Messages state
      setMessages((prev) => [...prev, newMsg]);

      // Update Conversation state
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversationId) {
            return {
              ...c,
              lastMessage: {
                text: imageUrl && !text.trim() ? '📷 Nagpadala ng larawan' : text.trim(),
                senderId: myId,
                senderName: myName,
                createdAt: newMsg.createdAt,
                isRead: false,
              },
              unreadCount: {
                ...c.unreadCount,
                [recipientId]: (c.unreadCount?.[recipientId] || 0) + 1,
              },
              updatedAt: new Date().toISOString(),
            };
          }
          return c;
        })
      );

      // Trigger notification for recipient
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        recipientUserId: recipientId,
        actor: {
          id: myId,
          name: myName,
          username: myUsername,
          avatarUrl: myAvatar,
          isSenior: currentUser?.isSenior || false,
        },
        type: 'message',
        title: `Bagong mensahe mula kay ${myName.split(' ')[0]}`,
        description: text.trim() ? (text.length > 50 ? `${text.slice(0, 47)}...` : text) : 'Nagpadala ng larawan.',
        targetType: 'conversation',
        targetId: activeConversationId,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);

      broadcastChange();
      return true;
    },
    [activeConversationId, conversations, effectiveUserId, currentUser, broadcastChange]
  );

  // Mark Conversation As Read
  const markConversationAsRead = useCallback(
    (convId: string) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === convId) {
            return {
              ...c,
              unreadCount: {
                ...c.unreadCount,
                [effectiveUserId]: 0,
              },
            };
          }
          return c;
        })
      );
      setMessages((prev) =>
        prev.map((m) => {
          if (m.conversationId === convId && m.recipientId === effectiveUserId) {
            return { ...m, isRead: true, status: 'read' };
          }
          return m;
        })
      );
      broadcastChange();
    },
    [effectiveUserId, broadcastChange]
  );

  // Delete Conversation
  const deleteConversation = useCallback(
    (convId: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      setMessages((prev) => prev.filter((m) => m.conversationId !== convId));
      if (activeConversationId === convId) {
        setActiveConversationId(null);
      }
      broadcastChange();
    },
    [activeConversationId, broadcastChange]
  );

  // Follow / Unfollow
  const isFollowing = useCallback(
    (userId: string) => {
      return followedUserIds.includes(userId);
    },
    [followedUserIds]
  );

  const toggleFollow = useCallback(
    (user: ConversationParticipant): boolean => {
      const isCurrentlyFollowing = followedUserIds.includes(user.id);
      let nextFollowing = false;

      if (isCurrentlyFollowing) {
        setFollowedUserIds((prev) => prev.filter((id) => id !== user.id));
        nextFollowing = false;
      } else {
        setFollowedUserIds((prev) => [...prev, user.id]);
        nextFollowing = true;

        // Generate friendly follow notification for the followed user
        const followNotif: NotificationItem = {
          id: `notif-follow-${Date.now()}`,
          recipientUserId: user.id,
          actor: {
            id: effectiveUserId,
            name: currentUser?.fullName || 'Maria Santos',
            username: currentUser?.username || 'mariasantos',
            avatarUrl: currentUser?.avatarUrl || '',
            isSenior: currentUser?.isSenior || false,
          },
          type: 'follow',
          title: 'Bagong Tagasubaybay (New Follower)',
          description: `Sinimulan kang sundan ni ${currentUser?.fullName || 'Maria Santos'} sa KayaNatinTo.`,
          targetType: 'user',
          targetId: effectiveUserId,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [followNotif, ...prev]);
      }

      broadcastChange();
      return nextFollowing;
    },
    [followedUserIds, effectiveUserId, currentUser, broadcastChange]
  );

  const getFollowersCount = useCallback(
    (userId: string) => {
      // Deterministic realistic follower count with baseline
      if (userId === 'user-nanay-lita') return 245;
      if (userId === 'user-kuya-jayson') return 188;
      if (userId === 'user-lola-mercy') return 142;
      if (userId === 'user-maria-santos' || userId === currentUser?.id) return 32;
      return 15;
    },
    [currentUser?.id]
  );

  const getFollowingCount = useCallback(
    (userId: string) => {
      if (userId === effectiveUserId) return followedUserIds.length;
      if (userId === 'user-nanay-lita') return 78;
      if (userId === 'user-kuya-jayson') return 64;
      return 45;
    },
    [effectiveUserId, followedUserIds.length]
  );

  // Return connection lists for modal
  const getConnectionsList = useCallback(
    (targetUserId?: string): { followers: UserConnectionProfile[]; following: UserConnectionProfile[] } => {
      const uid = targetUserId || effectiveUserId;

      const allDemoProfiles: UserConnectionProfile[] = [
        {
          id: 'user-nanay-lita',
          fullName: 'Lita Rodriguez (Nanay Lita)',
          username: 'nanaylita',
          avatarUrl: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
          isSenior: true,
          accountType: 'seller',
          city: 'Majayjay',
          province: 'Laguna',
          bio: '40 taong nagluluto ng paboritong Lumpia Shanghai at kakanin.',
        },
        {
          id: 'user-kuya-jayson',
          fullName: 'Jayson Bautista',
          username: 'kuyajayson',
          avatarUrl: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
          isSenior: false,
          accountType: 'talent',
          city: 'San Pablo',
          province: 'Laguna',
          bio: 'Music is life! Acoustic guitar at OPM covers.',
        },
        {
          id: 'user-lola-mercy',
          fullName: 'Mercedes Del Rosario (Lola Mercy)',
          username: 'lolamercy',
          avatarUrl: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
          isSenior: true,
          accountType: 'service',
          city: 'Pila',
          province: 'Laguna',
          bio: 'Master seamstress para sa barong at kasuotang Pilipino.',
        },
        {
          id: 'user-mang-carding',
          fullName: 'Carding Villanueva',
          username: 'mangcarding',
          avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
          isSenior: true,
          accountType: 'service',
          city: 'Paete',
          province: 'Laguna',
          bio: 'Gintong ukit sa kahoy mula sa Paete, Laguna.',
        },
        {
          id: 'user-elena-bakes',
          fullName: 'Elena Cruz',
          username: 'elenascakes',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          isSenior: false,
          accountType: 'seller',
          city: 'Santa Cruz',
          province: 'Laguna',
          bio: 'Artisan strawberry shortcake at homemade breads.',
        },
      ];

      const followers = allDemoProfiles.slice(0, 3);
      const following = allDemoProfiles.filter((p) => followedUserIds.includes(p.id));

      return { followers, following };
    },
    [effectiveUserId, followedUserIds]
  );

  // Block & Unblock
  const isUserBlocked = useCallback(
    (userId: string) => {
      return blockedUserIds.includes(userId);
    },
    [blockedUserIds]
  );

  const blockUser = useCallback(
    (userId: string) => {
      setBlockedUserIds((prev) => {
        if (!prev.includes(userId)) {
          return [...prev, userId];
        }
        return prev;
      });

      // Mark any conversations with this user as blocked
      setConversations((prev) =>
        prev.map((c) => {
          if (c.participantIds.includes(userId)) {
            return {
              ...c,
              isBlocked: true,
              blockedByUserId: effectiveUserId,
            };
          }
          return c;
        })
      );
      broadcastChange();
    },
    [effectiveUserId, broadcastChange]
  );

  const unblockUser = useCallback(
    (userId: string) => {
      setBlockedUserIds((prev) => prev.filter((id) => id !== userId));
      setConversations((prev) =>
        prev.map((c) => {
          if (c.participantIds.includes(userId)) {
            return {
              ...c,
              isBlocked: false,
              blockedByUserId: undefined,
            };
          }
          return c;
        })
      );
      broadcastChange();
    },
    [broadcastChange]
  );

  // Moderation & Reporting
  const submitReport = useCallback(
    async (
      reportData: Omit<ModerationReport, 'id' | 'createdAt' | 'status'>
    ): Promise<{ success: boolean; message: string }> => {
      const newReport: ModerationReport = {
        id: `rep-${Date.now()}`,
        ...reportData,
        createdAt: new Date().toISOString(),
        status: 'pending_review',
      };

      setReports((prev) => [newReport, ...prev]);

      return {
        success: true,
        message:
          'Maraming salamat sa pagmamalasakit. Naisumite ang inyong ulat sa KayaNatinTo Community Safety Team para sa pagsusuri ayon sa ating 18+ pamantayan.',
      };
    },
    []
  );

  // Notifications Handlers
  const markNotificationAsRead = useCallback(
    (notificationId: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      broadcastChange();
    },
    [broadcastChange]
  );

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    broadcastChange();
  }, [broadcastChange]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    broadcastChange();
  }, [broadcastChange]);

  return (
    <CommunityContext.Provider
      value={{
        conversations,
        activeConversation,
        activeMessages,
        unreadMessagesCount,
        unreadNotificationsCount,
        notifications,
        followedUserIds,
        blockedUserIds,
        isLoading,
        getOrCreateConversation,
        openConversationById,
        closeConversation,
        sendMessage,
        markConversationAsRead,
        deleteConversation,
        isFollowing,
        toggleFollow,
        getFollowersCount,
        getFollowingCount,
        getConnectionsList,
        isUserBlocked,
        blockUser,
        unblockUser,
        submitReport,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};
