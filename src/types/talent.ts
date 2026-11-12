export type TalentCategory =
  | 'music'
  | 'dance-performing'
  | 'drawing-painting'
  | 'handicrafts-diy'
  | 'cooking-baking'
  | 'photo-video'
  | 'storytelling-writing'
  | 'sports-physical'
  | 'education-demo'
  | 'other-talents';

export type MediaType = 'photo' | 'video';

export interface TalentComment {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  authorIsSenior?: boolean;
  content: string;
  createdAt: string;
  parentId?: string;
  replyToUsername?: string;
  replies?: TalentComment[];
  isEdited?: boolean;
  updatedAt?: string;
}

export interface TalentPost {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatarUrl?: string;
  creatorIsSenior: boolean;
  creatorAge: number;
  location: {
    city: string;
    province: string;
    barangay?: string;
  };
  mediaType: MediaType;
  mediaUrl: string;
  videoThumbnailUrl?: string;
  videoDuration?: string; // e.g. "0:45", "1:20"
  caption: string;
  category: TalentCategory;
  hashtags: string[];
  likesCount: number;
  comments: TalentComment[];
  createdAt: string;
  updatedAt?: string;
  linkedProductId?: string; // e.g. prod-001
  linkedServiceId?: string; // e.g. srv-001
  isFeatured?: boolean;
}

export interface TalentCategoryMeta {
  id: TalentCategory;
  name: string;
  tagalogName: string;
  description: string;
  iconName: string;
  colorClass: string;
  bgLightClass: string;
  borderClass: string;
}

export const TALENT_CATEGORIES: TalentCategoryMeta[] = [
  {
    id: 'music',
    name: 'Singing & Music',
    tagalogName: 'Pag-awit at Musika',
    description: 'Acoustic guitar, harana, OPM singing, kundiman, piyano, at orihinal na awitin.',
    iconName: 'Music',
    colorClass: 'text-purple-700',
    bgLightClass: 'bg-purple-50',
    borderClass: 'border-purple-200',
  },
  {
    id: 'dance-performing',
    name: 'Dancing & Performing Arts',
    tagalogName: 'Sayaw at Pagtatanghal',
    description: 'Katutubong sayaw (folk dance), modern hip-hop, dula, spoken word, at teatro.',
    iconName: 'Sparkles',
    colorClass: 'text-rose-700',
    bgLightClass: 'bg-rose-50',
    borderClass: 'border-rose-200',
  },
  {
    id: 'drawing-painting',
    name: 'Drawing & Painting',
    tagalogName: 'Pagguhit at Pagpipinta',
    description: 'Oil portrait, watercolor landscape, digital illustration, charcoal sketching, at mural art.',
    iconName: 'Palette',
    colorClass: 'text-indigo-700',
    bgLightClass: 'bg-indigo-50',
    borderClass: 'border-indigo-200',
  },
  {
    id: 'handicrafts-diy',
    name: 'Handicrafts & DIY',
    tagalogName: 'Gawang-Kamay at DIY',
    description: 'Tradisyunal na ukit sa kahoy, paghabi ng banig, crocheting, pottery, at pananahi.',
    iconName: 'Scissors',
    colorClass: 'text-amber-700',
    bgLightClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
  },
  {
    id: 'cooking-baking',
    name: 'Cooking & Baking',
    tagalogName: 'Pagluluto at Pagbe-bake',
    description: 'Lutong bahay na recipes, Laguna bibingka, sariwang lumpia, kakanin, at pastry tips.',
    iconName: 'Utensils',
    colorClass: 'text-orange-700',
    bgLightClass: 'bg-orange-50',
    borderClass: 'border-orange-200',
  },
  {
    id: 'photo-video',
    name: 'Photography & Videography',
    tagalogName: 'Litrato at Video',
    description: 'Likas-yaman ng Laguna, street photography, cinematic shorts, at documentation.',
    iconName: 'Camera',
    colorClass: 'text-cyan-700',
    bgLightClass: 'bg-cyan-50',
    borderClass: 'border-cyan-200',
  },
  {
    id: 'storytelling-writing',
    name: 'Storytelling & Writing',
    tagalogName: 'Pagkukuwento at Pagsulat',
    description: 'Kuwentong bayan, tula, sanaysay, inspirasyon ng mga nakatatanda, at pampamilyang aral.',
    iconName: 'BookOpen',
    colorClass: 'text-emerald-700',
    bgLightClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
  },
  {
    id: 'sports-physical',
    name: 'Sports & Physical Skills',
    tagalogName: 'Palakasan at Kalusugan',
    description: 'Arnis martial arts, ehersisyo para sa seniors, basketball drills, at yoga/stretching.',
    iconName: 'Trophy',
    colorClass: 'text-blue-700',
    bgLightClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
  },
  {
    id: 'education-demo',
    name: 'Educational & Demonstration',
    tagalogName: 'Edukasyon at Demo',
    description: 'How-to tutorials, pag-aalaga ng halaman, tips sa tahanan, at pagtuturo ng wika.',
    iconName: 'GraduationCap',
    colorClass: 'text-teal-700',
    bgLightClass: 'bg-teal-50',
    borderClass: 'border-teal-200',
  },
  {
    id: 'other-talents',
    name: 'Other Talents',
    tagalogName: 'Iba Pang Talento',
    description: 'Katutubong karunungan, pagpapatawa, magic tricks, calligraphy, at natatanging galing.',
    iconName: 'Users',
    colorClass: 'text-slate-700',
    bgLightClass: 'bg-slate-50',
    borderClass: 'border-slate-200',
  },
];
