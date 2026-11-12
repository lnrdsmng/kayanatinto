import React, { useState, useMemo } from 'react';
import {
  Wallet,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Gift,
  ShoppingBag,
  Briefcase,
  Hourglass,
  Radio,
  Tag,
  Calendar,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { useReels } from '../context/ReelsContext';
import { WithdrawEarningsModal } from './WithdrawEarningsModal';
import { ManagePayoutMethodsModal } from './ManagePayoutMethodsModal';

interface SellerWalletDashboardProps {
  onOpenAdminPortal?: () => void;
  onOpenKycModal?: () => void;
}

type TxSourceFilter = 'all' | 'products' | 'services' | 'reels_gifts' | 'withdrawals';

export const SellerWalletDashboard: React.FC<SellerWalletDashboardProps> = ({
  onOpenAdminPortal,
  onOpenKycModal,
}) => {
  const { currentUser } = useAuth();
  const { getSellerWalletSummary, getSellerWithdrawals, orders, bookings } = useTransactions();
  const { getCreatorGiftEarningsSummary, getCreatorGifts } = useReels();

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isManagePayoutOpen, setIsManagePayoutOpen] = useState(false);
  const [txFilter, setTxFilter] = useState<TxSourceFilter>('all');

  if (!currentUser) return null;

  const wallet = getSellerWalletSummary(currentUser.id, currentUser.username);
  const withdrawals = getSellerWithdrawals(currentUser.id);
  const giftEarnings = getCreatorGiftEarningsSummary(currentUser.username);
  const creatorGifts = getCreatorGifts(currentUser.username);

  // Filter user's product orders and service bookings
  const sellerOrders = useMemo(() => {
    const cleanId = currentUser.id.toLowerCase();
    const cleanUser = currentUser.username.toLowerCase();
    return orders.filter(
      (o) => o.sellerId.toLowerCase() === cleanId || o.sellerUsername.toLowerCase() === cleanUser
    );
  }, [orders, currentUser]);

  const providerBookings = useMemo(() => {
    const cleanId = currentUser.id.toLowerCase();
    const cleanUser = currentUser.username.toLowerCase();
    return bookings.filter(
      (b) => b.providerId.toLowerCase() === cleanId || b.providerUsername.toLowerCase() === cleanUser
    );
  }, [bookings, currentUser]);

  // Combined verified available balance
  const combinedAvailableBalance = Math.round((wallet.availableBalance + giftEarnings.netPesos) * 100) / 100;
  const combinedTotalEarnings = Math.round((wallet.totalSales + giftEarnings.netPesos) * 100) / 100;

  // Build unified transaction history list
  const unifiedTransactions = useMemo(() => {
    const list: Array<{
      id: string;
      source: 'product' | 'service' | 'reels_gift' | 'withdrawal';
      sourceLabel: string;
      reference: string;
      title: string;
      grossAmount: number;
      feeAmount: number;
      netAmount: number;
      date: string;
      status: string;
      statusColor: string;
    }> = [];

    // 1. Product Orders
    sellerOrders.forEach((order) => {
      const gross = order.totalAmount || (order.unitPrice * order.quantity);
      const fee = order.platformCommissionAmount || Math.round(gross * 0.03 * 100) / 100;
      const net = order.sellerProceeds || Math.round((gross - fee) * 100) / 100;

      let statusLabel = 'In Transit';
      let statusColor = 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300';
      if (order.status === 'completed') {
        statusLabel = 'Verified / Credited';
        statusColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
      } else if (order.status === 'cancelled') {
        statusLabel = 'Cancelled';
        statusColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
      } else if (order.paymentStatus === 'pending') {
        statusLabel = 'Under Verification';
        statusColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
      }

      list.push({
        id: `ord-${order.id}`,
        source: 'product',
        sourceLabel: 'Benta ng Produkto',
        reference: order.id,
        title: `${order.quantity}x ${order.productTitle}`,
        grossAmount: gross,
        feeAmount: fee,
        netAmount: net,
        date: order.createdAt,
        status: statusLabel,
        statusColor,
      });
    });

    // 2. Service Bookings
    providerBookings.forEach((booking) => {
      const gross = booking.rate || 0;
      const fee = Math.round(gross * 0.03 * 100) / 100;
      const net = Math.round((gross - fee) * 100) / 100;

      let statusLabel = booking.status.replace('_', ' ');
      let statusColor = 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300';
      if (booking.status === 'completed') {
        statusLabel = 'Verified / Credited';
        statusColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
      } else if (booking.status === 'cancelled') {
        statusLabel = 'Cancelled';
        statusColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
      }

      list.push({
        id: `srv-${booking.id}`,
        source: 'service',
        sourceLabel: 'Serbisyo at Booking',
        reference: booking.id,
        title: booking.serviceTitle,
        grossAmount: gross,
        feeAmount: fee,
        netAmount: net,
        date: booking.createdAt,
        status: statusLabel,
        statusColor,
      });
    });

    // 3. Reels Gifts Received
    creatorGifts.forEach((gift) => {
      list.push({
        id: `gift-${gift.id}`,
        source: 'reels_gift',
        sourceLabel: 'Reels Appreciation Gift',
        reference: gift.id,
        title: `${gift.giftIcon} ${gift.giftName} mula kay @${gift.senderUsername}`,
        grossAmount: gift.grossPesosValue,
        feeAmount: gift.platformSharePesos,
        netAmount: gift.creatorNetPesos,
        date: gift.createdAt,
        status: 'Verified Gift',
        statusColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
      });
    });

    // 4. Withdrawals
    withdrawals.forEach((w) => {
      let statusLabel = w.status.replace('_', ' ');
      let statusColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
      if (w.status === 'completed') {
        statusLabel = 'Disbursed';
        statusColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
      } else if (w.status === 'rejected') {
        statusLabel = 'Rejected (Refunded)';
        statusColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
      }

      list.push({
        id: `wdr-${w.id}`,
        source: 'withdrawal',
        sourceLabel: 'Payout Withdrawal',
        reference: w.id,
        title: `Withdrawal via ${w.payoutChannel.toUpperCase()} (${w.payoutAccountNumberMasked || w.maskedAccountNumber || ''})`,
        grossAmount: w.amount,
        feeAmount: w.fee,
        netAmount: w.netAmount ?? (w.amount - w.fee),
        date: w.submittedAt || w.createdAt,
        status: statusLabel,
        statusColor,
      });
    });

    // Sort by latest date first
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sellerOrders, providerBookings, creatorGifts, withdrawals]);

  const filteredTransactions = useMemo(() => {
    if (txFilter === 'all') return unifiedTransactions;
    if (txFilter === 'products') return unifiedTransactions.filter((t) => t.source === 'product');
    if (txFilter === 'services') return unifiedTransactions.filter((t) => t.source === 'service');
    if (txFilter === 'reels_gifts') return unifiedTransactions.filter((t) => t.source === 'reels_gift');
    if (txFilter === 'withdrawals') return unifiedTransactions.filter((t) => t.source === 'withdrawal');
    return unifiedTransactions;
  }, [unifiedTransactions, txFilter]);

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner & Quick Actions */}
      <div className="rounded-3xl bg-gradient-to-br from-[#2D0F55] via-[#3B1376] to-[#5B21B6] text-white p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-yellow-300 text-xs font-semibold backdrop-blur-xs border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>KayaNatinTo Verified Earnings Wallet</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
              ₱{combinedAvailableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-xs text-purple-200">
              Available Balance (Verified funds mula sa benta, serbisyo, at kinumpirmang Reels gifts)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsWithdrawOpen(true)}
              disabled={combinedAvailableBalance < 50}
              className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:pointer-events-none text-purple-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Mag-withdraw ng Kita</span>
            </button>

            <button
              onClick={() => setIsManagePayoutOpen(true)}
              className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Payout Accounts</span>
            </button>

            {onOpenAdminPortal && (
              <button
                onClick={onOpenAdminPortal}
                className="px-3.5 py-3 rounded-2xl bg-purple-900/80 hover:bg-purple-900 text-yellow-300 font-bold text-xs border border-amber-400/30 transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                title="Bukas para sa Admin Reconciliation at Disbursements"
              >
                <span>Admin Portal</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KYC Verification Gate Status Banner */}
      {currentUser.kycStatus === 'approved' ? (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Verified Account (KYC Approved)</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                Ligtas at kwalipikado kang mag-withdraw ng iyong mga kinita sa KayaNatinTo.
              </p>
            </div>
          </div>
          <span className="font-semibold text-[11px] bg-emerald-200/60 dark:bg-emerald-900/60 px-2.5 py-1 rounded-full">
            Active Payout Status
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Kailangan ng KYC Verification para sa Pag-withdraw</p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                Kailangan munang ma-verify ang iyong account bago ka makapag-withdraw ng earnings. Tanggap ang Senior Citizen ID (OSCA) at PhilSys ID alinsunod sa One Person, One Account policy.
              </p>
            </div>
          </div>
          {onOpenKycModal && (
            <button
              type="button"
              onClick={onOpenKycModal}
              className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>I-verify ang Account</span>
            </button>
          )}
        </div>
      )}

      {/* 4-Stream Income Breakdown (Stage 8.5 Highlight with Stage 10 Separation) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Pinagmulan ng Kinita (Income Streams Breakdown)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Stream 1: Products */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                Mga Benta ng Produkto
              </span>
              <span className="text-[10px] text-slate-400">3% fee</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              ₱{(wallet.totalSales * 0.97).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-slate-400">Gross: ₱{wallet.totalSales.toLocaleString()}</p>
          </div>

          {/* Stream 2: Services */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                Serbisyo at Booking
              </span>
              <span className="text-[10px] text-slate-400">3% fee</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              ₱0.00
            </div>
            <p className="text-[10px] text-slate-400">Direktang bayad sa serbisyo</p>
          </div>

          {/* Stream 3: Reels Gifts */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-purple-900 dark:text-purple-300">
              <span className="font-semibold flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-purple-600" />
                Reels Gifts ({giftEarnings.totalGifts})
              </span>
              <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300">80% Creator Net</span>
            </div>
            <div className="text-lg font-bold text-purple-900 dark:text-purple-200">
              ₱{giftEarnings.netPesos.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-purple-700/70 dark:text-purple-300/70">
              {giftEarnings.totalCoinsReceived} coins (Gross: ₱{giftEarnings.grossPesos})
            </p>
          </div>

          {/* Stream 4: Livestream Gifts (Stage 10 Separation) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 shadow-2xs space-y-1 opacity-80">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-slate-500" />
                Livestream Gifts
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 uppercase">
                Soon
              </span>
            </div>
            <div className="text-lg font-bold text-slate-600 dark:text-slate-400">
              ₱0.00
            </div>
            <p className="text-[10px] text-slate-400">Naka-reserba para sa Stage 10</p>
          </div>
        </div>
      </div>

      {/* Balance Ledger Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Earnings */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold">Kabuuang Kita (Total Earnings)</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            ₱{combinedTotalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400">Lahat ng natapos na transaksyon</p>
        </div>

        {/* Pending Balance */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold">Pending Earnings</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-700 dark:text-amber-400">
            ₱{wallet.pendingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400">Inihahanda / verification</p>
        </div>

        {/* Available Balance */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-purple-700 dark:text-purple-300 text-xs">
            <span className="font-semibold">Available Balance</span>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-purple-900 dark:text-purple-200">
            ₱{combinedAvailableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400">Maaari nang i-withdraw</p>
        </div>

        {/* Withdrawn Balance */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold">Nai-withdraw Na</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
            ₱{wallet.withdrawnBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400">Nailipat sa payout account</p>
        </div>

        {/* Total Withdrawal Fees */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold">Withdrawal Fees</span>
            <Hourglass className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-700 dark:text-slate-300">
            ₱{(wallet.totalWithdrawalFees ?? wallet.totalWithdrawalFeesPaid ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400">₱10 fixed fee bawat withdrawal</p>
        </div>
      </div>

      {/* COD Commission Status Notice */}
      {(wallet.unremittedCodCommission ?? 0) > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Nakolektang 3% Komisyon sa Cash on Delivery (COD)</p>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              Mayroon kayong <strong>₱{(wallet.unremittedCodCommission ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> na 3% platform commission na ibinayad ng inyong mga mamimili sa COD orders. Ito ay ire-reconcile at ire-remit sa pamamagitan ng KayaNatinTo Finance team alinsunod sa Stage 8 rules.
            </p>
          </div>
        </div>
      )}

      {/* Mandatory Turnaround Policy Card */}
      <div className="rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800/60 p-4 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-sm">
          <ShieldCheck className="w-4 h-4 text-purple-700 dark:text-purple-400" />
          <span>Alituntunin sa Withdrawal at Payout</span>
        </div>
        <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 text-xs">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
            <span>
              <strong>Minimum Withdrawal:</strong> ₱50.00 bawat kahilingan.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
            <span>
              <strong>Fixed Processing Fee:</strong> ₱10.00 bawat transaksyon na ibinabawas sa kabuuang withdrawal amount.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
            <span>
              <strong>Turnaround Time:</strong> 1 hanggang 20 BUSINESS DAYS manual payout window ng KayaNatinTo administrators patungo sa GCash, Maya, MariBank, at mga bangko sa Pilipinas.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
            <span>
              <strong>Ligtas na Ledger:</strong> Ang inyong pondo ay nakalaan (reserved) habang pinoproseso. Kung tinanggihan ng admin ang kahilingan dahil sa maling account number, agad itong ibinabalik sa inyong Available Balance nang buo nang walang kaltas.
            </span>
          </li>
        </ul>
      </div>

      {/* Comprehensive Transaction History (Stage 8.5 Requirement 14) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Kasaysayan ng Transaksyon at Kinita</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kumpletong tala ng bawat transaksyon, income source, kaltas ng komisyon, at netong halaga.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setTxFilter('all')}
              className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                txFilter === 'all'
                  ? 'bg-purple-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Lahat ({unifiedTransactions.length})
            </button>
            <button
              onClick={() => setTxFilter('products')}
              className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                txFilter === 'products'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Produkto
            </button>
            <button
              onClick={() => setTxFilter('services')}
              className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                txFilter === 'services'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Serbisyo
            </button>
            <button
              onClick={() => setTxFilter('reels_gifts')}
              className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                txFilter === 'reels_gifts'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Reels Gifts
            </button>
            <button
              onClick={() => setTxFilter('withdrawals')}
              className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                txFilter === 'withdrawals'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Withdrawals
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
            Walang transaksyon na tumutugma sa napiling filter.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-200 dark:hover:border-purple-700 shadow-2xs space-y-2 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-700 dark:text-purple-300">{tx.reference}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      ({tx.sourceLabel})
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${tx.statusColor}`}>
                      {tx.status}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    {new Date(tx.date).toLocaleDateString('fil-PH', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {tx.title}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>Gross: <strong>₱{tx.grossAmount.toFixed(2)}</strong></span>
                      <span>·</span>
                      <span>Platform Fee: <strong>₱{tx.feeAmount.toFixed(2)}</strong></span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                      {tx.source === 'withdrawal' ? 'Net Payout' : 'Net Kinita'}
                    </span>
                    <span className={`text-base font-extrabold ${tx.source === 'withdrawal' ? 'text-slate-900 dark:text-white' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      ₱{tx.netAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <WithdrawEarningsModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onOpenKycModal={onOpenKycModal}
        onOpenManagePayout={() => {
          setIsWithdrawOpen(false);
          setIsManagePayoutOpen(true);
        }}
      />

      <ManagePayoutMethodsModal
        isOpen={isManagePayoutOpen}
        onClose={() => setIsManagePayoutOpen(false)}
      />
    </div>
  );
};
