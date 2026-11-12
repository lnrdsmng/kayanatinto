export type MessageStatus = 'sending' | 'sent' | 'read';

export interface MessageContextItem {
  type: 'product' | 'service' | 'talent';
  id: string;
  title: string;
  priceOrCategory?: string;
  thumbnailUrl?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderAvatarUrl?: string;
  recipientId: string;
  text: string;
  imageUrl?: string;
  contextItem?: MessageContextItem;
  createdAt: string;
  status: MessageStatus;
  isRead: boolean;
}

export interface ConversationParticipant {
  id: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
  isSenior?: boolean;
  roleTitle?: string;
  city?: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants: ConversationParticipant[];
  lastMessage?: {
    text: string;
    senderId: string;
    senderName: string;
    createdAt: string;
    isRead: boolean;
  };
  unreadCount: Record<string, number>; // keyed by userId
  createdAt: string;
  updatedAt: string;
  isBlocked?: boolean;
  blockedByUserId?: string;
}

export type NotificationType =
  | 'message'
  | 'like'
  | 'comment'
  | 'reply'
  | 'follow'
  | 'system';

export interface NotificationItem {
  id: string;
  recipientUserId: string;
  actor: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    isSenior?: boolean;
  };
  type: NotificationType;
  title: string;
  description: string;
  targetType?: 'post' | 'conversation' | 'product' | 'service' | 'user';
  targetId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface UserConnectionProfile {
  id: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
  isSenior?: boolean;
  accountType?: string;
  city?: string;
  province?: string;
  bio?: string;
}

export type ModerationReportType = 'user' | 'message' | 'comment' | 'post';

export type ModerationReason =
  | 'underage' // below 18 years old
  | 'scam'
  | 'inappropriate'
  | 'harassment'
  | 'spam'
  | 'other';

export interface ModerationReport {
  id: string;
  reporterId: string;
  reporterUsername: string;
  targetType: ModerationReportType;
  targetId: string;
  targetAuthorUsername: string;
  reason: ModerationReason;
  explanation: string;
  createdAt: string;
  status: 'pending_review' | 'resolved';
}

export const REPORT_REASONS_MAP: { id: ModerationReason; label: string; tagalogLabel: string; description: string }[] = [
  {
    id: 'underage',
    label: 'Under 18 Years Old',
    tagalogLabel: 'Wala pang 18 taong gulang',
    description: 'Ang KayaNatinTo ay eksklusibo sa mga 18 taong gulang pataas para sa proteksyon at pananagutan.',
  },
  {
    id: 'scam',
    label: 'Scam / Fraudulent Listing',
    tagalogLabel: 'Panloloko o pekeng transaksyon',
    description: 'Hinihilingan ng bank OTP, bayad sa labas ng plataporma, o pekeng produkto.',
  },
  {
    id: 'inappropriate',
    label: 'Inappropriate Content',
    tagalogLabel: 'Hindi angkop na larawan o salita',
    description: 'Bastos, sensitibo, o labag sa kultura ng paggalang at pampamilyang pamayanan.',
  },
  {
    id: 'harassment',
    label: 'Harassment or Disrespect',
    tagalogLabel: 'Pang-aabuso o pambabastos',
    description: 'Pangmamaliit sa kapwa artisan, panlalait sa senior citizens, o paulit-ulit na pag-abala.',
  },
  {
    id: 'spam',
    label: 'Spam or Repetitive Flooding',
    tagalogLabel: 'Spam o paulit-ulit na mensahe',
    description: 'Pang-iisturbo gamit ang mga automated links o walang kabuluhang advertisement.',
  },
  {
    id: 'other',
    label: 'Other Concern',
    tagalogLabel: 'Iba pang alalahanin',
    description: 'Ibang isyu na lumalabag sa mga alituntunin ng pamayanan.',
  },
];
