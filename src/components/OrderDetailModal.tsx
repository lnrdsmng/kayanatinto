import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Phone,
  MessageCircle,
  Ban,
  PackageCheck,
  ChevronRight,
  User,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { ProductOrder, ProductOrderStatus } from '../types/transaction';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { useMessaging } from '../context/MessagingContext';

interface OrderDetailModalProps {
  order: ProductOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenMessage?: (
    participant: { id: string; name: string; username: string; avatarUrl?: string; isSenior?: boolean },
    contextItem: { type: 'order'; id: string; title: string; priceOrRate?: string; imageUrl?: string }
  ) => void;
  onViewUserProfile?: (username: string) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onOpenMessage,
  onViewUserProfile,
}) => {
  const { currentUser } = useAuth();
  const { updateOrderStatus, confirmCodPaymentReceived } = useTransactions();
  const { getOrCreateConversation } = useMessaging();

  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [sellerStatusNote, setSellerStatusNote] = useState('');
  const [showSellerNoteInput, setShowSellerNoteInput] = useState(false);

  if (!isOpen || !order) return null;

  const isCustomer = currentUser && (
    currentUser.id === order.customerId ||
    currentUser.username.toLowerCase() === order.customerUsername.toLowerCase()
  );
  const isSeller = currentUser && (
    currentUser.id === order.sellerId ||
    currentUser.username.toLowerCase() === order.sellerUsername.toLowerCase()
  );

  const handleStatusChange = async (nextStatus: ProductOrderStatus, note?: string) => {
    setIsUpdating(true);
    setErrorMessage(null);
    try {
      const res = await updateOrderStatus(order.id, nextStatus, note || sellerStatusNote.trim() || undefined);
      if (!res.success) {
        setErrorMessage(res.error || 'Hindi na-update ang estado ng order.');
      } else {
        setSellerStatusNote('');
        setShowSellerNoteInput(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'May naganap na error.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      setErrorMessage('Pakilagay ang dahilan ng pagkansela.');
      return;
    }
    setIsUpdating(true);
    setErrorMessage(null);
    try {
      const res = await updateOrderStatus(order.id, 'cancelled', undefined, cancelReason.trim());
      if (res.success) {
        setIsCancelConfirmOpen(false);
        setCancelReason('');
      } else {
        setErrorMessage(res.error || 'Hindi nakansela ang order.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'May naganap na error.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMessageOtherParty = () => {
    const targetUser = isSeller
      ? {
          id: order.customerId,
          name: order.customerName,
          username: order.customerUsername,
          avatarUrl: order.customerAvatarUrl,
          isSenior: order.customerIsSenior,
        }
      : {
          id: order.sellerId,
          name: order.sellerName,
          username: order.sellerUsername,
          avatarUrl: order.sellerAvatarUrl,
          isSenior: order.sellerIsSenior,
        };

    const contextItem = {
      type: 'order' as const,
      id: order.id,
      title: `Order #${order.id} (${order.productTitle})`,
      priceOrRate: `₱${order.totalAmount.toLocaleString()}`,
      imageUrl: order.productImage,
    };

    if (onOpenMessage) {
      onClose();
      onOpenMessage(targetUser, contextItem);
    } else {
      getOrCreateConversation(
        targetUser,
        `Kumusta! Makikipag-ugnayan po sana tungkol sa Order #${order.id} (${order.productTitle}).`,
        contextItem
      );
      onClose();
    }
  };

  const getStatusBadge = () => {
    switch (order.status) {
      case 'pending':
        return {
          label: 'Nakabinbin (Pending)',
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'accepted':
        return {
          label: 'Tinanggap (Accepted)',
          bg: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'preparing':
        return {
          label: 'Inihahanda (Preparing)',
          bg: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'ready_or_out':
        return {
          label: order.fulfillmentType === 'pickup' ? 'Handa na sa Pickup' : 'Ihahatid na (Out for Delivery)',
          bg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        };
      case 'completed':
        return {
          label: 'Matagumpay na Natapos (Completed)',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'cancelled':
        return {
          label: 'Nakansela (Cancelled)',
          bg: 'bg-rose-100 text-rose-800 border-rose-200',
        };
      default:
        return { label: order.status, bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const statusBadge = getStatusBadge();

  // Progress Stepper steps
  const orderSteps: { key: ProductOrderStatus; label: string }[] = [
    { key: 'pending', label: 'Order Sent' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready_or_out', label: order.fulfillmentType === 'pickup' ? 'Ready Pickup' : 'Out for Delivery' },
    { key: 'completed', label: 'Completed' },
  ];

  const getStepIndex = (st: ProductOrderStatus) => {
    switch (st) {
      case 'pending':
        return 0;
      case 'accepted':
        return 1;
      case 'preparing':
        return 2;
      case 'ready_or_out':
        return 3;
      case 'completed':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-6 overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3B1376] to-[#4F28D9] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-white/15 px-2 py-0.5 rounded-md text-amber-300 font-bold">
                  {order.id}
                </span>
                <span className="text-xs text-purple-200">
                  {new Date(order.createdAt).toLocaleDateString('fil-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold mt-0.5">
                Detalye ng Order sa KayaNatinTo
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Isara"
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Status Stepper */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700">Kasalukuyang Estado:</span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${statusBadge.bg}`}>
                {statusBadge.label}
              </span>
            </div>

            {order.status === 'cancelled' ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-950">
                  <Ban className="w-4 h-4 text-rose-600" />
                  <span>Kanseladong Order</span>
                </div>
                <p className="text-[11px] text-rose-800">
                  Kinansela ni: <span className="font-semibold">{order.cancelledBy === 'customer' ? 'Customer' : 'Seller'}</span>
                </p>
                {order.cancellationReason && (
                  <p className="text-[11px] text-rose-800 italic">
                    Dahilan: "{order.cancellationReason}"
                  </p>
                )}
                <p className="text-[10px] text-rose-700 mt-1">
                  Awtomatikong naibalik sa imbentaryo ang stock ng produkto.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-1 pt-1">
                {orderSteps.map((step, idx) => {
                  const isDone = currentStepIdx >= idx;
                  const isCurrent = currentStepIdx === idx;
                  return (
                    <div key={step.key} className="flex flex-col items-center text-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 transition-colors ${
                          isDone
                            ? 'bg-[#3B1376] text-white shadow-xs'
                            : 'bg-slate-200 text-slate-500'
                        } ${isCurrent ? 'ring-2 ring-purple-400 ring-offset-1' : ''}`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`text-[9px] sm:text-[10px] leading-tight font-medium ${
                          isDone ? 'text-slate-900 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Ordered */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
            <img
              src={order.productImage}
              alt={order.productTitle}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-slate-200 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                {order.productCategory}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate mt-0.5">
                {order.productTitle}
              </h3>
              <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-2 items-center">
                <span>Dami: <strong className="text-slate-900">{order.quantity} {order.priceUnit || 'piraso'}</strong></span>
                <span>•</span>
                <span>Presyo: <strong>₱{order.unitPrice.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>

          {/* Parties Involved */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Seller Info */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Nagbebenta (Seller)
                </span>
                {order.sellerIsSenior && (
                  <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-md">
                    Senior
                  </span>
                )}
              </div>
              <p className="font-bold text-xs text-slate-900 truncate">
                {order.sellerName}
              </p>
              <p className="text-[11px] text-slate-500">
                @{order.sellerUsername}
              </p>
              {onViewUserProfile && (
                <button
                  type="button"
                  onClick={() => onViewUserProfile(order.sellerUsername)}
                  className="text-[11px] text-[#4F28D9] font-bold hover:underline"
                >
                  Tingnan ang Profile ni Seller
                </button>
              )}
            </div>

            {/* Customer Info */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Bumili (Customer)
                </span>
                {order.customerIsSenior && (
                  <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-md">
                    Senior
                  </span>
                )}
              </div>
              <p className="font-bold text-xs text-slate-900 truncate">
                {order.customerName}
              </p>
              <p className="text-[11px] text-slate-600 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {order.customerPhone}
              </p>
              {onViewUserProfile && (
                <button
                  type="button"
                  onClick={() => onViewUserProfile(order.customerUsername)}
                  className="text-[11px] text-[#4F28D9] font-bold hover:underline"
                >
                  Tingnan ang Profile ni Customer
                </button>
              )}
            </div>
          </div>

          {/* Fulfillment Details */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              {order.fulfillmentType === 'pickup' ? (
                <>
                  <MapPin className="w-4 h-4 text-purple-700" />
                  <span>Paraan ng Pagkuha: Pickup sa Pwesto</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 text-purple-700" />
                  <span>Paraan ng Paghatid: Lokal na Delivery ng Seller</span>
                </>
              )}
            </h4>

            {order.fulfillmentType === 'pickup' ? (
              <div className="text-xs text-slate-700 space-y-1">
                <p className="font-medium text-slate-900">
                  📍 Lokasyon ng Pickup: <span className="font-semibold">{order.pickupLocation || 'Majayjay Town Center'}</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Makipag-ugnayan sa seller sa chat upang pag-usapan ang oras ng pagkikita.
                </p>
              </div>
            ) : (
              <div className="text-xs text-slate-700 space-y-1">
                <p className="font-medium text-slate-900">
                  🏠 Tirahan / Address:
                </p>
                <p className="text-[11px] text-slate-700 font-semibold pl-2">
                  {order.deliveryAddress?.streetAddress}, {order.deliveryAddress?.barangay}, {order.deliveryAddress?.city}, {order.deliveryAddress?.province}
                </p>
                {order.deliveryAddress?.landmark && (
                  <p className="text-[11px] text-slate-500 pl-2">
                    Palatandaan (Landmark): {order.deliveryAddress.landmark}
                  </p>
                )}
                <p className="text-[11px] text-purple-800 italic pt-1">
                  * Lokal na delivery na inayos mismo ni seller. Walang automated courier integration.
                </p>
              </div>
            )}
          </div>

          {/* Customer / Seller Notes */}
          {order.customerNote && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wide text-amber-900">
                Tagubilin mula sa Customer:
              </span>
              <p className="text-amber-950 italic">"{order.customerNote}"</p>
            </div>
          )}

          {order.sellerNote && (
            <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wide text-purple-900">
                Puna mula sa Seller:
              </span>
              <p className="text-purple-950 italic">"{order.sellerNote}"</p>
            </div>
          )}

          {/* STAGE 8: PAYMENT AND FINANCIAL SUMMARY */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-purple-700" />
                <span className="font-bold text-slate-800">
                  {order.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery (COD)'}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  order.paymentStatus === 'paid' || order.codPaymentStatus === 'collected_by_seller'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {order.paymentStatus === 'paid' || order.codPaymentStatus === 'collected_by_seller' ? 'Paid' : 'Pending Payment'}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Subtotal ({order.quantity} {order.priceUnit || 'piraso'})</span>
              <span className="font-semibold text-slate-900">₱{order.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between text-slate-600 items-center">
              <div className="flex items-center gap-1">
                <span>Komisyon ng Plataporma (3%)</span>
                <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-bold">
                  Buyer-Paid
                </span>
              </div>
              <span className="font-semibold text-purple-800">
                ₱{(order.platformCommissionAmount || (Math.round(order.subtotal * 0.03 * 100) / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Bayad sa Paghatid (Delivery Fee)</span>
              <span className="font-semibold text-slate-900">
                {order.deliveryFee > 0 ? `₱${order.deliveryFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'Libre (₱0.00)'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <div>
                <span className="font-bold text-slate-900 text-sm block">Kabuuang Ibinayad ng Buyer</span>
                <span className="text-[10px] text-slate-500">
                  {order.paymentMethod === 'cod' ? 'Ibinabayad sa Kaliwaan' : 'Online Gateway Settlement'}
                </span>
              </div>
              <span className="font-extrabold text-[#7C3AED] text-lg">
                ₱{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Seller Proceeds Callout */}
            <div className="p-2.5 bg-purple-50/60 rounded-xl border border-purple-100 flex items-center justify-between text-xs">
              <span className="text-purple-900 font-semibold">Netong Kita ng Nagbebenta (Seller Proceeds):</span>
              <span className="font-extrabold text-purple-700 text-sm">
                ₱{(order.sellerProceeds || (order.subtotal + (order.deliveryFee || 0))).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* COD Confirmation Action for Seller */}
            {order.paymentMethod === 'cod' && (
              <div className="pt-1">
                {order.codPaymentStatus === 'collected_by_seller' ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold">Kinumpirma ang Bayad sa COD</p>
                      <p className="text-[11px] text-emerald-700">
                        {order.codPaymentConfirmedAt ? new Date(order.codPaymentConfirmedAt).toLocaleString() : 'Natanggap na nang buo.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  isSeller && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={async () => {
                        setIsUpdating(true);
                        await confirmCodPaymentReceived(order.id);
                        setIsUpdating(false);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Kumpirmahin ang Natanggap na Bayad sa COD (₱{order.totalAmount.toLocaleString()})</span>
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-700" />
              Kasaysayan ng Transaksyon (Timeline)
            </h4>
            <div className="space-y-2 border-l-2 border-purple-200 pl-3 ml-2">
              {order.timeline.map((entry, idx) => (
                <div key={idx} className="text-xs relative">
                  <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-[#3B1376] ring-2 ring-white" />
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 capitalize">
                      {entry.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(entry.timestamp).toLocaleTimeString('fil-PH', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="text-[11px] text-slate-600 mt-0.5">{entry.note}</p>
                  )}
                  <p className="text-[10px] text-slate-400">Ni: {entry.actorName}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation Modal Dialog */}
          {isCancelConfirmOpen && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
              <h5 className="font-bold text-xs text-rose-950 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Sigurado ka bang nais mong kanselahin ang order na ito?
              </h5>
              <input
                type="text"
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Pakilagay ang dahilan ng pagkansela..."
                className="w-full px-3 py-2 text-xs border border-rose-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500 bg-white"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCancelConfirmOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 bg-white hover:bg-slate-50"
                >
                  Bumalik
                </button>
                <button
                  type="button"
                  disabled={isUpdating || !cancelReason.trim()}
                  onClick={handleCancelOrder}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs"
                >
                  {isUpdating ? 'Kinakansela...' : 'Kumpirmahing Kanselahin'}
                </button>
              </div>
            </div>
          )}

          {/* Actions Section */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            {/* Primary Seller Actions */}
            {isSeller && order.status !== 'completed' && order.status !== 'cancelled' && (
              <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 block">
                  Aksyon ng Seller (Merchant Controls):
                </span>

                {order.status === 'pending' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange('accepted', 'Tinanggap ng seller ang inyong order.')}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#3B1376] hover:bg-[#2F106A] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Tanggapin ang Order</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCancelConfirmOpen(true)}
                      className="py-2.5 px-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-xs"
                    >
                      Tanggihan / Kanselahin
                    </button>
                  </div>
                )}

                {order.status === 'accepted' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange('preparing', 'Sinisimulan na ang paghahanda ng produkto.')}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>Simulan ang Paghahanda (Preparing)</span>
                    </button>
                  </div>
                )}

                {order.status === 'preparing' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() =>
                        handleStatusChange(
                          'ready_or_out',
                          order.fulfillmentType === 'pickup'
                            ? 'Handa na para sa pickup ang inyong produkto.'
                            : 'Nasa biyahe na upang ihatid sa inyong tirahan.'
                        )
                      }
                      className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Truck className="w-4 h-4" />
                      <span>
                        {order.fulfillmentType === 'pickup' ? 'Handa na sa Pickup' : 'I-out for Delivery na'}
                      </span>
                    </button>
                  </div>
                )}

                {order.status === 'ready_or_out' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange('completed', 'Matagumpay na natapos at nabayaran.')}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Markahang Natapos at Bayad Na</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Customer Actions */}
            {isCustomer && (
              <div className="flex flex-wrap items-center gap-2">
                {order.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => setIsCancelConfirmOpen(true)}
                    className="py-2.5 px-3 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs"
                  >
                    Kanselahin ang Order
                  </button>
                )}

                {order.status === 'ready_or_out' && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleStatusChange('completed', 'Kinumpirma ng customer na natanggap na ang produkto.')}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Kinukumpirma kong Natanggap Ko Na</span>
                  </button>
                )}
              </div>
            )}

            {/* Direct Message Option */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleMessageOtherParty}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-[#3B1376]" />
                <span>
                  {isSeller ? `I-chat si ${order.customerName}` : `I-chat si ${order.sellerName}`}
                </span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Isara
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
