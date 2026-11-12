import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AccountType, calculateAge, KycRecord, KycStatus, GovernmentIdType } from '../types/auth';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  registeredUsers: User[];
  login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    userData: {
      fullName: string;
      username: string;
      email: string;
      dateOfBirth: string;
      location: { city: string; province: string; barangay?: string };
      accountType: AccountType;
      password: string;
    }
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  updateProfile: (updatedFields: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  submitKycVerification: (kycData: Omit<KycRecord, 'submittedAt'>) => Promise<{ success: boolean; error?: string }>;
  checkDuplicateIdNumber: (idNumber: string, userId: string) => boolean;
  logout: () => void;
  quickLoginAsDemo: (demoKey: 'nanaylita' | 'kuyajayson' | 'maria' | 'lolamercy') => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial Pre-Seeded Demonstration Users
const INITIAL_DEMO_USERS: User[] = [
  {
    id: 'user-nanay-lita',
    fullName: 'Lita Rodriguez (Nanay Lita)',
    username: 'nanaylita',
    email: 'nanaylita@kayanatin.ph',
    dateOfBirth: '1958-04-12',
    age: 68,
    isSenior: true,
    location: {
      city: 'Majayjay',
      province: 'Laguna',
      barangay: 'Brgy. Talojong',
    },
    accountType: 'seller',
    bio: 'Masarap. Malinis. Pusong Pinoy! 40 taong nagluluto ng paboritong Lumpia Shanghai, Kare-Kare, at heirloom kakanin para sa komunidad.',
    avatarUrl: './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
    skills: ['Homemade Lumpia', 'Kakanin Biko', 'Pansit Habhab', 'Kare-Kare Heirloom Recipe'],
    interests: ['Traditional Cooking', 'Local Herbs', 'Laguna Farmers Produce', 'Family Gatherings'],
    roles: ['Product Seller', 'Creator'],
    kycStatus: 'approved',
    kycData: {
      legalFullName: 'Lita Rodriguez',
      dateOfBirth: '1958-04-12',
      streetAddress: '123 Rizal St.',
      barangay: 'Brgy. Talojong',
      city: 'Majayjay',
      province: 'Laguna',
      contactNumber: '0917-555-8821',
      idType: 'senior_id',
      idNumber: 'SC-LAG-1998-4491',
      idFrontUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      selfieUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      submittedAt: '2026-01-16T09:00:00Z',
      reviewedAt: '2026-01-16T14:00:00Z',
    },
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'user-kuya-jayson',
    fullName: 'Jayson Bautista',
    username: 'kuyajayson',
    email: 'jayson@kayanatin.ph',
    dateOfBirth: '2004-09-18',
    age: 22,
    isSenior: false,
    location: {
      city: 'San Pablo',
      province: 'Laguna',
      barangay: 'Brgy. San Jose',
    },
    accountType: 'talent',
    bio: 'Music is life! 🎵 Acoustic guitarist at Pinoy songwriter. Nagbabahagi ng good vibes at OPM covers nang may pusong Pilipino.',
    avatarUrl: './assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
    skills: ['Acoustic Guitar', 'Songwriting', 'OPM Harana', 'Music Tutoring'],
    interests: ['Folk Music', 'Audio Production', 'Live Sessions', 'Community Youth Jam'],
    roles: ['Talento', 'Creator'],
    kycStatus: 'approved',
    createdAt: '2026-02-10T10:00:00Z',
  },
  {
    id: 'user-lola-mercy',
    fullName: 'Mercedes Del Rosario (Lola Mercy)',
    username: 'lolamercy',
    email: 'mercy@kayanatin.ph',
    dateOfBirth: '1962-07-25',
    age: 64,
    isSenior: true,
    location: {
      city: 'Pila',
      province: 'Laguna',
      barangay: 'Brgy. Santa Clara',
    },
    accountType: 'service',
    bio: 'Master seamstress na may mahigit 40 taong kasanayan sa barong alterations, modern Filipiniana, at school uniform repairs.',
    avatarUrl: './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    skills: ['Barong Alterations', 'Filipiniana Repair', 'Hem Adjustment', 'Custom Dressmaking'],
    interests: ['Traditional Weaving', 'Textile Arts', 'Sustainable Mending'],
    roles: ['Service Provider', 'Creator'],
    kycStatus: 'not_submitted',
    createdAt: '2026-02-01T09:30:00Z',
  },
  {
    id: 'user-maria-santos',
    fullName: 'Maria Santos',
    username: 'mariasantos',
    email: 'maria@example.com',
    dateOfBirth: '1992-03-14',
    age: 34,
    isSenior: false,
    location: {
      city: 'Quezon City',
      province: 'Metro Manila',
      barangay: 'Brgy. Diliman',
    },
    accountType: 'buyer',
    bio: 'Mahilig sumuporta sa mga lokal na gawang-kamay at lutong bahay mula sa ating mga nanay at lokal na artisan sa mga lalawigan.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&auto=format&fit=crop&q=80',
    skills: ['Community Patron', 'Local Art Collector'],
    interests: ['Pinoy Food', 'Terracotta Pottery', 'Support Local', 'Sustainable Goods'],
    roles: ['Product Seller', 'Creator', 'Talento'],
    kycStatus: 'approved',
    kycData: {
      legalFullName: 'Maria Santos',
      dateOfBirth: '1992-03-14',
      streetAddress: '45 Katipunan Ave.',
      barangay: 'Brgy. Diliman',
      city: 'Quezon City',
      province: 'Metro Manila',
      contactNumber: '0917-555-0192',
      idType: 'philsys',
      idNumber: 'PHIL-2022-9988-1243',
      idFrontUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
      selfieUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
      submittedAt: '2026-03-02T10:00:00Z',
      reviewedAt: '2026-03-02T16:00:00Z',
    },
    createdAt: '2026-03-01T14:20:00Z',
  },
];

// Mock password store mapped by username/email
const MOCK_PASSWORDS: Record<string, string> = {
  nanaylita: 'Password123!',
  'nanaylita@kayanatin.ph': 'Password123!',
  kuyajayson: 'Password123!',
  'jayson@kayanatin.ph': 'Password123!',
  lolamercy: 'Password123!',
  'mercy@kayanatin.ph': 'Password123!',
  mariasantos: 'Password123!',
  'maria@example.com': 'Password123!',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(INITIAL_DEMO_USERS);
  const [isLoading, setIsLoading] = useState(true);

  // Load persistence from localStorage on startup
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('kayanatin_registered_users');
      if (storedUsers) {
        const parsed = JSON.parse(storedUsers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRegisteredUsers(parsed);
        }
      } else {
        localStorage.setItem('kayanatin_registered_users', JSON.stringify(INITIAL_DEMO_USERS));
      }

      const storedCurrentUser = localStorage.getItem('kayanatin_current_user');
      if (storedCurrentUser) {
        const parsedUser = JSON.parse(storedCurrentUser);
        setCurrentUser(parsedUser);
      }
    } catch (err) {
      console.error('Error reading localStorage for auth:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login handler
  const login = async (
    emailOrUsername: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanInput = emailOrUsername.trim().toLowerCase();
    
    // Find user by email or username
    const foundUser = registeredUsers.find(
      (u) =>
        u.email.toLowerCase() === cleanInput ||
        u.username.toLowerCase() === cleanInput
    );

    if (!foundUser) {
      return {
        success: false,
        error: 'Hindi matagpuan ang account. Pakitiyak ang inyong email address o username.',
      };
    }

    // Check password
    const storedPass =
      MOCK_PASSWORDS[foundUser.username.toLowerCase()] ||
      MOCK_PASSWORDS[foundUser.email.toLowerCase()] ||
      'Password123!';

    if (password !== storedPass) {
      return {
        success: false,
        error: 'Maling password. Pakisubukang muli o i-click ang "Nakalimutan ang Password".',
      };
    }

    // Success: save current user
    setCurrentUser(foundUser);
    localStorage.setItem('kayanatin_current_user', JSON.stringify(foundUser));
    return { success: true };
  };

  // Register handler
  const register = async (userData: {
    fullName: string;
    username: string;
    email: string;
    dateOfBirth: string;
    location: { city: string; province: string; barangay?: string };
    accountType: AccountType;
    password: string;
  }): Promise<{ success: boolean; error?: string; user?: User }> => {
    const cleanEmail = userData.email.trim().toLowerCase();
    const cleanUsername = userData.username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');

    // 1. Check Age Requirement (MANDATORY)
    const age = calculateAge(userData.dateOfBirth);
    if (age < 18) {
      return {
        success: false,
        error: `Paumanhin: Ang KayaNatinTo ay eksklusibong nakalaan para sa mga may edad 18 taong gulang pataas (Kasalukuyang edad: ${age}). Hindi pa maaaring magrehistro ang mga menor de edad.`,
      };
    }

    // 2. Check Username uniqueness
    const usernameTaken = registeredUsers.some(
      (u) => u.username.toLowerCase() === cleanUsername
    );
    if (usernameTaken) {
      return {
        success: false,
        error: `Ang username na "@${cleanUsername}" ay ginagamit na. Pumili po ng ibang username.`,
      };
    }

    // 3. Check Email uniqueness
    const emailTaken = registeredUsers.some(
      (u) => u.email.toLowerCase() === cleanEmail
    );
    if (emailTaken) {
      return {
        success: false,
        error: 'Ang email address na ito ay mayroon nang kaugnay na account. Mag-log in na lamang.',
      };
    }

    // 4. Create new user object
    const isSenior = age >= 60;
    const newUser: User = {
      id: `user-${Date.now()}`,
      fullName: userData.fullName.trim(),
      username: cleanUsername,
      email: cleanEmail,
      dateOfBirth: userData.dateOfBirth,
      age,
      isSenior,
      location: userData.location,
      accountType: userData.accountType,
      bio: isSenior
        ? 'Isang senior creator / artisan na handang magbahagi ng talino, kasanayan, at sariling likha sa komunidad.'
        : 'Miyembro ng komunidad ng KayaNatinTo.',
      avatarUrl: '',
      skills: [],
      interests: [],
      createdAt: new Date().toISOString(),
    };

    // Save mock password
    MOCK_PASSWORDS[cleanUsername] = userData.password;
    MOCK_PASSWORDS[cleanEmail] = userData.password;

    // Update state & localStorage
    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    setCurrentUser(newUser);

    try {
      localStorage.setItem('kayanatin_registered_users', JSON.stringify(updatedUsers));
      localStorage.setItem('kayanatin_current_user', JSON.stringify(newUser));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    return { success: true, user: newUser };
  };

  // Update profile
  const updateProfile = async (
    updatedFields: Partial<User>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Kailangan munang mag-log in.' };
    }

    const updatedUser: User = {
      ...currentUser,
      ...updatedFields,
    };

    setCurrentUser(updatedUser);

    const updatedList = registeredUsers.map((u) =>
      u.id === currentUser.id ? updatedUser : u
    );
    setRegisteredUsers(updatedList);

    try {
      localStorage.setItem('kayanatin_registered_users', JSON.stringify(updatedList));
      localStorage.setItem('kayanatin_current_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    return { success: true };
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('kayanatin_current_user');
    } catch (e) {
      console.warn('LocalStorage remove error:', e);
    }
  };

  // Quick Demo Login for testing
  const quickLoginAsDemo = (demoKey: 'nanaylita' | 'kuyajayson' | 'maria' | 'lolamercy') => {
    const keyMap = {
      nanaylita: 'nanaylita',
      kuyajayson: 'kuyajayson',
      maria: 'mariasantos',
      lolamercy: 'lolamercy',
    };
    const targetUsername = keyMap[demoKey];
    const user = registeredUsers.find((u) => u.username === targetUsername);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('kayanatin_current_user', JSON.stringify(user));
    }
  };

  // Password reset simulation
  const requestPasswordReset = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const exists = registeredUsers.some((u) => u.email.toLowerCase() === cleanEmail);
    if (!exists) {
      return {
        success: false,
        message: 'Walang nahanap na account para sa email na ito. Pakitiyak ang inyong email address.',
      };
    }
    return {
      success: true,
      message: `Nagpadala ng password reset link sa ${cleanEmail}. Pakisuri ang inyong inbox o spam folder.`,
    };
  };

  // Check if an ID number is already used by another user (One person, one account safeguard)
  const checkDuplicateIdNumber = (idNumber: string, userId: string): boolean => {
    if (!idNumber) return false;
    const cleanId = idNumber.trim().toLowerCase().replace(/[\s-]/g, '');
    return registeredUsers.some((u) => {
      if (u.id === userId) return false;
      const otherId = u.kycData?.idNumber?.trim().toLowerCase().replace(/[\s-]/g, '');
      return otherId && otherId === cleanId;
    });
  };

  // Submit KYC verification
  const submitKycVerification = async (
    kycPayload: Omit<KycRecord, 'submittedAt'>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Kailangan munang mag-log in upang magsumite ng verification.' };
    }

    // 1. One Person, One Account safeguard
    if (checkDuplicateIdNumber(kycPayload.idNumber, currentUser.id)) {
      return {
        success: false,
        error: 'Ang ID number na ito ay nakatala na sa ibang rehistradong account. Alinsunod sa patakaran ng KayaNatinTo (One Person, One Account), isang lehitimong account lamang ang pinahihintulutan bawat tao.',
      };
    }

    const timestamp = new Date().toISOString();
    const newKycRecord: KycRecord = {
      ...kycPayload,
      submittedAt: timestamp,
    };

    const updatedUser: User = {
      ...currentUser,
      kycStatus: 'pending_review',
      kycData: newKycRecord,
    };

    setCurrentUser(updatedUser);

    const updatedList = registeredUsers.map((u) => (u.id === currentUser.id ? updatedUser : u));
    setRegisteredUsers(updatedList);

    try {
      localStorage.setItem('kayanatin_registered_users', JSON.stringify(updatedList));
      localStorage.setItem('kayanatin_current_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        registeredUsers,
        login,
        register,
        updateProfile,
        submitKycVerification,
        checkDuplicateIdNumber,
        logout,
        quickLoginAsDemo,
        requestPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
