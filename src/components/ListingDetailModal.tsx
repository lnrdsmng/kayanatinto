import React, { useState } from 'react';
import {
  X,
  Star,
  MapPin,
  Clock,
  Truck,
  ShieldCheck,
  Share2,
  Heart,
  MessageCircle,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { ListingItem } from '../data/mockData';
import { ClippedMockupImage } from './ClippedMockupImage';
import { useMessaging } from '../context/MessagingContext';

interface ListingDetailModalProps {
  item: ListingItem | null;
  onClose: () => void;
  onOpenSellerProfile?: (sellerName: string) => void;
  onOpenMessageSeller?: (seller: any, contextItem: any) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  item,
  onClose,
  onOpenSellerProfile,
  onOpenMessageSeller,
}) => {
  const { getOrCreateConversation } = useMessaging();
  const [isLiked, setIsLiked] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="listing-title"
      >
        {/* Top Image Preview with Controls */}
        <div className="relative w-full h-60 sm:h-72 bg-slate-900 shrink-0">
          <ClippedMockupImage
            crop={item.imageCrop}
            alt={item.title}
            className="w-full h-full object-cover"
            fallbackGradient={item.fallbackGradient}
            fallbackIcon={item.fallbackIcon}
          />

          {/* Top buttons */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all active:scale-95"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2.5 rounded-full backdrop-blur-md transition-all active:scale-95 ${
                  isLiked
                    ? 'bg-rose-500 text-white'
                    : 'bg-black/40 hover:bg-black/60 text-white'
                }`}
                aria-label="Add to favorites"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: item.title,
                      text: `Check out ${item.title} on KayaNatinTo!`,
                      url: window.location.href,
                    }).catch(() => {});
                  }
                }}
                className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all active:scale-95"
                aria-label="Share listing"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Floating Category and Rating overlay */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-[#3B1376] shadow-sm uppercase tracking-wide">
              {item.category}
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{item.rating.toFixed(1)}</span>
              <span className="opacity-75">({item.reviewsCount})</span>
            </div>
          </div>
        </div>

        {/* Scrollable Details */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Title & Price */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 id="listing-title" className="text-xl sm:text-2xl font-bold font-display text-slate-900 leading-snug">
                {item.title}
              </h2>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#3B1376]">
                {item.price}
              </span>
              {item.priceNote && (
                <span className="text-xs sm:text-sm text-slate-500 font-medium">
                  {item.priceNote}
                </span>
              )}
            </div>
          </div>

          {/* Location & Response info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="font-semibold text-slate-800">{item.location}</span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Sumasagot: {item.responseTime}</span>
            </div>
          </div>

          {/* Seller Card */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-200 border-2 border-purple-300 flex items-center justify-center text-[#3B1376] font-bold text-lg shrink-0 overflow-hidden">
                <UserCheck className="w-6 h-6 text-[#3B1376]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 text-sm">{item.sellerName}</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active Creator" />
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-purple-900 font-medium">
                    {item.sellerAge >= 60 ? `Senior Creator (${item.sellerAge} y/o)` : `Adult Creator (${item.sellerAge} y/o)`}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-emerald-700 font-medium">Verified Community Seller</span>
                </div>
              </div>
            </div>
            {onOpenSellerProfile && (
              <button
                onClick={() => onOpenSellerProfile(item.sellerName)}
                className="px-3 py-1.5 rounded-xl bg-white text-xs font-semibold text-[#3B1376] border border-purple-200 hover:bg-purple-100 transition-colors shrink-0 shadow-sm"
              >
                Profile
              </button>
            )}
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Tungkol sa Alok
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Highlights */}
          {item.highlights && item.highlights.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Mga Katangian
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.highlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs text-slate-700 p-2 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery & Fulfillment Info */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-start gap-3 text-xs text-amber-950">
            <Truck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Delivery at Pagkuha</p>
              <p className="mt-0.5 text-amber-800">{item.deliveryInfo}</p>
            </div>
          </div>

          {/* Demo Notice Disclaimer */}
          <div className="p-3 rounded-xl bg-slate-100 text-[11px] text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              <strong>Demonstration Content:</strong> This sample listing showcases how community sellers and artisans present their goods on KayaNatinTo. Real transactions will launch upon full release.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={() => {
              const sellerUsername = item.sellerName.toLowerCase().replace(/[^a-z0-9]/g, '');
              const sellerInfo = {
                id: `seller-${sellerUsername}`,
                name: item.sellerName,
                username: sellerUsername,
                isSenior: item.sellerAge >= 60,
              };
              const contextItem = {
                type: 'product' as const,
                id: item.id,
                title: item.title,
                priceOrRate: item.price,
              };
              if (onOpenMessageSeller) {
                onClose();
                onOpenMessageSeller(sellerInfo, contextItem);
              } else {
                getOrCreateConversation(
                  sellerInfo,
                  `Kumusta po ${item.sellerName}! Nais ko po sanang magtanong tungkol sa "${item.title}" (${item.price}). Available pa po ba ito?`,
                  contextItem
                );
                setInquirySent(true);
                setTimeout(() => {
                  setInquirySent(false);
                  onClose();
                }, 1200);
              }
            }}
            disabled={inquirySent}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 ${
              inquirySent
                ? 'bg-emerald-600 text-white'
                : 'bg-[#3B1376] hover:bg-[#2F106A] text-white'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            {inquirySent ? 'Nai-send na sa Inbox!' : 'Makipag-ugnayan sa Seller'}
          </button>
        </div>
      </div>
    </div>
  );
};
