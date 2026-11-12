import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  ProductOrder,
  ServiceBooking,
  ProductOrderStatus,
  ServiceBookingStatus,
  CreateProductOrderInput,
  CreateServiceBookingInput,
  PaymentMethod,
  PaymentStatus,
  CodPaymentStatus,
  CodCommissionStatus,
  PayoutChannel,
  SellerPayoutMethod,
  WithdrawalStatus,
  WithdrawalRequest,
  SellerWalletSummary,
  TransactionTimelineEntry,
} from '../types/transaction';
import { useAuth } from './AuthContext';
import { useProducts } from './ProductContext';
import { useServices } from './ServiceContext';
import { useNotifications } from './NotificationContext';

const ORDERS_STORAGE_KEY = 'kayanatin_orders';
const BOOKINGS_STORAGE_KEY = 'kayanatin_bookings';
const PAYOUT_METHODS_STORAGE_KEY = 'kayanatin_payout_methods';
const WITHDRAWALS_STORAGE_KEY = 'kayanatin_withdrawals';

interface TransactionContextType {
  orders: ProductOrder[];
  bookings: ServiceBooking[];
  withdrawals: WithdrawalRequest[];
  payoutMethods: SellerPayoutMethod[];
  isLoading: boolean;

  createProductOrder: (input: CreateProductOrderInput) => Promise<{ success: boolean; order?: ProductOrder; error?: string }>;
  updateOrderStatus: (orderId: string, newStatus: ProductOrderStatus, note?: string, reason?: string) => Promise<{ success: boolean; error?: string }>;

  // Stage 8 Payment & COD reconciliation
  confirmCodPaymentReceived: (orderId: string) => Promise<{ success: boolean; error?: string }>;
  recordCodCommissionRemittance: (orderId: string, settlementRef: string, note?: string) => Promise<{ success: boolean; error?: string }>;

  createServiceBooking: (input: CreateServiceBookingInput) => Promise<{ success: boolean; booking?: ServiceBooking; error?: string }>;
  updateBookingStatus: (
    bookingId: string,
    newStatus: ServiceBookingStatus,
    options?: { note?: string; proposedDate?: string; proposedTimeSlot?: string; reason?: string }
  ) => Promise<{ success: boolean; error?: string }>;

  getOrderById: (orderId: string) => ProductOrder | undefined;
  getBookingById: (bookingId: string) => ServiceBooking | undefined;

  getCustomerOrders: (customerId: string) => ProductOrder[];
  getSellerOrders: (sellerId: string, sellerUsername?: string) => ProductOrder[];

  getCustomerBookings: (customerId: string) => ServiceBooking[];
  getProviderBookings: (providerId: string, providerUsername?: string) => ServiceBooking[];

  // Stage 8 Seller Wallet & Balance
  getSellerWalletSummary: (sellerId: string, sellerUsername?: string) => SellerWalletSummary;
  getSellerWithdrawals: (sellerId: string) => WithdrawalRequest[];
  createWithdrawalRequest: (amount: number, payoutMethodId: string) => Promise<{ success: boolean; withdrawal?: WithdrawalRequest; error?: string }>;
  updateWithdrawalStatus: (
    withdrawalId: string,
    newStatus: WithdrawalStatus,
    options?: { rejectionReason?: string; adminNotes?: string; transactionReference?: string; adminName?: string }
  ) => Promise<{ success: boolean; error?: string }>;

