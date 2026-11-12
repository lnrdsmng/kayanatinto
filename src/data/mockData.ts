export interface Category {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  badgeColor: string;
  bgColor: string;
  textColor: string;
  accentBorder: string;
}

export interface ListingItem {
  id: string;
  title: string;
  category: 'products' | 'talents' | 'services' | 'videos';
  price: string;
  priceNote?: string;
  sellerName: string;
  sellerAge: number;
  sellerAvatarCrop?: { src: string; x: number; y: number; w: number; h: number };
  location: string;
  rating: number;
  reviewsCount: number;
  imageCrop: {
    src: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  image?: string;
  fallbackGradient: string;
  fallbackIcon: string;
  description: string;
  highlights: string[];
  deliveryInfo: string;
  responseTime: string;
  isPopular?: boolean;
}

export interface CreatorPerson {
  id: string;
  name: string;
  role: string;
  categoryLabel: string;
  age: number;
  avatar?: string;
  isSenior?: boolean;
  location: string;
  bio: string;
  story: string;
  stats: {
    followers: string;
    offerings: string;
    rating: string;
    likes: string;
  };
  avatarCrop: {
    src: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  cardImageCrop: {
    src: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  fallbackGradient: string;
  badge: string;
  sampleOfferings: string[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'products',
    name: 'Products',
    tagline: 'Gawang Lokal, Lutong Bahay at Likhang Kamay',
    icon: 'ShoppingBag',
    badgeColor: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-50 hover:bg-amber-100/80',
    textColor: 'text-amber-900',
    accentBorder: 'border-amber-200',
  },
  {
    id: 'talents',
    name: 'Talents',
    tagline: 'Musika, Sining, Sayaw at Katutubong Kakayahan',
    icon: 'Sparkles',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    bgColor: 'bg-yellow-50 hover:bg-yellow-100/80',
    textColor: 'text-yellow-900',
    accentBorder: 'border-yellow-200',
  },
  {
    id: 'services',
    name: 'Services',
    tagline: 'Pananahi, Pagkukumpuni, Serbisyo at Kaalaman',
    icon: 'Briefcase',
    badgeColor: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-50 hover:bg-blue-100/80',
    textColor: 'text-blue-900',
    accentBorder: 'border-blue-200',
  },
  {
    id: 'videos',
    name: 'Videos',
    tagline: 'Kwento ng Pagsisikap at Talent Reels',
    icon: 'Video',
    badgeColor: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-50 hover:bg-purple-100/80',
    textColor: 'text-purple-900',
    accentBorder: 'border-purple-200',
  },
];

export const SAMPLE_LISTINGS: ListingItem[] = [
  {
    id: 'lumpia-01',
    title: 'Homemade Lumpia Shanghai',
    category: 'products',
    price: '₱100',
    priceNote: '/ pack (12 pcs)',
    sellerName: 'Lutong Bahay ni Aling Rosa',
    sellerAge: 68,
    location: 'Majayjay, Laguna',
    rating: 4.9,
    reviewsCount: 328,
    imageCrop: {
      src: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
      x: 915,
      y: 50,
      w: 290,
      h: 220,
    },
    fallbackGradient: 'from-amber-600 to-orange-700',
    fallbackIcon: 'Utensils',
    description: 'Crispy golden fried lumpia filled with seasoned local minced pork, minced carrots, singkamas, and heirloom herbs. Made fresh daily and served with homemade sweet chili sauce. Perfect for family gatherings, snacks, or party platters.',
    highlights: ['Freshly rolled daily', 'Locally sourced spices', 'Heirloom family recipe (1985)', 'Includes sweet chili dip'],
    deliveryInfo: 'Local delivery or pickup in Majayjay & nearby Laguna towns (Pagsanjan, Magdalena, Liliw). Packed hot in food-grade thermal containers.',
    responseTime: 'Within 30 mins',
    isPopular: true,
  },
  {
    id: 'pottery-01',
    title: 'Handmade Pottery & Clay Pots',
    category: 'products',
    price: '₱250',
    priceNote: '/ piece',
    sellerName: 'Kuya Jun Wood & Clay Craft',
    sellerAge: 52,
    location: 'Luisiana, Laguna',
    rating: 4.9,
    reviewsCount: 95,
    imageCrop: {
      src: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
      x: 615,
      y: 295,
      w: 138,
      h: 100,
    },
    fallbackGradient: 'from-amber-800 to-stone-800',
    fallbackIcon: 'Flame',
    description: 'Hand-thrown terracotta and red clay planters and decorative vases fired in traditional firewood kilns in Luisiana, Laguna. Breathable clay keeps plants healthy and adds an authentic rustic Filipino touch to any home.',
    highlights: ['100% natural Laguna clay', 'Hand-thrown by master potter', 'Eco-friendly breathable finish', 'Weather-resistant'],
    deliveryInfo: 'Carefully wrapped in bubble cushion and reinforced cardboard. Shipped across Calabarzon and Metro Manila.',
    responseTime: 'Within 1 hour',
  },
  {
    id: 'tailoring-01',
    title: 'Tailoring Services & Alterations',
    category: 'services',
    price: '₱150',
    priceNote: '/ hour (or per garment)',
    sellerName: 'Lola Mercy Pananahi',
    sellerAge: 64,
    location: 'Pila, Laguna',
    rating: 4.8,
    reviewsCount: 120,
    imageCrop: {
      src: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
      x: 760,
      y: 115,
      w: 138,
      h: 100,
    },
    fallbackGradient: 'from-indigo-700 to-purple-800',
    fallbackIcon: 'Scissors',
    description: 'Expert dressmaking, alterations, hem shortening, zipper replacement, school uniform resizing, and custom barong repair with over 40 years of seamstress expertise. Precise fitting with prompt turnaround.',
    highlights: ['40+ years master experience', 'Same-day emergency hems available', 'Barong & Filipiniana specialist', 'Senior-owned livelihood'],
    deliveryInfo: 'Home fitting visits available in Pila & Victoria Laguna, or drop-off at Lola Mercy’s home workshop near Pila Town Plaza.',
    responseTime: 'Within 2 hours',
    isPopular: true,
  },
  {
    id: 'pastries-01',
    title: 'Homemade Pastries & Heirloom Bakes',
    category: 'products',
    price: '₱80',
    priceNote: '/ box of 6',
    sellerName: 'Nanay Elena Baked Goodies',
    sellerAge: 61,
    location: 'San Pablo, Laguna',
    rating: 5.0,
    reviewsCount: 76,
    imageCrop: {
      src: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
      x: 835,
      y: 575,
      w: 140,
      h: 115,
    },
    fallbackGradient: 'from-yellow-600 to-amber-700',
    fallbackIcon: 'Cake',
    description: 'Freshly baked flaky buko tarts, soft ensaymada with grated queso de bola, and traditional bibingka cup bakes prepared using pure butter and fresh coconut milk.',
    highlights: ['Baked every dawn', 'No artificial preservatives', 'Real Quezon coconut & Laguna cheese', 'Perfect coffee partner'],
    deliveryInfo: 'Same-day dispatch in San Pablo City, Alaminos, and Tiaong. Courier delivery available for nearby provinces.',
    responseTime: 'Within 45 mins',
  },
  {
    id: 'portrait-01',
    title: 'Handmade Oil Portrait & Painting',
    category: 'talents',
    price: '₱500',
    priceNote: '/ starting commission',
    sellerName: 'Mang Noel Local Sining',
    sellerAge: 48,
    location: 'San Pablo, Laguna',
    rating: 5.0,
    reviewsCount: 76,
    imageCrop: {
      src: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
      x: 760,
      y: 295,
      w: 138,
      h: 100,
    },
    fallbackGradient: 'from-blue-700 to-indigo-900',
    fallbackIcon: 'Palette',
    description: 'Custom oil and acrylic portraits of family, beloved pets, or ancestral homes painted on stretched canvas. Preserving Filipino heritage scenes and treasured memories.',
    highlights: ['Hand-painted original work', 'High-grade archival canvas', 'Includes preview drafts', 'Framing available'],
    deliveryInfo: 'Packed in wooden corner protectors with rigid board backing. Nationwide shipping insured.',
    responseTime: 'Within 3 hours',
  },
  {
    id: 'guitar-01',
    title: 'Acoustic Guitar & OPM Live Session',
    category: 'talents',
    price: '₱600',
    priceNote: '/ 45-min set or tutorial',
    sellerName: 'Kuya Jayson Musika',
    sellerAge: 22,
    location: 'San Pablo, Laguna',
    rating: 4.9,
    reviewsCount: 142,
    imageCrop: {
      src: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
      x: 312,
      y: 605,
      w: 288,
      h: 220,
    },
    fallbackGradient: 'from-purple-800 to-violet-950',
    fallbackIcon: 'Music',
    description: 'Soulful acoustic guitar performances for intimate family reunions, birthday harana, cafe sets, or beginner guitar coaching. Sharing the love of Pinoy acoustic melodies and modern folk.',
    highlights: ['Original songs & classic OPM', 'Friendly patient coaching', 'Flexible venue setup', 'Full audio equipment'],
    deliveryInfo: 'Available for in-person events in Laguna/Batangas or live virtual sessions anywhere.',
    responseTime: 'Within 15 mins',
  },
];

export const PEOPLE_OF_KAYANATINTO: CreatorPerson[] = [
  {
    id: 'person-nanay-lita',
    name: 'Nanay Lita & Aling Rosa',
    role: 'Home Cook & Kakanin Artisan',
    categoryLabel: 'Senior Citizen Entrepreneur',
    age: 68,
    isSenior: true,
    location: 'Majayjay, Laguna & Quezon City',
    bio: '"Masarap. Malinis. Pusong Pinoy! Ang sarap ng lutong bahay ay galing sa pagmamahal sa pamilya."',
    story: 'At 68 years old, Nanay Lita spent decades cooking for her children and grandchildren. With KayaNatinTo, she found a nationwide audience for her crispy homemade lumpia, slow-simmered kare-kare, and traditional kakanin without needing thousands of followers or tech complexities. Her eldest grandson helps package orders while Nanay leads every kitchen recipe with pride.',
    stats: {
      followers: '258',
      offerings: '45 Recipes',
      rating: '4.9 ★',
      likes: '12.8K',
    },
    avatarCrop: {
      src: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
      x: 880,
      y: 55,
      w: 140,
      h: 140,
    },
    cardImageCrop: {
      src: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
      x: 410,
      y: 40,
      w: 380,
      h: 360,
    },
    fallbackGradient: 'from-amber-600 to-rose-700',
    badge: 'Senior Entrepreneur (68 y/o)',
    sampleOfferings: ['Crispy Homemade Lumpia', 'Pansit Habhab Majayjay', 'Special Bibingka Galapong', 'Traditional Buko Pie'],
  },
  {
    id: 'person-kuya-jun',
    name: 'Kuya Jun',
    role: 'Woodworking & Pottery Artisan',
    categoryLabel: 'Local Craftsman',
    age: 52,
    location: 'Luisiana & Paete, Laguna',
    bio: '"Buhayin natin ang sariling atin. Bawat ukit at luwad ay may kwento ng Laguna."',
    story: 'Kuya Jun learned woodcarving from his father in Paete and later expanded into hand-thrown terracotta pottery. He previously depended entirely on passing tourists along the national highway. KayaNatinTo connects him directly with homeowners, cafes, and plant lovers who cherish genuine handmade Filipino crafts.',
    stats: {
      followers: '412',
      offerings: '38 Items',
      rating: '4.9 ★',
      likes: '9.4K',
    },
    avatarCrop: {
      src: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
      x: 420,
      y: 470,
      w: 125,
      h: 155,
    },
    cardImageCrop: {
      src: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
      x: 420,
      y: 470,
      w: 125,
      h: 155,
    },
    fallbackGradient: 'from-amber-800 to-stone-900',
    badge: 'Master Artisan (52 y/o)',
    sampleOfferings: ['Hand-thrown Clay Planters', 'Reclaimed Mahogany Coasters', 'Carved Wooden Spoons', 'Rustic Garden Pots'],
  },
  {
    id: 'person-kuya-jayson',
    name: 'Kuya Jayson',
    role: 'Musician & Acoustic Songwriter',
    categoryLabel: 'Young Adult Talent',
    age: 22,
    location: 'San Pablo, Laguna',
    bio: '"Music is life! 🎵 Let\'s spread good vibes through Pinoy acoustic melodies and honest songs."',
    story: 'Jayson is a 22-year-old college student who spends his weekends composing acoustic songs and teaching neighborhood kids how to play guitar. On KayaNatinTo, he booked his first paid cafe gigs and harana serenades without an agency or massive social following, demonstrating that raw talent speaks louder than viral algorithms.',
    stats: {
      followers: '8.7K',
      offerings: '19 Tracks',
      rating: '4.9 ★',
      likes: '14.2K',
    },
    avatarCrop: {
      src: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
      x: 320,
      y: 620,
      w: 260,
      h: 260,
    },
    cardImageCrop: {
      src: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
      x: 312,
      y: 605,
      w: 288,
      h: 260,
    },
    fallbackGradient: 'from-purple-800 to-indigo-950',
    badge: 'Young Talent (22 y/o)',
    sampleOfferings: ['Harana / Acoustic Serenade', 'Beginner Guitar Coaching', 'Event Song Performance', 'Custom Birthday Ballad'],
  },
  {
    id: 'person-lola-mercy',
    name: 'Lola Mercy',
    role: 'Master Seamstress & Tailor',
    categoryLabel: 'Professional Services',
    age: 64,
    isSenior: true,
    location: 'Pila, Laguna',
    bio: '"Pananahi at alterations na pulido ang tahi. Walang sayang na tela, bawat suot may dignidad."',
    story: 'Lola Mercy has been sitting behind her pedal-driven Singer sewing machine since 1978. When her local tailoring shop lost foot traffic during the pandemic, neighbors helped her showcase her skills on KayaNatinTo. Now she has a steady calendar of clients requesting custom barong repairs, prom gown alterations, and school uniforms.',
    stats: {
      followers: '315',
      offerings: '120 Orders',
      rating: '4.8 ★',
      likes: '8.1K',
    },
    avatarCrop: {
      src: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
      x: 550,
      y: 470,
      w: 125,
      h: 155,
    },
    cardImageCrop: {
      src: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
      x: 550,
      y: 470,
      w: 125,
      h: 155,
    },
    fallbackGradient: 'from-violet-800 to-purple-900',
    badge: 'Senior Professional (64 y/o)',
    sampleOfferings: ['Barong Tagalog Resizing', 'School Uniform Alterations', 'Filipiniana Gown Restoration', 'Zipper & Button Service'],
  },
];

export const COMMUNITY_NOTICES = [
  {
    id: 'notice-1',
    title: 'Mabuhay! Welcome to KayaNatinTo',
    tag: 'Platform Mission',
    date: 'Ngayong Araw',
    unread: true,
    content: 'Ang KayaNatinTo ay nilikha para sa lahat ng Pilipino edad 18 pataas—walang pinipiling kasikatan o libo-libong followers. Dito, pantay-pantay ang pagkakataon upang ipakita ang iyong produkto, talento, at serbisyo.',
  },
  {
    id: 'notice-2',
    title: 'Senior Citizens & Elders Welcomed With Honor',
    tag: 'Age Inclusion Policy',
    date: 'Kahapon',
    unread: true,
    content: 'Mahalaga sa atin ang karanasan at talino ng ating mga lolo at lola! Walang maximum age limit sa platform. Bilang patakaran, 18 anyos pataas lamang ang maaaring magrehistro upang protektahan ang kabataan at bigyang-lakas ang mga may sapat na gulang.',
  },
  {
    id: 'notice-3',
    title: 'Laguna & Metro Manila Community Showcase',
    tag: 'Lokal na Pamayanan',
    date: '3 araw ang nakalipas',
    unread: false,
    content: 'Tuklasin ang 28 bagong likhang-kamay na pottery, homemade lumpia, at acoustic talent na sumali ngayong linggo mula Majayjay, Paete, Luisiana, at Quezon City.',
  },
];

export const MOCK_INBOX_MESSAGES = [
  {
    id: 'msg-1',
    sender: 'Aling Rosa (Lutong Bahay)',
    role: 'Food Seller',
    time: '10:42 AM',
    unread: true,
    preview: 'Magandang araw po! Available po ang sariwang Lumpia Shanghai para sa Linggo. Ilang packs po ang kailangan?',
  },
  {
    id: 'msg-2',
    sender: 'Kuya Jun (Wood & Pottery)',
    role: 'Artisan',
    time: 'Kahapon',
    unread: true,
    preview: 'Salamat sa pagtatanong sa terracotta pots! Mayroon po kaming bagong luto mula sa hurno sa Luisiana.',
  },
  {
    id: 'msg-3',
    sender: 'Lola Mercy (Pananahi)',
    role: 'Services',
    time: 'Nov 4',
    unread: false,
    preview: 'Opo, kaya nating tapusin ang barong alteration bago ang darating na Biyernes. Dalhin niyo lang po sa workshop.',
  },
];
