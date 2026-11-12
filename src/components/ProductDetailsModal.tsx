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
  Package,
  CheckCircle2,
  AlertTriangle,
  Info,
  UserCheck,
  Edit3,
  ShoppingBag,
} from 'lucide-react';
import { Product } from '../types/product';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { useMessaging } from '../context/MessagingContext';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenSellerProfile?: (usernameOrName: string) => void;
  onOpenEditProduct?: (product: Product) => void;
  onOpenCreateOrder?: (product: Product) => void;
  onOpenMessageSeller?: (
    seller: {
      id: string;
      name: string;
      username: string;
      avatarUrl?: string;
      isSenior?: boolean;
    },
    contextItem: {
      type: 'product';
      id: string;
      title: string;
      priceOrRate?: string;
      imageUrl?: string;
    }
  ) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onOpenSellerProfile,
  onOpenEditProduct,
  onOpenCreateOrder,
  onOpenMessageSeller,
}) => {
  const { isBookmarked, toggleBookmark } = useProducts();
  const { currentUser } = useAuth();
  const { getOrCreateConversation } = useMessaging();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [contactFeedback, setContactFeedback] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  if (!product) return null;

  const bookmarked = isBookmarked(product.id);
  const isOwner =
    currentUser &&
    (currentUser.id === product.sellerId ||
      currentUser.username.toLowerCase() === product.sellerUsername.toLowerCase());

  const handleContactSeller = () => {
    const contextItem = {
      type: 'product' as const,
      id: product.id,
      title: product.title,
      priceOrRate: `₱${product.price.toLocaleString()}`,
      imageUrl: product.images[0],
    };

    const sellerInfo = {
      id: product.sellerId || `seller-${product.sellerUsername}`,
      name: product.sellerName,
      username: product.sellerUsername,
      avatarUrl: product.sellerAvatarUrl,
      isSenior: product.sellerIsSenior,
    };

    if (onOpenMessageSeller) {
      onClose();
      onOpenMessageSeller(sellerInfo, contextItem);
    } else {
      getOrCreateConversation(
        sellerInfo,
        `Kumusta po ${product.sellerName}! Nais ko po sanang magtanong tungkol sa "${product.title}" (₱${product.price.toLocaleString()}). Available pa po ba ito?`,
        contextItem
      );
      onClose();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product.title,
          text: `Silipin ang ${product.title} sa KayaNatinTo!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2500);
    }
  };

  const activePhoto =
    product.images[activeImageIndex] ||
    product.images[0] ||
    './assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png';

  const conditionLabels: Record<string, string> = {
    handcrafted: 'Gawang-Kamay (Handcrafted)',
    'brand-new': 'Bago (Brand New)',
    'made-to-order': 'Ginagawa sa Order (Made-to-Order)',
    'pre-owned': 'Pre-owned / Nagamit na',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[94vh] flex flex-col text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-details-title"
      >
        {/* Main Photo Gallery */}
        <div className="relative w-full h-64 sm:h-76 bg-slate-900 shrink-0 overflow-hidden">
          <img
            src={activePhoto}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                './assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png';
            }}
          />

          {/* Top Bar Actions */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              aria-label="Isara"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleBookmark(product.id)}
                className={`p-2.5 rounded-full backdrop-blur-md transition-all active:scale-95 cursor-pointer ${
                  bookmarked
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'bg-black/50 hover:bg-black/70 text-white'
                }`}
                title={bookmarked ? 'Alisin sa naka-save' : 'I-save ang produkto'}
              >
                <Heart className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                aria-label="I-share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bottom Badges Overlay */}
          <div className="absolute bottom-3 inset-x-4 flex items-center justify-between pointer-events-none">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-[#3B1376] shadow-sm uppercase tracking-wide">
              {conditionLabels[product.condition] || 'Handcrafted'}
            </span>

            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-white/70 font-normal">({product.reviewsCount})</span>
            </div>
          </div>
        </div>

        {/* Thumbnail Bar (if multiple photos) */}
        {product.images.length > 1 && (
          <div className="px-4 py-2 bg-slate-100 flex items-center gap-2 overflow-x-auto shrink-0">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  activeImageIndex === idx ? 'border-[#3B1376] scale-105' : 'border-transparent opacity-70'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Scrollable Details Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {shareFeedback && (
            <div className="p-2.5 bg-purple-50 border border-purple-200 text-[#3B1376] text-xs rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              <span>Nai-kopya na ang link para maibahagi sa iyong mga kaibigan!</span>
            </div>
          )}

          {/* Title & Price Header */}
          <div>
            <h1
              id="product-details-title"
              className="text-xl sm:text-2xl font-bold font-display text-slate-900 leading-snug"
            >
              {product.title}
            </h1>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#3B1376]">
                ₱{product.price.toLocaleString()}
              </span>
              {product.priceUnit && (
                <span className="text-xs sm:text-sm text-slate-500 font-medium">
                  / {product.priceUnit}
                </span>
              )}
            </div>

            {/* Stock Availability */}
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold ${
                  product.stock > 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {product.stock > 0 ? `May ${product.stock} pirasong available` : 'Sold Out / Ubos na'}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 capitalize">{product.category}</span>
            </div>
          </div>

          {/* Perishable Food Advisory (if applicable) */}
          {product.deliveryOptions.isPerishableFood && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">
                  Perishable Food Notice (Lokal na Transaksyon Lamang)
                </p>
                <p className="mt-0.5 text-amber-800 leading-relaxed text-[11px]">
                  Ang pagkaing ito ay sariwang niluluto. Para sa kaligtasan at sarap, eksklusibo itong ibinibigay para sa pickup o lokal na hatid sa loob ng bayan o kalapit na munisipalidad.
                </p>
              </div>
            </div>
          )}

          {/* Seller Card */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-200 border-2 border-purple-300 flex items-center justify-center overflow-hidden shrink-0">
                {product.sellerAvatarUrl ? (
                  <img
                    src={product.sellerAvatarUrl}
                    alt={product.sellerName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-[#3B1376] text-base">
                    {product.sellerName.charAt(0)}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {product.sellerName}
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active Seller" />
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs">
                  <span className="text-purple-900 font-semibold">
                    {product.sellerIsSenior
                      ? `Senior Seller (${product.sellerAge} y/o)`
                      : 'Komunidad Seller'}
                  </span>
                  <span className="text-slate-300">·</span>
                  <div className="flex items-center gap-0.5 text-slate-500">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    <span>{product.sellerLocation?.city || 'Laguna'}, {product.sellerLocation?.province || 'Pilipinas'}</span>
                  </div>
                </div>
              </div>
            </div>

            {onOpenSellerProfile && (
              <button
                onClick={() => onOpenSellerProfile(product.sellerUsername || product.sellerName)}
                className="px-3 py-1.5 rounded-xl bg-white text-xs font-semibold text-[#3B1376] border border-purple-200 hover:bg-purple-100 transition-colors shrink-0 shadow-2xs"
              >
                Profile
              </button>
            )}
          </div>

          {/* Product Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Deskripsyon ng Produkto
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/60 p-3.5 rounded-2xl border border-slate-100">
              {product.description}
            </p>
          </div>

          {/* Delivery & Pickup Terms (Stage 3 Requirement) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#3B1376]" />
              <span>Paraan ng Pagkuha at Paghahatid (Local Terms)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Pickup Option */}
              <div
                className={`p-3 rounded-2xl border ${
                  product.deliveryOptions.allowPickup
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-slate-50/40 border-slate-100 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Package className="w-3.5 h-3.5 text-amber-600" />
                  <span>Buyer Pickup</span>
                </div>
                {product.deliveryOptions?.allowPickup ? (
                  <p className="text-[11px] text-slate-600">
                    Maaaring kunin sa:{' '}
                    <strong>{product.deliveryOptions?.pickupLocation || product.sellerLocation?.city || 'Laguna'}</strong>
                  </p>
                ) : (
                  <p className="text-[11px]">Hindi available ang pickup para rito.</p>
                )}
              </div>

              {/* Seller Delivery Option */}
              <div
                className={`p-3 rounded-2xl border ${
                  product.deliveryOptions?.allowSellerDelivery
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-slate-50/40 border-slate-100 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Truck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Hatid ng Seller</span>
                </div>
                {product.deliveryOptions?.allowSellerDelivery ? (
                  <p className="text-[11px] text-slate-600">
                    Saklaw:{' '}
                    <strong>{product.deliveryOptions?.deliveryArea || product.sellerLocation?.city || 'Laguna'}</strong>
                    {product.deliveryOptions?.deliveryFee ? ` (Fee: ₱${product.deliveryOptions.deliveryFee})` : ' (Libre o napagkasunduan)'}
                  </p>
                ) : (
                  <p className="text-[11px]">Walang delivery service; kailangang i-pickup.</p>
                )}
              </div>
            </div>

            {/* Delivery Limitation Notes */}
            {product.deliveryOptions.deliveryLimitations && (
              <p className="text-[11px] text-slate-500 italic px-1">
                Paalala mula sa seller: "{product.deliveryOptions.deliveryLimitations}"
              </p>
            )}

            {/* Transparent Community Delivery Rule Disclaimer */}
            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-[11px] text-purple-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
              <span>
                <strong>Patakaran ng Komunidad:</strong> Ang paghahatid o pickup ay direktang inaayos sa pagitan ng mamimili at nagbebenta. Ang KayaNatinTo ay hindi courier service, upang mapanatiling abot-kaya at direktang makinabang ang ating mga lokal na artisan at nanay.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2.5">
          {isOwner && onOpenEditProduct ? (
            <button
              onClick={() => {
                onClose();
                onOpenEditProduct(product);
              }}
              className="w-full py-3 px-4 rounded-xl bg-purple-100 hover:bg-purple-200 text-[#3B1376] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
              <span>I-edit ang Aking Listing</span>
            </button>
          ) : (
            <>
              {onOpenCreateOrder && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenCreateOrder(product);
                  }}
                  disabled={product.stock <= 0 || !product.isAvailable}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 bg-[#3B1376] hover:bg-[#2F106A] disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-300" />
                  <span>
                    {product.stock <= 0 || !product.isAvailable
                      ? 'Out of Stock / Hindi Available'
                      : `Bumili / Mag-order Ngayon (₱${product.price.toLocaleString()})`}
                  </span>
                </button>
              )}

              <button
                onClick={handleContactSeller}
                className={`w-full sm:w-auto py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border active:scale-95 ${
                  contactFeedback
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                }`}
              >
                <MessageCircle className="w-4 h-4 text-purple-700" />
                <span>Mag-chat sa Seller</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
