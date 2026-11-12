import React, { createContext, useContext, useState, useEffect } from 'react';
import { Service, ServiceCategory } from '../types/service';

interface ServiceContextType {
  services: Service[];
  bookmarkedServiceIds: string[];
  isLoading: boolean;
  addService: (newServiceData: Omit<Service, 'id' | 'createdAt' | 'rating' | 'reviewsCount'>) => Service;
  updateService: (id: string, updatedFields: Partial<Service>) => boolean;
  deleteService: (id: string) => boolean;
  toggleServiceAvailability: (id: string) => void;
  toggleBookmarkService: (id: string) => void;
  isServiceBookmarked: (id: string) => boolean;
  getProviderServices: (username: string) => Service[];
  getServiceById: (id: string) => Service | undefined;
  getServicesByCategory: (category: ServiceCategory) => Service[];
}

const LOCAL_STORAGE_KEY = 'kayanatin_marketplace_services';
const BOOKMARKS_STORAGE_KEY = 'kayanatin_bookmarked_service_ids';

const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-001',
    providerId: 'usr-003',
    providerName: 'Lola Mercy Ramos',
    providerUsername: 'lola_mercy',
    providerAvatarUrl: './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    providerIsSenior: true,
    providerAge: 64,
    providerLocation: {
      city: 'Pila',
      province: 'Laguna',
      barangay: 'Brgy. Santa Clara',
    },
    title: 'Master Pananahi at Filipiniana Repair & Alterations',
    description: 'Mahigit 40 taon nang nagtatahi ng barong tagalog, modern filipiniana, at school/office uniforms. Nagseserbisyo rin ng zipper replacement, fitting adjustments, at hemline repair. Maingat, pulido, at garantisadong matibay ang tahi.',
    category: 'professional',
    rate: 150,
    rateUnit: 'oras',
    pricingType: 'hourly',
    arrangement: 'flexible',
    availability: 'Lunes hanggang Sabado, 8:00 AM - 5:00 PM',
    experienceYears: 42,
    portfolioImages: [
      './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    ],
    serviceArea: 'Pila, Victoria, at Santa Cruz, Laguna',
    isAvailable: true,
    isFeatured: true,
    rating: 5.0,
    reviewsCount: 48,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'srv-002',
    providerId: 'usr-002',
    providerName: 'Kuya Jayson Morales',
    providerUsername: 'jayson_music',
    providerAvatarUrl: './assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    providerIsSenior: false,
    providerAge: 22,
    providerLocation: {
      city: 'San Pablo City',
      province: 'Laguna',
      barangay: 'Brgy. San Jose',
    },
    title: 'Acoustic Guitar Lessons & OPM Vocal Coaching',
    description: 'Nais mo bang matutong mag-gitara o kumanta? Nagtuturo ako ng basic chords, fingerpicking, strumming rhythm, at ear training para sa mga baguhan at kabataan. Puwedeng online session o home-visit sa paligid ng San Pablo.',
    category: 'education-tutoring',
    rate: 400,
    rateUnit: 'session (1.5 oras)',
    pricingType: 'fixed',
    arrangement: 'flexible',
    availability: 'Martes, Huwebes, at Sabado, 1:00 PM - 7:00 PM',
    experienceYears: 5,
    portfolioImages: [
      './assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    ],
    serviceArea: 'San Pablo City at mga karatig-bayan',
    isAvailable: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 34,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'srv-003',
    providerId: 'usr-005',
    providerName: 'Mang Carding Santos',
    providerUsername: 'mang_carding',
    providerAvatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
    providerIsSenior: false,
    providerAge: 56,
    providerLocation: {
      city: 'Paete',
      province: 'Laguna',
      barangay: 'Brgy. Bangkusay',
    },
    title: 'Wood Furniture Restoration & Custom Carpentry',
    description: 'Tubong Paete na sanay sa tradisyunal na ukit at paggawa ng matitibay na narra, molave, at mahogany furniture. Tumatanggap ng pag-aayos ng lumang aparador, sirang dining table, sliding doors, at custom wooden dividers.',
    category: 'repair-maintenance',
    rate: 650,
    rateUnit: 'araw',
    pricingType: 'project',
    arrangement: 'customer-location',
    availability: 'Lunes hanggang Biyernes, 8:00 AM - 4:00 PM',
    experienceYears: 32,
    portfolioImages: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
    ],
    serviceArea: 'Paete, Pakil, Pangil, at Kalayaan, Laguna',
    isAvailable: true,
    isFeatured: true,
    rating: 4.8,
    reviewsCount: 29,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'srv-004',
    providerId: 'usr-006',
    providerName: 'Teacher Grace Villanueva',
    providerUsername: 'teacher_grace',
    providerAvatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    providerIsSenior: false,
    providerAge: 38,
    providerLocation: {
      city: 'Majayjay',
      province: 'Laguna',
      barangay: 'Brgy. San Francisco',
    },
    title: 'Elementary Math & Filipino Reading Remedial Coaching',
    description: 'Licensed professional teacher na may pusong magturo sa mga batang nahihirapan sa basic reading comprehension (Filipino & English) at elementary mathematics. Ginagamitan ng masayang visual aids at hands-on practice.',
    category: 'education-tutoring',
    rate: 250,
    rateUnit: 'oras',
    pricingType: 'hourly',
    arrangement: 'online',
    availability: 'Lunes hanggang Sabado, 3:00 PM - 7:00 PM',
    experienceYears: 14,
    portfolioImages: [
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80',
    ],
    serviceArea: 'Online nationwide & Home-visit sa Majayjay',
    isAvailable: true,
    isFeatured: false,
    rating: 5.0,
    reviewsCount: 42,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'srv-005',
    providerId: 'usr-007',
    providerName: 'Kuya Rene Bautro',
    providerUsername: 'kuya_rene_errands',
    providerAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    providerIsSenior: false,
    providerAge: 45,
    providerLocation: {
      city: 'San Pablo City',
      province: 'Laguna',
      barangay: 'Brgy. Del Remedio',
    },
    title: 'Tricycle Hatid-Sundo & Palengke Pabili Service',
    description: 'Walang oras mamalengke o kailangan ng maaasahang maghahatid sa senior parents papuntang clinic? Ako na po ang bahala! Malinis ang sasakyan, mabait, may official receipts para sa bawat bilihin.',
    category: 'transport-errand',
    rate: 80,
    rateUnit: 'errand',
    pricingType: 'fixed',
    arrangement: 'customer-location',
    availability: 'Araw-araw mula 6:00 AM - 6:00 PM',
    experienceYears: 12,
    portfolioImages: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
    ],
    serviceArea: 'Lahat ng Barangay sa San Pablo City',
    isAvailable: true,
    isFeatured: false,
    rating: 4.9,
    reviewsCount: 56,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'srv-006',
    providerId: 'usr-001',
    providerName: 'Nanay Lita Ramos',
    providerUsername: 'nanaylita',
    providerAvatarUrl: './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    providerIsSenior: true,
    providerAge: 68,
    providerLocation: {
      city: 'Majayjay',
      province: 'Laguna',
      barangay: 'Brgy. Malinao',
    },
    title: 'Fiesta Catering & Authentic Laguna Lumpia Cook',
    description: 'May darating bang bisita o kaarawan sa pamilya? Nagluluto ako on-site o delivery ng authentic sariwang lumpiang ubod, menudo ng kapistahan, kare-kareng baka, at puto kutsinta. Sinisigurong malinis at lasang pampamilya.',
    category: 'catering-food',
    rate: 1500,
    rateUnit: 'handaan package',
    pricingType: 'negotiable',
    arrangement: 'customer-location',
    availability: 'Sabado at Linggo (Reservations 3 days ahead)',
    experienceYears: 45,
    portfolioImages: [
      './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    ],
    serviceArea: 'Majayjay, Liliw, Magdalena, at Lucban',
    isAvailable: true,
    isFeatured: true,
    rating: 5.0,
    reviewsCount: 61,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'srv-007',
    providerId: 'usr-008',
    providerName: 'Ate Maricel Dizon',
    providerUsername: 'maricel_clean',
    providerAvatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80',
    providerIsSenior: false,
    providerAge: 42,
    providerLocation: {
      city: 'Nagcarlan',
      province: 'Laguna',
      barangay: 'Brgy. Poblacion I',
    },
    title: 'Deep House Cleaning, Kusina & Banyo Sanitation',
    description: 'Pangkalahatang linis ng bahay, mabisang pagtanggal ng sebo sa kusina, scrub ng banyo, at pag-aayos ng mga kalat. May dalang sariling eco-friendly disinfectant at gamit.',
    category: 'cleaning',
    rate: 350,
    rateUnit: 'session',
    pricingType: 'hourly',
    arrangement: 'customer-location',
    availability: 'Lunes, Miyerkules, Biyernes, 8:00 AM - 3:00 PM',
    experienceYears: 9,
    portfolioImages: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
    ],
    serviceArea: 'Nagcarlan, Liliw, at Rizal, Laguna',
    isAvailable: true,
    isFeatured: false,
    rating: 4.7,
    reviewsCount: 19,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'srv-008',
    providerId: 'usr-009',
    providerName: 'Kuya Dexter Alcantara',
    providerUsername: 'dexter_photos',
    providerAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    providerIsSenior: false,
    providerAge: 29,
    providerLocation: {
      city: 'Calamba',
      province: 'Laguna',
      barangay: 'Brgy. Real',
    },
    title: 'Family Portrait & Community Event Photography',
    description: 'Litrato ng binyag, 60th birthday, family reunion, o small business product shots. Kasama ang high-resolution enhanced photos at libreng short video clips para sa social media.',
    category: 'photo-video',
    rate: 1200,
    rateUnit: 'event',
    pricingType: 'project',
    arrangement: 'flexible',
    availability: 'Biyernes hanggang Linggo, full day available',
    experienceYears: 6,
    portfolioImages: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
    ],
    serviceArea: 'Calamba, Los Baños, Cabuyao, at Santa Rosa',
    isAvailable: true,
    isFeatured: false,
    rating: 4.9,
    reviewsCount: 23,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_SERVICES;
  });

  const [bookmarkedServiceIds, setBookmarkedServiceIds] = useState<string[]>(() => {
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

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(services));
    } catch {
      // ignore
    }
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarkedServiceIds));
    } catch {
      // ignore
    }
  }, [bookmarkedServiceIds]);

  const addService = (newServiceData: Omit<Service, 'id' | 'createdAt' | 'rating' | 'reviewsCount'>): Service => {
    const newService: Service = {
      ...newServiceData,
      id: `srv-${Date.now()}`,
      createdAt: new Date().toISOString(),
      rating: 5.0,
      reviewsCount: 1,
    };

    setServices((prev) => [newService, ...prev]);
    return newService;
  };

  const updateService = (id: string, updatedFields: Partial<Service>): boolean => {
    let updated = false;
    setServices((prev) =>
      prev.map((srv) => {
        if (srv.id === id) {
          updated = true;
          return {
            ...srv,
            ...updatedFields,
            updatedAt: new Date().toISOString(),
          };
        }
        return srv;
      })
    );
    return updated;
  };

  const deleteService = (id: string): boolean => {
    let deleted = false;
    setServices((prev) => {
      const exists = prev.some((srv) => srv.id === id);
      if (exists) {
        deleted = true;
        return prev.filter((srv) => srv.id !== id);
      }
      return prev;
    });

    setBookmarkedServiceIds((prev) => prev.filter((bookmarkId) => bookmarkId !== id));
    return deleted;
  };

  const toggleServiceAvailability = (id: string) => {
    setServices((prev) =>
      prev.map((srv) => {
        if (srv.id === id) {
          return {
            ...srv,
            isAvailable: !srv.isAvailable,
            updatedAt: new Date().toISOString(),
          };
        }
        return srv;
      })
    );
  };

  const toggleBookmarkService = (id: string) => {
    setBookmarkedServiceIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const isServiceBookmarked = (id: string) => {
    return bookmarkedServiceIds.includes(id);
  };

  const getProviderServices = (username: string): Service[] => {
    return services.filter(
      (srv) => srv.providerUsername.toLowerCase() === username.toLowerCase()
    );
  };

  const getServiceById = (id: string): Service | undefined => {
    return services.find((srv) => srv.id === id);
  };

  const getServicesByCategory = (category: ServiceCategory): Service[] => {
    return services.filter((srv) => srv.category === category);
  };

  return (
    <ServiceContext.Provider
      value={{
        services,
        bookmarkedServiceIds,
        isLoading,
        addService,
        updateService,
        deleteService,
        toggleServiceAvailability,
        toggleBookmarkService,
        isServiceBookmarked,
        getProviderServices,
        getServiceById,
        getServicesByCategory,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};
