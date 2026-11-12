import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Phone,
  MessageCircle,
  Ban,
  Wrench,
  User,
  ArrowRight,
  Briefcase,
} from 'lucide-react';
import { ServiceBooking, ServiceBookingStatus } from '../types/transaction';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { useMessaging } from '../context/MessagingContext';
import { ProposeScheduleModal } from './ProposeScheduleModal';

interface BookingDetailModalProps {
  booking: ServiceBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenMessage?: (
    participant: { id: string; name: string; username: string; avatarUrl?: string; isSenior?: boolean },
    contextItem: { type: 'booking'; id: string; title: string; priceOrRate?: string; imageUrl?: string }
  ) => void;
  onViewUserProfile?: (username: string) => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  isOpen,
  onClose,
  onOpenMessage,
  onViewUserProfile,
}) => {
  const { currentUser } = useAuth();
  const { updateBookingStatus } = useTransactions();
  const { getOrCreateConversation } = useMessaging();

  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (!isOpen || !booking) return null;

  const isCustomer = currentUser && (
    currentUser.id === booking.customerId ||
    currentUser.username.toLowerCase() === booking.customerUsername.toLowerCase()
  );
  const isProvider = currentUser && (
    currentUser.id === booking.providerId ||
    currentUser.username.toLowerCase() === booking.providerUsername.toLowerCase()
  );

  const handleStatusChange = async (nextStatus: ServiceBookingStatus, note?: string) => {
    setIsUpdating(true);
    setErrorMessage(null);
    try {
      const res = await updateBookingStatus(booking.id, nextStatus, { note });
      if (!res.success) {
        setErrorMessage(res.error || 'Hindi na-update ang estado ng booking.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'May naganap na error.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      setErrorMessage('Pakilagay ang dahilan ng pagkansela.');
      return;
    }
    setIsUpdating(true);
    setErrorMessage(null);
    try {
      const res = await updateBookingStatus(booking.id, 'cancelled', {
        reason: cancelReason.trim(),
      });
      if (res.success) {
        setIsCancelConfirmOpen(false);
        setCancelReason('');
      } else {
        setErrorMessage(res.error || 'Hindi nakansela ang booking.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'May naganap na error.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMessageOtherParty = () => {
    const targetUser = isProvider
      ? {
          id: booking.customerId,
          name: booking.customerName,
          username: booking.customerUsername,
          avatarUrl: booking.customerAvatarUrl,
          isSenior: booking.customerIsSenior,
        }
      : {
          id: booking.providerId,
          name: booking.providerName,
          username: booking.providerUsername,
          avatarUrl: booking.providerAvatarUrl,
          isSenior: booking.providerIsSenior,
        };

    const contextItem = {
      type: 'booking' as const,
      id: booking.id,
      title: `Booking #${booking.id} (${booking.serviceTitle})`,
      priceOrRate: booking.estimatedPriceDisplay,
      imageUrl: booking.serviceImage,
    };

    if (onOpenMessage) {
      onClose();
      onOpenMessage(targetUser, contextItem);
    } else {
      getOrCreateConversation(
        targetUser,
        `Kumusta! Makikipag-ugnayan po sana tungkol sa Booking #${booking.id} para sa "${booking.serviceTitle}".`,
        contextItem
      );
      onClose();
    }
  };

  const getStatusBadge = () => {
    switch (booking.status) {
      case 'pending':
        return {
          label: 'Nakabinbin (Pending Review)',
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'accepted':
        return {
          label: 'Tinanggap ng Provider (Accepted)',
          bg: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'schedule_proposed':
        return {
          label: 'May Bagong Mungkahing Iskedyul',
          bg: 'bg-orange-100 text-orange-800 border-orange-200',
        };
      case 'confirmed':
        return {
          label: 'Kumpirmadong Iskedyul (Confirmed)',
          bg: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'in_progress':
        return {
          label: 'Kasalukuyang Ginagawa (In Progress)',
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
        return { label: booking.status, bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-2xl w-full my-6 overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#3B1376] to-[#4F28D9] text-white p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-white/15 px-2 py-0.5 rounded-md text-amber-300 font-bold">
                    {booking.id}
                  </span>
                  <span className="text-xs text-purple-200">
                    {new Date(booking.createdAt).toLocaleDateString('fil-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold mt-0.5">
                  Detalye ng Kahilingan sa Serbisyo (Booking)
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

            {/* Current Status Pill */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Kasalukuyang Estado:</span>
                <span className="text-[11px] text-slate-500">
                  {booking.status === 'schedule_proposed'
                    ? 'Nag-alok ang provider ng bagong petsa o oras'
                    : 'Status ng inyong appointment'}
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${statusBadge.bg}`}>
                {statusBadge.label}
              </span>
            </div>

            {/* Special Proposed Schedule Alert Banner */}
            {booking.status === 'schedule_proposed' && (
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span>Iminumungkahing Bagong Iskedyul mula kay Provider</span>
                </div>
                <div className="text-xs text-amber-900 bg-white/70 p-3 rounded-lg border border-amber-200 space-y-1">
                  <p>
                    <strong>Bagong Petsa:</strong> {booking.proposedDate || 'Nakatakda'}
                  </p>
                  <p>
                    <strong>Bagong Oras:</strong> {booking.proposedTimeSlot || 'Nakatakda'}
                  </p>
                  {booking.providerNote && (
                    <p className="italic text-[11px] text-amber-800 mt-1">
                      Paliwanag: "{booking.providerNote}"
                    </p>
                  )}
                </div>

                {isCustomer && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() =>
                        handleStatusChange(
                          'confirmed',
                          `Tinanggap ng customer ang mungkahing iskedyul: ${booking.proposedDate} (${booking.proposedTimeSlot}).`
                        )
                      }
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sang-ayon Ako sa Bagong Iskedyul</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleMessageOtherParty}
                      className="py-2 px-3 rounded-xl border border-amber-300 text-amber-900 bg-white hover:bg-amber-50 font-semibold text-xs"
                    >
                      Makipag-usap sa Chat
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Service Summary Card */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
              <img
                src={booking.serviceImage}
                alt={booking.serviceTitle}
                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-slate-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                  {booking.serviceCategory}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate mt-0.5">
                  {booking.serviceTitle}
                </h3>
                <div className="text-xs text-slate-600 mt-1">
                  Rate: <strong className="text-[#3B1376]">{booking.estimatedPriceDisplay}</strong>
                </div>
              </div>
            </div>

            {/* Schedule & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Schedule Info */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Nakatakdang Iskedyul
                </span>
                <p className="font-bold text-xs text-slate-900">
                  📅 {booking.proposedDate || booking.preferredDate}
                </p>
                <p className="text-[11px] text-slate-600">
                  ⏰ {booking.proposedTimeSlot || booking.preferredTimeSlot}
                </p>
                {booking.proposedDate && (
                  <span className="inline-block text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md mt-1">
                    Na-update ng provider
                  </span>
                )}
              </div>

              {/* Arrangement & Location */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Paraan at Lokasyon
                </span>
                <p className="font-bold text-xs text-slate-900 capitalize">
                  {booking.arrangement === 'customer-location' && '🏠 Home Visit / Lokasyon ng Customer'}
                  {booking.arrangement === 'provider-location' && '🏢 Pwesto o Talyer ng Provider'}
                  {booking.arrangement === 'online' && '💻 Online / Remote Consultation'}
                  {booking.arrangement === 'flexible' && '🤝 Flexible / Pag-uusapan'}
                </p>
                {booking.serviceLocationAddress && (
                  <p className="text-[11px] text-slate-600 truncate">
                    📍 {booking.serviceLocationAddress}
                  </p>
                )}
              </div>
            </div>

            {/* Parties Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Provider */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Service Provider
                  </span>
                  {booking.providerIsSenior && (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-md">
                      Senior
                    </span>
                  )}
                </div>
                <p className="font-bold text-xs text-slate-900 truncate">
                  {booking.providerName}
                </p>
                <p className="text-[11px] text-slate-500">
                  @{booking.providerUsername}
                </p>
                {onViewUserProfile && (
                  <button
                    type="button"
                    onClick={() => onViewUserProfile(booking.providerUsername)}
                    className="text-[11px] text-[#4F28D9] font-bold hover:underline"
                  >
                    Tingnan ang Profile ni Provider
                  </button>
                )}
              </div>

              {/* Customer */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Humiling (Customer)
                  </span>
                  {booking.customerIsSenior && (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-md">
                      Senior
                    </span>
                  )}
                </div>
                <p className="font-bold text-xs text-slate-900 truncate">
                  {booking.customerName}
                </p>
                <p className="text-[11px] text-slate-600 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {booking.customerPhone}
                </p>
                {onViewUserProfile && (
                  <button
                    type="button"
                    onClick={() => onViewUserProfile(booking.customerUsername)}
                    className="text-[11px] text-[#4F28D9] font-bold hover:underline"
                  >
                    Tingnan ang Profile ni Customer
                  </button>
                )}
              </div>
            </div>

            {/* Customer Requirements */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-700">
                Detalye ng Ipagagawa o Trabaho:
              </span>
              <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                {booking.customerRequirements}
              </p>
            </div>

            {/* Cancellation Notice if cancelled */}
            {booking.status === 'cancelled' && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-950">
                  <Ban className="w-4 h-4 text-rose-600" />
                  <span>Kanseladong Serbisyo</span>
                </div>
                <p className="text-[11px] text-rose-800">
                  Kinansela ni: <span className="font-semibold">{booking.cancelledBy === 'customer' ? 'Customer' : 'Provider'}</span>
                </p>
                {booking.cancellationReason && (
                  <p className="text-[11px] text-rose-800 italic">
                    Dahilan: "{booking.cancellationReason}"
                  </p>
                )}
              </div>
            )}

            {/* Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-700" />
                Kasaysayan ng Booking (Timeline)
              </h4>
              <div className="space-y-2 border-l-2 border-purple-200 pl-3 ml-2">
                {booking.timeline.map((entry, idx) => (
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

            {/* Cancel Form Dialog */}
            {isCancelConfirmOpen && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
                <h5 className="font-bold text-xs text-rose-950 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Kanselahin ang booking na ito?
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
                    onClick={handleCancelBooking}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs"
                  >
                    {isUpdating ? 'Kinakansela...' : 'Kumpirmahing Kanselahin'}
                  </button>
                </div>
              </div>
            )}

            {/* Actions Section */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              {/* Provider Actions */}
              {isProvider && booking.status !== 'completed' && booking.status !== 'cancelled' && (
                <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 block">
                    Aksyon ng Provider (Service Controls):
                  </span>

                  {booking.status === 'pending' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange('accepted', 'Tinanggap ng provider ang inyong booking.')}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#3B1376] hover:bg-[#2F106A] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Tanggapin ang Booking</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsProposeModalOpen(true)}
                        className="py-2.5 px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs"
                      >
                        Mag-propose ng Bagong Iskedyul
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCancelConfirmOpen(true)}
                        className="py-2.5 px-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-xs"
                      >
                        Tanggihan
                      </button>
                    </div>
                  )}

                  {booking.status === 'accepted' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange('confirmed', 'Kinumpirma ang iskedyul ng serbisyo.')}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Kumpirmahin ang Iskedyul (Confirm Appointment)</span>
                      </button>
                    </div>
                  )}

                  {booking.status === 'confirmed' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange('in_progress', 'Kasalukuyang isinasagawa ang serbisyo.')}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Wrench className="w-4 h-4" />
                        <span>Simulan ang Trabaho (Mark In Progress)</span>
                      </button>
                    </div>
                  )}

                  {booking.status === 'in_progress' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange('completed', 'Matagumpay na natapos ang serbisyo.')}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Markahang Tapos Na ang Trabaho</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Customer Actions */}
              {isCustomer && (
                <div className="flex flex-wrap items-center gap-2">
                  {(booking.status === 'pending' || booking.status === 'schedule_proposed') && (
                    <button
                      type="button"
                      onClick={() => setIsCancelConfirmOpen(true)}
                      className="py-2.5 px-3 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs"
                    >
                      Kanselahin ang Booking
                    </button>
                  )}

                  {booking.status === 'in_progress' && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange('completed', 'Kinumpirma ng customer na tapos at ayos na ang serbisyo.')}
                      className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Kumpirmahing Tapos Na ang Trabaho</span>
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
                    {isProvider ? `I-chat si ${booking.customerName}` : `I-chat si ${booking.providerName}`}
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

      {/* Alternative Schedule Propose Modal */}
      <ProposeScheduleModal
        booking={booking}
        isOpen={isProposeModalOpen}
        onClose={() => setIsProposeModalOpen(false)}
        onSuccess={() => {
          setIsProposeModalOpen(false);
        }}
      />
    </>
  );
};
