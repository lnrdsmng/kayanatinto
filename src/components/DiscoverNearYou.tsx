import React from 'react';
import { MapPin, Eye } from 'lucide-react';
import { ListingItem } from '../data/mockData';

interface DiscoverNearYouProps {
  listings: ListingItem[];
  onSelectListing: (listing: ListingItem) => void;
  activeFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
  onNavigateMarketplace?: () => void;
}

export const DiscoverNearYou: React.FC<DiscoverNearYouProps> = ({
  listings,
  onSelectListing,
  onNavigateMarketplace,
}) => {
  return (
    <section className="py-8 px-4 sm:px-6 max-w-4xl mx-auto text-left" aria-labelledby="listings-heading">
      {/* Header Pill & Heading */}
      <div className="mb-6 space-y-2">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FEF3C7] text-[#D97706] font-bold text-xs shadow-2xs">
          <MapPin className="w-3.5 h-3.5" />
          <span>Discover Near You</span>
        </span>

        <h2 id="listings-heading" className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
          Listings from your community
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed">
          Sample products and services from local sellers and providers. This is demonstration content for showcase purposes.
        </p>

        {onNavigateMarketplace && (
          <div className="pt-2">
            <button
              onClick={onNavigateMarketplace}
              className="px-5 py-2.5 rounded-xl border border-purple-200 text-[#6D28D9] hover:bg-purple-50 font-bold text-xs transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>
        )}
      </div>

      {/* Grid of Listings */}
      <div className="space-y-6">
        {listings.slice(0, 4).map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectListing(item)}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 hover:border-purple-300 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            {/* Image Header with Type Badge & Price Tag */}
            <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-slate-900">
              <img
                src={item.image || item.imageCrop?.src || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

              {/* Category Pill Badge: Top Left */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md text-[#6D28D9] font-bold text-xs shadow-xs capitalize">
                  {item.category === 'products' ? 'Products' : item.category === 'services' ? 'Services' : 'Talents'}
                </span>
              </div>

              {/* Price Tag: Bottom Right in Solid Purple */}
              {item.price && (
                <div className="absolute bottom-4 right-4">
                  <span className="px-3.5 py-1.5 rounded-xl bg-[#6D28D9] text-white font-black text-sm shadow-md">
                    {item.price}
                  </span>
                </div>
              )}
            </div>

            {/* Content Details */}
            <div className="p-5 sm:p-6 space-y-3">
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 group-hover:text-[#6D28D9] transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-[#6D28D9] mt-0.5">
                  {item.sellerName}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.location}</span>
                </p>
              </div>

              {/* View Details Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectListing(item);
                }}
                className="w-full py-3 px-4 rounded-2xl border border-purple-200 hover:border-purple-400 bg-white hover:bg-purple-50/70 text-[#6D28D9] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-2xs"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
