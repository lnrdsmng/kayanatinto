export interface ReelsGift {
  id: string;
  name: string;
  coinPrice: number;
  icon: string;
  description: string;
  animationColor: string;
}

export const REELS_GIFT_CATALOG: ReelsGift[] = [
  {
    id: 'gift-heart',
    name: 'Puso (Heart)',
    coinPrice: 10,
    icon: '❤️',
    description: 'Simpleng pagmamahal at pagsuporta sa likha.',
    animationColor: '#EF4444',
  },
  {
    id: 'gift-flower',
    name: 'Bulaklak (Flower)',
    coinPrice: 25,
    icon: '🌸',
    description: 'Pampasigla at pagbati sa magandang gawa.',
    animationColor: '#EC4899',
  },
  {
    id: 'gift-star',
    name: 'Tala (Star)',
    coinPrice: 50,
    icon: '⭐',
    description: 'Ikaw ay kumikinang sa iyong talento!',
    animationColor: '#F59E0B',
  },
  {
    id: 'gift-trophy',
    name: 'Kopita (Trophy)',
    coinPrice: 100,
    icon: '🏆',
    description: 'Saludo sa husay at sipag ng creator!',
    animationColor: '#EAB308',
  },
  {
    id: 'gift-diamond',
    name: 'Diyamante (Diamond)',
    coinPrice: 250,
    icon: '💎',
    description: 'Pambihirang galing at gintong inspirasyon.',
    animationColor: '#06B6D4',
  },
  {
    id: 'gift-crown',
    name: 'Korona (Kayamanan Crown)',
    coinPrice: 500,
    icon: '👑',
    description: 'Dakilang pasasalamat at parangal sa komunidad.',
    animationColor: '#A855F7',
  },
];

export interface ReelItem {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatarUrl: string;
  creatorIsSenior?: boolean;
  videoUrl: string;
  videoThumbnailUrl?: string;
  caption: string;
  category: string;
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  giftsReceivedCount: number;
  createdAt: string;
}

export interface ReelsGiftTransaction {
  id: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderAvatarUrl?: string;
  receiverId: string;
  receiverUsername: string;
  reelId: string;
  reelTitle: string;
  giftId: string;
  giftName: string;
  giftIcon: string;
  coinAmount: number;
  grossPesosValue: number; // 1 Coin = ₱1.00
  platformSharePesos: number; // 20% = ₱0.20/coin
  creatorNetPesos: number; // 80% = ₱0.80/coin
  createdAt: string;
}

export interface ReelsCoinTransaction {
  id: string;
  userId: string;
  type: 'welcome_grant' | 'top_up' | 'gift_sent';
  amount: number; // positive for addition, negative for deduction
  description: string;
  relatedGiftId?: string;
  createdAt: string;
}
