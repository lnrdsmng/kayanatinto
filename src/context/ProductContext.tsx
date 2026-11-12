import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, ProductCategory, ProductCondition } from '../types/product';
import { useAuth } from './AuthContext';

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  bookmarkedProductIds: string[];
  toggleBookmark: (productId: string) => void;
  isBookmarked: (productId: string) => boolean;
  addProduct: (productInput: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewsCount'>) => Promise<{ success: boolean; error?: string; product?: Product }>;
  updateProduct: (productId: string, updatedFields: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  toggleProductAvailability: (productId: string) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (productId: string) => Promise<{ success: boolean; error?: string }>;
  getProductById: (productId: string) => Product | undefined;
  getSellerProducts: (sellerIdOrUsername: string) => Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Initial Pre-Seeded Products Across Categories
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-lumpia-shanghai',
    sellerId: 'user-nanay-lita',
    sellerName: 'Lutong Bahay ni Aling Rosa',
    sellerUsername: 'nanaylita',
    sellerAvatarUrl: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    sellerIsSenior: true,
    sellerAge: 68,
    sellerLocation: {
      city: 'Majayjay',
      province: 'Laguna',
      barangay: 'Brgy. Talojong',
    },
    title: 'Homemade Lumpia Shanghai (Crispy Golden)',
    description: 'Freshly rolled crispy lumpia filled with seasoned minced pork, minced carrots, singkamas, spring onions, and heirloom Laguna herbs. Made fresh every morning using Nanay Rosa’s 40-year heirloom recipe. Includes special sweet chili dipping sauce.',
    category: 'food',
    price: 100,
    priceUnit: 'pack (12 pcs)',
    stock: 25,
    condition: 'made-to-order',
    images: [
      '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    ],
    deliveryOptions: {
      allowPickup: true,
      pickupLocation: 'Near Majayjay Town Plaza, Laguna',
      allowSellerDelivery: true,
      deliveryFee: 30,
      deliveryArea: 'Majayjay, Magdalena, and Liliw Laguna',
      isPerishableFood: true,
      deliveryLimitations: 'Perishable food: Local immediate transactions only. Delivered hot in insulated containers within 1-2 hours of rolling.',
    },
    isAvailable: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 328,
    createdAt: '2026-11-01T08:00:00Z',
  },
  {
    id: 'prod-terracotta-pots',
    sellerId: 'user-kuya-jun',
    sellerName: 'Kuya Jun Wood & Clay Craft',
    sellerUsername: 'kuyajun',
    sellerAvatarUrl: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    sellerIsSenior: false,
    sellerAge: 52,
    sellerLocation: {
      city: 'Luisiana',
      province: 'Laguna',
      barangay: 'Brgy. San Diego',
    },
    title: 'Handmade Terracotta Pottery & Clay Pots',
    description: 'Traditional wood-kiln fired clay planters and decorative vases crafted from natural Luisiana clay. Highly breathable ceramic that keeps plant roots aerated and cool in Philippine tropical weather.',
    category: 'arts-crafts',
    price: 250,
    priceUnit: 'piece',
    stock: 14,
    condition: 'handcrafted',
    images: [
      '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    ],
    deliveryOptions: {
      allowPickup: true,
      pickupLocation: 'Kuya Jun Workshop, Luisiana National Highway',
      allowSellerDelivery: true,
      deliveryFee: 50,
      deliveryArea: 'Luisiana, Lucban, and Cavinti Laguna',
      isPerishableFood: false,
      deliveryLimitations: 'Wrapped in recycled paper cushion and rigid box. Seller arranges direct drop-off.',
    },
    isAvailable: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 95,
    createdAt: '2026-11-02T10:30:00Z',
  },
  {
    id: 'prod-pastries-ensaymada',
    sellerId: 'user-nanay-elena',
    sellerName: 'Nanay Elena Baked Goodies',
    sellerUsername: 'nanayelena',
    sellerAvatarUrl: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    sellerIsSenior: true,
    sellerAge: 61,
    sellerLocation: {
      city: 'San Pablo',
      province: 'Laguna',
      barangay: 'Brgy. San Jose',
    },
    title: 'Fresh Buko Tarts & Special Ensaymada',
    description: 'Soft butter brioche topped with grated queso de bola and tender young coconut hand-pies with flaky golden crust. Baked before dawn every day with pure creamery butter.',
    category: 'food',
    price: 80,
    priceUnit: 'box of 6',
    stock: 30,
    condition: 'made-to-order',
    images: [
      '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    ],
    deliveryOptions: {
      allowPickup: true,
      pickupLocation: 'San Pablo City Public Market area',
      allowSellerDelivery: true,
      deliveryFee: 25,
      deliveryArea: 'San Pablo City and Alaminos',
      isPerishableFood: true,
      deliveryLimitations: 'Fresh bakery product. Best consumed within 3 days. Local delivery only.',
    },
    isAvailable: true,
    isFeatured: true,
    rating: 5.0,
    reviewsCount: 76,
    createdAt: '2026-11-04T06:00:00Z',
  },
  {
    id: 'prod-barong-habing-pinoy',
    sellerId: 'user-lola-mercy',
    sellerName: 'Lola Mercy Pananahi & Modista',
    sellerUsername: 'lolamercy',
    sellerAvatarUrl: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    sellerIsSenior: true,
    sellerAge: 64,
    sellerLocation: {
      city: 'Pila',
      province: 'Laguna',
      barangay: 'Brgy. Santa Clara',
    },
    title: 'Custom Barong Tagalog & Modern Filipiniana Blouse',
    description: 'Custom tailored Piña-organza and jusi barongs tailored by Lola Mercy with over 40 years of precision sewing experience. Includes delicate embroidery accents and custom fitting measurements.',
    category: 'clothing',
    price: 1200,
    priceUnit: 'garment',
    stock: 5,
    condition: 'handcrafted',
    images: [
      '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    ],
    deliveryOptions: {
      allowPickup: true,
      pickupLocation: 'Pila Town Workshop near Historic Town Plaza',
      allowSellerDelivery: true,
      deliveryFee: 60,
      deliveryArea: 'Pila, Santa Cruz, and Victoria Laguna',
      isPerishableFood: false,
      deliveryLimitations: 'Personal fitting service available upon request in nearby towns.',
    },
    isAvailable: true,
    isFeatured: false,
    rating: 4.8,
    reviewsCount: 120,
    createdAt: '2026-11-03T11:15:00Z',
  },
  {
    id: 'prod-herbal-soap-vco',
    sellerId: 'user-maria-santos',
    sellerName: 'Maria Santos Likas Botanicals',
    sellerUsername: 'mariasantos',
    sellerAvatarUrl: '',
    sellerIsSenior: false,
    sellerAge: 34,
    sellerLocation: {
      city: 'San Pablo',
      province: 'Laguna',
      barangay: 'Brgy. Del Remedio',
    },
    title: 'Cold-Pressed Virgin Coconut & Calamansi Herbal Soap',
    description: 'Handmade cold-process bar soap made from organic Laguna coconut oil, wild honey, and natural calamansi peel extract. Gentle and chemical-free for sensitive skin.',
    category: 'beauty',
    price: 95,
    priceUnit: 'bar (100g)',
    stock: 45,
    condition: 'handcrafted',
    images: [
      '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    ],
    deliveryOptions: {
      allowPickup: true,
      pickupLocation: 'San Pablo City, Laguna',
      allowSellerDelivery: true,
      deliveryFee: 40,
      deliveryArea: 'Within 15km of San Pablo',
      isPerishableFood: false,
      deliveryLimitations: 'Packed in biodegradable banana fiber wrapping.',
    },
    isAvailable: true,
    isFeatured: false,
    rating: 4.9,
    reviewsCount: 42,
    createdAt: '2026-11-05T09:20:00Z',
  },
  {
    id: 'prod-handwoven-bayong',
    sellerId: 'user-nanay-lita',
    sellerName: 'Lutong Bahay ni Aling Rosa',
    sellerUsername: 'nanaylita',
    sellerAvatarUrl: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    sellerIsSenior: true,
    sellerAge: 68,
    sellerLocation: {
      city: 'Majayjay',
      province: 'Laguna',
      barangay: 'Brgy. Talojong',
    },
    title: 'Laguna Pandan Woven Market Bag (Bayong)',
    description: 'Eco-friendly and durable handwoven bayong bag woven from dried pandan leaves. Sturdy handles, water-resistant base, and spacious enough for farm market groceries.',
    category: 'home-living',
    price: 180,
    priceUnit: 'piece',
    stock: 18,
    condition: 'handcrafted',
    images: [
      '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    ],
    deliveryOptions: {
      allowPickup: true,
      pickupLocation: 'Majayjay Town Center',
      allowSellerDelivery: true,
      deliveryFee: 35,
      deliveryArea: 'Majayjay & Liliw',
      isPerishableFood: false,
      deliveryLimitations: 'Discounts available for bulk bundle orders of 5 or more.',
    },
    isAvailable: true,
    isFeatured: false,
    rating: 4.8,
    reviewsCount: 38,
    createdAt: '2026-11-05T14:40:00Z',
  },
  {
    id: 'prod-calathea-ornamental-plant',
    sellerId: 'user-kuya-jayson',
    sellerName: 'Jayson Bautista Hardin & Jam',
    sellerUsername: 'kuyajayson',
    sellerAvatarUrl: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    sellerIsSenior: false,
    sellerAge: 22,
    sellerLocation: {
      city: 'San Pablo',
      province: 'Laguna',
      barangay: 'Brgy. San Jose',
    },
    title: 'Potted Calathea & Native Herb Seedlings',
    description: 'Healthy rooted Calathea prayer plants and organic culinary herbs (oregano, basil, and lemongrass) propagated in compost-enriched Laguna volcanic soil.',
    category: 'plants-gardening',
    price: 150,
    priceUnit: 'pot',
    stock: 12,
    condition: 'handcrafted',
    images: [
      '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    ],
    deliveryOptions: {
      allowPickup: true,
      pickupLocation: 'San Pablo City, Laguna',
      allowSellerDelivery: true,
      deliveryFee: 30,
      deliveryArea: 'San Pablo local area',
      isPerishableFood: false,
      deliveryLimitations: 'Handled with care on foot/motorcycle to prevent soil spillage.',
    },
    isAvailable: true,
    isFeatured: false,
    rating: 4.9,
    reviewsCount: 19,
    createdAt: '2026-11-06T13:00:00Z',
  },
  {
    id: 'prod-solar-emergency-lamp',
    sellerId: 'user-kuya-jun',
    sellerName: 'Kuya Jun Wood & Clay Craft',
    sellerUsername: 'kuyajun',
    sellerAvatarUrl: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    sellerIsSenior: false,
    sellerAge: 52,
    sellerLocation: {
      city: 'Luisiana',
      province: 'Laguna',
      barangay: 'Brgy. San Diego',
    },
    title: 'Mini Solar Powered Emergency Night Lamp',
    description: 'Compact 5W solar-charged LED emergency light with USB phone charging port. Tested and tuned for local farm houses and rainy typhoon seasons.',
    category: 'electronics',
    price: 320,
    priceUnit: 'unit',
    stock: 8,
    condition: 'brand-new',
    images: [
      '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    ],
    deliveryOptions: {
      allowPickup: true,
      pickupLocation: 'Luisiana Highway Workshop',
      allowSellerDelivery: true,
      deliveryFee: 40,
      deliveryArea: 'Luisiana & Lucban',
      isPerishableFood: false,
      deliveryLimitations: 'Tested working before handover. Includes solar panel cable.',
    },
    isAvailable: true,
    isFeatured: false,
    rating: 4.7,
    reviewsCount: 24,
    createdAt: '2026-11-06T16:15:00Z',
  },
];

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [bookmarkedProductIds, setBookmarkedProductIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load products and bookmarks from localStorage on startup
  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem('kayanatin_marketplace_products');
      if (storedProducts) {
        const parsed = JSON.parse(storedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        }
      } else {
        localStorage.setItem('kayanatin_marketplace_products', JSON.stringify(INITIAL_PRODUCTS));
      }

      const storedBookmarks = localStorage.getItem('kayanatin_bookmarked_product_ids');
      if (storedBookmarks) {
        const parsedB = JSON.parse(storedBookmarks);
        if (Array.isArray(parsedB)) {
          setBookmarkedProductIds(parsedB);
        }
      }
    } catch (e) {
      console.error('Error reading localStorage for products:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save products to localStorage helper
  const persistProducts = (updated: Product[]) => {
    setProducts(updated);
    try {
      localStorage.setItem('kayanatin_marketplace_products', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  // Toggle bookmark / save product
  const toggleBookmark = (productId: string) => {
    setBookmarkedProductIds((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem('kayanatin_bookmarked_product_ids', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const isBookmarked = (productId: string) => {
    return bookmarkedProductIds.includes(productId);
  };

  // Add Product (Create)
  const addProduct = async (
    productInput: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewsCount'>
  ): Promise<{ success: boolean; error?: string; product?: Product }> => {
    if (!currentUser) {
      return { success: false, error: 'Kailangan munang mag-log in upang mag-post ng produkto.' };
    }

    if (!productInput.title.trim()) {
      return { success: false, error: 'Pakilagay ang pangalan ng produkto.' };
    }

    if (productInput.price <= 0) {
      return { success: false, error: 'Pakilagay ang wastong presyo ng produkto.' };
    }

    const newProduct: Product = {
      ...productInput,
      id: `prod-${Date.now()}`,
      sellerId: currentUser.id,
      sellerName: currentUser.fullName,
      sellerUsername: currentUser.username,
      sellerAvatarUrl: currentUser.avatarUrl,
      sellerIsSenior: currentUser.isSenior,
      sellerAge: currentUser.age,
      sellerLocation: {
        city: currentUser.location.city,
        province: currentUser.location.province,
        barangay: currentUser.location.barangay,
      },
      rating: 5.0,
      reviewsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newProduct, ...products];
    persistProducts(updated);
    return { success: true, product: newProduct };
  };

  // Update Product (Update)
  const updateProduct = async (
    productId: string,
    updatedFields: Partial<Product>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Kailangan munang mag-log in.' };
    }

    const target = products.find((p) => p.id === productId);
    if (!target) {
      return { success: false, error: 'Hindi nahanap ang produkto.' };
    }

    // Ownership verification
    const isOwner =
      target.sellerId === currentUser.id ||
      target.sellerUsername.toLowerCase() === currentUser.username.toLowerCase();

    if (!isOwner) {
      return {
        success: false,
        error: 'Wala kayong pahintulot na baguhin ang produktong ito. Ang may-ari lamang ang maaaring mag-edit.',
      };
    }

    const updatedList = products.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          ...updatedFields,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    persistProducts(updatedList);
    return { success: true };
  };

  // Toggle availability / mark as sold or unavailable
  const toggleProductAvailability = async (
    productId: string
  ): Promise<{ success: boolean; error?: string }> => {
    const target = products.find((p) => p.id === productId);
    if (!target) return { success: false, error: 'Product not found' };

    return updateProduct(productId, {
      isAvailable: !target.isAvailable,
      isSoldOut: target.isAvailable,
    });
  };

  // Delete Product (Delete)
  const deleteProduct = async (
    productId: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Kailangan munang mag-log in.' };
    }

    const target = products.find((p) => p.id === productId);
    if (!target) {
      return { success: false, error: 'Hindi nahanap ang produkto.' };
    }

    // Ownership verification
    const isOwner =
      target.sellerId === currentUser.id ||
      target.sellerUsername.toLowerCase() === currentUser.username.toLowerCase();

    if (!isOwner) {
      return {
        success: false,
        error: 'Wala kayong pahintulot na tanggalin ang produktong pagmamay-ari ng ibang seller.',
      };
    }

    const updatedList = products.filter((p) => p.id !== productId);
    persistProducts(updatedList);
    return { success: true };
  };

  const getProductById = (productId: string) => {
    return products.find((p) => p.id === productId);
  };

  const getSellerProducts = (sellerIdOrUsername: string) => {
    const clean = sellerIdOrUsername.toLowerCase();
    return products.filter(
      (p) =>
        p.sellerId.toLowerCase() === clean ||
        p.sellerUsername.toLowerCase() === clean
    );
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        bookmarkedProductIds,
        toggleBookmark,
        isBookmarked,
        addProduct,
        updateProduct,
        toggleProductAvailability,
        deleteProduct,
        getProductById,
        getSellerProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
