import React, { useState } from 'react';
import {
  X,
  Heart,
  MapPin,
  Star,
  Clock,
  ShieldCheck,
  Home,
  Building2,
  Laptop,
  CheckCircle2,
  MessageSquare,
  Share2,
  Edit3,
  Calendar,
  Briefcase,
  AlertCircle,
  PhoneCall
} from 'lucide-react';
import { Service, SERVICE_CATEGORIES } from '../types/service';
import { useServices } from '../context/ServiceContext';
import { useAuth } from '../context/AuthContext';
import { useMessaging } from '../context/MessagingContext';

interface ServiceDetailsModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onViewProviderProfile?: (username: string) => void;
  onOpenCreateBooking?: (service: Service) => void;
  onOpenMessageProvider?: (
    provider: {
      id: string;
      name: string;
      username: string;
      avatarUrl?: string;
      isSenior?: boolean;
    },
    contextItem: {
      type: 'service';
      id: string;
      title: string;
      priceOrRate?: string;
      imageUrl?: string;
    },
    initialMessage?: string
  ) => void;
}

export const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  service,
  isOpen,
  onClose,
  onEdit,
  onViewProviderProfile,
  onOpenCreateBooking,
  onOpenMessageProvider,
}) => {
  const { isServiceBookmarked, toggleBookmarkService } = useServices();
  const { currentUser } = useAuth();
  const { getOrCreateConversation } = useMessaging();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [inquirySent, setInquirySent] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryNotes, setInquiryNotes] = useState('');
  const [shareCopied, setShareCopied] = useState(false);

  if (!isOpen) return null;

  const isOwner = currentUser && (currentUser.id === service.providerId || currentUser.username === service.providerUsername);
  const bookmarked = isServiceBookmarked(service.id);
  const categoryMeta = SERVICE_CATEGORIES.find((c) => c.id === service.category);

  const images = service.portfolioImages && service.portfolioImages.length > 0
    ? service.portfolioImages
    : [service.providerAvatarUrl || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80'];

  const formatPricingType = (type: string) => {
    switch (type) {
      case 'hourly':
        return 'Kabayaran bawat oras';
      case 'fixed':
        return 'Nakatakdang presyo (Fixed price)';
      case 'project':
        return 'Bawat proyekto o gawaan';
      case 'negotiable':
        return 'Puwede pag-usapan (Negotiable)';
      default:
        return 'Service rate';
    }
  };

  const formatArrangement = (arr: string) => {
    switch (arr) {
      case 'customer-location':
        return {
          title: 'Home Service (Sa Iyong Bahay)',
          desc: 'Pupunta ang service provider sa inyong tirahan o lokasyon.',
          icon: Home,
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        };
      case 'provider-location':
        return {
          title: 'Sa Shop o Workshop ng Provider',
          desc: 'Dadalhin ang serbisyo sa shop, talyer, o tahanan ng provider.',
          icon: Building2,
          color: 'text-blue-700 bg-blue-50 border-blue-200',
        };
      case 'online':
        return {
          title: 'Online o Virtual Session',
          desc: 'Isasagawa sa pamamagitan ng video call o digital file transfer.',
          icon: Laptop,
          color: 'text-purple-700 bg-purple-50 border-purple-200',
        };
      default:
        return {
          title: 'Flexible (Home Service o Shop)',
          desc: 'Puwede sa bahay ng customer o sa workshop ayon sa mapagkasunduan.',
          icon: Home,
          color: 'text-amber-700 bg-amber-50 border-amber-200',
        };
    }
  };

  const arrangementInfo = formatArrangement(service.arrangement);
  const ArrangementIcon = arrangementInfo.icon;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    const contextItem = {
      type: 'service' as const,
      id: service.id,
      title: service.title,
      priceOrRate: `₱${service.rate.toLocaleString()} / ${service.rateUnit || 'serbisyo'}`,
      imageUrl: service.portfolioImages?.[0] || service.providerAvatarUrl,
    };

    const providerInfo = {
      id: service.providerId || `provider-${service.providerUsername}`,
      name: service.providerName,
      username: service.providerUsername,
      avatarUrl: service.providerAvatarUrl,
      isSenior: service.providerIsSenior,
    };

    const initialMsg = inquiryNotes.trim() || `Kumusta po ${service.providerName}! Nais ko po sanang magtanong tungkol sa inyong serbisyong "${service.title}".`;

    if (onOpenMessageProvider) {
      onClose();
      onOpenMessageProvider(providerInfo, contextItem, initialMsg);
    } else {
      getOrCreateConversation(providerInfo, initialMsg, contextItem);
      setInquirySent(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Sticky Header with Actions */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md text-slate-700 hover:text-[#4F28D9] flex items-center justify-center transition-transform hover:scale-105"
            title="I-share ang serbisyong ito"
          >
            <Share2 className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => toggleBookmarkService(service.id)}
            className={`w-10 h-10 rounded-full shadow-md backdrop-blur-md flex items-center justify-center transition-transform hover:scale-105 ${
              bookmarked
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 text-slate-700 hover:text-rose-500'
            }`}
            title={bookmarked ? 'Alisin sa naka-save' : 'I-save ang serbisyo'}
          >
            <Heart className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-transform hover:scale-105"
            title="Isara"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share toast notice */}
        {shareCopied && (
          <div className="absolute top-16 right-4 z-30 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg animate-in slide-in-from-top-2">
            Na-kopya ang link ng serbisyo!
          </div>
        )}

        <div className="max-h-[85vh] overflow-y-auto">
          {/* Main Visual Image Banner */}
          <div className="relative aspect-16/9 w-full bg-slate-100 overflow-hidden">
            <img
              src={images[selectedImageIndex] || images[0]}
              alt={service.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Badges on image */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#3B1376]/90 text-white shadow-sm border border-purple-300/30 backdrop-blur-sm">
                {categoryMeta?.name || 'Serbisyo'}
              </span>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 text-slate-800 text-xs font-bold shadow-sm">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{service.rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({service.reviewsCount} mga pagsusuri)</span>
              </div>
            </div>
          </div>

          {/* Gallery Thumbnails (if multiple images) */}
          {images.length > 1 && (
            <div className="flex gap-2 p-3 bg-slate-50 border-b border-slate-100 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-[#4F28D9] scale-105 shadow-xs'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Service Core Info */}
          <div className="p-5 sm:p-6 space-y-6">
            
            {/* Title & Pricing Card */}
            <div className="bg-gradient-to-br from-purple-50/70 to-indigo-50/50 p-4 sm:p-5 rounded-2xl border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#4F28D9] uppercase tracking-wider block mb-1">
                  Kabayaran / Service Rate
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#3B1376]">
                    ₱{service.rate.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-slate-600">
                    {service.rateUnit ? `/ ${service.rateUnit}` : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatPricingType(service.pricingType)}
                </p>
              </div>

              {/* Status pill */}
              <div className="flex items-center gap-2">
                {service.isAvailable ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Bukas at Tumatanggap ng Booking
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Pansamantalang Naka-pause
                  </span>
                )}
              </div>
            </div>

            {/* Service Title */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {service.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {service.providerLocation.city}, {service.providerLocation.province}
                  {service.providerLocation.barangay ? ` (${service.providerLocation.barangay})` : ''}
                </span>
                {service.experienceYears && (
                  <span className="flex items-center gap-1 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-700">
                    <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                    {service.experienceYears} taong karanasan sa trabaho
                  </span>
                )}
              </div>
            </div>

            {/* Arrangement Banner */}
            <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${arrangementInfo.color}`}>
              <ArrangementIcon className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide">
                  {arrangementInfo.title}
                </h4>
                <p className="text-xs mt-0.5 font-medium opacity-90">
                  {arrangementInfo.desc}
                </p>
              </div>
            </div>

            {/* Full Description */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Tungkol sa Serbisyo
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                {service.description}
              </p>
            </div>

            {/* Schedule & Coverage Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                  <Clock className="w-4 h-4 text-[#4F28D9]" />
                  Oras at Araw ng Serbisyong Bukas
                </div>
                <p className="text-xs text-slate-600 font-medium pl-6">
                  {service.availability || 'Makipag-ugnayan para sa iskedyul'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Lugar na Sinasakop (Coverage Area)
                </div>
                <p className="text-xs text-slate-600 font-medium pl-6">
                  {service.serviceArea || `${service.providerLocation?.city || 'Laguna'} at karatig lugar`}
                </p>
              </div>
            </div>

            {/* Provider Profile Card */}
            <div className="p-4 sm:p-5 rounded-2xl border border-purple-200/80 bg-gradient-to-r from-purple-50/50 to-white">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={service.providerAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={service.providerName}
                    className="w-13 h-13 rounded-full object-cover border-2 border-[#4F28D9] shadow-xs"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-base">
                        {service.providerName}
                      </h4>
                      {service.providerIsSenior && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          Senior ({service.providerAge} y/o)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      @{service.providerUsername}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-700 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Beripikadong Kasapi ng Komunidad ng KayaNatinTo
                    </div>
                  </div>
                </div>

                {onViewProviderProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onViewProviderProfile(service.providerUsername);
                    }}
                    className="text-xs font-bold text-[#4F28D9] hover:underline whitespace-nowrap pt-1"
                  >
                    Tingnan ang Profile
                  </button>
                )}
              </div>
            </div>

            {/* Direct Inquiry / Contact Section */}
            <div className="border-t border-slate-200 pt-5">
              {isOwner ? (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-purple-900">
                      Ito ang iyong sariling serbisyo
                    </h4>
                    <p className="text-xs text-purple-700">
                      Maaari mong baguhin ang presyo, iskedyul, at detalye anumang oras.
                    </p>
                  </div>
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEdit();
                      }}
                      className="px-4 py-2 bg-[#3B1376] hover:bg-[#4F28D9] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      I-edit ang Serbisyo
                    </button>
                  )}
                </div>
              ) : showInquiryForm ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
                  {inquirySent ? (
                    <div className="text-center py-4 space-y-2">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">
                        Matagumpay na Naipadala ang Tanong!
                      </h4>
                      <p className="text-xs text-slate-600 max-w-md mx-auto">
                        Natanggap ni <span className="font-semibold text-slate-800">{service.providerName}</span> ang iyong mensahe at magkakaroon ng abiso sa susunod na pag-login.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowInquiryForm(false);
                          setInquirySent(false);
                          setInquiryNotes('');
                        }}
                        className="mt-3 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl"
                      >
                        Bumalik sa Serbisyo
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSendInquiry} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-[#4F28D9]" />
                          Mag-iwan ng Mensahe kay {service.providerName}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowInquiryForm(false)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Kanselahin
                        </button>
                      </div>
                      <p className="text-xs text-slate-500">
                        Ilarawan ang kailangan mong tulong, nais na petsa, o mga tanong tungkol sa serbisyo.
                      </p>
                      <textarea
                        required
                        rows={3}
                        value={inquiryNotes}
                        onChange={(e) => setInquiryNotes(e.target.value)}
                        placeholder="Halimbawa: Kumusta po Nanay/Kuya! Magpapatanong po sana kung puwede po kayo sa darating na Sabado ng hapon para sa..."
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#4F28D9] focus:border-transparent bg-white resize-none"
                      />
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowInquiryForm(false)}
                          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
                        >
                          Kanselahin
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 text-xs font-bold text-white bg-[#3B1376] hover:bg-[#4F28D9] rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Ipadala ang Inquiry
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {onOpenCreateBooking && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenCreateBooking(service);
                      }}
                      className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-[#3B1376] hover:bg-[#2F106A] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-98"
                    >
                      <Calendar className="w-4 h-4 text-amber-300" />
                      <span>Mag-book ng Iskedyul / Humiling</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowInquiryForm(true)}
                    className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
                  >
                    <MessageSquare className="w-4 h-4 text-purple-700" />
                    <span>Mag-inquire sa Provider</span>
                  </button>
                </div>
              )}

              {/* Note on equal opportunity / Stage roadmap */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl text-center">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  ❤️ <strong>KayaNatinTo Pangako sa Komunidad:</strong> Walang komisyon o bayad sa gitna. Ang bawat kasapi ng komunidad—baguhan man o senior citizen—ay pantay-pantay ang pagkakataong madiskubre.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
