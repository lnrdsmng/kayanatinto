export type NotificationType =
  | 'message'
  | 'like'
  | 'comment'
  | 'reply'
  | 'follow'
  | 'order'
  | 'booking'
  | 'system'
  | 'gift'
  | 'order_status';

export interface NotificationItem {
  id: string;
  userId: string; // The recipient of the notification
  actorId?: string; // Who performed the action
  actorName?: string;
  actorUsername?: string;
  actorAvatarUrl?: string;
  actorIsSenior?: boolean;
  type: NotificationType;
  title: string;
  message: string;
  targetId?: string; // e.g. post id, conversation id, user profile id, order id, booking id
  targetType?: 'post' | 'conversation' | 'product' | 'service' | 'profile' | 'order' | 'booking';
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}
