import React, { createContext, useContext, useState, useEffect } from 'react';
import { TalentPost, TalentComment, TalentCategory } from '../types/talent';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';

interface TalentContextType {
  posts: TalentPost[];
  likedPostIds: string[];
  bookmarkedPostIds: string[];
  reportedPostIds: string[];
  isLoading: boolean;
  createPost: (data: Omit<TalentPost, 'id' | 'createdAt' | 'likesCount' | 'comments'>) => TalentPost;
  updatePost: (id: string, updatedFields: Partial<TalentPost>) => boolean;
  deletePost: (id: string) => boolean;
  toggleLikePost: (id: string) => void;
  isPostLiked: (id: string) => boolean;
  toggleBookmarkPost: (id: string) => void;
  isPostBookmarked: (id: string) => boolean;
  addComment: (
    postId: string,
    commentData:
      | string
      | {
          authorId: string;
          authorName: string;
          authorUsername: string;
          authorAvatarUrl?: string;
          authorIsSenior?: boolean;
          content: string;
        }
  ) => TalentComment | null;
  addReply: (
    postId: string,
    parentCommentId: string,
    replyData:
      | string
      | {
          authorId: string;
          authorName: string;
          authorUsername: string;
          authorAvatarUrl?: string;
          authorIsSenior?: boolean;
          content: string;
        }
  ) => TalentComment | null;
  addReplyToComment: (
    postId: string,
    parentCommentId: string,
    replyData:
      | string
      | {
          authorId: string;
          authorName: string;
          authorUsername: string;
          authorAvatarUrl?: string;
          authorIsSenior?: boolean;
          content: string;
        }
  ) => TalentComment | null;
  updateComment: (postId: string, commentId: string, newContent: string) => boolean;
  deleteComment: (postId: string, commentId: string) => boolean;
  reportPost: (postId: string, reason: string) => void;
  isPostReported: (postId: string) => boolean;
  getCreatorPosts: (username: string) => TalentPost[];
  getPostsByCategory: (category: TalentCategory) => TalentPost[];
}

const POSTS_STORAGE_KEY = 'kayanatin_talent_posts';
const LIKES_STORAGE_KEY = 'kayanatin_liked_talent_post_ids';
const BOOKMARKS_STORAGE_KEY = 'kayanatin_bookmarked_talent_post_ids';
const REPORTED_STORAGE_KEY = 'kayanatin_reported_talent_post_ids';