  // Stage 8 Payout Methods
  getSellerPayoutMethods: (sellerId: string) => SellerPayoutMethod[];
  addPayoutMethod: (input: {
    channel: PayoutChannel;
    channelName: string;
    accountHolderName: string;
    accountNumber: string;
    isDefault?: boolean;
  }) => Promise<{ success: boolean; payoutMethod?: SellerPayoutMethod; error?: string }>;
  deletePayoutMethod: (id: string) => Promise<{ success: boolean; error?: string }>;
  setDefaultPayoutMethod: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Counters
  pendingSellerOrdersCount: number;
  pendingProviderBookingsCount: number;
  pendingCustomerOrdersCount: number;
  pendingCustomerBookingsCount: number;
  pendingWithdrawalsCount: number;
  outstandingCodCommissionsCount: number;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Initial Pre-Seeded Sample Orders for Realistic Testing
export const INITIAL_ORDERS: ProductOrder[] = [
  {
    id: 'ORD-2026-88124',
    customerId: 'user-maria-santos',
    customerName: 'Maria Santos',
    customerUsername: 'mariasantos',
    customerAvatarUrl: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    customerIsSenior: false,
    customerPhone: '0917-555-0192',
    customerEmail: 'maria.santos@kayanatin.ph',

    sellerId: 'user-nanay-lita',
    sellerName: 'Lutong Bahay ni Aling Rosa',
    sellerUsername: 'nanaylita',
    sellerAvatarUrl: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    sellerIsSenior: true,

    productId: 'prod-lumpia-shanghai',
    productTitle: 'Homemade Lumpia Shanghai (Crispy Golden)',
    productImage: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    productCategory: 'food',

    unitPrice: 100,
    quantity: 2,
    priceUnit: 'pack (12 pcs)',
    subtotal: 200,
    platformCommissionRate: 0.03,
    platformCommissionAmount: 6,
    deliveryFee: 30,
    totalAmount: 236,
    sellerProceeds: 230,

    paymentMethod: 'cod',
    paymentStatus: 'pending',
    codPaymentStatus: 'pending_collection',
    codCommissionStatus: 'pending',

    fulfillmentType: 'delivery',
    deliveryAddress: {
      city: 'Majayjay',
      province: 'Laguna',
      barangay: 'Brgy. San Roque',
      streetAddress: '142 Rizal Street, tapat ng lumang kapilya',
      landmark: 'Kulay asul na gate',
    },
    isPerishableFood: true,

    customerNote: 'Pakidagdagan po ng sweet chili sauce kung maaari po Nanay Rosa, salamat po!',
    sellerNote: 'Sinisimulan na po ang pagbalot at pagprito nang sariwa.',

    status: 'preparing',
    timeline: [
      {
        status: 'pending',
        timestamp: '2026-11-08T09:30:00Z',
        note: 'Naisumite ang order request ng customer. Cash on Delivery pinili.',
        actorName: 'Maria Santos',
      },
      {
        status: 'accepted',
        timestamp: '2026-11-08T09:45:00Z',
        note: 'Tinanggap ni Nanay Rosa ang inyong order request.',
        actorName: 'Lutong Bahay ni Aling Rosa',
      },
      {
        status: 'preparing',
        timestamp: '2026-11-08T10:15:00Z',
        note: 'Kasalukuyang inihahanda ang sariwang lumpia sa kusina.',
        actorName: 'Lutong Bahay ni Aling Rosa',
      },
    ],
    createdAt: '2026-11-08T09:30:00Z',
    updatedAt: '2026-11-08T10:15:00Z',
  },
  {
    id: 'ORD-2026-77319',
    customerId: 'user-maria-santos',
    customerName: 'Maria Santos',
    customerUsername: 'mariasantos',
    customerAvatarUrl: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    customerIsSenior: false,
    customerPhone: '0917-555-0192',

    sellerId: 'user-lola-mercy',
    sellerName: 'Lola Mercy Handmade Crafts',
    sellerUsername: 'lolamercy',
    sellerIsSenior: true,

    productId: 'prod-bayong-laguna',
    productTitle: 'Handwoven Pandan Bayong Eco-Tote Bag',
    productImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    productCategory: 'arts-crafts',

    unitPrice: 280,
    quantity: 1,
    priceUnit: 'piraso',
    subtotal: 280,
    platformCommissionRate: 0.03,
    platformCommissionAmount: 8.4,
    deliveryFee: 0,
    totalAmount: 288.4,
    sellerProceeds: 280,

    paymentMethod: 'cod',
    paymentStatus: 'paid',
    codPaymentStatus: 'collected_by_seller',
    codCommissionStatus: 'remitted',
    codPaymentConfirmedAt: '2026-11-05T16:30:00Z',
    codPaymentConfirmedBy: 'Lola Mercy',
    codCommissionRemittedAt: '2026-11-06T09:00:00Z',
    codCommissionRemittanceRef: 'REM-2026-00412',

    fulfillmentType: 'pickup',
    pickupLocation: 'Pila Town Center Heritage Lane, Pila, Laguna',
    isPerishableFood: false,

    customerNote: 'Kukunin ko po sa Sabado ng hapon.',
    sellerNote: 'Nakuha na nang maayos ng mamimili. Maraming salamat sa pagtangkilik!',

    status: 'completed',
    timeline: [
      {
        status: 'pending',
        timestamp: '2026-11-04T14:00:00Z',
        note: 'Order placed by customer via Cash on Delivery.',
        actorName: 'Maria Santos',
      },
      {
        status: 'accepted',
        timestamp: '2026-11-04T15:00:00Z',
        note: 'Order confirmed by Lola Mercy.',
        actorName: 'Lola Mercy',
      },
      {
        status: 'ready_or_out',
        timestamp: '2026-11-05T10:00:00Z',
        note: 'Nakahanda na sa pickup location ang Pandan Bayong.',
        actorName: 'Lola Mercy',
      },
      {
        status: 'completed',
        timestamp: '2026-11-05T16:30:00Z',
        note: 'Matagumpay na natanggap at nabayaran sa pickup. Kinumpirma ni Lola Mercy ang bayad sa COD.',
        actorName: 'Lola Mercy',
      },
    ],
    createdAt: '2026-11-04T14:00:00Z',
    updatedAt: '2026-11-05T16:30:00Z',
  },
  {
    id: 'ORD-2026-90412',
    customerId: 'user-kuya-jayson',
    customerName: 'Kuya Jayson Alcantara',
    customerUsername: 'kuyajayson',
    customerIsSenior: false,
    customerPhone: '0928-555-8812',

    sellerId: 'user-maria-santos',
    sellerName: 'Maria Santos',
    sellerUsername: 'mariasantos',
    sellerIsSenior: false,

    productId: 'prod-embroidery-patch',
    productTitle: 'Handmade Laguna Sampaguita Embroidery Craft',
    productImage: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    productCategory: 'arts-crafts',

    unitPrice: 150,
    quantity: 3,
    priceUnit: 'piraso',
    subtotal: 450,
    platformCommissionRate: 0.03,
    platformCommissionAmount: 13.5,
    deliveryFee: 0,
    totalAmount: 463.5,
    sellerProceeds: 450,

    paymentMethod: 'cod',
    paymentStatus: 'pending',
    codPaymentStatus: 'pending_collection',
    codCommissionStatus: 'pending',

    fulfillmentType: 'pickup',
    pickupLocation: 'Majayjay Central Plaza',
    isPerishableFood: false,

    customerNote: 'Para po sa kasuotan ng aking nanay.',

    status: 'pending',
    timeline: [
      {
        status: 'pending',
        timestamp: '2026-11-09T02:00:00Z',
        note: 'Bagong papasok na order mula kay Kuya Jayson. COD pinili.',
        actorName: 'Kuya Jayson Alcantara',
      },
    ],
    createdAt: '2026-11-09T02:00:00Z',
    updatedAt: '2026-11-09T02:00:00Z',
  },
  {
    id: 'ORD-2026-91550',
    customerId: 'user-nanay-lita',
    customerName: 'Nanay Lita (Lutong Bahay)',
    customerUsername: 'nanaylita',
    customerAvatarUrl: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    customerIsSenior: true,
    customerPhone: '0918-555-7721',

    sellerId: 'user-maria-santos',
    sellerName: 'Maria Santos',
    sellerUsername: 'mariasantos',
    sellerAvatarUrl: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    sellerIsSenior: false,

    productId: 'prod-embroidery-patch',
    productTitle: 'Handmade Laguna Sampaguita Embroidery Craft',
    productImage: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    productCategory: 'arts-crafts',

    unitPrice: 150,
    quantity: 4,
    priceUnit: 'piraso',
    subtotal: 600,
    platformCommissionRate: 0.03,
    platformCommissionAmount: 18,
    deliveryFee: 40,
    totalAmount: 658,
    sellerProceeds: 640,

    paymentMethod: 'online',
    paymentStatus: 'paid',
    onlinePaymentRef: 'PAY-ONLINE-99214',
    onlinePaymentGateway: 'GCash Marketplace Settlement',

    fulfillmentType: 'delivery',
    deliveryAddress: {
      city: 'Majayjay',
      province: 'Laguna',
      barangay: 'Brgy. San Roque',
      streetAddress: '12 Palengke Street',
    },
    isPerishableFood: false,

    sellerNote: 'Naihatid nang maayos at nakumpirma ang online payment.',

    status: 'completed',
    timeline: [
      {
        status: 'pending',
        timestamp: '2026-11-01T08:00:00Z',
        note: 'Order placed via Online Payment (GCash).',
        actorName: 'Nanay Lita',
      },
      {
        status: 'accepted',
        timestamp: '2026-11-01T08:30:00Z',
        note: 'Tinanggap ni Maria ang order.',
        actorName: 'Maria Santos',
      },
      {
        status: 'completed',
        timestamp: '2026-11-02T16:00:00Z',
        note: 'Natanggap ng mamimili. Pumasok na ang ₱640 sa verified seller balance ni Maria.',
        actorName: 'Maria Santos',
      },
    ],
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-02T16:00:00Z',
  },
];

// Initial Pre-Seeded Payout Accounts
export const INITIAL_PAYOUT_METHODS: SellerPayoutMethod[] = [
  {
    id: 'pm-maria-gcash',
    sellerId: 'user-maria-santos',
    channel: 'gcash',
    channelName: 'GCash Philippines',
    accountHolderName: 'Maria Santos',
    accountNumber: '09175550192',
    isDefault: true,
    createdAt: '2026-11-01T08:00:00Z',
  },
  {
    id: 'pm-maria-maya',
    sellerId: 'user-maria-santos',
    channel: 'maya',
    channelName: 'Maya Wallet',
    accountHolderName: 'Maria Santos',
    accountNumber: '09175550192',
    isDefault: false,
    createdAt: '2026-11-03T10:00:00Z',
  },
  {
    id: 'pm-lola-maribank',
    sellerId: 'user-lola-mercy',
    channel: 'maribank',
    channelName: 'MariBank Philippines',
    accountHolderName: 'Mercy D. Ramos',
    accountNumber: '109288345512',
    isDefault: true,
    createdAt: '2026-11-01T08:00:00Z',
  },
];

// Initial Pre-Seeded Sample Withdrawal Requests
export const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'WDR-2026-10023',
    sellerId: 'user-maria-santos',
    sellerName: 'Maria Santos',
    sellerUsername: 'mariasantos',
    amount: 200,
    fee: 10,
    netAmount: 190,
    netPayoutAmount: 190,
    payoutMethodId: 'pm-maria-gcash',
    payoutChannel: 'gcash',
    payoutChannelName: 'GCash Philippines',
    accountHolderName: 'Maria Santos',
    payoutAccountName: 'Maria Santos',
    maskedAccountNumber: '0917 •••• 0192',
    payoutAccountNumberMasked: '0917 •••• 0192',
    status: 'completed',
    submittedAt: '2026-11-02T10:00:00Z',
    approvedAt: '2026-11-03T14:20:00Z',
    processedAt: '2026-11-04T09:15:00Z',
    completedAt: '2026-11-04T11:30:00Z',
    transactionReference: 'GCASH-TX-9988231',
    adminName: 'Admin KayaNatinTo',
    adminNotes: 'Matagumpay na naipadala via GCash express send.',
    estimatedProcessingDays: '1 to 20 business days',
    createdAt: '2026-11-02T10:00:00Z',
    updatedAt: '2026-11-04T11:30:00Z',
    timeline: [
      { status: 'pending', timestamp: '2026-11-02T10:00:00Z', note: 'Withdrawal request submitted by Maria Santos.', actorName: 'Maria Santos' },
      { status: 'approved', timestamp: '2026-11-03T14:20:00Z', note: 'Naaprubahan ng Admin ang kahilingan.', actorName: 'Admin KayaNatinTo' },
      { status: 'processing', timestamp: '2026-11-04T09:15:00Z', note: 'Ipinapadala na ang pondo sa bangko / e-wallet.', actorName: 'Admin KayaNatinTo' },
      { status: 'completed', timestamp: '2026-11-04T11:30:00Z', note: 'Nailipat na ang ₱190.00 net payout. Ref: GCASH-TX-9988231.', actorName: 'Admin KayaNatinTo' },
    ],
  },
];

