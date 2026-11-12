export type ProductOrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready_or_out'
  | 'completed'
  | 'cancelled';

export type ServiceBookingStatus =
  | 'pending'
  | 'accepted'
  | 'schedule_proposed'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'cod' | 'online';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type CodPaymentStatus =
  | 'pending_collection'
  | 'collected_by_seller'
  | 'remitted';

export type CodCommissionStatus = 'pending' | 'outstanding' | 'remitted' | 'waived';

export interface TransactionTimelineEntry<TStatus extends string = string> {
  status: TStatus;
  timestamp: string;
  note?: string;
  actorName?: string;
}

export interface DeliveryAddress {
  city: string;
  province: string;
  barangay: string;
  streetAddress: string;
  landmark?: string;
}

export interface ProductOrder {
  id: string; // e.g. 'ORD-2026-88124'
  customerId: string;
  customerName: string;
  customerUsername: string;
  customerAvatarUrl?: string;
  customerIsSenior?: boolean;
  customerPhone: string;
  customerEmail?: string;

  sellerId: string;
  sellerName: string;
  sellerUsername: string;
  sellerAvatarUrl?: string;
  sellerIsSenior?: boolean;

  productId: string;
  productTitle: string;
  productImage: string;
  productCategory: string;

  unitPrice: number;
  quantity: number;
  priceUnit?: string;
  subtotal: number;

  // Stage 8: Buyer-Paid Platform Commission (3% of subtotal)
  platformCommissionRate: number; // 0.03
  platformCommissionAmount: number; // 3% of subtotal
  deliveryFee: number;
  totalAmount: number; // subtotal + platformCommissionAmount + deliveryFee
  sellerProceeds: number; // subtotal + deliveryFee (seller does NOT have 3% deducted)

  // Stage 8: Payment Methods & Reconciliation
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;

  // Cash on Delivery Tracking
  codPaymentStatus?: CodPaymentStatus;
  isCodPaymentConfirmedBySeller?: boolean;
  codPaymentConfirmedAt?: string;
  codCommissionStatus?: CodCommissionStatus;
  codPaymentConfirmedBy?: string;
  codCommissionRemittedAt?: string;
  codCommissionSettlementRef?: string;
  codCommissionRemittanceRef?: string;
  onlinePaymentRef?: string;
  onlinePaymentGateway?: string;

  // Online Payment Settlement Details (Integration Ready)
  onlinePaymentDetails?: {
    provider: string; // e.g. 'GCash / Maya (Philippine Payment Gateway)'
    transactionRef: string;
    paidAt?: string;
    processingFee: number;
    settlementStatus: 'integration_pending' | 'direct_settled' | 'wallet_credited';
  };

  fulfillmentType: 'pickup' | 'delivery';
  pickupLocation?: string;
  deliveryAddress?: DeliveryAddress;
  isPerishableFood: boolean;

  customerNote?: string;
  sellerNote?: string;

  status: ProductOrderStatus;
  cancellationReason?: string;
  cancelledBy?: 'customer' | 'seller';

