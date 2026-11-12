export type AccountType =
  | 'buyer'
  | 'seller'
  | 'service'
  | 'talent'
  | 'both';

export interface UserLocation {
  city: string;
  province: string;
  barangay?: string;
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  dateOfBirth: string; // YYYY-MM-DD
  age: number;
  isSenior: boolean;
  location: UserLocation;
  accountType: AccountType;
  bio: string;
  avatarUrl: string;
  coverPhotoUrl?: string;
  skills: string[];
  interests: string[];
  roles?: string[];
  createdAt: string;

  // Stage 8.5 KYC & Authentication
  kycStatus?: KycStatus;
  kycData?: KycRecord;
  kycRecord?: KycRecord;
}

export type KycStatus =
  | 'not_submitted'
  | 'pending_review'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'resubmission_required';

export type GovernmentIdType =
  | 'senior_id'
  | 'senior_citizen_id'
  | 'philsys'
  | 'philsys_national_id'
  | 'drivers_license'
  | 'passport'
  | 'umid'
  | 'postal_id'
  | 'voters_id'
  | 'prc_id'
  | 'other_gov';

export interface KycRecord {
  legalFullName: string;
  fullName?: string;
  dateOfBirth: string;
  streetAddress?: string;
  addressLine?: string;
  barangay?: string;
  city: string;
  province: string;
  contactNumber: string;
  idType: GovernmentIdType;
  idNumber: string;
  idFrontUrl?: string;
  idPhotoUrl?: string;
  selfieUrl?: string;
  selfiePhotoUrl?: string;
  submittedAt: string;
  reviewedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  reviewerNotes?: string;
}

export interface AccountTypeOption {
  id: AccountType;
  title: string;
  tagalogTitle: string;
  description: string;
  iconName: string;
  badgeColor: string;
}

export const ACCOUNT_TYPE_OPTIONS: AccountTypeOption[] = [
  {
    id: 'buyer',
    title: 'Customer / Buyer',
    tagalogTitle: 'Mamimili at Tagatangkilik',
    description: 'Nais tumuklas at bumili ng mga sariling lutong bahay, handmade crafts, at serbisyo sa komunidad.',
    iconName: 'ShoppingBag',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
  },
  {
    id: 'seller',
    title: 'Seller / Product Creator',
    tagalogTitle: 'Nagbebenta ng Produkto o Pagkain',
    description: 'Nais magbenta ng sariling lutong kakanin, pastry, pottery, o mga likhang-kamay na produkto.',
    iconName: 'Store',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
  },
  {
    id: 'service',
    title: 'Service Provider / Skilled Worker',
    tagalogTitle: 'Nag-aalok ng Serbisyo o Kasanayan',
    description: 'Nais mag-alok ng pananahi, pagkukumpuni, pagtuturo, o propesyonal na kakayahan.',
    iconName: 'Briefcase',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  },
  {
    id: 'talent',
    title: 'Talent / Content Creator',
    tagalogTitle: 'Talento at Malikhaing Sining',
    description: 'Nais magbahagi ng musika, sining, sayaw, o video reels nang walang kailangang libo-libong followers.',
    iconName: 'Sparkles',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
  },
  {
    id: 'both',
    title: 'Both Customer & Creator',
    tagalogTitle: 'Parehong Mamimili at Manlilikha',
    description: 'Nais magbenta ng sariling likha at sumuporta rin sa kapwa mga artisan at elder sa komunidad.',
    iconName: 'Users',
    badgeColor: 'bg-violet-100 text-violet-900 border-violet-200',
  },
];

// Helper to compute exact age from birth date string (YYYY-MM-DD)
export function calculateAge(birthDateStr: string): number {
  if (!birthDateStr) return 0;
  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) return 0;

  // Local anchor time (2026-11-07) or system current date
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
