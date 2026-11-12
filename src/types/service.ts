export type ServiceCategory =
  | 'repair-maintenance'
  | 'cleaning'
  | 'education-tutoring'
  | 'beauty-care'
  | 'catering-food'
  | 'creative-digital'
  | 'photo-video'
  | 'transport-errand'
  | 'professional'
  | 'other-skills';

export type PricingType = 'hourly' | 'fixed' | 'project' | 'negotiable';

export type ServiceArrangement =
  | 'customer-location' // Sa bahay ng customer (Home service)
  | 'provider-location' // Sa shop/workshop ng provider
  | 'online'            // Online o Virtual
  | 'flexible';         // Parehong home service at shop

export interface Service {
  id: string;
  providerId: string;
  providerName: string;
  providerUsername: string;
  providerAvatarUrl?: string;
  providerIsSenior: boolean;
  providerAge: number;
  providerLocation: {
    city: string;
    province: string;
    barangay?: string;
  };
  title: string;
  description: string;
  category: ServiceCategory;
  rate: number;
  rateUnit?: string; // 'oras', 'araw', 'proyekto', 'session'
  pricingType: PricingType;
  arrangement: ServiceArrangement;
  availability: string;
  experienceYears?: number;
  portfolioImages: string[];
  serviceArea: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  rating: number;
  reviewsCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceCategoryMeta {
  id: ServiceCategory;
  name: string;
  tagalogName: string;
  description: string;
  iconName: string;
  colorClass: string;
  bgLightClass: string;
  borderClass: string;
}

export const SERVICE_CATEGORIES: ServiceCategoryMeta[] = [
  {
    id: 'repair-maintenance',
    name: 'Home Repair & Maintenance',
    tagalogName: 'Pagkukumpuni at Karpintero',
    description: 'Tubero, electrical repairs, karpintero, at pagsasaayos ng gamit sa bahay.',
    iconName: 'Wrench',
    colorClass: 'text-blue-700',
    bgLightClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
  },
  {
    id: 'cleaning',
    name: 'Cleaning Services',
    tagalogName: 'Paglilinis at Labada',
    description: 'General house cleaning, deep cleaning, paglalaba, at sanitation ng tahanan.',
    iconName: 'Sparkles',
    colorClass: 'text-teal-700',
    bgLightClass: 'bg-teal-50',
    borderClass: 'border-teal-200',
  },
  {
    id: 'education-tutoring',
    name: 'Education & Tutoring',
    tagalogName: 'Pagtuturo at Tutorial',
    description: 'Academic coaching sa elementarya/high school, pagbasa, math, at gitara/musika.',
    iconName: 'GraduationCap',
    colorClass: 'text-indigo-700',
    bgLightClass: 'bg-indigo-50',
    borderClass: 'border-indigo-200',
  },
  {
    id: 'beauty-care',
    name: 'Beauty & Personal Care',
    tagalogName: 'Gupit, Masahe, at Kagandahan',
    description: 'Home service gupit, traditional hilot, masahe, manicure, at makeup para sa okasyon.',
    iconName: 'HeartHandshake',
    colorClass: 'text-rose-700',
    bgLightClass: 'bg-rose-50',
    borderClass: 'border-rose-200',
  },
  {
    id: 'catering-food',
    name: 'Food & Catering Services',
    tagalogName: 'Serbisyo sa Lutong Handaan',
    description: 'Personal cook para sa piyesta, handaan, birthday catering, at ulam subscriptions.',
    iconName: 'Utensils',
    colorClass: 'text-amber-700',
    bgLightClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
  },
  {
    id: 'creative-digital',
    name: 'Creative & Digital Services',
    tagalogName: 'Sining, Disenyo, at Digital',
    description: 'Graphic design para sa tarpaulin, video editing, translation, at digital invitations.',
    iconName: 'Palette',
    colorClass: 'text-purple-700',
    bgLightClass: 'bg-purple-50',
    borderClass: 'border-purple-200',
  },
  {
    id: 'photo-video',
    name: 'Photography & Videography',
    tagalogName: 'Pagkuha ng Litrato at Video',
    description: 'Binyag, kasal, kaarawan, portrait shots, at photo documentation.',
    iconName: 'Camera',
    colorClass: 'text-cyan-700',
    bgLightClass: 'bg-cyan-50',
    borderClass: 'border-cyan-200',
  },
  {
    id: 'transport-errand',
    name: 'Transportation & Errand Services',
    tagalogName: 'Hatid-Sundo at Pabili',
    description: 'Tricycle service, pabili sa palengke, paghahatid ng package, at personal errands.',
    iconName: 'Bike',
    colorClass: 'text-orange-700',
    bgLightClass: 'bg-orange-50',
    borderClass: 'border-orange-200',
  },
  {
    id: 'professional',
    name: 'Professional Services',
    tagalogName: 'Propesyonal na Serbisyo',
    description: 'Pananahi ng barong/uniforms, bookkeeping, dokumentasyon, at konsultasyon.',
    iconName: 'Briefcase',
    colorClass: 'text-emerald-700',
    bgLightClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
  },
  {
    id: 'other-skills',
    name: 'Personal Skills & Other Services',
    tagalogName: 'Iba Pang Kasanayan',
    description: 'Gardening, pag-aalaga ng alagang hayop, event hosting, at katutubong kaalaman.',
    iconName: 'Users',
    colorClass: 'text-slate-700',
    bgLightClass: 'bg-slate-50',
    borderClass: 'border-slate-200',
  },
];
