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
  Info,
  Wrench,
  Briefcase,
} from 'lucide-react';
import { Service } from '../types/service';
import { ServiceBooking } from '../types/transaction';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';

interface CreateBookingModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: (booking: ServiceBooking) => void;
  onOpenLogin?: () => void;
}

export const CreateBookingModal: React.FC<CreateBookingModalProps> = ({
  service,
  isOpen,
  onClose,
  onBookingSuccess,
  onOpenLogin,
}) => {
  const { currentUser } = useAuth();
  const { createServiceBooking } = useTransactions();

  // Tomorrow's date formatted as YYYY-MM-DD for sensible default
  const tomorrowStr = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [preferredDate, setPreferredDate] = useState(tomorrowStr);
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('Umaga (8:00 AM - 12:00 PM)');
  const [arrangement, setArrangement] = useState<'customer-location' | 'provider-location' | 'online' | 'flexible'>('customer-location');
  const [serviceLocationAddress, setServiceLocationAddress] = useState('');
  const [customerRequirements, setCustomerRequirements] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !service) return null;

  const isOwner = currentUser && (
    currentUser.id === service.providerId ||
    currentUser.username.toLowerCase() === service.providerUsername.toLowerCase()
  );

  const formatPricingDisplay = () => {
    switch (service.pricingType) {
      case 'fixed':
        return `₱${service.rate.toLocaleString()} (Nakatakdang Halaga / Fixed)`;
      case 'hourly':
        return `₱${service.rate.toLocaleString()} / oras`;
      case 'project':
        return `₱${service.rate.toLocaleString()} / proyekto o trabaho`;
      case 'negotiable':
      default:
        return `₱${service.rate.toLocaleString()} (Puwede Pag-usapan / Negotiable)`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentUser) {
      if (onOpenLogin) {
        onClose();
        onOpenLogin();
      } else {
        setErrorMessage('Kailangan munang mag-log in upang mag-book ng serbisyo.');
      }
      return;
    }

    if (isOwner) {
      setErrorMessage('Hindi mo maaaring i-book ang sarili mong serbisyo.');
      return;
    }

    if (!preferredDate) {
      setErrorMessage('Pumili ng petsa para sa appointment.');
      return;
    }

    if (!customerRequirements.trim()) {
      setErrorMessage('Pakilagay ang detalye o kailangang gawaing ipapagawa sa provider.');
      return;
    }

    if (arrangement === 'customer-location' && !serviceLocationAddress.trim()) {
      setErrorMessage('Pakilagay ang lokasyon o tirahan kung saan isasagawa ang serbisyo.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Pakilagay ang inyong numero ng telepono upang makontak kayo ng provider.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createServiceBooking({
        serviceId: service.id,
        preferredDate,
        preferredTimeSlot,
        arrangement,
        serviceLocationAddress: serviceLocationAddress.trim() || undefined,
        customerRequirements: customerRequirements.trim(),
        customerPhone: phone.trim(),
      });

      if (res.success && res.booking) {
        onBookingSuccess(res.booking);
        onClose();
      } else {
        setErrorMessage(res.error || 'Nagkaroon ng problema sa pag-book ng serbisyo.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'May naganap na error. Pakisubukang muli.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full my-6 overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3B1376] to-[#4F28D9] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Mag-book ng Serbisyo</h2>
              <p className="text-xs text-purple-200">
                Direktang kahilingan kay {service.providerName}
              </p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Service Summary Card */}
          <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <img
              src={service.portfolioImages?.[0] || service.providerAvatarUrl || '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png'}
              alt={service.title}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-slate-200 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                {service.category}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate mt-1">
                {service.title}
              </h3>
              <p className="text-xs text-slate-500 truncate">
                Provider: <span className="font-semibold text-slate-700">{service.providerName}</span>
                {service.providerIsSenior && (
                  <span className="ml-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                    Senior Expert
                  </span>
                )}
              </p>
              <div className="mt-1">
                <span className="text-xs sm:text-sm font-extrabold text-[#3B1376]">
                  {formatPricingDisplay()}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Note */}
          <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-xs text-purple-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-[#3B1376] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-purple-950">
                {service.pricingType === 'negotiable' ? 'Presyong Napag-uusapan (Negotiable)' : 'Tinatayang Halaga ng Serbisyo'}
              </p>
              <p className="text-purple-800 text-[11px] mt-0.5">
                Maaaring kumpirmahin o pagkasunduan ang pinal na halaga batay sa lawak ng trabaho at kagamitang kailangan.
              </p>
            </div>
          </div>

          {/* Schedule Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Nais na Petsa (Preferred Date) *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#3B1376]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Oras o Time Slot *
              </label>
              <select
                value={preferredTimeSlot}
                onChange={(e) => setPreferredTimeSlot(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#3B1376] bg-white"
              >
                <option value="Umaga (8:00 AM - 12:00 PM)">Umaga (8:00 AM - 12:00 PM)</option>
                <option value="Hapon (1:00 PM - 5:00 PM)">Hapon (1:00 PM - 5:00 PM)</option>
                <option value="Gabi (5:00 PM - 8:00 PM)">Gabi (5:00 PM - 8:00 PM)</option>
                <option value="Buong Araw (8:00 AM - 5:00 PM)">Buong Araw (8:00 AM - 5:00 PM)</option>
                <option value="Flexible / Pag-usapan sa Chat">Flexible / Pag-usapan sa Chat</option>
              </select>
            </div>
          </div>

          {/* Service Arrangement / Location */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Saan Isasagawa ang Serbisyo (Arrangement)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setArrangement('customer-location')}
                className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                  arrangement === 'customer-location'
                    ? 'border-[#3B1376] bg-purple-50/70 ring-2 ring-[#3B1376]/20 font-bold text-[#3B1376]'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                🏠 Sa Bahay / Lokasyon ng Customer
              </button>

              <button
                type="button"
                onClick={() => setArrangement('provider-location')}
                className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                  arrangement === 'provider-location'
                    ? 'border-[#3B1376] bg-purple-50/70 ring-2 ring-[#3B1376]/20 font-bold text-[#3B1376]'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                🏢 Sa Pwesto o Talyer ng Provider
              </button>

              <button
                type="button"
                onClick={() => setArrangement('online')}
                className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                  arrangement === 'online'
                    ? 'border-[#3B1376] bg-purple-50/70 ring-2 ring-[#3B1376]/20 font-bold text-[#3B1376]'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                💻 Online o Remote Consultation
              </button>

              <button
                type="button"
                onClick={() => setArrangement('flexible')}
                className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                  arrangement === 'flexible'
                    ? 'border-[#3B1376] bg-purple-50/70 ring-2 ring-[#3B1376]/20 font-bold text-[#3B1376]'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                🤝 Pag-uusapan / Flexible
              </button>
            </div>
          </div>

          {/* Location Address if customer location */}
          {arrangement === 'customer-location' && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Lokasyon o Tirahan kung saan pupunta ang provider *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={serviceLocationAddress}
                  onChange={(e) => setServiceLocationAddress(e.target.value)}
                  placeholder="Hal. 142 Rizal St., Brgy. San Roque, Majayjay, Laguna"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#3B1376]"
                />
              </div>
            </div>
          )}

          {/* Details / Requirements */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Detalye ng Ipagagawa o Trabaho *
            </label>
            <textarea
              required
              rows={3}
              value={customerRequirements}
              onChange={(e) => setCustomerRequirements(e.target.value)}
              placeholder="Hal. Paaayusin po sana ang bisagra ng lumang cabinet at may lamat ang kahoy na kailangan lagyan ng brace..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#3B1376] resize-none"
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Numero ng Telepono o Cellphone (para sa komunikasyon) *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Hal. 0917-123-4567"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#3B1376]"
              />
            </div>
          </div>

          {/* Provider Opportunity / Safety Banner */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Direktang Kasunduan sa Komunidad</p>
              <p className="text-slate-600 mt-0.5">
                Maaaring tanggapin ng provider ang iskedyul, o mag-propose ng alternatibong oras kung okupado na ang araw na ito.
              </p>
            </div>
          </div>

          {/* Footer Submit Buttons */}
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
              className="flex-1 py-3 px-4 rounded-xl bg-[#3B1376] hover:bg-[#2F106A] disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Ipinapadala ang Booking Request...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ipadala ang Kahilingan sa Booking</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
