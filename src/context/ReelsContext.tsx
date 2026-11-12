import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ReelItem,
  ReelsGift,
  REELS_GIFT_CATALOG,
  ReelsGiftTransaction,
  ReelsCoinTransaction,
} from '../types/reels';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

interface ReelsContextType {
  reels: ReelItem[];
  reelsCoins: number;
  coinHistory: ReelsCoinTransaction[];
  giftTransactions: ReelsGiftTransaction[];
  catalog: ReelsGift[];
  activeGiftAnimation: { gift: ReelsGift; senderName: string } | null;
  clearGiftAnimation: () => void;
  sendReelsGift: (reelId: string, giftId: string) => Promise<{ success: boolean; error?: string; gift?: ReelsGift }>;
  getCreatorGifts: (usernameOrId: string) => ReelsGiftTransaction[];
  getCreatorGiftEarningsSummary: (usernameOrId: string) => {
    totalGifts: number;
    grossPesos: number;
    platformShare: number;
    netPesos: number;
    totalCoinsReceived: number;
  };
  toggleLikeReel: (reelId: string) => void;
  isReelLiked: (reelId: string) => boolean;
}

const ReelsContext = createContext<ReelsContextType | undefined>(undefined);

const REELS_STORAGE_KEY = 'kayanatin_reels_items';
const COINS_STORAGE_KEY = 'kayanatin_reels_coins_balance';
const COIN_HISTORY_KEY = 'kayanatin_reels_coin_history';
const GIFT_TX_STORAGE_KEY = 'kayanatin_reels_gift_transactions';
const REELS_LIKES_STORAGE_KEY = 'kayanatin_reels_liked_ids';

const INITIAL_REELS: ReelItem[] = [
  {
    id: 'reel-001',
    creatorId: 'user-kuya-jayson',
    creatorName: 'Jayson Bautista',
    creatorUsername: 'kuyajayson',
    creatorAvatarUrl: './assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    creatorIsSenior: false,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoThumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    caption: 'Acoustic Harana OPM session sa ilalim ng puno sa Laguna. Walang autotune, purong damdamin para sa inyo! 🎶🇵🇭',
    category: 'Pag-awit at Musika',
    hashtags: ['OPM', 'LagunaMusician', 'AcousticGuitar', 'KayaNatinTo'],
    likesCount: 142,
    commentsCount: 18,
    giftsReceivedCount: 12,
    createdAt: '2026-11-09T14:00:00Z',
  },
  {
    id: 'reel-002',
    creatorId: 'user-nanay-lita',
    creatorName: 'Lita Rodriguez (Nanay Lita)',
    creatorUsername: 'nanaylita',
    creatorAvatarUrl: './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    creatorIsSenior: true,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    videoThumbnailUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    caption: 'Sikreto sa pagbalot ng pinakamasarap at pinakacrunchy na Lumpia Shanghai ng Majayjay! Para sa inyo mga anak. 🥟✨',
    category: 'Pagluluto',
    hashtags: ['NanayLitaRecipe', 'LutongPinoy', 'SeniorArtisan', 'FilipinoFood'],
    likesCount: 289,
    commentsCount: 34,
    giftsReceivedCount: 25,
    createdAt: '2026-11-08T09:30:00Z',
  },
  {
    id: 'reel-003',
    creatorId: 'user-lola-mercy',
    creatorName: 'Mercedes Del Rosario (Lola Mercy)',
    creatorUsername: 'lolamercy',
    creatorAvatarUrl: './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    creatorIsSenior: true,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    videoThumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    caption: 'Tradisyunal na pagtahi at pag-aayos ng burdang Barong Tagalog. 40 taon nang naglilingkod sa bayan ng Pila. 🧵🪡',
    category: 'Skills at Serbisyo',
    hashtags: ['BarongTagalog', 'Handmade', 'ElderCraft', 'FilipinoTradition'],
    likesCount: 198,
    commentsCount: 22,
    giftsReceivedCount: 16,
    createdAt: '2026-11-07T11:15:00Z',
  },
  {
    id: 'reel-004',
    creatorId: 'user-mika-dela-cruz',
    creatorName: 'Mika Dela Cruz',
    creatorUsername: 'mikacrafts',
    creatorAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    creatorIsSenior: false,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    videoThumbnailUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80',
    caption: 'Paano gumawa ng beaded phone charms at kwintas mula sa upcycled glass beads! Step-by-step DIY showcase. 🎨📿',
    category: 'Sining at Likha',
    hashtags: ['DIYCrafts', 'BeadedJewelry', 'YouthArtisan', 'SupportLocal'],
    likesCount: 310,
    commentsCount: 42,
    giftsReceivedCount: 20,
    createdAt: '2026-11-06T16:45:00Z',
  },
];

