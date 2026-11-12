import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Sparkles,
  MapPin,
  Heart,
  Video,
  Image as ImageIcon,
  Clock,
  Music,
  Palette,
  Scissors,
  Utensils,
  Camera,
  BookOpen,
  Trophy,
  GraduationCap,
  Users,
  Grid,
  List,
  SlidersHorizontal,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { TalentPost, TalentCategory, TALENT_CATEGORIES } from '../types/talent';
import { useTalents } from '../context/TalentContext';
import { useAuth } from '../context/AuthContext';
import { TalentCard } from './TalentCard';
import { TalentDetailsModal } from './TalentDetailsModal';
import { CreateTalentPostModal } from './CreateTalentPostModal';
import { EditTalentPostModal } from './EditTalentPostModal';
import { ReportPostModal } from './ReportPostModal';

interface TalentDiscoveryPageProps {
  onNavigateHome: () => void;
  onNavigateProducts: () => void;
  onNavigateServices: () => void;
  onNavigateProfile: (username?: string) => void;
  onOpenLinkedProduct?: (productId: string) => void;
  onOpenLinkedService?: (serviceId: string) => void;
  onOpenMessageCreator?: (creator: any, contextItem: any) => void;
  onRequireAuth: () => void;
  onOpenExpandedMedia?: (post: TalentPost) => void;
  onOpenReels?: (reelId?: string) => void;
  onShare?: (title: string, text: string, url: string) => void;
}

