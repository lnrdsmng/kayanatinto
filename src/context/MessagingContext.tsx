import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Conversation,
  Message,
  ConversationParticipant,
  MessageContextItem,
} from '../types/messaging';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { useConnections } from './ConnectionContext';

interface MessagingContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  activeConversationId: string | null;
  activeMessages: Message[];
  totalUnreadCount: number;
  setActiveConversationId: (id: string | null) => void;
  getOrCreateConversation: (
    participant: ConversationParticipant,
    initialMessage?: string,
    contextItem?: MessageContextItem
  ) => string;
  sendMessage: (
    conversationId: string,
    content: string,
    imageUrl?: string
  ) => Message | null;
  markConversationAsRead: (conversationId: string) => void;
  blockConversation: (conversationId: string) => void;
  unblockConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  searchConversations: (query: string) => Conversation[];
}

const CONVERSATIONS_STORAGE_KEY = 'kayanatin_conversations';
const MESSAGES_STORAGE_KEY = 'kayanatin_messages';

// Initial pre-seeded conversations between community demo members
const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-maria-lita',
    participantIds: ['user-maria-santos', 'user-nanay-lita'],
    participants: [
      {
        id: 'user-maria-santos',
        name: 'Maria Santos',
        username: 'mariasantos',
        role: 'Customer / Buyer',
        location: 'Quezon City',
      },
      {
        id: 'user-nanay-lita',
        name: 'Nanay Lita Rodriguez',
        username: 'nanaylita',
        avatarUrl: './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
        isSenior: true,
        role: 'Food Artisan / Seller',
        location: 'Majayjay, Laguna',
      },
    ],
    updatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    unreadCount: {
      'user-maria-santos': 1,
      'user-nanay-lita': 0,
    },
    contextItem: {
      type: 'product',
      id: 'lumpia-01',
      title: 'Lumpiang Shanghai at Heirloom Kakanin',
      priceOrRate: '₱180 / pack',
      imageUrl: './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    },
  },
  {
    id: 'conv-maria-jayson',
    participantIds: ['user-maria-santos', 'user-kuya-jayson'],
    participants: [
      {
        id: 'user-maria-santos',
        name: 'Maria Santos',
        username: 'mariasantos',
        role: 'Customer / Buyer',
        location: 'Quezon City',
      },
      {
        id: 'user-kuya-jayson',
        name: 'Jayson Bautista',
        username: 'kuyajayson',
        avatarUrl: './assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
        isSenior: false,
        role: 'Musician / Talent Creator',
        location: 'San Pablo, Laguna',
      },
    ],
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    unreadCount: {
      'user-maria-santos': 0,
      'user-kuya-jayson': 0,
    },
    contextItem: {
      type: 'service',
      id: 'srv-002',
      title: 'Acoustic Guitar Lessons & Live Harana',
      priceOrRate: '₱350 / session',
      imageUrl: './assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    },
  },
  {
    id: 'conv-jayson-mercy',
    participantIds: ['user-kuya-jayson', 'user-lola-mercy'],
    participants: [
      {
        id: 'user-kuya-jayson',
        name: 'Jayson Bautista',
        username: 'kuyajayson',
        avatarUrl: './assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
        isSenior: false,
        role: 'Musician',
        location: 'San Pablo, Laguna',
      },
      {
        id: 'user-lola-mercy',
        name: 'Mercedes Del Rosario',
        username: 'lolamercy',
        avatarUrl: './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
        isSenior: true,
        role: 'Master Seamstress',
        location: 'Pila, Laguna',
      },
    ],
    updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    unreadCount: {
      'user-kuya-jayson': 0,
      'user-lola-mercy': 0,
    },
    contextItem: {
      type: 'service',
      id: 'srv-001',
      title: 'Barong Alterations & Traditional Pananahi',
      priceOrRate: '₱250 / gawa',
      imageUrl: './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    },
  },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-101',
    conversationId: 'conv-maria-lita',
    senderId: 'user-maria-santos',
    senderName: 'Maria Santos',
    senderUsername: 'mariasantos',
    recipientId: 'user-nanay-lita',
    content: 'Magandang hapon po Nanay Lita! Nais ko po sanang mag-order ng 3 packs ng inyong frozen Lumpiang Shanghai para sa kaarawan ng kapatid ko sa darating na Linggo.',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    status: 'read',
  },
  {
    id: 'msg-102',
    conversationId: 'conv-maria-lita',
    senderId: 'user-nanay-lita',
    senderName: 'Nanay Lita Rodriguez',
    senderUsername: 'nanaylita',
    senderAvatarUrl: './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    senderIsSenior: true,
    recipientId: 'user-maria-santos',
    content: 'Naku, maraming salamat iha! Opo, may sariwa tayong balot bukas ng umaga. Maaari ninyong i-pickup sa aming bahay sa Majayjay o ipahatid sa San Pablo terminal.',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    status: 'delivered',
  },
  {
    id: 'msg-201',
    conversationId: 'conv-maria-jayson',
    senderId: 'user-maria-santos',
    senderName: 'Maria Santos',
    senderUsername: 'mariasantos',
    recipientId: 'user-kuya-jayson',
    content: 'Hi Kuya Jayson! Napanood ko ang guitar cover mo sa Tanghalan. Nagtuturo ka po ba ng online acoustic basics para sa beginners?',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    status: 'read',
  },
  {
    id: 'msg-202',
    conversationId: 'conv-maria-jayson',
    senderId: 'user-kuya-jayson',
    senderName: 'Jayson Bautista',
    senderUsername: 'kuyajayson',
    senderAvatarUrl: './assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    recipientId: 'user-maria-santos',
    content: 'Opo Ate Maria! Puwede po tayong mag-1-on-1 video session tuwing weekends. Padadalhan din kita ng chord charts ng mga paboritong OPM songs.',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    status: 'read',
  },
  {
    id: 'msg-301',
    conversationId: 'conv-jayson-mercy',
    senderId: 'user-kuya-jayson',
    senderName: 'Jayson Bautista',
    senderUsername: 'kuyajayson',
    senderAvatarUrl: './assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    recipientId: 'user-lola-mercy',
    content: 'Lola Mercy, magpapatulong po sana ako magpa-repair ng manggas ng aking lumang barong para sa recital sa susunod na buwan.',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    status: 'read',
  },
  {
    id: 'msg-302',
    conversationId: 'conv-jayson-mercy',
    senderId: 'user-lola-mercy',
    senderName: 'Mercedes Del Rosario',
    senderUsername: 'lolamercy',
    senderAvatarUrl: './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    senderIsSenior: true,
    recipientId: 'user-kuya-jayson',
    content: 'Aba oo naman iho, dalhin mo lang dito sa Pila sa Biyernes para masukat natin nang tama at matibay ang pagkakatahi.',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 15 * 60 * 1000).toISOString(),
    status: 'read',
  },
];

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();
  const { isBlocked } = useConnections();

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_CONVERSATIONS;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(MESSAGES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_MESSAGES;
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
    } catch {}
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Strict participant access control: users only see conversations where they are participants!
  const userConversations = useMemo(() => {
    const currentId = currentUser ? currentUser.id : 'user-maria-santos';
    const currentUsername = currentUser ? currentUser.username : 'mariasantos';

    return conversations
      .filter((conv) => {
        return (
          conv.participantIds.includes(currentId) ||
          conv.participantIds.includes(currentUsername) ||
          conv.participants.some(
            (p) => p.id === currentId || p.username.toLowerCase() === currentUsername.toLowerCase()
          )
        );
      })
      .map((conv) => {
        // Attach the latest message
        const convMessages = messages.filter((m) => m.conversationId === conv.id);
        const lastMsg = convMessages[convMessages.length - 1];
        return {
          ...conv,
          lastMessage: lastMsg,
          isBlocked: conv.isBlocked || conv.participants.some((p) => isBlocked(p.id)),
        };
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [conversations, messages, currentUser, isBlocked]);

  // Current active conversation
  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null;
    return userConversations.find((c) => c.id === activeConversationId) || null;
  }, [activeConversationId, userConversations]);

  // Current active messages
  const activeMessages = useMemo(() => {
    if (!activeConversationId) return [];
    return messages.filter((m) => m.conversationId === activeConversationId);
  }, [activeConversationId, messages]);

  // Total unread messages for the active user
  const totalUnreadCount = useMemo(() => {
    const currentId = currentUser ? currentUser.id : 'user-maria-santos';
    let count = 0;
    userConversations.forEach((conv) => {
      count += conv.unreadCount[currentId] || 0;
    });
    return count;
  }, [userConversations, currentUser]);

  // Mark active conversation read when opened
  useEffect(() => {
    if (activeConversationId) {
      markConversationAsRead(activeConversationId);
    }
  }, [activeConversationId]);

  const markConversationAsRead = (convId: string) => {
    const currentId = currentUser ? currentUser.id : 'user-maria-santos';

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            unreadCount: {
              ...c.unreadCount,
              [currentId]: 0,
            },
          };
        }
        return c;
      })
    );

    // Update statuses of messages received
    setMessages((prev) =>
      prev.map((m) => {
        if (m.conversationId === convId && m.recipientId === currentId && m.status !== 'read') {
          return { ...m, status: 'read' };
        }
        return m;
      })
    );
  };

  // Get or Create Conversation (strictly avoids duplicates!)
  const getOrCreateConversation = (
    targetParticipant: ConversationParticipant,
    initialMessage?: string,
    contextItem?: MessageContextItem
  ): string => {
    const currentId = currentUser ? currentUser.id : 'user-maria-santos';
    const currentName = currentUser ? currentUser.fullName : 'Maria Santos';
    const currentUsername = currentUser ? currentUser.username : 'mariasantos';
    const currentAvatar = currentUser ? currentUser.avatarUrl : '';
    const currentIsSenior = currentUser ? currentUser.isSenior : false;

    // 1. Check if conversation already exists
    const existing = conversations.find((conv) => {
      const hasMe =
        conv.participantIds.includes(currentId) ||
        conv.participantIds.includes(currentUsername);
      const hasOther =
        conv.participantIds.includes(targetParticipant.id) ||
        conv.participantIds.includes(targetParticipant.username) ||
        conv.participants.some(
          (p) =>
            p.id === targetParticipant.id ||
            p.username.toLowerCase() === targetParticipant.username.toLowerCase()
        );
      return hasMe && hasOther;
    });

    if (existing) {
      // Update context item if provided and open it
      if (contextItem || initialMessage) {
        setConversations((prev) =>
          prev.map((c) => (c.id === existing.id ? { ...c, contextItem: contextItem || c.contextItem } : c))
        );
        if (initialMessage) {
          sendMessage(existing.id, initialMessage);
        }
      }
      setActiveConversationId(existing.id);
      return existing.id;
    }

    // 2. Create brand-new conversation
    const newConvId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newConversation: Conversation = {
      id: newConvId,
      participantIds: [currentId, targetParticipant.id],
      participants: [
        {
          id: currentId,
          name: currentName,
          username: currentUsername,
          avatarUrl: currentAvatar,
          isSenior: currentIsSenior,
          role: currentUser?.accountType || 'buyer',
          location: currentUser ? `${currentUser.location.city}, ${currentUser.location.province}` : 'Laguna',
        },
        targetParticipant,
      ],
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      unreadCount: {
        [currentId]: 0,
        [targetParticipant.id]: initialMessage ? 1 : 0,
      },
      contextItem: contextItem,
    };

    setConversations((prev) => [newConversation, ...prev]);

    // Add initial message if provided
    if (initialMessage) {
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        conversationId: newConvId,
        senderId: currentId,
        senderName: currentName,
        senderUsername: currentUsername,
        senderAvatarUrl: currentAvatar,
        senderIsSenior: currentIsSenior,
        recipientId: targetParticipant.id,
        content: initialMessage,
        createdAt: new Date().toISOString(),
        status: 'sent',
        contextItem,
      };
      setMessages((prev) => [...prev, newMsg]);
    }

    setActiveConversationId(newConvId);
    return newConvId;
  };

  // Send Message
  const sendMessage = (
    conversationId: string,
    content: string,
    imageUrl?: string
  ): Message | null => {
    const cleanContent = content.trim();
    if (!cleanContent && !imageUrl) return null;

    const currentId = currentUser ? currentUser.id : 'user-maria-santos';
    const currentName = currentUser ? currentUser.fullName : 'Maria Santos';
    const currentUsername = currentUser ? currentUser.username : 'mariasantos';
    const currentAvatar = currentUser ? currentUser.avatarUrl : '';
    const currentIsSenior = currentUser ? currentUser.isSenior : false;

    const conv = conversations.find((c) => c.id === conversationId);
    if (!conv) return null;

    // Check if blocked
    if (conv.isBlocked) {
      return null;
    }

    // Identify recipient
    const recipient = conv.participants.find(
      (p) => p.id !== currentId && p.username.toLowerCase() !== currentUsername.toLowerCase()
    ) || conv.participants[0];

    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      senderId: currentId,
      senderName: currentName,
      senderUsername: currentUsername,
      senderAvatarUrl: currentAvatar,
      senderIsSenior: currentIsSenior,
      recipientId: recipient.id,
      content: cleanContent,
      imageUrl,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, newMsg]);

    // Update conversation
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: newMsg,
            updatedAt: newMsg.createdAt,
            unreadCount: {
              ...c.unreadCount,
              [recipient.id]: (c.unreadCount[recipient.id] || 0) + 1,
            },
          };
        }
        return c;
      })
    );

    // Send notification to recipient
    addNotification({
      userId: recipient.id,
      actorId: currentId,
      actorName: currentName,
      actorUsername: currentUsername,
      actorAvatarUrl: currentAvatar,
      actorIsSenior: currentIsSenior,
      type: 'message',
      title: `Bagong mensahe mula kay ${currentName}`,
      message: cleanContent.slice(0, 120),
      targetId: conversationId,
      targetType: 'conversation',
    });

    // Realistic Demo Auto-reply simulation for rich interactivity
    const demoKeywords = ['nanaylita', 'kuyajayson', 'lolamercy'];
    const isTargetingDemo = demoKeywords.some(
      (k) =>
        recipient.username.toLowerCase().includes(k) ||
        recipient.id.toLowerCase().includes(k)
    );

    if (isTargetingDemo && recipient.id !== currentId) {
      setTimeout(() => {
        let replyText = 'Salamat po sa inyong mensahe! Pag-usapan po natin ang detalye rito sa KayaNatinTo.';
        if (recipient.username.includes('nanaylita')) {
          replyText = 'Salamat po sa inyong pagtangkilik! Nakahanda po ang ating mga gawang-bahay. Masaya po akong makapaglingkod sa kapwa Pilipino.';
        } else if (recipient.username.includes('kuyajayson')) {
          replyText = 'Maraming salamat po! Handang-handa po akong tumugtog at magbahagi ng awitin para sa inyo. Ingat po lagi!';
        } else if (recipient.username.includes('lolamercy')) {
          replyText = 'Opo, aasahan ko po kayo sa aking talyer dito sa Pila. Iingatan natin ang inyong damit.';
        }

        const replyMsg: Message = {
          id: `msg-${Date.now()}-reply`,
          conversationId,
          senderId: recipient.id,
          senderName: recipient.name,
          senderUsername: recipient.username,
          senderAvatarUrl: recipient.avatarUrl,
          senderIsSenior: recipient.isSenior,
          recipientId: currentId,
          content: replyText,
          createdAt: new Date().toISOString(),
          status: 'delivered',
        };

        setMessages((prev) => [...prev, replyMsg]);

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === conversationId) {
              return {
                ...c,
                lastMessage: replyMsg,
                updatedAt: replyMsg.createdAt,
                unreadCount: {
                  ...c.unreadCount,
                  [currentId]: (c.unreadCount[currentId] || 0) + 1,
                },
              };
            }
            return c;
          })
        );

        addNotification({
          userId: currentId,
          actorId: recipient.id,
          actorName: recipient.name,
          actorUsername: recipient.username,
          actorAvatarUrl: recipient.avatarUrl,
          actorIsSenior: recipient.isSenior,
          type: 'message',
          title: `Tumugon si ${recipient.name}`,
          message: replyText,
          targetId: conversationId,
          targetType: 'conversation',
        });
      }, 1600);
    }

    return newMsg;
  };

  const blockConversation = (conversationId: string) => {
    const currentId = currentUser ? currentUser.id : 'user-maria-santos';
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, isBlocked: true, blockedBy: currentId }
          : c
      )
    );
  };

  const unblockConversation = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, isBlocked: false, blockedBy: undefined }
          : c
      )
    );
  };

  const deleteConversation = (conversationId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    setMessages((prev) => prev.filter((m) => m.conversationId !== conversationId));
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
    }
  };

  const searchConversations = (query: string): Conversation[] => {
    const q = query.toLowerCase().trim();
    if (!q) return userConversations;

    return userConversations.filter((c) => {
      const matchParticipant = c.participants.some(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.username.toLowerCase().includes(q) ||
          (p.role && p.role.toLowerCase().includes(q))
      );
      const matchLastMsg = c.lastMessage && c.lastMessage.content.toLowerCase().includes(q);
      const matchContext = c.contextItem && c.contextItem.title.toLowerCase().includes(q);
      return matchParticipant || matchLastMsg || matchContext;
    });
  };

  return (
    <MessagingContext.Provider
      value={{
        conversations: userConversations,
        activeConversation,
        activeConversationId,
        activeMessages,
        totalUnreadCount,
        setActiveConversationId,
        getOrCreateConversation,
        sendMessage,
        markConversationAsRead,
        blockConversation,
        unblockConversation,
        deleteConversation,
        searchConversations,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};