// Initial Pre-Seeded Sample Bookings for Realistic Testing
export const INITIAL_BOOKINGS: ServiceBooking[] = [
  {
    id: 'SRV-2026-44091',
    customerId: 'user-maria-santos',
    customerName: 'Maria Santos',
    customerUsername: 'mariasantos',
    customerAvatarUrl: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    customerIsSenior: false,
    customerPhone: '0917-555-0192',

    providerId: 'user-kuya-jayson',
    providerName: 'Kuya Jayson Alcantara',
    providerUsername: 'kuyajayson',
    providerAvatarUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
    providerIsSenior: false,

    serviceId: 'srv-carpentry-repair',
    serviceTitle: 'Traditional Carpentry & Wood Furniture Restoration',
    serviceCategory: 'home-repair',
    serviceImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',

    pricingType: 'project',
    rate: 650,
    rateUnit: 'bawat proyekto o gawaan',
    estimatedPriceDisplay: '₱650 / proyekto',

    arrangement: 'customer-location',
    serviceLocationAddress: '142 Rizal Street, Brgy. San Roque, Majayjay, Laguna',

    preferredDate: '2026-11-12',
    preferredTimeSlot: 'Umaga (8:00 AM - 12:00 PM)',

    customerRequirements: 'Paaayusin po sana ang lumang kahoy na cabinet ng aking lola na maluwag na ang bisagra at medyo umuugong ang pinto.',
    providerNote: 'Opo, nakareserba na po ang iskedyul. Dadalhin ko ang kinakailangang pait, turnilyo, at wood glue.',

    status: 'accepted',
    timeline: [
      {
        status: 'pending',
        timestamp: '2026-11-07T11:00:00Z',
        note: 'Customer submitted service booking request.',
        actorName: 'Maria Santos',
      },
      {
        status: 'accepted',
        timestamp: '2026-11-07T13:30:00Z',
        note: 'Tinanggap ni Kuya Jayson ang booking at kinumpirma ang oras.',
        actorName: 'Kuya Jayson Alcantara',
      },
    ],
    createdAt: '2026-11-07T11:00:00Z',
    updatedAt: '2026-11-07T13:30:00Z',
  },
  {
    id: 'SRV-2026-39102',
    customerId: 'user-maria-santos',
    customerName: 'Maria Santos',
    customerUsername: 'mariasantos',
    customerPhone: '0917-555-0192',

    providerId: 'user-nanay-lita',
    providerName: 'Lutong Bahay ni Aling Rosa',
    providerUsername: 'nanaylita',
    providerIsSenior: true,

    serviceId: 'srv-culinary-kakanin',
    serviceTitle: 'Traditional Native Kakanin & Fiesta Catering Prep',
    serviceCategory: 'culinary',
    serviceImage: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',

    pricingType: 'fixed',
    rate: 1200,
    rateUnit: 'bawat handaan',
    estimatedPriceDisplay: '₱1,200 fixed rate',

    arrangement: 'customer-location',
    serviceLocationAddress: 'Majayjay, Laguna',

    preferredDate: '2026-10-25',
    preferredTimeSlot: 'Maghapon (8:00 AM - 5:00 PM)',

    customerRequirements: 'Paghahanda ng biko at puto bumbong para sa kaarawan ng pamilya.',
    providerNote: 'Matagumpay na naihanda ang kakanin sa oras. Maraming salamat sa tiwala!',

    status: 'completed',
    timeline: [
      {
        status: 'pending',
        timestamp: '2026-10-20T10:00:00Z',
        note: 'Booking submitted.',
        actorName: 'Maria Santos',
      },
      {
        status: 'accepted',
        timestamp: '2026-10-20T11:15:00Z',
        note: 'Accepted by provider.',
        actorName: 'Lutong Bahay ni Aling Rosa',
      },
      {
        status: 'confirmed',
        timestamp: '2026-10-22T09:00:00Z',
        note: 'Schedule re-confirmed.',
        actorName: 'Lutong Bahay ni Aling Rosa',
      },
      {
        status: 'completed',
        timestamp: '2026-10-25T17:00:00Z',
        note: 'Natapos ang serbisyo nang maayos.',
        actorName: 'Lutong Bahay ni Aling Rosa',
      },
    ],
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-25T17:00:00Z',
  },
  {
    id: 'SRV-2026-92100',
    customerId: 'user-lola-mercy',
    customerName: 'Lola Mercy',
    customerUsername: 'lolamercy',
    customerIsSenior: true,
    customerPhone: '0919-555-4321',

    providerId: 'user-maria-santos',
    providerName: 'Maria Santos',
    providerUsername: 'mariasantos',
    providerIsSenior: false,

    serviceId: 'srv-maria-tailor',
    serviceTitle: 'Patahian at Pag-aayos ng Kasuotan (Alterations & Tailoring)',
    serviceCategory: 'tailoring',
    serviceImage: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',

    pricingType: 'negotiable',
    rate: 350,
    rateUnit: 'kasuotan',
    estimatedPriceDisplay: '₱350 / kasuotan (Negotiable)',

    arrangement: 'provider-location',
    serviceLocationAddress: 'Workshop ni Maria, Majayjay, Laguna',

    preferredDate: '2026-11-14',
    preferredTimeSlot: 'Hapon (1:00 PM - 5:00 PM)',

    customerRequirements: 'Magpapasukat po ng bestidang baro’t saya para sa darating na pista.',

    status: 'pending',
    timeline: [
      {
        status: 'pending',
        timestamp: '2026-11-09T03:00:00Z',
        note: 'Bagong booking request mula kay Lola Mercy.',
        actorName: 'Lola Mercy',
      },
    ],
    createdAt: '2026-11-09T03:00:00Z',
    updatedAt: '2026-11-09T03:00:00Z',
  },
];

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { products, updateProduct } = useProducts();
  const { services } = useServices();
  const { addNotification } = useNotifications();

  const [isLoading, setIsLoading] = useState(false);

  const [orders, setOrders] = useState<ProductOrder[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) {
        const parsed: ProductOrder[] = JSON.parse(saved);
        // Ensure Stage 8 fields exist on all historical orders
        return parsed.map((o) => {
          const subtotal = o.subtotal || o.unitPrice * o.quantity;
          const comm = o.platformCommissionAmount !== undefined ? o.platformCommissionAmount : Math.round(subtotal * 0.03 * 100) / 100;
          const deliveryFee = o.deliveryFee || 0;
          return {
            ...o,
            subtotal,
            platformCommissionRate: o.platformCommissionRate || 0.03,
            platformCommissionAmount: comm,
            sellerProceeds: o.sellerProceeds || (subtotal + deliveryFee),
            totalAmount: o.totalAmount || (subtotal + comm + deliveryFee),
            paymentMethod: o.paymentMethod || 'cod',
            paymentStatus: o.paymentStatus || (o.status === 'completed' ? 'paid' : 'pending'),
            codPaymentStatus: o.codPaymentStatus || (o.paymentMethod === 'cod' ? (o.status === 'completed' ? 'collected_by_seller' : 'pending_collection') : undefined),
            codCommissionStatus: o.codCommissionStatus || (o.paymentMethod === 'cod' ? (o.status === 'completed' ? 'remitted' : 'pending') : undefined),
          };
        });
      }
    } catch {}
    return INITIAL_ORDERS;
  });

  const [bookings, setBookings] = useState<ServiceBooking[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_BOOKINGS;
  });

  const [payoutMethods, setPayoutMethods] = useState<SellerPayoutMethod[]>(() => {
    try {
      const saved = localStorage.getItem(PAYOUT_METHODS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PAYOUT_METHODS;
  });

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => {
    try {
      const saved = localStorage.getItem(WITHDRAWALS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_WITHDRAWALS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    } catch {}
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem(PAYOUT_METHODS_STORAGE_KEY, JSON.stringify(payoutMethods));
    } catch {}
  }, [payoutMethods]);

  useEffect(() => {
    try {
      localStorage.setItem(WITHDRAWALS_STORAGE_KEY, JSON.stringify(withdrawals));
    } catch {}
  }, [withdrawals]);

  // Create Product Order
  const createProductOrder = async (
    input: CreateProductOrderInput
  ): Promise<{ success: boolean; order?: ProductOrder; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Kailangan munang mag-log in upang mag-order ng produkto.' };
    }

    const product = products.find((p) => p.id === input.productId);
    if (!product) {
      return { success: false, error: 'Hindi nahanap ang produkto.' };
    }

    if (!product.isAvailable) {
      return { success: false, error: 'Kasalukuyang hindi available ang produktong ito.' };
    }

    if (input.quantity <= 0) {
      return { success: false, error: 'Pumili ng wastong dami o quantity.' };
    }

    if (product.stock < input.quantity) {
      return {
        success: false,
        error: `Paumanhin, mayroon na lamang na ${product.stock} pirasong stock para sa ${product.title}.`,
      };
    }

    // Perishable food local delivery policy enforcement
    if (product.deliveryOptions?.isPerishableFood && input.fulfillmentType === 'delivery') {
      if (!input.deliveryAddress?.city) {
        return {
          success: false,
          error: 'Pakilagay ang inyong lungsod o bayan para sa lokal na delivery ng pagkain.',
        };
      }
    }

    const subtotal = product.price * input.quantity;
    const deliveryFee = input.fulfillmentType === 'delivery' ? (product.deliveryOptions?.deliveryFee || 0) : 0;
    
    // Stage 8: Buyer-Paid Platform Commission (3% of subtotal)
    const platformCommissionRate = 0.03;
    const platformCommissionAmount = Math.round(subtotal * platformCommissionRate * 100) / 100;
    const totalAmount = subtotal + platformCommissionAmount + deliveryFee;
    const sellerProceeds = subtotal + deliveryFee;

    const paymentMethod: PaymentMethod = input.paymentMethod || 'cod';
    const referenceId = `ORD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: ProductOrder = {
      id: referenceId,
      customerId: currentUser.id,
      customerName: currentUser.fullName,
      customerUsername: currentUser.username,
      customerAvatarUrl: currentUser.avatarUrl,
      customerIsSenior: currentUser.isSenior,
      customerPhone: input.customerPhone || currentUser.phone || 'N/A',
      customerEmail: currentUser.email,

      sellerId: product.sellerId,
      sellerName: product.sellerName,
      sellerUsername: product.sellerUsername,
      sellerAvatarUrl: product.sellerAvatarUrl,
      sellerIsSenior: product.sellerIsSenior,

      productId: product.id,
      productTitle: product.title,
      productImage: product.images[0] || '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
      productCategory: product.category,

      unitPrice: product.price,
      quantity: input.quantity,
      priceUnit: product.priceUnit,
      subtotal,
      platformCommissionRate,
      platformCommissionAmount,
      deliveryFee,
      totalAmount,
      sellerProceeds,

      paymentMethod,
      paymentStatus: 'pending',
      codPaymentStatus: paymentMethod === 'cod' ? 'pending_collection' : undefined,
      codCommissionStatus: paymentMethod === 'cod' ? 'pending' : undefined,
      onlinePaymentGateway: paymentMethod === 'online' ? 'Licensed Philippine Payment Gateway (GCash/Maya/QR Ph accreditation in progress / Soon)' : undefined,

      fulfillmentType: input.fulfillmentType,
      pickupLocation: input.fulfillmentType === 'pickup' ? (product.deliveryOptions?.pickupLocation || `${product.sellerLocation?.city || 'Laguna'} Pickup Point`) : undefined,
      deliveryAddress: input.fulfillmentType === 'delivery' ? input.deliveryAddress : undefined,
      isPerishableFood: !!product.deliveryOptions?.isPerishableFood,

      customerNote: input.customerNote?.trim() || undefined,

      status: 'pending',
      timeline: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: `Naisumite ang order para sa ${input.quantity} ${product.priceUnit || 'piraso'} gamit ang ${paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment'}. Subtotal: ₱${subtotal.toLocaleString()} + 3% Komisyon: ₱${platformCommissionAmount.toLocaleString()} (Ref: ${referenceId}).`,
          actorName: currentUser.fullName,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Deduct stock in ProductContext
    const newStock = Math.max(0, product.stock - input.quantity);
    await updateProduct(product.id, {
      stock: newStock,
      isAvailable: newStock > 0,
      isSoldOut: newStock === 0,
    });

    setOrders((prev) => [newOrder, ...prev]);

    // Send real-time notification to the seller
    addNotification({
      userId: product.sellerId,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorUsername: currentUser.username,
      actorAvatarUrl: currentUser.avatarUrl,
      actorIsSenior: currentUser.isSenior,
      type: 'order',
      title: 'Bagong Order sa KayaNatinTo!',
      message: `Nag-order si ${currentUser.fullName} ng ${input.quantity}x ${product.title} (${paymentMethod.toUpperCase()}, Kabuuang Bayarin: ₱${totalAmount.toLocaleString()}).`,
      targetId: newOrder.id,
      targetType: 'order',
    });

    return { success: true, order: newOrder };
  };

  // Update Product Order Status
  const updateOrderStatus = async (
    orderId: string,
    newStatus: ProductOrderStatus,
    note?: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Kailangan munang mag-log in.' };
    }

    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, error: 'Hindi nahanap ang order.' };
    }

    const isCustomer = currentUser.id === order.customerId || currentUser.username === order.customerUsername;
    const isSeller = currentUser.id === order.sellerId || currentUser.username === order.sellerUsername;

    if (!isCustomer && !isSeller) {
      return { success: false, error: 'Wala kayong pahintulot na baguhin ang order na ito.' };
    }

    // Validate cancellation constraints
    if (newStatus === 'cancelled') {
      if (isCustomer && order.status !== 'pending') {
        return {
          success: false,
          error: 'Hindi na maaaring kanselahin ang order kapag tinanggap o inihahanda na ng seller. Makipag-ugnayan sa seller sa pamamagitan ng inbox.',
        };
      }

      // If cancelled, restore product stock
      const product = products.find((p) => p.id === order.productId);
      if (product) {
        await updateProduct(product.id, {
          stock: product.stock + order.quantity,
          isAvailable: true,
          isSoldOut: false,
        });
      }
    }

    const updatedTimelineEntry = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || (newStatus === 'cancelled' ? `Nakansela: ${reason || 'Hiniling ng user'}` : undefined),
      actorName: currentUser.fullName,
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: newStatus,
          sellerNote: isSeller && note ? note : o.sellerNote,
          cancellationReason: newStatus === 'cancelled' ? reason || note : o.cancellationReason,
          cancelledBy: newStatus === 'cancelled' ? (isCustomer ? 'customer' : 'seller') : undefined,
          timeline: [...o.timeline, updatedTimelineEntry],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    // Notify the other party
    const recipientId = isSeller ? order.customerId : order.sellerId;
    const getStatusMessage = (st: ProductOrderStatus) => {
      switch (st) {
        case 'accepted':
          return `Tinanggap na ng seller ang inyong order #${order.id}.`;
        case 'preparing':
          return `Inihahanda na ng seller ang inyong order #${order.id}.`;
        case 'ready_or_out':
          return order.fulfillmentType === 'pickup'
            ? `Handa na para sa pickup ang inyong order #${order.id} sa ${order.pickupLocation}.`
            : `Ihahatid na ng seller ang inyong order #${order.id}.`;
        case 'completed':
          return `Matagumpay na natapos ang order #${order.id}. Maraming salamat!`;
        case 'cancelled':
          return `Nakansela ang order #${order.id}. Dahilan: ${reason || 'Napag-usapan'}.`;
        default:
          return `Na-update ang estado ng order #${order.id}.`;
      }
    };

    addNotification({
      userId: recipientId,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorUsername: currentUser.username,
      actorAvatarUrl: currentUser.avatarUrl,
      actorIsSenior: currentUser.isSenior,
      type: 'order',
      title: `Update sa Order #${order.id}`,
      message: getStatusMessage(newStatus),
      targetId: order.id,
      targetType: 'order',
    });

    return { success: true };
  };

  // Stage 8: Confirm COD Payment Received by Seller
  const confirmCodPaymentReceived = async (orderId: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Kailangan munang mag-log in.' };
    }

    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, error: 'Hindi nahanap ang order.' };
    }

    const isSeller = currentUser.id === order.sellerId || currentUser.username === order.sellerUsername;
    if (!isSeller) {
      return { success: false, error: 'Tanging ang nagtitindang nagbenta lamang ang maaaring magkumpirma ng bayad sa COD.' };
    }

    if (order.paymentMethod !== 'cod') {
      return { success: false, error: 'Hindi COD order ang transaksyong ito.' };
    }

    if (order.codPaymentStatus === 'collected_by_seller') {
      return { success: false, error: 'Nakumpirma na dati ang bayad para sa order na ito.' };
    }

    const timestamp = new Date().toISOString();
    const updatedTimelineEntry = {
      status: order.status,
      timestamp,
      note: `Kinumpirma ng seller (${currentUser.fullName}) na natanggap nang buo ang ₱${order.totalAmount.toLocaleString()} Cash on Delivery mula sa mamimili.`,
      actorName: currentUser.fullName,
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          paymentStatus: 'paid',
          codPaymentStatus: 'collected_by_seller',
          codPaymentConfirmedAt: timestamp,
          codPaymentConfirmedBy: currentUser.fullName,
          timeline: [...o.timeline, updatedTimelineEntry],
          updatedAt: timestamp,
        };
      })
    );

    // Notify buyer
    addNotification({
      userId: order.customerId,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorUsername: currentUser.username,
      actorAvatarUrl: currentUser.avatarUrl,
      actorIsSenior: currentUser.isSenior,
      type: 'order',
      title: `Kinumpirma ang Bayad sa COD (#${order.id})`,
      message: `Kinumpirma ni ${currentUser.fullName} ang inyong kabuuang bayad na ₱${order.totalAmount.toLocaleString()}. Maraming salamat sa pagtangkilik!`,
      targetId: order.id,
      targetType: 'order',
    });

    return { success: true };
  };

  // Stage 8: Record COD Platform Commission Remittance (Admin Reconciliation)
  const recordCodCommissionRemittance = async (
    orderId: string,
    settlementRef: string,
    note?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Kailangan munang mag-log in.' };
    }

    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, error: 'Hindi nahanap ang order.' };
    }

    const timestamp = new Date().toISOString();
    const updatedTimelineEntry = {
      status: order.status,
      timestamp,
      note: `Naitala ang remittance ng 3% platform commission (₱${order.platformCommissionAmount.toLocaleString()}) ng Admin. Ref: ${settlementRef}. ${note || ''}`,
      actorName: currentUser.fullName,
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          codCommissionStatus: 'remitted',
          codCommissionRemittedAt: timestamp,
          codCommissionRemittanceRef: settlementRef,
          timeline: [...o.timeline, updatedTimelineEntry],
          updatedAt: timestamp,
        };
      })
    );

    return { success: true };
  };

  // Create Service Booking
  const createServiceBooking = async (
    input: CreateServiceBookingInput
  ): Promise<{ success: boolean; booking?: ServiceBooking; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Kailangan munang mag-log in upang mag-book ng serbisyo.' };
    }

    const service = services.find((s) => s.id === input.serviceId);
    if (!service) {
      return { success: false, error: 'Hindi nahanap ang serbisyo.' };
    }

    if (!input.preferredDate) {
      return { success: false, error: 'Pumili ng nais na petsa para sa serbisyo.' };
    }

    if (!input.customerRequirements.trim()) {
      return { success: false, error: 'Pakilagay ang detalye o kailangan ninyong trabaho.' };
    }

    const formatPriceDisplay = () => {
      switch (service.pricingType) {
        case 'fixed':
          return `₱${service.rate.toLocaleString()} (Fixed Rate)`;
        case 'hourly':
          return `₱${service.rate.toLocaleString()} / oras`;
        case 'project':
          return `₱${service.rate.toLocaleString()} / proyekto`;
        case 'negotiable':
        default:
          return `₱${service.rate.toLocaleString()} (Puwede Pag-usapan)`;
      }
    };

    const referenceId = `SRV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newBooking: ServiceBooking = {
      id: referenceId,
      customerId: currentUser.id,
      customerName: currentUser.fullName,
      customerUsername: currentUser.username,
      customerAvatarUrl: currentUser.avatarUrl,
      customerIsSenior: currentUser.isSenior,
      customerPhone: input.customerPhone || currentUser.phone || 'N/A',
      customerEmail: currentUser.email,

      providerId: service.providerId,
      providerName: service.providerName,
      providerUsername: service.providerUsername,
      providerAvatarUrl: service.providerAvatarUrl,
      providerIsSenior: service.providerIsSenior,

      serviceId: service.id,
      serviceTitle: service.title,
      serviceCategory: service.category,
      serviceImage: service.portfolioImages?.[0] || service.providerAvatarUrl || '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',

      pricingType: service.pricingType,
      rate: service.rate,
      rateUnit: service.rateUnit,
      estimatedPriceDisplay: formatPriceDisplay(),

      arrangement: input.arrangement,
      serviceLocationAddress: input.serviceLocationAddress?.trim() || undefined,

      preferredDate: input.preferredDate,
      preferredTimeSlot: input.preferredTimeSlot || 'Umaga (8:00 AM - 12:00 PM)',

      customerRequirements: input.customerRequirements.trim(),

      status: 'pending',
      timeline: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: `Naisumite ang booking request para sa petsang ${input.preferredDate} (${referenceId}).`,
          actorName: currentUser.fullName,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Send real-time notification to the service provider
    addNotification({
      userId: service.providerId,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorUsername: currentUser.username,
      actorAvatarUrl: currentUser.avatarUrl,
      actorIsSenior: currentUser.isSenior,
      type: 'booking',
      title: 'Bagong Kahilingan sa Serbisyo (Booking)!',
      message: `Humingi si ${currentUser.fullName} ng iskedyul para sa "${service.title}" sa ${input.preferredDate}.`,
      targetId: newBooking.id,
      targetType: 'booking',
    });

    return { success: true, booking: newBooking };
  };

  // Update Service Booking Status
  const updateBookingStatus = async (
    bookingId: string,
    newStatus: ServiceBookingStatus,
    options?: { note?: string; proposedDate?: string; proposedTimeSlot?: string; reason?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Kailangan munang mag-log in.' };
    }

    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
      return { success: false, error: 'Hindi nahanap ang booking.' };
    }

    const isCustomer = currentUser.id === booking.customerId || currentUser.username === booking.customerUsername;
    const isProvider = currentUser.id === booking.providerId || currentUser.username === booking.providerUsername;

    if (!isCustomer && !isProvider) {
      return { success: false, error: 'Wala kayong pahintulot na baguhin ang booking na ito.' };
    }

    let timelineNote = options?.note;
    if (newStatus === 'schedule_proposed') {
      timelineNote = `Nag-propose ng bagong petsa: ${options?.proposedDate || 'Petsa'} (${options?.proposedTimeSlot || 'Oras'}). ${options?.note || ''}`;
    } else if (newStatus === 'confirmed') {
      timelineNote = options?.note || 'Kumpirmado na ang iskedyul ng serbisyo.';
    } else if (newStatus === 'cancelled') {
      timelineNote = `Nakansela ang serbisyo: ${options?.reason || options?.note || 'Napagkasunduan'}.`;
    }

    const updatedTimelineEntry = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: timelineNote,
      actorName: currentUser.fullName,
    };

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        return {
          ...b,
          status: newStatus,
          proposedDate: options?.proposedDate || b.proposedDate,
          proposedTimeSlot: options?.proposedTimeSlot || b.proposedTimeSlot,
          providerNote: isProvider && options?.note ? options.note : b.providerNote,
          cancellationReason: newStatus === 'cancelled' ? options?.reason || options?.note : b.cancellationReason,
          cancelledBy: newStatus === 'cancelled' ? (isCustomer ? 'customer' : 'provider') : undefined,
          timeline: [...b.timeline, updatedTimelineEntry],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    // Notify the other party
    const recipientId = isProvider ? booking.customerId : booking.providerId;
    const getStatusMessage = (st: ServiceBookingStatus) => {
      switch (st) {
        case 'accepted':
          return `Tinanggap ni ${booking.providerName} ang inyong booking para sa "${booking.serviceTitle}".`;
        case 'schedule_proposed':
          return `Nag-alok si ${booking.providerName} ng bagong petsa para sa "${booking.serviceTitle}": ${options?.proposedDate} (${options?.proposedTimeSlot}).`;
        case 'confirmed':
          return `Kumpirmado na ang inyong appointment para sa "${booking.serviceTitle}".`;
        case 'in_progress':
          return `Kasalukuyang isinasagawa na ang inyong serbisyong "${booking.serviceTitle}".`;
        case 'completed':
          return `Matagumpay na natapos ang serbisyong "${booking.serviceTitle}".`;
        case 'cancelled':
          return `Nakansela ang serbisyong "${booking.serviceTitle}". Dahilan: ${options?.reason || 'Napag-usapan'}.`;
        default:
          return `May bagong update sa inyong booking para sa "${booking.serviceTitle}".`;
      }
    };

    addNotification({
      userId: recipientId,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorUsername: currentUser.username,
      actorAvatarUrl: currentUser.avatarUrl,
      actorIsSenior: currentUser.isSenior,
      type: 'booking',
      title: `Update sa Booking #${booking.id}`,
      message: getStatusMessage(newStatus),
      targetId: booking.id,
      targetType: 'booking',
    });

    return { success: true };
  };

  const getOrderById = (orderId: string): ProductOrder | undefined => {
    return orders.find((o) => o.id === orderId);
  };

  const getBookingById = (bookingId: string): ServiceBooking | undefined => {
    return bookings.find((b) => b.id === bookingId);
  };

  const getCustomerOrders = (customerId: string): ProductOrder[] => {
    return orders.filter(
      (o) => o.customerId === customerId || (currentUser && o.customerUsername.toLowerCase() === currentUser.username.toLowerCase())
    );
  };

  const getSellerOrders = (sellerId: string, sellerUsername?: string): ProductOrder[] => {
    const cleanId = sellerId.toLowerCase();
    const cleanUser = sellerUsername ? sellerUsername.toLowerCase() : '';
    return orders.filter(
      (o) =>
        o.sellerId.toLowerCase() === cleanId ||
        (cleanUser && o.sellerUsername.toLowerCase() === cleanUser)
    );
  };

  const getCustomerBookings = (customerId: string): ServiceBooking[] => {
    return bookings.filter(
      (b) => b.customerId === customerId || (currentUser && b.customerUsername.toLowerCase() === currentUser.username.toLowerCase())
    );
  };

  const getProviderBookings = (providerId: string, providerUsername?: string): ServiceBooking[] => {
    const cleanId = providerId.toLowerCase();
    const cleanUser = providerUsername ? providerUsername.toLowerCase() : '';
    return bookings.filter(
      (b) =>
        b.providerId.toLowerCase() === cleanId ||
        (cleanUser && b.providerUsername.toLowerCase() === cleanUser)
    );
  };

  // ==========================================
  // STAGE 8: SELLER WALLET & WITHDRAWAL SYSTEM
  // ==========================================

  // Secure Ledger-based Wallet Summary Calculator
  const getSellerWalletSummary = (sellerId: string, sellerUsername?: string): SellerWalletSummary => {
    const cleanId = (sellerId || '').toLowerCase();
    const cleanUser = (sellerUsername || '').toLowerCase();

    // 1. Completed orders with confirmed payment
    const completedOrders = orders.filter((o) => {
      const matchSeller = o.sellerId.toLowerCase() === cleanId || (cleanUser && o.sellerUsername.toLowerCase() === cleanUser);
      if (!matchSeller) return false;
      const isCompleted = o.status === 'completed';
      const isPaid = o.paymentStatus === 'paid' || o.codPaymentStatus === 'collected_by_seller';
      return isCompleted && isPaid;
    });

    // 2. In-progress / Pending collection orders
    const inProgressOrders = orders.filter((o) => {
      const matchSeller = o.sellerId.toLowerCase() === cleanId || (cleanUser && o.sellerUsername.toLowerCase() === cleanUser);
      if (!matchSeller) return false;
      return o.status !== 'completed' && o.status !== 'cancelled';
    });

    // 3. Seller withdrawals
    const myWithdrawals = withdrawals.filter(
      (w) => w.sellerId.toLowerCase() === cleanId || (cleanUser && w.sellerUsername.toLowerCase() === cleanUser)
    );

    const completedWithdrawals = myWithdrawals.filter((w) => w.status === 'completed');
    const activeWithdrawals = myWithdrawals.filter((w) =>
      ['pending', 'under_review', 'approved', 'processing'].includes(w.status)
    );

    const totalSales = completedOrders.reduce((acc, o) => acc + (o.sellerProceeds || (o.subtotal + (o.deliveryFee || 0))), 0);
    const pendingBalance = inProgressOrders.reduce((acc, o) => acc + (o.sellerProceeds || (o.subtotal + (o.deliveryFee || 0))), 0);

    const withdrawnBalance = completedWithdrawals.reduce((acc, w) => acc + w.amount, 0);
    const pendingWithdrawalsAmount = activeWithdrawals.reduce((acc, w) => acc + w.amount, 0);
    const completedFees = completedWithdrawals.reduce((acc, w) => acc + w.fee, 0);
    const pendingFees = activeWithdrawals.reduce((acc, w) => acc + w.fee, 0);
    const totalWithdrawalFees = completedFees + pendingFees;

    // Available balance is strictly ledger derived: Total Verified Earnings minus (Withdrawn + Active Reserved Withdrawals)
    const availableBalance = Math.max(0, Math.round((totalSales - withdrawnBalance - pendingWithdrawalsAmount) * 100) / 100);

    // Outstanding COD Commission owed to KayaNatinTo (collected from buyer by seller, pending remittance)
    const unremittedCodCommission = orders
      .filter((o) => {
        const matchSeller = o.sellerId.toLowerCase() === cleanId || (cleanUser && o.sellerUsername.toLowerCase() === cleanUser);
        return (
          matchSeller &&
          o.paymentMethod === 'cod' &&
          o.codPaymentStatus === 'collected_by_seller' &&
          o.codCommissionStatus !== 'remitted'
        );
      })
      .reduce((acc, o) => acc + (o.platformCommissionAmount || 0), 0);

    return {
      totalSales: Math.round(totalSales * 100) / 100,
      pendingBalance: Math.round(pendingBalance * 100) / 100,
      availableBalance,
      withdrawnBalance: Math.round(withdrawnBalance * 100) / 100,
      pendingWithdrawalsAmount: Math.round(pendingWithdrawalsAmount * 100) / 100,
      pendingWithdrawals: Math.round(pendingWithdrawalsAmount * 100) / 100,
      totalWithdrawalFeesPaid: Math.round(totalWithdrawalFees * 100) / 100,
      totalWithdrawalFees: Math.round(totalWithdrawalFees * 100) / 100,
      unremittedCodCommission: Math.round(unremittedCodCommission * 100) / 100,
      minWithdrawalAmount: 50,
      fixedWithdrawalFee: 10,
      payoutTurnaroundPolicy: '1 hanggang 20 BUSINESS DAYS manual payout window ng KayaNatinTo via Philippine banks at e-wallets.',
    };
  };

  const getSellerWithdrawals = (sellerId: string): WithdrawalRequest[] => {
    const cleanId = (sellerId || '').toLowerCase();
    return withdrawals.filter(
      (w) => w.sellerId.toLowerCase() === cleanId || (currentUser && w.sellerUsername.toLowerCase() === currentUser.username.toLowerCase())
    );
  };

  // Create Manual Withdrawal Request
  const createWithdrawalRequest = async (
    amount: number,
    payoutMethodId: string
  ): Promise<{ success: boolean; withdrawal?: WithdrawalRequest; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Kailangan munang mag-log in.' };
    }

    if (amount < 50) {
      return { success: false, error: 'Ang pinakamababang halaga ng withdrawal ay ₱50.00.' };
    }

    const summary = getSellerWalletSummary(currentUser.id, currentUser.username);
    if (amount > summary.availableBalance) {
      return {
        success: false,
        error: `Kulang ang inyong Available Balance (₱${summary.availableBalance.toLocaleString()}) para sa kahilingang ₱${amount.toLocaleString()}.`,
      };
    }

    const method = payoutMethods.find((p) => p.id === payoutMethodId);
    if (!method) {
      return { success: false, error: 'Pumili ng wastong payout account o e-wallet.' };
    }

    // Mask account number for security: e.g. 0917 •••• 0192
    const rawNum = method.accountNumber.replace(/\D/g, '');
    const maskedNumber =
      rawNum.length >= 6
        ? `${rawNum.slice(0, 4)} •••• ${rawNum.slice(-4)}`
        : method.accountNumber;

    const fee = 10;
    const netPayoutAmount = Math.max(0, amount - fee);
    const referenceId = `WDR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const timestamp = new Date().toISOString();

    const newWithdrawal: WithdrawalRequest = {
      id: referenceId,
      sellerId: currentUser.id,
      sellerName: currentUser.fullName,
      sellerUsername: currentUser.username,
      amount,
      fee,
      netAmount: netPayoutAmount,
      netPayoutAmount,
      payoutMethodId: method.id,
      payoutChannel: method.channel,
      payoutChannelName: method.channelName,
      accountHolderName: method.accountHolderName,
      payoutAccountName: method.accountHolderName,
      maskedAccountNumber: maskedNumber,
      payoutAccountNumberMasked: maskedNumber,
      status: 'pending',
      submittedAt: timestamp,
      estimatedProcessingDays: '1 to 20 business days',
      createdAt: timestamp,
      updatedAt: timestamp,
      timeline: [
        {
          status: 'pending',
          timestamp,
          note: `Naisumite ang kahilingan para sa ₱${amount.toLocaleString()} (Net Payout: ₱${netPayoutAmount.toLocaleString()} pagkabawas ng ₱10 fixed fee) patungo sa ${method.channelName}. Manual processing sa loob ng 1-20 business days.`,
          actorName: currentUser.fullName,
        },
      ],
    };

    setWithdrawals((prev) => [newWithdrawal, ...prev]);

    // Send notification to user
    addNotification({
      userId: currentUser.id,
      actorId: currentUser.id,
      actorName: 'KayaNatinTo Finance',
      actorUsername: 'finance',
      actorAvatarUrl: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
      actorIsSenior: false,
      type: 'order',
      title: `Naisumite ang Withdrawal Request #${referenceId}`,
      message: `Natanggap ang inyong kahilingan na ₱${amount.toLocaleString()} papunta sa ${method.channelName}. Ipo-proseso ito sa loob ng 1 hanggang 20 business days.`,
      targetId: referenceId,
      targetType: 'order',
    });

    return { success: true, withdrawal: newWithdrawal };
  };

  // Update Withdrawal Status (Admin Workflow: approve, process, complete with transfer ref, or reject with reason)
  const updateWithdrawalStatus = async (
    withdrawalId: string,
    newStatus: WithdrawalStatus,
    options?: { rejectionReason?: string; adminNotes?: string; transactionReference?: string; adminName?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Kailangan munang mag-log in.' };
    }

    const item = withdrawals.find((w) => w.id === withdrawalId);
    if (!item) {
      return { success: false, error: 'Hindi nahanap ang withdrawal request.' };
    }

    const timestamp = new Date().toISOString();
    let note = options?.adminNotes;
    if (newStatus === 'under_review') {
      note = note || 'Kasalukuyang sinusuri ng KayaNatinTo Finance team ang account details.';
    } else if (newStatus === 'approved') {
      note = note || 'Naaprubahan ang payout request. Nakapila na para sa disbursement.';
    } else if (newStatus === 'processing') {
      note = note || 'Ipinapadala na ang pondo sa napiling e-wallet / bangko.';
    } else if (newStatus === 'completed') {
      note = note || `Matagumpay na nailipat ang ₱${(item.netAmount || item.amount - item.fee).toLocaleString()} net payout. Reference: ${options?.transactionReference || 'REF-N/A'}.`;
    } else if (newStatus === 'rejected') {
      note = note || `Tinanggihan ang kahilingan: ${options?.rejectionReason || 'Hindi tumugma ang detalye ng account'}. Naibalik ang pondo sa Available Balance.`;
    }

    const updatedTimelineEntry: TransactionTimelineEntry<WithdrawalStatus> = {
      status: newStatus,
      timestamp,
      note,
      actorName: options?.adminName || currentUser.fullName,
    };

    setWithdrawals((prev) =>
      prev.map((w) => {
        if (w.id !== withdrawalId) return w;
        return {
          ...w,
          status: newStatus,
          approvedAt: newStatus === 'approved' ? timestamp : w.approvedAt,
          processedAt: newStatus === 'processing' ? timestamp : w.processedAt,
          completedAt: newStatus === 'completed' ? timestamp : w.completedAt,
          rejectedAt: newStatus === 'rejected' ? timestamp : w.rejectedAt,
          transactionReference: options?.transactionReference || w.transactionReference,
          rejectionReason: options?.rejectionReason || w.rejectionReason,
          adminNotes: options?.adminNotes || w.adminNotes,
          adminName: options?.adminName || currentUser.fullName,
          timeline: [...w.timeline, updatedTimelineEntry],
        };
      })
    );

    // Notify seller
    const getNotificationTitle = () => {
      switch (newStatus) {
        case 'approved':
          return `Naaprubahan ang Withdrawal #${item.id}`;
        case 'processing':
          return `Ipinapadala na ang Payout #${item.id}`;
        case 'completed':
          return `Nailipat na ang Iyong Payout (#${item.id})!`;
        case 'rejected':
          return `Update sa Withdrawal Request #${item.id}`;
        default:
          return `Update sa Withdrawal #${item.id}`;
      }
    };

    addNotification({
      userId: item.sellerId,
      actorId: currentUser.id,
      actorName: 'KayaNatinTo Finance',
      actorUsername: 'finance',
      actorAvatarUrl: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
      actorIsSenior: false,
      type: 'order',
      title: getNotificationTitle(),
      message: note || `Binago ang estado ng inyong withdrawal patungong ${newStatus}.`,
      targetId: item.id,
      targetType: 'order',
    });

    return { success: true };
  };

  // Manage Payout Accounts
  const getSellerPayoutMethods = (sellerId: string): SellerPayoutMethod[] => {
    const cleanId = (sellerId || '').toLowerCase();
    return payoutMethods.filter(
      (p) => p.sellerId.toLowerCase() === cleanId || (currentUser && p.sellerId === currentUser.id)
    );
  };

  const addPayoutMethod = async (input: {
    channel: PayoutChannel;
    channelName: string;
    accountHolderName: string;
    accountNumber: string;
    isDefault?: boolean;
  }): Promise<{ success: boolean; payoutMethod?: SellerPayoutMethod; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Kailangan munang mag-log in.' };
    }

    if (!input.accountHolderName.trim()) {
      return { success: false, error: 'Ilagay ang buong pangalan ng account holder.' };
    }

    if (!input.accountNumber.trim()) {
      return { success: false, error: 'Ilagay ang numero ng account o mobile number.' };
    }

    const isFirstMethod = payoutMethods.filter((p) => p.sellerId === currentUser.id).length === 0;
    const shouldBeDefault = input.isDefault || isFirstMethod;

    const newMethod: SellerPayoutMethod = {
      id: `pm-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      sellerId: currentUser.id,
      channel: input.channel,
      channelName: input.channelName,
      accountHolderName: input.accountHolderName.trim(),
      accountNumber: input.accountNumber.trim(),
      isDefault: shouldBeDefault,
      createdAt: new Date().toISOString(),
    };

    setPayoutMethods((prev) => {
      let updated = prev;
      if (shouldBeDefault) {
        updated = updated.map((m) => (m.sellerId === currentUser.id ? { ...m, isDefault: false } : m));
      }
      return [...updated, newMethod];
    });

    return { success: true, payoutMethod: newMethod };
  };

  const deletePayoutMethod = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Kailangan munang mag-log in.' };
    }

    setPayoutMethods((prev) => prev.filter((p) => p.id !== id));
    return { success: true };
  };

  const setDefaultPayoutMethod = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Kailangan munang mag-log in.' };
    }

    setPayoutMethods((prev) =>
      prev.map((p) => {
        if (p.sellerId !== currentUser.id) return p;
        return { ...p, isDefault: p.id === id };
      })
    );
    return { success: true };
  };

  // Badge Counters for Active / Pending action
  const currentId = currentUser ? currentUser.id : 'user-maria-santos';
  const currentUsername = currentUser ? currentUser.username : 'mariasantos';

  const pendingSellerOrdersCount = useMemo(() => {
    return orders.filter(
      (o) =>
        (o.sellerId === currentId || o.sellerUsername.toLowerCase() === currentUsername.toLowerCase()) &&
        (o.status === 'pending' || o.status === 'accepted' || o.status === 'preparing')
    ).length;
  }, [orders, currentId, currentUsername]);

  const pendingProviderBookingsCount = useMemo(() => {
    return bookings.filter(
      (b) =>
        (b.providerId === currentId || b.providerUsername.toLowerCase() === currentUsername.toLowerCase()) &&
        (b.status === 'pending' || b.status === 'schedule_proposed' || b.status === 'confirmed')
    ).length;
  }, [bookings, currentId, currentUsername]);

  const pendingCustomerOrdersCount = useMemo(() => {
    return orders.filter(
      (o) =>
        (o.customerId === currentId || o.customerUsername.toLowerCase() === currentUsername.toLowerCase()) &&
        (o.status === 'pending' || o.status === 'accepted' || o.status === 'preparing' || o.status === 'ready_or_out')
    ).length;
  }, [orders, currentId, currentUsername]);

  const pendingCustomerBookingsCount = useMemo(() => {
    return bookings.filter(
      (b) =>
        (b.customerId === currentId || b.customerUsername.toLowerCase() === currentUsername.toLowerCase()) &&
        (b.status === 'pending' || b.status === 'schedule_proposed' || b.status === 'confirmed' || b.status === 'in_progress')
    ).length;
  }, [bookings, currentId, currentUsername]);

  // Stage 8 Admin & Finance Counters
  const pendingWithdrawalsCount = useMemo(() => {
    return withdrawals.filter((w) => ['pending', 'under_review', 'processing'].includes(w.status)).length;
  }, [withdrawals]);

  const outstandingCodCommissionsCount = useMemo(() => {
    return orders.filter(
      (o) => o.paymentMethod === 'cod' && o.codPaymentStatus === 'collected_by_seller' && o.codCommissionStatus === 'pending'
    ).length;
  }, [orders]);

  return (
    <TransactionContext.Provider
      value={{
        orders,
        bookings,
        withdrawals,
        payoutMethods,
        isLoading,
        createProductOrder,
        updateOrderStatus,
        confirmCodPaymentReceived,
        recordCodCommissionRemittance,
        createServiceBooking,
        updateBookingStatus,
        getOrderById,
        getBookingById,
        getCustomerOrders,
        getSellerOrders,
        getCustomerBookings,
        getProviderBookings,
        getSellerWalletSummary,
        getSellerWithdrawals,
        createWithdrawalRequest,
        updateWithdrawalStatus,
        getSellerPayoutMethods,
        addPayoutMethod,
        deletePayoutMethod,
        setDefaultPayoutMethod,
        pendingSellerOrdersCount,
        pendingProviderBookingsCount,
        pendingCustomerOrdersCount,
        pendingCustomerBookingsCount,
        pendingWithdrawalsCount,
        outstandingCodCommissionsCount,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
