import React from 'react';
import { Heart, MapPin, Star, Clock, Home, Building2, Laptop, ArrowRight } from 'lucide-react';
import { Service, SERVICE_CATEGORIES } from '../types/service';
import { useServices } from '../context/ServiceContext';

interface ServiceCardProps {
  service: Service;
  onClick: () => void;
  showProviderActions?: boolean;
  onEdit?: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onClick,
  showProviderActions = false,
  onEdit,
}) => {
  const { isServiceBookmarked, toggleBookmarkService } = useServices();
  const bookmarked = isServiceBookmarked(service.id);

  const categoryMeta = SERVICE_CATEGORIES.find((c) => c.id === service.category);

  const formatPricingType = (type: string) => {
    switch (type) {
      case 'hourly':
        return '/ oras';
      case 'fixed':
        return 'fixed rate';
      case 'project':
        return '/ proyekto';
      case 'negotiable':
        return 'negotiable';
      default:
        return '';
    }
  };

  const formatArrangement = (arr: string) => {
    switch (arr) {
      case 'customer-location':
        return { label: 'Home Service', icon: Home, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'provider-location':
        return { label: 'Sa Shop / Bahay', icon: Building2, bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'online':
        return { label: 'Online / Virtual', icon: Laptop, bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'Flexible / Kahit Saan', icon: Home, bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
  };

  const arrangementInfo = formatArrangement(service.arrangement);
  const ArrangementIcon = arrangementInfo.icon;

  const displayImage =
    service.portfolioImages && service.portfolioImages.length > 0
      ? service.portfolioImages[0]
      : service.providerAvatarUrl || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80';

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer relative"
    >
      {/* Top Media / Thumbnail */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={displayImage}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Category Pill */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-white/95 shadow-xs border ${
              categoryMeta ? categoryMeta.borderClass : 'border-slate-200'
            } ${categoryMeta ? categoryMeta.colorClass : 'text-slate-700'}`}
          >
            {categoryMeta ? categoryMeta.tagalogName.split(' ')[0] : 'Serbisyo'}
          </span>
        </div>

        {/* Bookmark Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleBookmarkService(service.id);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            bookmarked
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white shadow-xs'
          }`}
          aria-label={bookmarked ? 'Alisin sa naka-save' : 'I-save ang serbisyo'}
        >
          <Heart className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
        </button>

        {/* Service Arrangement Tag on Image */}
        <div className="absolute bottom-2.5 left-2.5">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border backdrop-blur-md shadow-xs ${arrangementInfo.bg}`}
          >
            <ArrangementIcon className="w-3 h-3" />
            {arrangementInfo.label}
          </span>
        </div>

        {/* Availability Badge */}
        {!service.isAvailable && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-md">
              Pansamantalang Hindi Available
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rate & Pricing */}
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-[#3B1376]">
                ₱{service.rate.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {service.rateUnit ? `/ ${service.rateUnit}` : formatPricingType(service.pricingType)}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{service.rating.toFixed(1)}</span>
              <span className="text-slate-400">({service.reviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-[#4F28D9] transition-colors mb-2">
            {service.title}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-slate-600 line-clamp-2 mb-3">
            {service.description}
          </p>
        </div>

        {/* Provider Info & Location Footer */}
        <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-2">
          {/* Provider row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={service.providerAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={service.providerName}
                className="w-7 h-7 rounded-full object-cover border border-purple-200 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {service.providerName}
                  </span>
                  {service.providerIsSenior && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                      Senior ({service.providerAge})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Years of Experience */}
            {service.experienceYears && (
              <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
                {service.experienceYears} taong karanasan
              </span>
            )}
          </div>

          {/* Location row */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {service.providerLocation?.city || 'Laguna'}, {service.providerLocation?.province || 'Pilipinas'}
              </span>
            </div>

            <span className="text-[#4F28D9] font-medium text-xs flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Tingnan <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          {/* Provider management buttons if viewing own listing */}
          {showProviderActions && onEdit && (
            <div className="mt-2 pt-2 border-t border-dashed border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="px-3 py-1 text-xs font-semibold text-[#4F28D9] hover:bg-purple-50 rounded-lg transition-colors border border-purple-200"
              >
                I-edit ang Serbisyo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
