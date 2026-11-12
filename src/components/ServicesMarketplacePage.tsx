import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Plus,
  Sparkles,
  MapPin,
  Clock,
  Heart,
  ChevronDown,
  Wrench,
  Sparkle,
  GraduationCap,
  HeartHandshake,
  Utensils,
  Palette,
  Camera,
  Bike,
  Briefcase,
  Users,
  CheckCircle2,
  AlertCircle,
  Home,
  Laptop
} from 'lucide-react';
import { Service, ServiceCategory, SERVICE_CATEGORIES } from '../types/service';
import { useServices } from '../context/ServiceContext';
import { useAuth } from '../context/AuthContext';
import { ServiceCard } from './ServiceCard';
import { ServiceDetailsModal } from './ServiceDetailsModal';
import { CreateServiceModal } from './CreateServiceModal';
import { EditServiceModal } from './EditServiceModal';

interface ServicesMarketplacePageProps {
  onNavigateHome: () => void;
  onNavigateProducts: () => void;
  onNavigateProfile: (username?: string) => void;
  onRequireAuth: () => void;
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

export const ServicesMarketplacePage: React.FC<ServicesMarketplacePageProps> = ({
  onNavigateHome,
  onNavigateProducts,
  onNavigateProfile,
  onRequireAuth,
  onOpenMessageProvider,
}) => {
  const { services, bookmarkedServiceIds } = useServices();
  const { currentUser } = useAuth();

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedArrangement, setSelectedArrangement] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under300' | '300to700' | 'above700'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);
  const [showOnlySeniors, setShowOnlySeniors] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Modal States
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Extract unique locations from services
  const availableLocations = useMemo(() => {
    const locSet = new Set<string>();
    services.forEach((s) => {
      if (s.providerLocation.city) {
        locSet.add(s.providerLocation.city);
      }
    });
    return Array.from(locSet).sort();
  }, [services]);