  timeline: TransactionTimelineEntry<ProductOrderStatus>[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceBooking {
  id: string; // e.g. 'SRV-2026-44091'
  customerId: string;
  customerName: string;
  customerUsername: string;
  customerAvatarUrl?: string;
  customerIsSenior?: boolean;
  customerPhone: string;
  customerEmail?: string;

  providerId: string;
  providerName: string;
  providerUsername: string;
  providerAvatarUrl?: string;
  providerIsSenior?: boolean;

  serviceId: string;
  serviceTitle: string;
  serviceCategory: string;
  serviceImage: string;

  pricingType: 'hourly' | 'fixed' | 'project' | 'negotiable';
  rate: number;
  rateUnit?: string;
  estimatedPriceDisplay: string;

  arrangement: 'customer-location' | 'provider-location' | 'online' | 'flexible';
  serviceLocationAddress?: string;

  preferredDate: string; // YYYY-MM-DD
  preferredTimeSlot: string; // e.g. 'Umaga (8:00 AM - 12:00 PM)'

  proposedDate?: string;
  proposedTimeSlot?: string;

  customerRequirements: string;
  providerNote?: string;

  status: ServiceBookingStatus;
  cancellationReason?: string;
  cancelledBy?: 'customer' | 'provider';

  timeline: TransactionTimelineEntry<ServiceBookingStatus>[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductOrderInput {
  productId: string;
  quantity: number;
  fulfillmentType: 'pickup' | 'delivery';
  deliveryAddress?: DeliveryAddress;
  customerPhone: string;
  customerNote?: string;
  paymentMethod?: PaymentMethod;
  onlinePaymentRef?: string;
  onlinePaymentProofUrl?: string;
}

export interface CreateServiceBookingInput {
  serviceId: string;
  preferredDate: string;
  preferredTimeSlot: string;
  arrangement: 'customer-location' | 'provider-location' | 'online' | 'flexible';
  serviceLocationAddress?: string;
  customerRequirements: string;
  customerPhone: string;
}

// Stage 8: Payout Channels & Accounts
export type PayoutChannel =
  | 'gcash'
  | 'maya'
  | 'maribank'
  | 'bdo'
  | 'bpi'
  | 'unionbank'
  | 'seabank'
  | 'gotyme'
  | 'landbank'
  | 'rcbc'
  | 'metrobank'
  | 'other_bank'
  | 'other';

export interface SellerPayoutMethod {
  id: string;
  sellerId: string;
  channel: PayoutChannel;
  channelName: string;
  accountHolderName: string;
  accountNumber: string;
  maskedAccountNumber?: string;
  isDefault: boolean;
  isVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Stage 8: Withdrawal Statuses & Request
export type WithdrawalStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'rejected'
  | 'failed';

export interface WithdrawalRequest {
  id: string; // e.g. 'WDR-2026-10492'
  sellerId: string;
  sellerName: string;
  sellerUsername: string;
  sellerAvatarUrl?: string;

  amount: number; // Min ₱50
  fee: number; // ₱10 fixed
  netAmount: number; // amount - fee
  netPayoutAmount?: number;

  payoutMethodId: string;
  payoutChannel: PayoutChannel;
  payoutChannelName: string;
  accountHolderName: string;
  payoutAccountName?: string;
  maskedAccountNumber: string;
  payoutAccountNumberMasked?: string;
  fullAccountNumber?: string; // Accessible to authorized admin for transfer

  status: WithdrawalStatus;
  rejectionReason?: string;
  adminNotes?: string;
  transactionReference?: string; // Bank/e-wallet transfer ref (e.g. 'GCASH-98234821')
  processedAt?: string;
  approvedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  submittedAt?: string;
  processedByAdminName?: string;
  adminName?: string;
  estimatedProcessingDays: string; // '1 to 20 business days'

  createdAt: string;
  updatedAt: string;
  timeline: TransactionTimelineEntry<WithdrawalStatus>[];
}

// Stage 8: Secure Transaction Ledger & Balance Summaries
export interface WalletLedgerEntry {
  id: string;
  sellerId: string;
  type:
    | 'order_earning'
    | 'withdrawal_reserved'
    | 'withdrawal_completed'
    | 'withdrawal_fee'
    | 'withdrawal_refunded'
    | 'admin_adjustment';
  amount: number;
  referenceId: string; // ORD-xxx or WDR-xxx
  description: string;
  createdAt: string;
}

export interface SellerWalletSummary {
  totalSales: number;
  pendingBalance: number; // Uncompleted orders or unconfirmed COD
  availableBalance: number; // Verified completed earnings eligible for withdrawal
  withdrawnBalance: number; // Successfully paid out
  pendingWithdrawalsAmount: number; // Reserved in active withdrawal requests
  pendingWithdrawals?: number;
  unremittedCodCommission?: number;
  totalWithdrawalFeesPaid: number; // Total ₱10 fees from completed withdrawals
  totalWithdrawalFees?: number;
  minWithdrawalAmount?: number;
  fixedWithdrawalFee?: number;
  payoutTurnaroundPolicy?: string;
}