export const TalentDiscoveryPage: React.FC<TalentDiscoveryPageProps> = ({
  onNavigateHome,
  onNavigateProducts,
  onNavigateServices,
  onNavigateProfile,
  onOpenLinkedProduct,
  onOpenLinkedService,
  onOpenMessageCreator,
  onRequireAuth,
  onOpenExpandedMedia,
  onOpenReels,
  onShare,
}) => {
  const { posts, bookmarkedPostIds } = useTalents();
  const { currentUser } = useAuth();

  // Search & Navigation States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TalentCategory | 'all'>('all');
  const [activeSubTab, setActiveSubTab] = useState<'for-you' | 'newest' | 'videos' | 'near-you' | 'bookmarks'>('for-you');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [showOnlySeniors, setShowOnlySeniors] = useState(false);
  const [viewMode, setViewMode] = useState<'feed' | 'grid'>('feed');

  // Modal States
  const [activePost, setActivePost] = useState<TalentPost | null>(null);
  const [editingPost, setEditingPost] = useState<TalentPost | null>(null);
  const [reportingPost, setReportingPost] = useState<TalentPost | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // User location reference
  const userCity = currentUser?.location?.city || 'San Pablo City';

  // Filtered & Balanced Post List
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCaption = post.caption.toLowerCase().includes(q);
        const matchCreator = post.creatorName.toLowerCase().includes(q) || post.creatorUsername.toLowerCase().includes(q);
        const matchLocation = post.location.city.toLowerCase().includes(q);
        const matchTag = post.hashtags.some((t) => t.toLowerCase().includes(q));
        if (!matchCaption && !matchCreator && !matchLocation && !matchTag) {
          return false;
        }
      }

      // 2. Category
      if (selectedCategory !== 'all' && post.category !== selectedCategory) {
        return false;
      }

      // 3. Media Type Filter
      if (mediaTypeFilter !== 'all' && post.mediaType !== mediaTypeFilter) {
        return false;
      }

      // 4. Sub-tab conditions
      if (activeSubTab === 'videos' && post.mediaType !== 'video') {
        return false;
      }

      if (activeSubTab === 'near-you' && post.location.city.toLowerCase() !== userCity.toLowerCase()) {
        return false;
      }

      if (activeSubTab === 'bookmarks' && !bookmarkedPostIds.includes(post.id)) {
        return false;
      }

      // 5. Senior Filter
      if (showOnlySeniors && !post.creatorIsSenior) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Discovery Ordering (Anti-popularity bias)
      if (activeSubTab === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      // 'for-you' & default: balanced exposure giving all creators opportunities
      // Features recent posts, but spreads creators without view gating
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    posts,
    searchQuery,
    selectedCategory,
    activeSubTab,
    mediaTypeFilter,
    showOnlySeniors,
    bookmarkedPostIds,
    userCity,
  ]);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Music':
        return Music;
      case 'Sparkles':
        return Sparkles;
      case 'Palette':
        return Palette;
      case 'Scissors':
        return Scissors;
      case 'Utensils':
        return Utensils;
      case 'Camera':
        return Camera;
      case 'BookOpen':
        return BookOpen;
      case 'Trophy':
        return Trophy;
      case 'GraduationCap':
        return GraduationCap;
      default:
        return Users;
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setActiveSubTab('for-you');
    setMediaTypeFilter('all');
    setShowOnlySeniors(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 pb-24 text-left transition-colors">
      
      {/* 1. Header Hero Banner */}
      <div className="bg-gradient-to-r from-[#3B1376] via-[#4F28D9] to-[#2B0E5A] dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 text-white pt-8 pb-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-300/30">
                <Sparkles className="w-3.5 h-3.5" />
                Lahat May Kwento &bull; Lahat May Talento
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                Tuklasin ang KayaNatinTo
              </h1>
              <p className="text-sm sm:text-base text-purple-200 mt-1 max-w-2xl leading-relaxed">
                Makakita ng bagong talento, produkto, at serbisyo mula sa iba't ibang tao. Walang kinakailangang kasikatan—bawat isa ay may pagkakataong maipagmalaki ang sarili.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5">
              {onOpenReels && (
                <button
                  type="button"
                  onClick={() => onOpenReels()}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>Manood ng Reels</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    onRequireAuth();
                  } else {
                    setIsCreateModalOpen(true);
                  }
                }}
                className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Mag-post</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-3xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-300">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ano ang hinahanap mo? (Hal. pagkain, gitara, sining, kasanayan)..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm sm:text-base shadow-lg focus:outline-hidden focus:ring-3 focus:ring-amber-400/80 transition-all border border-transparent dark:border-slate-800"
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

          {/* Quick Sub-tabs to Products & Services */}
          <div className="flex items-center gap-2 mt-4 pt-2 overflow-x-auto text-xs">
            <span className="text-purple-200 font-medium whitespace-nowrap">Iba pang seksyon:</span>
            <button
              type="button"
              onClick={onNavigateProducts}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors shrink-0"
            >
              📦 Produkto ng Komunidad
            </button>
            <button
              type="button"
              onClick={onNavigateServices}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors shrink-0"
            >
              🛠️ Mga Serbisyo at Skills
            </button>
            {onOpenReels && (
              <button
                type="button"
                onClick={() => onOpenReels()}
                className="px-3 py-1 rounded-full bg-purple-500/40 hover:bg-purple-500/60 text-amber-300 font-bold transition-colors shrink-0 flex items-center gap-1"
              >
                🎬 Reels Video Feed
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 2. Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Category Carousel (11 Categories from Stage 8.5 Specification) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Mga Kategorya ng Tuklasin
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              I-swipe pakanan o pakaliwa
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {/* 1. Lahat */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setShowOnlySeniors(false);
                setActiveSubTab('for-you');
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                selectedCategory === 'all' && !showOnlySeniors && activeSubTab === 'for-you'
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Lahat
            </button>

            {/* 2. Pag-awit at Musika */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('music');
                setShowOnlySeniors(false);
                setActiveSubTab('for-you');
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border ${
                selectedCategory === 'music'
                  ? 'bg-purple-700 text-white border-purple-700 shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-purple-300'
              }`}
            >
              <Music className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Pag-awit at Musika
            </button>

            {/* 3. Sayaw */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('dance-performing');
                setShowOnlySeniors(false);
                setActiveSubTab('for-you');
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border ${
                selectedCategory === 'dance-performing'
                  ? 'bg-purple-700 text-white border-purple-700 shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-purple-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
              Sayaw
            </button>

            {/* 4. Sining at Likha */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('drawing-painting');
                setShowOnlySeniors(false);
                setActiveSubTab('for-you');
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border ${
                selectedCategory === 'drawing-painting'
                  ? 'bg-purple-700 text-white border-purple-700 shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-purple-300'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Sining at Likha
            </button>

            {/* 5. Pagluluto */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('cooking-baking');
                setShowOnlySeniors(false);
                setActiveSubTab('for-you');
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border ${
                selectedCategory === 'cooking-baking'
                  ? 'bg-purple-700 text-white border-purple-700 shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-purple-300'
              }`}
            >
              <Utensils className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              Pagluluto
            </button>

            {/* 6. Skills at Serbisyo */}
            <button
              type="button"
              onClick={onNavigateServices}
              className="px-3.5 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800 hover:bg-blue-100"
            >
              <Scissors className="w-3.5 h-3.5 text-blue-600" />
              Skills at Serbisyo
            </button>

            {/* 7. Senior Creators */}
            <button
              type="button"
              onClick={() => {
                setShowOnlySeniors(true);
                setSelectedCategory('all');
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border ${
                showOnlySeniors
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-600 shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-amber-400'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-amber-600" />
              Senior Creators (60+)
            </button>

            {/* 8. Malapit sa Iyo */}
            <button
              type="button"
              onClick={() => {
                setActiveSubTab('near-you');
                setShowOnlySeniors(false);
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border ${
                activeSubTab === 'near-you'
                  ? 'bg-purple-700 text-white border-purple-700 shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-purple-300'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              Malapit sa Iyo
            </button>

            {/* 9. Mga Bagong Post */}
            <button
              type="button"
              onClick={() => {
                setActiveSubTab('newest');
                setShowOnlySeniors(false);
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border ${
                activeSubTab === 'newest'
                  ? 'bg-purple-700 text-white border-purple-700 shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-purple-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              Mga Bagong Post
            </button>

            {/* 10. Videos */}
            <button
              type="button"
              onClick={() => {
                setActiveSubTab('videos');
                setShowOnlySeniors(false);
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border ${
                activeSubTab === 'videos'
                  ? 'bg-purple-700 text-white border-purple-700 shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-purple-300'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-blue-500" />
              Videos
            </button>

            {/* 11. Reels */}
            <button
              type="button"
              onClick={() => {
                if (onOpenReels) onOpenReels();
              }}
              className="px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:from-purple-700 hover:to-indigo-700"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Reels
            </button>

          </div>
        </div>

        {/* Discovery Sub-Tabs & Filtering Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 mb-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Left: Discovery Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {[
                { id: 'for-you', label: 'Para sa Iyo', icon: Sparkles },
                { id: 'newest', label: 'Pinakabago', icon: Clock },
                { id: 'videos', label: 'Mga Video', icon: Video },
                { id: 'near-you', label: `Malapit sa Iyo (${userCity})`, icon: MapPin },
                { id: 'bookmarks', label: `Naka-save (${bookmarkedPostIds.length})`, icon: Heart },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSubTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#3B1376] text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right: Senior Filter & View Mode Toggle */}
            <div className="flex items-center gap-2">
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
                👵 Senior Creators (60+)
              </button>

              {/* View Switcher (Feed vs Grid) */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('feed')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'feed'
                      ? 'bg-white text-[#3B1376] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Feed layout"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-[#3B1376] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Grid layout"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Results Count & Current Filter Banner */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {searchQuery
                ? `Mga Resulta para sa "${searchQuery}"`
                : selectedCategory !== 'all'
                ? `Mga Post sa ${TALENT_CATEGORIES.find((c) => c.id === selectedCategory)?.name}`
                : activeSubTab === 'videos'
                ? 'Mga Video at Pagtatanghal'
                : activeSubTab === 'near-you'
                ? `Mga Talento sa ${userCity}`
                : 'Lahat ng Talento at Malikhaing Gawa'}
            </h3>
            <p className="text-xs text-slate-500">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'mga post'} na maipagmamalaki sa komunidad
            </p>
          </div>

          {(searchQuery || selectedCategory !== 'all' || showOnlySeniors || activeSubTab !== 'for-you') && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-purple-700 hover:underline"
            >
              I-reset ang mga filter
            </button>
          )}
        </div>

        {/* Posts Display: Feed or Grid View */}
        {filteredPosts.length > 0 ? (
          viewMode === 'feed' ? (
            <div className="max-w-2xl mx-auto space-y-6">
              {filteredPosts.map((post) => (
                <TalentCard
                  key={post.id}
                  post={post}
                  onClick={() => {
                    if (onOpenExpandedMedia) {
                      onOpenExpandedMedia(post);
                    } else {
                      setActivePost(post);
                    }
                  }}
                  onOpenCreatorProfile={onNavigateProfile}
                  onOpenLinkedProduct={onOpenLinkedProduct}
                  onOpenLinkedService={onOpenLinkedService}
                  onEdit={(p) => setEditingPost(p)}
                  onReport={(p) => setReportingPost(p)}
                  onOpenMessageCreator={onOpenMessageCreator}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPosts.map((post) => (
                <TalentCard
                  key={post.id}
                  post={post}
                  onClick={() => {
                    if (onOpenExpandedMedia) {
                      onOpenExpandedMedia(post);
                    } else {
                      setActivePost(post);
                    }
                  }}
                  onOpenCreatorProfile={onNavigateProfile}
                  onOpenLinkedProduct={onOpenLinkedProduct}
                  onOpenLinkedService={onOpenLinkedService}
                  onEdit={(p) => setEditingPost(p)}
                  onReport={(p) => setReportingPost(p)}
                  onOpenMessageCreator={onOpenMessageCreator}
                />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-purple-100 text-[#4F28D9] rounded-2xl flex items-center justify-center mx-auto">
              <Compass className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Walang Nakitang Post na Tugma sa Filter
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Subukang lumipat ng kategorya o mag-reset ng filter upang makita ang iba pang talento ng komunidad.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={resetFilters}
                className="px-5 py-2.5 bg-[#3B1376] hover:bg-[#4F28D9] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                I-reset ang Lahat ng Filter
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Floating Add Post Button on Mobile */}
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
          <Plus className="w-4 h-4 text-amber-300 stroke-[2.5]" />
          <span>I-post ang Talento</span>
        </button>
      </div>

      {/* Modals */}
      {activePost && (
        <TalentDetailsModal
          post={activePost}
          isOpen={!!activePost}
          onClose={() => setActivePost(null)}
          onOpenCreatorProfile={onNavigateProfile}
          onOpenLinkedProduct={onOpenLinkedProduct}
          onOpenLinkedService={onOpenLinkedService}
          onOpenMessageCreator={onOpenMessageCreator}
          onEdit={(p) => {
            setEditingPost(p);
            setActivePost(null);
          }}
          onReport={(p) => {
            setReportingPost(p);
            setActivePost(null);
          }}
        />
      )}

      {isCreateModalOpen && (
        <CreateTalentPostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(newPost) => {
            setIsCreateModalOpen(false);
            setActivePost(newPost);
          }}
          onRequireAuth={onRequireAuth}
        />
      )}

      {editingPost && (
        <EditTalentPostModal
          post={editingPost}
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          onSuccess={() => setEditingPost(null)}
        />
      )}

      {reportingPost && (
        <ReportPostModal
          post={reportingPost}
          isOpen={!!reportingPost}
          onClose={() => setReportingPost(null)}
        />
      )}

    </div>
  );
};