export const ReelsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();

  const [reels, setReels] = useState<ReelItem[]>(() => {
    try {
      const saved = localStorage.getItem(REELS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_REELS;
  });

  // User's Reels Coins balance (separate from Stage 10 Livestream Coins)
  // New users receive a starter bonus of 100 Reels Coins to try appreciation gifting
  const [reelsCoins, setReelsCoins] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(COINS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return 100;
  });

  const [coinHistory, setCoinHistory] = useState<ReelsCoinTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(COIN_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'coin-tx-welcome',
        userId: 'any',
        type: 'welcome_grant',
        amount: 100,
        description: 'Maligayang pagdating! 100 Reels Coins starter grant para sa pagbibigay ng Appreciation Gifts.',
        createdAt: '2026-11-01T00:00:00Z',
      },
    ];
  });

  const [giftTransactions, setGiftTransactions] = useState<ReelsGiftTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(GIFT_TX_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'gift-tx-demo-01',
        senderId: 'user-maria-santos',
        senderName: 'Maria Santos',
        senderUsername: 'mariasantos',
        receiverId: 'user-nanay-lita',
        receiverUsername: 'nanaylita',
        reelId: 'reel-002',
        reelTitle: 'Sikreto sa pagbalot ng Lumpia Shanghai',
        giftId: 'gift-flower',
        giftName: 'Bulaklak (Flower)',
        giftIcon: '🌸',
        coinAmount: 25,
        grossPesosValue: 25,
        platformSharePesos: 5, // 20%
        creatorNetPesos: 20, // 80%
        createdAt: '2026-11-10T11:00:00Z',
      },
    ];
  });

  const [likedReelIds, setLikedReelIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(REELS_LIKES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [activeGiftAnimation, setActiveGiftAnimation] = useState<{ gift: ReelsGift; senderName: string } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(REELS_STORAGE_KEY, JSON.stringify(reels));
      localStorage.setItem(COINS_STORAGE_KEY, JSON.stringify(reelsCoins));
      localStorage.setItem(COIN_HISTORY_KEY, JSON.stringify(coinHistory));
      localStorage.setItem(GIFT_TX_STORAGE_KEY, JSON.stringify(giftTransactions));
      localStorage.setItem(REELS_LIKES_STORAGE_KEY, JSON.stringify(likedReelIds));
    } catch {
      // ignore
    }
  }, [reels, reelsCoins, coinHistory, giftTransactions, likedReelIds]);

  const clearGiftAnimation = () => {
    setActiveGiftAnimation(null);
  };

  const toggleLikeReel = (reelId: string) => {
    const isLiked = likedReelIds.includes(reelId);
    if (isLiked) {
      setLikedReelIds((prev) => prev.filter((id) => id !== reelId));
      setReels((prev) =>
        prev.map((r) => (r.id === reelId ? { ...r, likesCount: Math.max(0, r.likesCount - 1) } : r))
      );
    } else {
      setLikedReelIds((prev) => [...prev, reelId]);
      setReels((prev) =>
        prev.map((r) => (r.id === reelId ? { ...r, likesCount: r.likesCount + 1 } : r))
      );
    }
  };

  const isReelLiked = (reelId: string) => likedReelIds.includes(reelId);

  // Send an appreciation gift on a Reel
  const sendReelsGift = async (
    reelId: string,
    giftId: string
  ): Promise<{ success: boolean; error?: string; gift?: ReelsGift }> => {
    if (!currentUser) {
      return { success: false, error: 'Kailangan munang mag-log in upang magpadala ng gift.' };
    }

    const reel = reels.find((r) => r.id === reelId);
    if (!reel) {
      return { success: false, error: 'Hindi nahanap ang Reel.' };
    }

    const gift = REELS_GIFT_CATALOG.find((g) => g.id === giftId);
    if (!gift) {
      return { success: false, error: 'Hindi nahanap ang napiling gift.' };
    }

    // Check balance
    if (reelsCoins < gift.coinPrice) {
      return {
        success: false,
        error: `Kulang ang iyong Reels Coins. Kailangan ng ${gift.coinPrice} Coins, ngunit mayroon ka lamang ${reelsCoins} Coins.`,
      };
    }

    // Deduct coins securely
    const newBalance = reelsCoins - gift.coinPrice;
    setReelsCoins(newBalance);

    const timestamp = new Date().toISOString();

    // 1 Coin = ₱1.00 gross. 80% to creator net earnings, 20% platform share
    const grossPesos = gift.coinPrice;
    const platformShare = Math.round(grossPesos * 0.2 * 100) / 100;
    const creatorNet = Math.round((grossPesos - platformShare) * 100) / 100;

    const newGiftTx: ReelsGiftTransaction = {
      id: `GIFT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderUsername: currentUser.username,
      senderAvatarUrl: currentUser.avatarUrl,
      receiverId: reel.creatorId,
      receiverUsername: reel.creatorUsername,
      reelId: reel.id,
      reelTitle: reel.caption,
      giftId: gift.id,
      giftName: gift.name,
      giftIcon: gift.icon,
      coinAmount: gift.coinPrice,
      grossPesosValue: grossPesos,
      platformSharePesos: platformShare,
      creatorNetPesos: creatorNet,
      createdAt: timestamp,
    };

    const newCoinTx: ReelsCoinTransaction = {
      id: `COIN-TX-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: currentUser.id,
      type: 'gift_sent',
      amount: -gift.coinPrice,
      description: `Nagpadala ng ${gift.name} (${gift.icon}) kay @${reel.creatorUsername} sa kanyang Reel.`,
      relatedGiftId: gift.id,
      createdAt: timestamp,
    };

    setGiftTransactions((prev) => [newGiftTx, ...prev]);
    setCoinHistory((prev) => [newCoinTx, ...prev]);

    // Update reel gifts counter
    setReels((prev) =>
      prev.map((r) => (r.id === reelId ? { ...r, giftsReceivedCount: r.giftsReceivedCount + 1 } : r))
    );

    // Trigger visual celebratory animation
    setActiveGiftAnimation({ gift, senderName: currentUser.fullName });

    // Send notification
    addNotification({
      userId: currentUser.id,
      type: 'order_status',
      title: `Matagumpay na naipadala ang ${gift.name} ${gift.icon}!`,
      message: `Ibinawas ang ${gift.coinPrice} Reels Coins sa iyong balance para sa pagsuporta kay @${reel.creatorUsername}.`,
      data: { giftId: gift.id, reelId },
    });

    return { success: true, gift };
  };

  const getCreatorGifts = (usernameOrId: string): ReelsGiftTransaction[] => {
    const q = (usernameOrId || '').toLowerCase();
    return giftTransactions.filter(
      (tx) => tx.receiverId.toLowerCase() === q || tx.receiverUsername.toLowerCase() === q
    );
  };

  const getCreatorGiftEarningsSummary = (usernameOrId: string) => {
    const list = getCreatorGifts(usernameOrId);
    const totalGifts = list.length;
    const grossPesos = list.reduce((sum, item) => sum + item.grossPesosValue, 0);
    const platformShare = list.reduce((sum, item) => sum + item.platformSharePesos, 0);
    const netPesos = list.reduce((sum, item) => sum + item.creatorNetPesos, 0);
    const totalCoinsReceived = list.reduce((sum, item) => sum + item.coinAmount, 0);

    return {
      totalGifts,
      grossPesos: Math.round(grossPesos * 100) / 100,
      platformShare: Math.round(platformShare * 100) / 100,
      netPesos: Math.round(netPesos * 100) / 100,
      totalCoinsReceived,
    };
  };

  return (
    <ReelsContext.Provider
      value={{
        reels,
        reelsCoins,
        coinHistory,
        giftTransactions,
        catalog: REELS_GIFT_CATALOG,
        activeGiftAnimation,
        clearGiftAnimation,
        sendReelsGift,
        getCreatorGifts,
        getCreatorGiftEarningsSummary,
        toggleLikeReel,
        isReelLiked,
      }}
    >
      {children}
    </ReelsContext.Provider>
  );
};

export const useReels = (): ReelsContextType => {
  const context = useContext(ReelsContext);
  if (!context) {
    throw new Error('useReels must be used within a ReelsProvider');
  }
  return context;
};
