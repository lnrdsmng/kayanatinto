import React from 'react';
import {
  MapPin,
  Star,
  Heart,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Package,
} from 'lucide-react';
import { Product } from '../types/product';
import { useProducts } from '../context/ProductContext';
import { ClippedMockupImage } from './ClippedMockupImage';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  className = '',
}) => {
  const { isBookmarked, toggleBookmark } = useProducts();
  const bookmarked = isBookmarked(product.id);

  // Map product categories to display styling
  const categoryStyles: Record<string, { bg: string; text: string; label: string }> = {
    food: { bg: 'bg-amber-100', text: 'text-amber-900', label: 'Pagkain' },
    clothing: { bg: 'bg-rose-100', text: 'text-rose-900', label: 'Kasuotan' },
    'arts-crafts': { bg: 'bg-purple-100', text: 'text-purple-900', label: 'Sining & Likha' },
    beauty: { bg: 'bg-pink-100', text: 'text-pink-900', label: 'Kalusugan' },
    'home-living': { bg: 'bg-emerald-100', text: 'text-emerald-900', label: 'Gamit Bahay' },
    electronics: { bg: 'bg-blue-100', text: 'text-blue-900', label: 'Elektroniko' },
    'plants-gardening': { bg: 'bg-green-100', text: 'text-green-900', label: 'Halaman' },
    other: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Iba Pa' },
  };

  const catStyle = categoryStyles[product.category] || categoryStyles.other;

  // Use primary image or fallback crop
  const imageSource = product.images[0] || '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png';

  const isPerishable = product.deliveryOptions.isPerishableFood;
  const isOutOfStock = product.stock <= 0 || !product.isAvailable;

  return (
    <div
      onClick={() => onSelect(product)}
      className={`group bg-white rounded-3xl overflow-hidden border border-slate-200/90 hover:border-purple-300 shadow-2xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col text-left justify-between ${className}`}
    >
      <div>
        {/* Photo Container */}
        <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
          {imageSource.startsWith('/assets/') ? (
            <img
              src={imageSource}
              alt={product.title}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                isOutOfStock ? 'opacity-60 grayscale-[30%]' : ''
              }`}
            />
          ) : (
            <img
              src={imageSource}
              alt={product.title}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                isOutOfStock ? 'opacity-60 grayscale-[30%]' : ''
              }`}
              onError={(e) => {
                // Graceful fallback
                (e.target as HTMLImageElement).src = '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png';
              }}
            />
          )}

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(product.id);
            }}
            className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all active:scale-90 z-10"
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark product'}
            title={bookmarked ? 'Nai-save na' : 'I-save ang produkto'}
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                bookmarked ? 'fill-rose-500 text-rose-500' : 'text-white'
              }`}
            />
          </button>

          {/* Category Tag Overlay */}
          <div className="absolute bottom-2 left-2 pointer-events-none">
            <span
              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${catStyle.bg} ${catStyle.text} backdrop-blur-xs shadow-2xs`}
            >
              {catStyle.label}
            </span>
          </div>

          {/* Perishable Food Badge */}
          {isPerishable && (
            <div className="absolute top-2.5 left-2.5 pointer-events-none">
              <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-amber-500/90 text-white backdrop-blur-xs shadow-2xs flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                <span>Sariwa / Lokal</span>
              </span>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center pointer-events-none">
              <span className="px-3 py-1 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md uppercase tracking-wider">
                Sold Out / Hindi Available
              </span>
            </div>
          )}
        </div>

        {/* Details Body */}
        <div className="p-3.5 sm:p-4 space-y-2">
          {/* Title */}
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#3B1376] transition-colors line-clamp-1 leading-snug">
            {product.title}
          </h3>

          {/* Price & Unit */}
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-extrabold text-[#3B1376]">
              ₱{product.price.toLocaleString()}
            </span>
            {product.priceUnit && (
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
                / {product.priceUnit}
              </span>
            )}
          </div>

          {/* Rating, Reviews & Stock */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <div className="flex items-center gap-1 font-semibold text-slate-700">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({product.reviewsCount})</span>
            </div>

            <span
              className={`text-[10px] font-semibold px-2 py-0.2 rounded-md ${
                product.stock > 5
                  ? 'bg-slate-100 text-slate-600'
                  : product.stock > 0
                  ? 'bg-amber-50 text-amber-800'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {product.stock > 0 ? `${product.stock} available` : 'Walang stock'}
            </span>
          </div>

          {/* Local Delivery & Pickup terms */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
            <Truck className="w-3 h-3 text-[#3B1376] shrink-0" />
            <span className="truncate">
              {product.deliveryOptions.allowPickup && product.deliveryOptions.allowSellerDelivery
                ? 'Pickup o Hatid ng Seller'
                : product.deliveryOptions.allowPickup
                ? 'Pickup lamang'
                : 'Hatid ng Seller'}
            </span>
          </div>
        </div>
      </div>

      {/* Seller & Location Footer */}
      <div className="px-3.5 pb-3.5 pt-0">
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-1 truncate max-w-[65%]">
            <span className="font-semibold truncate">{product.sellerName}</span>
          </div>
          <div className="flex items-center gap-0.5 text-slate-400 shrink-0">
            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
            <span className="truncate text-[10px]">{product.sellerLocation?.city || 'Laguna'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
