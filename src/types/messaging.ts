export interface MessageContextItem {
  type: 'product' | 'service' | 'talent' | 'order' | 'booking';
  id: string;
  title: string;
  priceOrRate?: string;
  imageUrl?: string;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderAvatarUrl?: string;
  senderIsSenior?: boolean;
  recipientId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  status: MessageStatus;
  contextItem?: MessageContextItem;
}

export interface ConversationParticipant {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  isSenior?: boolean;
  role?: string;
  location?: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: Record<string, number>; // unread count keyed by userId
  updatedAt: string;
  createdAt: string;
  isBlocked?: boolean;
  blockedBy?: string;
  contextItem?: MessageContextItem;
}
