import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Sparkles,
  ArrowUpDown,
  Plus,
  Package,
  Truck,
  Heart,
  Clock,
  Filter,
  X,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { Product, ProductCategory, PRODUCT_CATEGORIES } from '../types/product';
import { ProductCard } from './ProductCard';
import { KayaNatinLogo } from './KayaNatinLogo';

interface MarketplacePageProps {
  onSelectProduct: (product: Product) => void;
  onOpenCreateProduct: () => void;
  onNavigateHome: () => void;
  initialCategory?: ProductCategory | null;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  onSelectProduct,
  onOpenCreateProduct,
  onNavigateHome,
  initialCategory = null,
}) => {
  const { products, bookmarkedProductIds } = useProducts();
  const { currentUser } = useAuth();

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>(
    initialCategory || 'all'
  );
  const [priceFilter, setPriceFilter] = useState<'all' | 'under100' | '100to250' | '250to500' | 'above500'>('all');
  const [locationFilter, setLocationFilter] = useState<'all' | 'Majayjay' | 'San Pablo' | 'Pila' | 'Luisiana' | 'Quezon City'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [perishableOnly, setPerishableOnly] = useState(false);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Available Locations extracted from active products
  const availableLocations = useMemo(() => {
    const locSet = new Set<string>();
    products.forEach((p) => {
      if (p.sellerLocation?.city) locSet.add(p.sellerLocation.city);
    });
    return Array.from(locSet);
  }, [products]);

  // Main Filter Logic (Equal discovery - not dependent on follower counts!)
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesSeller = item.sellerName.toLowerCase().includes(q);
        const matchesCity = item.sellerLocation.city.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesSeller && !matchesCity) {
          return false;
        }
      }

      // 2. Category
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // 3. Price Filter
      if (priceFilter === 'under100' && item.price >= 100) return false;
      if (priceFilter === '100to250' && (item.price < 100 || item.price > 250)) return false;
      if (priceFilter === '250to500' && (item.price < 250 || item.price > 500)) return false;
      if (priceFilter === 'above500' && item.price <= 500) return false;

      // 4. Location Filter
      if (locationFilter !== 'all' && item.sellerLocation.city !== locationFilter) {
        return false;
      }

      // 5. Available Only
      if (availableOnly && (!item.isAvailable || item.stock <= 0)) {
        return false;
      }

      // 6. Perishable Food Only
      if (perishableOnly && !item.deliveryOptions.isPerishableFood) {
        return false;
      }

      // 7. Bookmarks Only
      if (showBookmarksOnly && !bookmarkedProductIds.includes(item.id)) {
        return false;
      }

      return true;
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    priceFilter,
    locationFilter,
    availableOnly,
    perishableOnly,
    showBookmarksOnly,
    bookmarkedProductIds,
  ]);

  // Sorting Logic
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'newest':
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating);
      default:
        return list;
    }
  }, [filteredProducts, sortBy]);

  // Featured Products (equal discovery spotlight)
  const featuredProducts = useMemo(() => {
    return products.filter((p) => p.isFeatured && p.isAvailable);
  }, [products]);

  // Products Near User (if user location is set, otherwise default Laguna)
  const nearUserProducts = useMemo(() => {
    const userCity = currentUser?.location?.city || 'Majayjay';
    return products.filter(
      (p) => p.sellerLocation.city.toLowerCase() === userCity.toLowerCase() || p.sellerLocation.province === 'Laguna'
    );
  }, [products, currentUser]);

  // Recently added products (Newest 4)
  const recentlyAddedProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [products]);

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (priceFilter !== 'all' ? 1 : 0) +
    (locationFilter !== 'all' ? 1 : 0) +
    (availableOnly ? 1 : 0) +
    (perishableOnly ? 1 : 0) +
    (showBookmarksOnly ? 1 : 0);

  const resetFilters = () => {
    setSelectedCategory('all');
    setPriceFilter('all');
    setLocationFilter('all');
    setAvailableOnly(false);
    setPerishableOnly(false);
    setShowBookmarksOnly(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 text-left text-slate-800">
      {/* Top Marketplace Header Banner */}
      <section className="bg-gradient-to-r from-[#2F106A] via-[#3B1376] to-[#4F28D9] text-white pt-6 pb-8 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-purple-950 uppercase tracking-wide">
                Lokal na Pamilihan
              </span>
              <span className="text-xs text-purple-200">Stage 3 Marketplace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight">
              Pamilihan ng <span className="text-amber-400">KayaNatinTo</span>
            </h1>
            <p className="text-xs sm:text-sm text-purple-100 max-w-xl mt-1 leading-relaxed">
              Tuklasin ang mga sariling gawang-kamay, lutong kakanin, at lokal na ani. Dito, hindi kailangan ng libo-libong followers upang matuklasan.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenCreateProduct}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Magtinda ng Produkto</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-4 space-y-6">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-lg border border-slate-200/90 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4 text-purple-600" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Maghanap ng lumpia, pottery, damit, halaman, o lutong ulam..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm rounded-xl border border-transparent focus:border-[#3B1376] focus:ring-2 focus:ring-purple-500/10 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Filter Drawer Trigger for Mobile */}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shrink-0 ${
                activeFiltersCount > 0
                  ? 'bg-[#3B1376] text-white border-[#3B1376] shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Mga Filter</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-purple-950 text-[10px] flex items-center justify-center font-extrabold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Category Horizontal Selector (8 Categories) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#3B1376] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Lahat (All)
            </button>
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-[#3B1376] text-white font-bold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{cat.tagalogName}</span>
              </button>
            ))}
          </div>

          {/* Quick Filter Tags / Sorting Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Bookmarks Filter */}
              <button
                onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-colors flex items-center gap-1 ${
                  showBookmarksOnly
                    ? 'bg-rose-500 text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Heart className={`w-3 h-3 ${showBookmarksOnly ? 'fill-current' : ''}`} />
                <span>Naka-save ({bookmarkedProductIds.length})</span>
              </button>

              {/* Perishable Food Tag */}
              <button
                onClick={() => setPerishableOnly(!perishableOnly)}
                className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-colors flex items-center gap-1 ${
                  perishableOnly
                    ? 'bg-amber-500 text-purple-950 font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Sariwang Pagkain Lamang</span>
              </button>

              {/* In-Stock Only */}
              <button
                onClick={() => setAvailableOnly(!availableOnly)}
                className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-colors flex items-center gap-1 ${
                  availableOnly
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>May Stock Lamang</span>
              </button>

              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-[#3B1376] font-bold underline ml-1"
                >
                  I-reset ang filter
                </button>
              )}
            </div>

            {/* Sorting Select */}
            <div className="flex items-center gap-1.5 ml-auto text-slate-500 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Ayusin ayon sa:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-100 text-slate-800 text-xs font-bold rounded-lg px-2 py-1 outline-none border border-slate-200"
              >
                <option value="newest">Pinakabago (Newest)</option>
                <option value="price-asc">Presyo: Mababa hanggang Mataas</option>
                <option value="price-desc">Presyo: Mataas hanggang Mababa</option>
                <option value="rating">Pinakamataas na Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Local Delivery & Perishable Rule Advisory Card (Stage 3 Requirement) */}
        <div className="p-4 rounded-3xl bg-purple-50/80 border border-purple-200/70 text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#3B1376] text-amber-400 shrink-0 mt-0.5">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">
                Lokal na Transaksyon at Paghahatid (Community Policy)
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Ang mga transaksyon sa KayaNatinTo ay direktang inaayos sa pagitan ng mamimili at ng nagbebenta. Maaaring mag-alok ng buyer pickup o lokal na hatid ng seller. Walang mamahaling courier fees. Ang mga lutong pagkain ay para sa lokal na pamayanan lamang.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-white text-[#3B1376] font-bold text-[10px] border border-purple-200 shrink-0">
            Local Pickup & Delivery
          </span>
        </div>

        {/* Section 1: Featured Products (when no strict search active) */}
        {!searchQuery && selectedCategory === 'all' && priceFilter === 'all' && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h2 className="text-base sm:text-lg font-bold font-display text-slate-900">
                  Featured Products (Pinakatampok na Gawang-Kamay)
                </h2>
              </div>
              <span className="text-xs text-purple-700 font-semibold">Equal Discovery</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {featuredProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
              ))}
            </div>
          </section>
        )}

        {/* Section 2: Products Near User */}
        {!searchQuery && selectedCategory === 'all' && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                <h2 className="text-base sm:text-lg font-bold font-display text-slate-900">
                  Malapit sa Iyong Lugar (Laguna & Calabarzon)
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                {nearUserProducts.length} produkto
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {nearUserProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
              ))}
            </div>
          </section>
        )}

        {/* Section 3: All / Filtered Products Grid */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-slate-900">
                {searchQuery
                  ? `Mga Resulta para sa "${searchQuery}"`
                  : selectedCategory !== 'all'
                  ? `Kategorya: ${PRODUCT_CATEGORIES.find((c) => c.id === selectedCategory)?.tagalogName}`
                  : 'Lahat ng Produkto sa Marketplace'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                May kabuuang {sortedProducts.length} produkto mula sa mga lokal na creator at nanay
              </p>
            </div>
          </div>

          {sortedProducts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">Walang nahanap na produkto</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Subukang baguhin ang iyong keyword o alisin ang ilang filter upang makita ang iba pang mga likha sa komunidad.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-5 py-2 rounded-xl bg-[#3B1376] text-white text-xs font-bold"
              >
                Ipakita Lahat ng Produkto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {sortedProducts.map((p) => (
                <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Filter Drawer Modal for Granular Control */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#3B1376]" />
                <h3 className="text-base font-bold font-display text-slate-900">
                  I-filter ang Marketplace
                </h3>
              </div>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Presyo (Price Range)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'all', label: 'Lahat ng Presyo' },
                  { id: 'under100', label: 'Mababa sa ₱100' },
                  { id: '100to250', label: '₱100 hanggang ₱250' },
                  { id: '250to500', label: '₱250 hanggang ₱500' },
                  { id: 'above500', label: 'Higit sa ₱500' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPriceFilter(item.id as any)}
                    className={`py-2 px-3 rounded-xl border text-left font-medium transition-all ${
                      priceFilter === item.id
                        ? 'bg-[#3B1376] text-white border-[#3B1376] font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Lokasyon (Town / City)
              </label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              >
                <option value="all">Lahat ng Bayan at Lalawigan</option>
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}, Laguna
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
              >
                I-reset Lahat
              </button>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#3B1376] text-white text-xs font-bold shadow-md"
              >
                I-apply ang mga Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
