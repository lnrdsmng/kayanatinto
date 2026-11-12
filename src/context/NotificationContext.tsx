import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationItem, NotificationType } from '../types/notification';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (
    data: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>
  ) => NotificationItem;
}

const NOTIFICATIONS_STORAGE_KEY = 'kayanatin_notifications';

// Initial Seeded Notifications for initial rich experience
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'user-maria-santos',
    actorId: 'user-nanay-lita',
    actorName: 'Nanay Lita Ramos',
    actorUsername: 'nanaylita',
    actorAvatarUrl: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    actorIsSenior: true,
    type: 'message',
    title: 'Bagong Mensahe mula kay Nanay Lita',
    message: 'Magandang araw po! Oo, available pa ang sariwang Lumpiang Sariwa para sa Linggo.',
    targetId: 'conv-maria-lita',
    targetType: 'conversation',
    isRead: false,
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'user-nanay-lita',
    actorId: 'user-kuya-jayson',
    actorName: 'Kuya Jayson Morales',
    actorUsername: 'kuyajayson',
    actorAvatarUrl: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    actorIsSenior: false,
    type: 'comment',
    title: 'Nagkomento si Kuya Jayson sa iyong Talent post',
    message: '"Napakasarap naman po tingnan Nanay Lita! Subukan po namin ito lutuin bukas."',
    targetId: 'post-001',
    targetType: 'post',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'user-nanay-lita',
    userId: 'user-nanay-lita',
    actorId: 'user-maria-santos',
    actorName: 'Maria Santos',
    actorUsername: 'mariasantos',
    type: 'follow',
    title: 'Bagong Tagasunod (New Connection)',
    message: 'Nagsimula nang sumubaybay si Maria Santos sa iyong mga lutong kakanin at sining.',
    targetId: 'user-maria-santos',
    targetType: 'profile',
    isRead: true,
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-4',
    userId: 'user-maria-santos',
    actorId: 'user-kuya-jayson',
    actorName: 'Kuya Jayson Morales',
    actorUsername: 'kuyajayson',
    actorAvatarUrl: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    type: 'like',
    title: 'Nag-cheer si Kuya Jayson',
    message: 'Nagustuhan ni Kuya Jayson ang iyong sinusuportahang lokal na mga likha.',
    targetId: 'post-002',
    targetType: 'post',
    isRead: false,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-5',
    userId: 'system',
    actorId: 'system',
    actorName: 'KayaNatinTo Moderation',
    actorUsername: 'kayanatin_system',
    type: 'system',
    title: 'Paalala sa Kaligtasan at Respeto sa Komunidad',
    message: 'Laging maging magalang at tapat sa pakikipag-ugnayan sa kapwa mamamayan edad 18 pataas.',
    isRead: true,
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(allNotifications));
    } catch {
      // ignore
    }
  }, [allNotifications]);

  // Filter notifications for the current active user or system
  const userNotifications = React.useMemo(() => {
    if (!currentUser) {
      // Show general notifications when not logged in
      return allNotifications.filter(
        (n) => n.userId === 'system' || n.userId === 'user-maria-santos'
      );
    }
    return allNotifications.filter(
      (n) =>
        n.userId === currentUser.id ||
        n.userId === currentUser.username ||
        n.userId === 'system'
    );
  }, [allNotifications, currentUser]);

  const unreadCount = React.useMemo(() => {
    return userNotifications.filter((n) => !n.isRead).length;
  }, [userNotifications]);

  const markAsRead = (id: string) => {
    setAllNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    if (!currentUser) {
      setAllNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      return;
    }
    setAllNotifications((prev) =>
      prev.map((n) => {
        if (
          n.userId === currentUser.id ||
          n.userId === currentUser.username ||
          n.userId === 'system'
        ) {
          return { ...n, isRead: true };
        }
        return n;
      })
    );
  };

  const deleteNotification = (id: string) => {
    setAllNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    if (!currentUser) {
      setAllNotifications([]);
      return;
    }
    setAllNotifications((prev) =>
      prev.filter(
        (n) =>
          n.userId !== currentUser.id &&
          n.userId !== currentUser.username &&
          n.userId !== 'system'
      )
    );
  };

  const addNotification = (
    data: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>
  ): NotificationItem => {
    const newItem: NotificationItem = {
      ...data,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setAllNotifications((prev) => [newItem, ...prev]);
    return newItem;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications: userNotifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