const INITIAL_TALENT_POSTS: TalentPost[] = [
  {
    id: 'post-001',
    creatorId: 'usr-001',
    creatorName: 'Nanay Lita Ramos',
    creatorUsername: 'nanaylita',
    creatorAvatarUrl: './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    creatorIsSenior: true,
    creatorAge: 68,
    location: {
      city: 'Majayjay',
      province: 'Laguna',
      barangay: 'Brgy. Malinao',
    },
    mediaType: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoThumbnailUrl: './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    videoDuration: '1:45',
    caption: 'Masarap at Madaling Ulam para sa Pamilya ❤️ Ibinabahagi ko ang sikreto sa malutong na pambalot ng Lumpiang Sariwa at lumang timpla ng Menudo na natutunan ko pa sa aking lola noong 1968. Sana ay subukan ninyo para sa inyong hapag-kainan!',
    category: 'cooking-baking',
    hashtags: ['#KayaNatinPH', '#LutongBahay', '#SeniorChef', '#MajayjayLaguna', '#TradisyunalNaResipe'],
    likesCount: 142,
    comments: [
      {
        id: 'comm-101',
        authorId: 'usr-002',
        authorName: 'Kuya Jayson Morales',
        authorUsername: 'jayson_music',
        authorAvatarUrl: './assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
        authorIsSenior: false,
        content: 'Napakasarap naman po tingnan Nanay Lita! Subukan po namin ito lutuin bukas.',
        createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      },
      {
        id: 'comm-102',
        authorId: 'usr-003',
        authorName: 'Lola Mercy Ramos',
        authorUsername: 'lola_mercy',
        authorAvatarUrl: './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
        authorIsSenior: true,
        content: 'Ganyan din ang luto ng nanay ko noon sa Pila. Tunay na lasang pamana!',
        createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    linkedProductId: 'prod-001',
    linkedServiceId: 'srv-006',
    isFeatured: true,
  },
  {
    id: 'post-002',
    creatorId: 'usr-002',
    creatorName: 'Kuya Jayson Morales',
    creatorUsername: 'jayson_music',
    creatorAvatarUrl: './assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    creatorIsSenior: false,
    creatorAge: 22,
    location: {
      city: 'San Pablo City',
      province: 'Laguna',
      barangay: 'Brgy. San Jose',
    },
    mediaType: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    videoThumbnailUrl: './assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    videoDuration: '2:10',
    caption: 'Music is life! 🎵 Let\'s spread good vibes! Narito ang simpleng acoustic cover ko ng paborito nating OPM classic harana. Sana po ay magustuhan ninyo at magsilbing pampagana sa ating araw!',
    category: 'music',
    hashtags: ['#KayaNatinPH', '#Music', '#Talent', '#AcousticGuitar', '#OPM', '#SanPabloCity'],
    likesCount: 98,
    comments: [
      {
        id: 'comm-201',
        authorId: 'usr-001',
        authorName: 'Nanay Lita Ramos',
        authorUsername: 'nanaylita',
        authorAvatarUrl: './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
        authorIsSenior: true,
        content: 'Napakagandang pakinggan iho! Ipagpatuloy ang iyong galing sa musika.',
        createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    linkedServiceId: 'srv-002',
    isFeatured: true,
  },
  {
    id: 'post-003',
    creatorId: 'usr-003',
    creatorName: 'Lola Mercy Ramos',
    creatorUsername: 'lola_mercy',
    creatorAvatarUrl: './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    creatorIsSenior: true,
    creatorAge: 64,
    location: {
      city: 'Pila',
      province: 'Laguna',
      barangay: 'Brgy. Santa Clara',
    },
    mediaType: 'photo',
    mediaUrl: './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    caption: 'Mabusising Pagbuburda at Pananahi sa Tradisyunal na Filipiniana 🪡 Hindi hadlang ang edad upang patuloy na lumikha. Bawat tusok ng karayom ay may pagmamahal sa kulturang Pilipino.',
    category: 'handicrafts-diy',
    hashtags: ['#Pananahi', '#Filipiniana', '#GawangKamay', '#SeniorSkills', '#PilaLaguna'],
    likesCount: 115,
    comments: [],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    linkedServiceId: 'srv-001',
    isFeatured: true,
  },
  {
    id: 'post-004',
    creatorId: 'usr-004',
    creatorName: 'Kuya Jun Woodworks',
    creatorUsername: 'kuya_jun_crafts',
    creatorAvatarUrl: './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    creatorIsSenior: false,
    creatorAge: 49,
    location: {
      city: 'Paete',
      province: 'Laguna',
      barangay: 'Brgy. Quinale',
    },
    mediaType: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    videoThumbnailUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
    videoDuration: '1:15',
    caption: 'Tradisyunal na Pag-uukit sa Kahoy (Paete Woodcraft Demo) 🪵 Ipinapakita ko rito ang tamang hawak sa paet at martilyo upang lumabas ang natural na hibla ng kahoy.',
    category: 'handicrafts-diy',
    hashtags: ['#PaeteWoodcarving', '#WoodCraft', '#SiningNgPaete', '#GawangLaguna'],
    likesCount: 84,
    comments: [],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    linkedServiceId: 'srv-003',
    isFeatured: true,
  },
  {
    id: 'post-005',
    creatorId: 'usr-005',
    creatorName: 'Mang Noel Local Sining',
    creatorUsername: 'noel_art_ph',
    creatorAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    creatorIsSenior: false,
    creatorAge: 48,
    location: {
      city: 'San Pablo City',
      province: 'Laguna',
      barangay: 'Brgy. Concepcion',
    },
    mediaType: 'photo',
    mediaUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    caption: 'Handmade Oil Portrait on Canvas 🎨 Isang pagpupugay sa ating mga magsasaka at manggagawa. Natapos ang obra matapos ang tatlong linggong masusing pagpipinta.',
    category: 'drawing-painting',
    hashtags: ['#PinoyArt', '#OilPainting', '#PortraitArt', '#SanPabloArtists'],
    likesCount: 76,
    comments: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    linkedProductId: 'portrait-01',
    isFeatured: false,
  },
  {
    id: 'post-006',
    creatorId: 'usr-006',
    creatorName: 'Teacher Grace Villanueva',
    creatorUsername: 'teacher_grace',
    creatorAvatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    creatorIsSenior: false,
    creatorAge: 38,
    location: {
      city: 'Majayjay',
      province: 'Laguna',
      barangay: 'Brgy. San Francisco',
    },
    mediaType: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    videoThumbnailUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80',
    videoDuration: '1:30',
    caption: 'Kuwentong Pambata: "Si Pagong at Si Matsing" 📚 Masayang pagbabasa na may kasamang aral sa katapatan at pamilya. Panoorin kasama ng inyong mga anak!',
    category: 'storytelling-writing',
    hashtags: ['#KuwentongPambata', '#Edukasyon', '#Pagbasa', '#Storytelling', '#Majayjay'],
    likesCount: 63,
    comments: [],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    linkedServiceId: 'srv-004',
    isFeatured: false,
  },
  {
    id: 'post-007',
    creatorId: 'usr-007',
    creatorName: 'Nanay Elena Baked Goodies',
    creatorUsername: 'elena_bakes',
    creatorAvatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80',
    creatorIsSenior: true,
    creatorAge: 61,
    location: {
      city: 'San Pablo City',
      province: 'Laguna',
      barangay: 'Brgy. San Roque',
    },
    mediaType: 'photo',
    mediaUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    caption: 'Fresh from the Oven! Mainit-init na Laguna Buko Pie at Malalambot na Ensaymada 🥧 Dalisay na gata at tunay na keso de bola.',
    category: 'cooking-baking',
    hashtags: ['#BukoPie', '#Baking', '#SanPabloDelicacy', '#LutongPinoy'],
    likesCount: 89,
    comments: [],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    linkedProductId: 'pastries-01',
    isFeatured: false,
  },
  {
    id: 'post-008',
    creatorId: 'usr-009',
    creatorName: 'Kuya Dexter Alcantara',
    creatorUsername: 'dexter_photos',
    creatorAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    creatorIsSenior: false,
    creatorAge: 29,
    location: {
      city: 'Calamba',
      province: 'Laguna',
      barangay: 'Brgy. Real',
    },
    mediaType: 'photo',
    mediaUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    caption: 'Gintong Bukang-Liwayway sa Lawa ng Laguna 🌅 Kuha mula sa Baywalk ng Calamba gamit ang natural lighting.',
    category: 'photo-video',
    hashtags: ['#Photography', '#LagunaDeBay', '#CalambaCity', '#SunriseView'],
    likesCount: 110,
    comments: [],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    linkedServiceId: 'srv-008',
    isFeatured: false,
  },
];

const TalentContext = createContext<TalentContextType | undefined>(undefined);

export const TalentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();
  const [posts, setPosts] = useState<TalentPost[]>(() => {
    try {
      const saved = localStorage.getItem(POSTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_TALENT_POSTS;
  });

  const [likedPostIds, setLikedPostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LIKES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [reportedPostIds, setReportedPostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(REPORTED_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
    } catch {
      // ignore
    }
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likedPostIds));
    } catch {
      // ignore
    }
  }, [likedPostIds]);

  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarkedPostIds));
    } catch {
      // ignore
    }
  }, [bookmarkedPostIds]);

  useEffect(() => {
    try {
      localStorage.setItem(REPORTED_STORAGE_KEY, JSON.stringify(reportedPostIds));
    } catch {
      // ignore
    }
  }, [reportedPostIds]);

  const createPost = (data: Omit<TalentPost, 'id' | 'createdAt' | 'likesCount' | 'comments'>): TalentPost => {
    const newPost: TalentPost = {
      ...data,
      id: `post-${Date.now()}`,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);
    return newPost;
  };

  const updatePost = (id: string, updatedFields: Partial<TalentPost>): boolean => {
    let updated = false;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          updated = true;
          return {
            ...p,
            ...updatedFields,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
    return updated;
  };

  const deletePost = (id: string): boolean => {
    let deleted = false;
    setPosts((prev) => {
      const exists = prev.some((p) => p.id === id);
      if (exists) {
        deleted = true;
        return prev.filter((p) => p.id !== id);
      }
      return prev;
    });

    setLikedPostIds((prev) => prev.filter((item) => item !== id));
    setBookmarkedPostIds((prev) => prev.filter((item) => item !== id));
    return deleted;
  };

  const toggleLikePost = (id: string) => {
    const isLiked = likedPostIds.includes(id);

    setLikedPostIds((prev) => {
      if (isLiked) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newLikesCount = isLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1;
          
          // Send notification to post creator if liked by another user
          if (!isLiked && currentUser && p.creatorId !== currentUser.id) {
            addNotification({
              userId: p.creatorId,
              actorId: currentUser.id,
              actorName: currentUser.fullName,
              actorUsername: currentUser.username,
              actorAvatarUrl: currentUser.avatarUrl,
              actorIsSenior: currentUser.isSenior,
              type: 'like',
              title: 'Nagustuhan ang iyong talento',
              message: `Nag-like si ${currentUser.fullName} sa iyong ibinahaging talento (${p.caption.slice(0, 40)}...).`,
              targetId: p.id,
              targetType: 'post',
            });
          }

          return {
            ...p,
            likesCount: newLikesCount,
          };
        }
        return p;
      })
    );
  };

  const isPostLiked = (id: string) => {
    return likedPostIds.includes(id);
  };

  const toggleBookmarkPost = (id: string) => {
    setBookmarkedPostIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const isPostBookmarked = (id: string) => {
    return bookmarkedPostIds.includes(id);
  };

  const addComment = (
    postId: string,
    commentData:
      | string
      | {
          authorId: string;
          authorName: string;
          authorUsername: string;
          authorAvatarUrl?: string;
          authorIsSenior?: boolean;
          content: string;
        }
  ): TalentComment | null => {
    const resolved =
      typeof commentData === 'string'
        ? {
            authorId: currentUser?.id || 'guest',
            authorName: currentUser?.fullName || 'Ka-Barangay',
            authorUsername: currentUser?.username || 'member',
            authorAvatarUrl: currentUser?.avatarUrl,
            authorIsSenior: currentUser?.isSenior,
            content: commentData,
          }
        : commentData;

    const newComment: TalentComment = {
      id: `comm-${Date.now()}`,
      authorId: resolved.authorId,
      authorName: resolved.authorName,
      authorUsername: resolved.authorUsername,
      authorAvatarUrl: resolved.authorAvatarUrl,
      authorIsSenior: resolved.authorIsSenior,
      content: resolved.content.trim(),
      createdAt: new Date().toISOString(),
      replies: [],
    };

    let targetPost: TalentPost | undefined;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          targetPost = p;
          return {
            ...p,
            comments: [...p.comments, newComment],
          };
        }
        return p;
      })
    );

    // Notify post creator
    if (targetPost && targetPost.creatorId !== resolved.authorId) {
      addNotification({
        userId: targetPost.creatorId,
        actorId: resolved.authorId,
        actorName: resolved.authorName,
        actorUsername: resolved.authorUsername,
        actorAvatarUrl: resolved.authorAvatarUrl,
        actorIsSenior: resolved.authorIsSenior,
        type: 'comment',
        title: `Nagkomento si ${resolved.authorName}`,
        message: `"${resolved.content.slice(0, 100)}" sa iyong talento.`,
        targetId: postId,
        targetType: 'post',
      });
    }

    return newComment;
  };

  const addReply = (
    postId: string,
    parentCommentId: string,
    replyData:
      | string
      | {
          authorId: string;
          authorName: string;
          authorUsername: string;
          authorAvatarUrl?: string;
          authorIsSenior?: boolean;
          content: string;
        }
  ): TalentComment | null => {
    const resolved =
      typeof replyData === 'string'
        ? {
            authorId: currentUser?.id || 'guest',
            authorName: currentUser?.fullName || 'Ka-Barangay',
            authorUsername: currentUser?.username || 'member',
            authorAvatarUrl: currentUser?.avatarUrl,
            authorIsSenior: currentUser?.isSenior,
            content: replyData,
          }
        : replyData;

    const newReply: TalentComment = {
      id: `reply-${Date.now()}`,
      parentId: parentCommentId,
      authorId: resolved.authorId,
      authorName: resolved.authorName,
      authorUsername: resolved.authorUsername,
      authorAvatarUrl: resolved.authorAvatarUrl,
      authorIsSenior: resolved.authorIsSenior,
      content: resolved.content.trim(),
      createdAt: new Date().toISOString(),
    };

    let parentAuthorId: string | undefined;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const updatedComments = p.comments.map((c) => {
            if (c.id === parentCommentId) {
              parentAuthorId = c.authorId;
              const existingReplies = c.replies || [];
              return {
                ...c,
                replies: [...existingReplies, newReply],
              };
            }
            return c;
          });
          return {
            ...p,
            comments: updatedComments,
          };
        }
        return p;
      })
    );

    // Notify parent comment author
    if (parentAuthorId && parentAuthorId !== resolved.authorId) {
      addNotification({
        userId: parentAuthorId,
        actorId: resolved.authorId,
        actorName: resolved.authorName,
        actorUsername: resolved.authorUsername,
        actorAvatarUrl: resolved.authorAvatarUrl,
        actorIsSenior: resolved.authorIsSenior,
        type: 'reply',
        title: `Tumugon si ${resolved.authorName} sa iyong komento`,
        message: `"${resolved.content.slice(0, 100)}"`,
        targetId: postId,
        targetType: 'post',
      });
    }

    return newReply;
  };

  const updateComment = (postId: string, commentId: string, newContent: string): boolean => {
    let updated = false;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const updatedComments = p.comments.map((c) => {
            if (c.id === commentId) {
              updated = true;
              return {
                ...c,
                content: newContent.trim(),
                isEdited: true,
                updatedAt: new Date().toISOString(),
              };
            }
            if (c.replies && c.replies.some((r) => r.id === commentId)) {
              return {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === commentId
                    ? { ...r, content: newContent.trim(), isEdited: true, updatedAt: new Date().toISOString() }
                    : r
                ),
              };
            }
            return c;
          });
          return { ...p, comments: updatedComments };
        }
        return p;
      })
    );
    return updated;
  };

  const deleteComment = (postId: string, commentId: string): boolean => {
    let deleted = false;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          deleted = true;
          // Check top-level comments or replies
          const updatedComments = p.comments
            .filter((c) => c.id !== commentId)
            .map((c) => {
              if (c.replies) {
                return {
                  ...c,
                  replies: c.replies.filter((r) => r.id !== commentId),
                };
              }
              return c;
            });
          return {
            ...p,
            comments: updatedComments,
          };
        }
        return p;
      })
    );
    return deleted;
  };

  const reportPost = (postId: string, reason: string) => {
    setReportedPostIds((prev) => {
      if (!prev.includes(postId)) {
        return [...prev, postId];
      }
      return prev;
    });
  };

  const isPostReported = (postId: string) => {
    return reportedPostIds.includes(postId);
  };

  const getCreatorPosts = (username: string): TalentPost[] => {
    return posts.filter(
      (p) => p.creatorUsername.toLowerCase() === username.toLowerCase()
    );
  };

  const getPostsByCategory = (category: TalentCategory): TalentPost[] => {
    return posts.filter((p) => p.category === category);
  };

  return (
    <TalentContext.Provider
      value={{
        posts,
        likedPostIds,
        bookmarkedPostIds,
        reportedPostIds,
        isLoading,
        createPost,
        updatePost,
        deletePost,
        toggleLikePost,
        isPostLiked,
        toggleBookmarkPost,
        isPostBookmarked,
        addComment,
        addReply,
        addReplyToComment: addReply,
        updateComment,
        deleteComment,
        reportPost,
        isPostReported,
        getCreatorPosts,
        getPostsByCategory,
      }}
    >
      {children}
    </TalentContext.Provider>
  );
};

export const useTalents = () => {
  const context = useContext(TalentContext);
  if (!context) {
    throw new Error('useTalents must be used within a TalentProvider');
  }
  return context;
};
