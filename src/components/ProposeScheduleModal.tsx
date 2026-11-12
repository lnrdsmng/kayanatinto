import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ServiceBooking } from '../types/transaction';
import { useTransactions } from '../context/TransactionContext';

interface ProposeScheduleModalProps {
  booking: ServiceBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProposeScheduleModal: React.FC<ProposeScheduleModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { updateBookingStatus } = useTransactions();

  const [proposedDate, setProposedDate] = useState(() => {
    if (booking?.preferredDate) return booking.preferredDate;
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });

  const [proposedTimeSlot, setProposedTimeSlot] = useState(
    booking?.preferredTimeSlot || 'Hapon (1:00 PM - 5:00 PM)'
  );
  const [providerNote, setProviderNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!proposedDate) {
      setErrorMessage('Pumili ng bagong petsa.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateBookingStatus(booking.id, 'schedule_proposed', {
        proposedDate,
        proposedTimeSlot,
        note: providerNote.trim() || `Nag-alok ng alternatibong petsa: ${proposedDate} (${proposedTimeSlot}).`,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMessage(res.error || 'Hindi nai-save ang bagong iskedyul.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'May naganap na error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Mag-propose ng Bagong Iskedyul</h3>
              <p className="text-xs text-amber-100">Booking #{booking.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              Orihinal na Kahilingan ng Customer:
            </span>
            <p className="font-semibold text-slate-800">
              📅 {booking.preferredDate} — ⏰ {booking.preferredTimeSlot}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Bagong Iminumungkahing Petsa *
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={proposedDate}
              onChange={(e) => setProposedDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Bagong Iminumungkahing Oras o Slot *
            </label>
            <select
              value={proposedTimeSlot}
              onChange={(e) => setProposedTimeSlot(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="Umaga (8:00 AM - 12:00 PM)">Umaga (8:00 AM - 12:00 PM)</option>
              <option value="Hapon (1:00 PM - 5:00 PM)">Hapon (1:00 PM - 5:00 PM)</option>
              <option value="Gabi (5:00 PM - 8:00 PM)">Gabi (5:00 PM - 8:00 PM)</option>
              <option value="Buong Araw (8:00 AM - 5:00 PM)">Buong Araw (8:00 AM - 5:00 PM)</option>
              <option value="Flexible / Pag-usapan sa Chat">Flexible / Pag-usapan sa Chat</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Paliwanag o Mensahe para sa Customer
            </label>
            <textarea
              rows={3}
              value={providerNote}
              onChange={(e) => setProviderNote(e.target.value)}
              placeholder="Hal. Paumanhin po, okupado po ako sa naunang petsa. Available po ako sa petsang ito kung sang-ayon po kayo."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Kanselahin
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Ipadala ang Mungkahing Iskedyul</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
