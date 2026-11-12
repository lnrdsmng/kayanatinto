export type ProductCategory =
  | 'food'
  | 'clothing'
  | 'arts-crafts'
  | 'beauty'
  | 'home-living'
  | 'electronics'
  | 'plants-gardening'
  | 'other';

export type ProductCondition = 'handcrafted' | 'brand-new' | 'made-to-order' | 'pre-owned';

export interface ProductDeliveryOptions {
  allowPickup: boolean;
  pickupLocation?: string;
  allowSellerDelivery: boolean;
  deliveryFee?: number;
  deliveryArea?: string;
  isPerishableFood: boolean;
  deliveryLimitations?: string;
}

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerUsername: string;
  sellerAvatarUrl?: string;
  sellerIsSenior?: boolean;
  sellerAge?: number;
  sellerLocation: {
    city: string;
    province: string;
    barangay?: string;
  };
  title: string;
  description: string;
  category: ProductCategory;
  price: number;
  priceUnit?: string;
  stock: number;
  condition: ProductCondition;
  images: string[];
  deliveryOptions: ProductDeliveryOptions;
  isAvailable: boolean;
  isSoldOut?: boolean;
  isFeatured?: boolean;
  rating: number;
  reviewsCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductCategoryMeta {
  id: ProductCategory;
  name: string;
  tagalogName: string;
  description: string;
  iconName: string;
  colorClass: string;
  bgLightClass: string;
  borderClass: string;
}

export const PRODUCT_CATEGORIES: ProductCategoryMeta[] = [
  {
    id: 'food',
    name: 'Food & Homemade Products',
    tagalogName: 'Lutong Bahay at Pagkain',
    description: 'Sariwang lumpia, kakanin, pastries, heirloom delicacies, at pampamilyang ulam.',
    iconName: 'UtensilsCrossed',
    colorClass: 'text-amber-700',
    bgLightClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
  },
  {
    id: 'clothing',
    name: 'Clothing & Accessories',
    tagalogName: 'Kasuotan at Pananahi',
    description: 'Gawang-kamay na barong, habing katutubo, bag, sumbrero, at custom clothing.',
    iconName: 'Shirt',
    colorClass: 'text-rose-700',
    bgLightClass: 'bg-rose-50',
    borderClass: 'border-rose-200',
  },
  {
    id: 'arts-crafts',
    name: 'Arts & Crafts',
    tagalogName: 'Sining at Likhang-Kamay',
    description: 'Terracotta pottery, ukit sa kahoy, oil paintings, at mga palamuting gawang-kamay.',
    iconName: 'Palette',
    colorClass: 'text-purple-700',
    bgLightClass: 'bg-purple-50',
    borderClass: 'border-purple-200',
  },
  {
    id: 'beauty',
    name: 'Beauty & Personal Care',
    tagalogName: 'Kagandahan at Kalusugan',
    description: 'Lokal na sabon, herbal balms, coconut oil products, at natural body care.',
    iconName: 'Sparkles',
    colorClass: 'text-pink-700',
    bgLightClass: 'bg-pink-50',
    borderClass: 'border-pink-200',
  },
  {
    id: 'home-living',
    name: 'Home & Living',
    tagalogName: 'Gamit sa Bahay at Pamumuhay',
    description: 'Banig, basket, rattan items, kitchenware, at handcrafted home decor.',
    iconName: 'Home',
    colorClass: 'text-emerald-700',
    bgLightClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
  },
  {
    id: 'electronics',
    name: 'Electronics & Gadgets',
    tagalogName: 'Kagamitang Elektroniko',
    description: 'Solar lights, cables, phone accessories, at kapakipakinabang na gamit sa tahanan.',
    iconName: 'Cpu',
    colorClass: 'text-blue-700',
    bgLightClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
  },
  {
    id: 'plants-gardening',
    name: 'Plants & Gardening',
    tagalogName: 'Halaman at Hardin',
    description: 'Bunga, punla ng gulay, ornamental plants, pataba, at mga paso mula sa lokal na hardin.',
    iconName: 'Leaf',
    colorClass: 'text-green-700',
    bgLightClass: 'bg-green-50',
    borderClass: 'border-green-200',
  },
  {
    id: 'other',
    name: 'Other Products',
    tagalogName: 'Iba Pang Produkto',
    description: 'Mga espesyal na gamit, gamit sa paaralan, at natatanging likha ng komunidad.',
    iconName: 'Package',
    colorClass: 'text-slate-700',
    bgLightClass: 'bg-slate-50',
    borderClass: 'border-slate-200',
  },
];