  // Filtered & Sorted Services
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = srv.title.toLowerCase().includes(query);
        const matchDesc = srv.description.toLowerCase().includes(query);
        const matchProvider = srv.providerName.toLowerCase().includes(query);
        const matchLocation = srv.providerLocation.city.toLowerCase().includes(query);
        const matchArea = srv.serviceArea.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchProvider && !matchLocation && !matchArea) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'all' && srv.category !== selectedCategory) {
        return false;
      }

      // Location
      if (selectedLocation !== 'all' && srv.providerLocation.city.toLowerCase() !== selectedLocation.toLowerCase()) {
        return false;
      }

      // Arrangement
      if (selectedArrangement !== 'all' && srv.arrangement !== selectedArrangement) {
        return false;
      }

      // Price filter
      if (priceFilter === 'under300' && srv.rate > 300) return false;
      if (priceFilter === '300to700' && (srv.rate < 300 || srv.rate > 700)) return false;
      if (priceFilter === 'above700' && srv.rate < 700) return false;

      // Available only
      if (showOnlyAvailable && !srv.isAvailable) return false;

      // Bookmarks only
      if (showOnlyBookmarks && !bookmarkedServiceIds.includes(srv.id)) return false;

      // Seniors only
      if (showOnlySeniors && !srv.providerIsSenior) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') {
        return a.rate - b.rate;
      }
      if (sortBy === 'price-desc') {
        return b.rate - a.rate;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      // 'newest' default (equal discovery without follower discrimination)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    services,
    searchQuery,
    selectedCategory,
    selectedLocation,
    selectedArrangement,
    priceFilter,
    sortBy,
    showOnlyAvailable,
    showOnlyBookmarks,
    showOnlySeniors,
    bookmarkedServiceIds,
  ]);

  // Featured Services section (high quality community talents)
  const featuredServices = useMemo(() => {
    return services.filter((s) => s.isFeatured && s.isAvailable).slice(0, 4);
  }, [services]);

  // Near You Services (using currentUser's city or default 'Majayjay')
  const userCity = currentUser?.location?.city || 'Majayjay';
  const nearYouServices = useMemo(() => {
    return services.filter((s) => s.isAvailable && s.providerLocation.city.toLowerCase() === userCity.toLowerCase());
  }, [services, userCity]);

  // Active filter count
  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedLocation !== 'all' ? 1 : 0) +
    (selectedArrangement !== 'all' ? 1 : 0) +
    (priceFilter !== 'all' ? 1 : 0) +
    (showOnlyBookmarks ? 1 : 0) +
    (showOnlySeniors ? 1 : 0) +
    (!showOnlyAvailable ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSelectedArrangement('all');
    setPriceFilter('all');
    setSortBy('newest');
    setShowOnlyAvailable(true);
    setShowOnlyBookmarks(false);
    setShowOnlySeniors(false);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wrench':
        return Wrench;
      case 'Sparkles':
        return Sparkle;
      case 'GraduationCap':
        return GraduationCap;
      case 'HeartHandshake':
        return HeartHandshake;
      case 'Utensils':
        return Utensils;
      case 'Palette':
        return Palette;
      case 'Camera':
        return Camera;
      case 'Bike':
        return Bike;
      case 'Briefcase':
        return Briefcase;
      default:
        return Users;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24">
      
      {/* Top Banner / Hero Header */}
      <div className="bg-gradient-to-r from-[#3B1376] via-[#4F28D9] to-[#2B0E5A] text-white pt-8 pb-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-300/30">
                <Sparkles className="w-3.5 h-3.5" />
                Pantay na Pagkakataon Para sa Bawat Kasanayan
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                Pamilihan ng Serbisyo at Talento
              </h1>
              <p className="text-sm sm:text-base text-purple-200 mt-1 max-w-2xl">
                Tuklasin ang galing ng ating mga kapitbahay—mula sa tradisyunal na pagtatahi, pagkukumpuni, hanggang sa pagtuturo at musika.
              </p>
            </div>

            {/* Offer a service CTA */}
            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  onRequireAuth();
                } else {
                  setIsCreateModalOpen(true);
                }
              }}
              className="self-start sm:self-center px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#3B1376] font-extrabold text-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 shrink-0"
            >
              <Plus className="w-5 h-5" />
              Mag-alok ng Serbisyo
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-3xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5 text-purple-300" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Maghanap ng kasanayan, serbisyo, guro, karpintero, o pangalan ng provider..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base shadow-lg focus:outline-hidden focus:ring-3 focus:ring-amber-400/80 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Sub-tabs: Products vs Services */}
          <div className="flex items-center gap-2 mt-4 pt-2 overflow-x-auto text-xs">
            <span className="text-purple-200 font-medium">Bumalik o lumipat sa:</span>
            <button
              type="button"
              onClick={onNavigateProducts}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
            >
              📦 Pamilihan ng Produkto
            </button>
            <button
              type="button"
              onClick={onNavigateHome}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
            >
              🏠 Tahanan (Homepage)
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Category Carousel / Shortcuts */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Mga Kategorya ng Serbisyo
            </h2>
            {selectedCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="text-xs font-semibold text-[#4F28D9] hover:underline"
              >
                Ipakita Lahat
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {/* All Category Pill */}
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-[#3B1376] text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-purple-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Lahat ({services.length})
            </button>

            {/* 10 Category Chips */}
            {SERVICE_CATEGORIES.map((cat) => {
              const Icon = getCategoryIcon(cat.iconName);
              const isSelected = selectedCategory === cat.id;
              const count = services.filter((s) => s.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 border ${
                    isSelected
                      ? 'bg-[#3B1376] text-white border-[#3B1376] shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : cat.colorClass}`} />
                  <span>{cat.tagalogName.split(' ')[0]}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter & Sort Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 mb-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Left Quick Filters Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                  activeFiltersCount > 0
                    ? 'bg-purple-50 border-[#4F28D9] text-[#3B1376]'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Mga Filter
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#4F28D9] text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Senior filter toggle */}
              <button
                type="button"
                onClick={() => setShowOnlySeniors(!showOnlySeniors)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-colors ${
                  showOnlySeniors
                    ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                👴 Senior Providers (60+)
              </button>

              {/* Bookmarks toggle */}
              <button
                type="button"
                onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-colors ${
                  showOnlyBookmarks
                    ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${showOnlyBookmarks ? 'fill-current' : ''}`} />
                Naka-save ({bookmarkedServiceIds.length})
              </button>

              {/* Reset link if filters applied */}
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-rose-600 hover:underline font-medium px-2 py-1"
                >
                  I-reset lahat
                </button>
              )}
            </div>

            {/* Right Sorting Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Ayusin ayon sa:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-semibold p-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#4F28D9]"
              >
                <option value="newest">✨ Pinakabago (Pantay na Pagkakataon)</option>
                <option value="price-asc">Presyo: Mababa hanggang Mataas</option>
                <option value="price-desc">Presyo: Mataas hanggang Mababa</option>
                <option value="rating">Pinakamataas na Marka</option>
              </select>
            </div>

          </div>

          {/* Expanded Filter Panel */}
          {showMobileFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              
              {/* Location filter */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bayan o Lungsod
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="all">Lahat ng Bayan</option>
                  {availableLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Arrangement */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Saan Isasagawa ang Serbisyo
                </label>
                <select
                  value={selectedArrangement}
                  onChange={(e) => setSelectedArrangement(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="all">Kahit saan / Lahat ng uri</option>
                  <option value="customer-location">Home Service (Sa bahay ng customer)</option>
                  <option value="provider-location">Sa Shop o Workshop ng provider</option>
                  <option value="online">Online o Virtual</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              {/* Price bracket */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Presyo o Rate
                </label>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="all">Lahat ng Presyo</option>
                  <option value="under300">₱300 pababa (Abot-kaya)</option>
                  <option value="300to700">₱300 hanggang ₱700</option>
                  <option value="above700">₱700 pataas</option>
                </select>
              </div>

            </div>
          )}
        </div>

        {/* Featured Section (when no search query or filters applied) */}
        {!searchQuery && selectedCategory === 'all' && activeFiltersCount === 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Mga Natatanging Kasanayan sa Komunidad
                </h3>
                <p className="text-xs text-slate-500">
                  Kilalanin ang mga maaasahang service provider sa ating pamayanan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredServices.map((srv) => (
                <ServiceCard
                  key={srv.id}
                  service={srv}
                  onClick={() => setActiveService(srv)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Near You Section (if applicable and matching user's town) */}
        {!searchQuery && selectedCategory === 'all' && nearYouServices.length > 0 && activeFiltersCount === 0 && (
          <div className="mb-10 p-5 rounded-3xl bg-purple-50/50 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#4F28D9]" />
                  Mga Serbisyo Malapit sa Iyo ({userCity})
                </h3>
                <p className="text-xs text-slate-600">
                  Madaling ma-contact at mabilis puntahan sa iyong lugar.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearYouServices.slice(0, 3).map((srv) => (
                <ServiceCard
                  key={srv.id}
                  service={srv}
                  onClick={() => setActiveService(srv)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All / Filtered Results Grid Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {searchQuery
                ? `Mga Resulta para sa "${searchQuery}"`
                : selectedCategory !== 'all'
                ? `Mga Serbisyo sa ${SERVICE_CATEGORIES.find((c) => c.id === selectedCategory)?.name}`
                : 'Lahat ng Serbisyo at Kasanayan'}
            </h3>
            <p className="text-xs text-slate-500">
              {filteredServices.length} {filteredServices.length === 1 ? 'serbisyo' : 'mga serbisyong'} natagpuan
            </p>
          </div>
        </div>

        {/* Results Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredServices.map((srv) => (
              <ServiceCard
                key={srv.id}
                service={srv}
                onClick={() => setActiveService(srv)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
            <div className="w-16 h-16 bg-purple-100 text-[#4F28D9] rounded-2xl flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Walang Serbisyong Tugma sa Iyong Hinahanap
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Subukang baguhin ang mga filter o maghanap ng ibang salita tulad ng "karpintero", "guro", o "tahi".
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={resetFilters}
                className="px-5 py-2.5 bg-[#3B1376] hover:bg-[#4F28D9] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                I-clear ang Lahat ng Filter
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Floating Offer Service Mobile Action */}
      <div className="sm:hidden fixed bottom-18 right-4 z-40">
        <button
          type="button"
          onClick={() => {
            if (!currentUser) {
              onRequireAuth();
            } else {
              setIsCreateModalOpen(true);
            }
          }}
          className="px-4 py-3 rounded-full bg-[#3B1376] text-white font-bold text-xs shadow-xl flex items-center gap-2 border-2 border-amber-300"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          Mag-alok ng Serbisyo
        </button>
      </div>

      {/* Modals */}
      {activeService && (
        <ServiceDetailsModal
          service={activeService}
          isOpen={!!activeService}
          onClose={() => setActiveService(null)}
          onEdit={() => {
            setEditingService(activeService);
            setActiveService(null);
          }}
          onViewProviderProfile={(username) => {
            setActiveService(null);
            onNavigateProfile(username);
          }}
          onOpenMessageProvider={onOpenMessageProvider}
        />
      )}

      {editingService && (
        <EditServiceModal
          service={editingService}
          isOpen={!!editingService}
          onClose={() => setEditingService(null)}
          onSuccess={() => setEditingService(null)}
        />
      )}

      {isCreateModalOpen && (
        <CreateServiceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(created) => {
            setIsCreateModalOpen(false);
            setActiveService(created);
          }}
          onRequireAuth={onRequireAuth}
        />
      )}

    </div>
  );
};
