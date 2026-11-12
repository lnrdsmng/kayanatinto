/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Smartphone,
  Monitor,
  Heart,
  Sparkles,
  Info,
  Shield,
  Wifi,
  BatteryMedium,
  CheckCircle2,
} from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { ConnectionProvider, useConnections } from './context/ConnectionContext';
import { MessagingProvider, useMessaging } from './context/MessagingContext';
import { ProductProvider, useProducts } from './context/ProductContext';
import { ServiceProvider, useServices } from './context/ServiceContext';
import { PublicProfileModal } from './components/PublicProfileModal';
import { Header } from './components/Header';
import { CategoryShortcuts } from './components/CategoryShortcuts';
import { CommunityCategoryShowcase } from './components/CommunityCategoryShowcase';
import { CommunityFooter } from './components/CommunityFooter';
import { AdminFinancialDashboardModal } from './components/AdminFinancialDashboardModal';
import { HeroBanner } from './components/HeroBanner';
import { DiscoverNearYou } from './components/DiscoverNearYou';
import { PeopleOfKayaNatinTo } from './components/PeopleOfKayaNatinTo';
import { MissionAndAgeBanner } from './components/MissionAndAgeBanner';
import { BottomNavigation, NavTab } from './components/BottomNavigation';
import { ListingDetailModal } from './components/ListingDetailModal';
import { CreatorProfileModal } from './components/CreatorProfileModal';
import { AgePolicyModal } from './components/AgePolicyModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { CreatePostModal } from './components/CreatePostModal';
import { InboxDrawer } from './components/InboxDrawer';
import { ProfileDrawer } from './components/ProfileDrawer';
import { JoinModal } from './components/JoinModal';
import { KayaNatinLogo } from './components/KayaNatinLogo';
import { LoginPage } from './components/LoginPage';
import { RegistrationPage } from './components/RegistrationPage';
import { ProfileSetupPage } from './components/ProfileSetupPage';
import { UserProfilePage } from './components/UserProfilePage';
import { EditProfileModal } from './components/EditProfileModal';
import { MarketplacePage } from './components/MarketplacePage';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CreateProductModal } from './components/CreateProductModal';
import { EditProductModal } from './components/EditProductModal';
import { ServicesMarketplacePage } from './components/ServicesMarketplacePage';
import { ServiceDetailsModal } from './components/ServiceDetailsModal';
import { CreateServiceModal } from './components/CreateServiceModal';
import { EditServiceModal } from './components/EditServiceModal';
import { TalentProvider, useTalents } from './context/TalentContext';
import { TalentDiscoveryPage } from './components/TalentDiscoveryPage';
import { TalentDetailsModal } from './components/TalentDetailsModal';
import { CreateTalentPostModal } from './components/CreateTalentPostModal';
import { EditTalentPostModal } from './components/EditTalentPostModal';
import { ReportPostModal } from './components/ReportPostModal';
import { CreateActionModal } from './components/CreateActionModal';
import { ThemeProvider } from './context/ThemeContext';
import { ReelsProvider } from './context/ReelsContext';
import { KycVerificationModal } from './components/KycVerificationModal';
import { ReelsFeedModal } from './components/ReelsFeedModal';
import { ExpandedMediaViewerModal } from './components/ExpandedMediaViewerModal';
import { ShareModal } from './components/ShareModal';

import { TransactionProvider, useTransactions } from './context/TransactionContext';
import { ProductOrder, ServiceBooking } from './types/transaction';
import { CreateOrderModal } from './components/CreateOrderModal';
import { CreateBookingModal } from './components/CreateBookingModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { BookingDetailModal } from './components/BookingDetailModal';
import { TransactionsDashboardPage } from './components/TransactionsDashboardPage';

import {
  SAMPLE_LISTINGS,
  PEOPLE_OF_KAYANATINTO,
  ListingItem,
  CreatorPerson,
} from './data/mockData';
import { Product, ProductCategory } from './types/product';
import { Service } from './types/service';
import { TalentPost } from './types/talent';

type PageView = 'home' | 'marketplace' | 'services' | 'talents' | 'transactions' | 'login' | 'register' | 'profile-setup' | 'profile';

function MainApp() {
  const { currentUser } = useAuth();
  const { unreadCount: notificationsCount } = useNotifications();
  const { totalUnreadCount, getOrCreateConversation } = useMessaging();
  const { posts } = useTalents();
  const { products } = useProducts();
  const { services } = useServices();
  const {
    pendingSellerOrdersCount,
    pendingProviderBookingsCount,
    pendingCustomerOrdersCount,
    pendingCustomerBookingsCount,
    getOrderById,
    getBookingById,
  } = useTransactions();

  // Page Routing State
  const [currentPage, setCurrentPage] = useState<PageView>('home');

  // Navigation & Search State
  const [activeNavTab, setActiveNavTab] = useState<NavTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Modals & Drawers State
  const [selectedListing, setSelectedListing] = useState<ListingItem | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<CreatorPerson | null>(null);
  const [publicProfileUser, setPublicProfileUser] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);

  // Stage 4 Service States
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);

  // Stage 5 Talent States
  const [selectedTalent, setSelectedTalent] = useState<TalentPost | null>(null);
  const [editingTalent, setEditingTalent] = useState<TalentPost | null>(null);
  const [reportingTalent, setReportingTalent] = useState<TalentPost | null>(null);
  const [isCreateTalentOpen, setIsCreateTalentOpen] = useState(false);
  const [isCreateActionOpen, setIsCreateActionOpen] = useState(false);

  // Stage 7 Transaction States
  const [selectedOrder, setSelectedOrder] = useState<ProductOrder | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(null);
  const [orderingProduct, setOrderingProduct] = useState<Product | null>(null);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [isCreateBookingOpen, setIsCreateBookingOpen] = useState(false);

  const [isAgePolicyOpen, setIsAgePolicyOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isReelsOpen, setIsReelsOpen] = useState(false);
  const [initialReelId, setInitialReelId] = useState<string | undefined>(undefined);
  const [expandedMediaPost, setExpandedMediaPost] = useState<TalentPost | null>(null);
  const [shareData, setShareData] = useState<{ title: string; text?: string; url?: string } | null>(null);

  // Accessibility & Display Modes
  const [isLargeTextMode, setIsLargeTextMode] = useState(false);
  const [devicePreviewMode, setDevicePreviewMode] = useState<'responsive' | 'mobile-frame'>('responsive');

  // Filter listings based on search query and category (for homepage)
  const filteredListings = useMemo(() => {
    return SAMPLE_LISTINGS.filter((item) => {
      const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.sellerName.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Filter creators based on search query
  const filteredCreators = useMemo(() => {
    if (!searchQuery.trim()) return PEOPLE_OF_KAYANATINTO;
    const q = searchQuery.toLowerCase().trim();
    return PEOPLE_OF_KAYANATINTO.filter(
      (person) =>
        person.name.toLowerCase().includes(q) ||
        person.role.toLowerCase().includes(q) ||
        person.location.toLowerCase().includes(q) ||
        person.bio.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Bottom Navigation Handler
  const handleNavTabChange = (tab: NavTab) => {
    setActiveNavTab(tab);
    if (tab === 'home') {
      setCurrentPage('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'discover') {
      // Stage 5 Talent & Creative Showcase
      setCurrentPage('talents');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'create') {
      if (!currentUser) {
        // Prompt login if not logged in
        setCurrentPage('login');
      } else {
        // Open Create Action Chooser (Talent, Product, or Service)
        setIsCreateActionOpen(true);
      }
    } else if (tab === 'inbox') {
      setIsInboxOpen(true);
    } else if (tab === 'profile') {
      if (currentUser) {
        setCurrentPage('profile');
      } else {
        setCurrentPage('login');
      }
    }
  };

  // Helper when clicking a user/seller/creator name across the app
  const handleOpenSellerProfile = (sellerNameOrUsername: string) => {
    setSelectedListing(null);
    setSelectedProduct(null);
    setSelectedService(null);
    setSelectedTalent(null);
    setPublicProfileUser(sellerNameOrUsername);
  };

  // Helper to initiate or navigate to 1-on-1 private conversation
  const handleOpenMessageWithUser = (
    user: {
      id: string;
      name: string;
      username: string;
      avatarUrl?: string;
      isSenior?: boolean;
      role?: string;
    },
    contextItem?: any,
    initialText?: string
  ) => {
    if (!currentUser) {
      setCurrentPage('login');
      return;
    }
    getOrCreateConversation(user, initialText, contextItem);
    setIsInboxOpen(true);
  };

  // Helper when Category Shortcuts are clicked
  const handleCategoryShortcutClick = (catId: string | null) => {
    if (catId === 'products') {
      setCurrentPage('marketplace');
    } else if (catId === 'services') {
      setCurrentPage('services');
    } else if (catId === 'talents' || catId === 'videos') {
      setCurrentPage('talents');
    } else {
      setSelectedCategory(catId);
    }
  };

  // Render Page Content based on currentPage
  const renderCurrentPage = () => {
    const pendingTransactionsCount =
      pendingSellerOrdersCount +
      pendingProviderBookingsCount +
      pendingCustomerOrdersCount +
      pendingCustomerBookingsCount;

    switch (currentPage) {
      case 'talents':
        return (
          <>
            <Header
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              onOpenAgePolicy={() => setIsAgePolicyOpen(true)}
              onNavigateLogin={() => setCurrentPage('login')}
              onNavigateRegister={() => setCurrentPage('register')}
              onNavigateProfile={() => setCurrentPage('profile')}
              onNavigateMarketplace={() => setCurrentPage('marketplace')}
              onNavigateServices={() => setCurrentPage('services')}
              onNavigateTalents={() => setCurrentPage('talents')}
              onNavigateTransactions={() => {
                setCurrentPage('transactions');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              pendingTransactionsCount={pendingTransactionsCount}
              onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
              unreadCount={notificationsCount}
              isLargeTextMode={isLargeTextMode}
              onToggleLargeTextMode={() => setIsLargeTextMode(!isLargeTextMode)}
            />
            <TalentDiscoveryPage
              onNavigateHome={() => setCurrentPage('home')}
              onNavigateProducts={() => setCurrentPage('marketplace')}
              onNavigateServices={() => setCurrentPage('services')}
              onNavigateProfile={(username) => {
                if (username) {
                  handleOpenSellerProfile(username);
                } else {
                  setCurrentPage('profile');
                }
              }}
              onOpenLinkedProduct={(productId) => {
                const prod = products.find((p) => p.id === productId);
                if (prod) {
                  setSelectedProduct(prod);
                } else {
                  setCurrentPage('marketplace');
                }
              }}
              onOpenLinkedService={(serviceId) => {
                const srv = services.find((s) => s.id === serviceId);
                if (srv) {
                  setSelectedService(srv);
                } else {
                  setCurrentPage('services');
                }
              }}
              onOpenMessageCreator={(creator, ctx) => {
                handleOpenMessageWithUser(
                  creator,
                  ctx,
                  `Kumusta po ${creator.name}! Nais ko po sanang magtanong tungkol sa "${ctx.title}".`
                );
              }}
              onRequireAuth={() => setCurrentPage('login')}
              onOpenExpandedMedia={(post) => setExpandedMediaPost(post)}
              onOpenReels={(reelId) => {
                setInitialReelId(reelId);
                setIsReelsOpen(true);
              }}
              onShare={(t, tx, u) => setShareData({ title: t, text: tx, url: u })}
            />
            <BottomNavigation
              activeTab="discover"
              onTabChange={handleNavTabChange}
              inboxBadge={totalUnreadCount}
            />
          </>
        );

      case 'marketplace':
        return (
          <>
            <Header
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              onOpenAgePolicy={() => setIsAgePolicyOpen(true)}
              onNavigateLogin={() => setCurrentPage('login')}
              onNavigateRegister={() => setCurrentPage('register')}
              onNavigateProfile={() => setCurrentPage('profile')}
              onNavigateMarketplace={() => setCurrentPage('marketplace')}
              onNavigateServices={() => setCurrentPage('services')}
              onNavigateTalents={() => setCurrentPage('talents')}
              onNavigateTransactions={() => {
                setCurrentPage('transactions');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              pendingTransactionsCount={pendingTransactionsCount}
              onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
              unreadCount={notificationsCount}
              isLargeTextMode={isLargeTextMode}
              onToggleLargeTextMode={() => setIsLargeTextMode(!isLargeTextMode)}
            />
            <MarketplacePage
              onSelectProduct={(prod) => setSelectedProduct(prod)}
              onOpenCreateProduct={() => {
                if (currentUser) {
                  setIsCreateProductOpen(true);
                } else {
                  setCurrentPage('login');
                }
              }}
              onNavigateHome={() => setCurrentPage('home')}
            />
            <BottomNavigation
              activeTab={activeNavTab}
              onTabChange={handleNavTabChange}
              inboxBadge={totalUnreadCount}
            />
          </>
        );

      case 'services':
        return (
          <>
            <Header
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              onOpenAgePolicy={() => setIsAgePolicyOpen(true)}
              onNavigateLogin={() => setCurrentPage('login')}
              onNavigateRegister={() => setCurrentPage('register')}
              onNavigateProfile={() => setCurrentPage('profile')}
              onNavigateMarketplace={() => setCurrentPage('marketplace')}
              onNavigateServices={() => setCurrentPage('services')}
              onNavigateTalents={() => setCurrentPage('talents')}
              onNavigateTransactions={() => {
                setCurrentPage('transactions');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              pendingTransactionsCount={pendingTransactionsCount}
              onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
              unreadCount={notificationsCount}
              isLargeTextMode={isLargeTextMode}
              onToggleLargeTextMode={() => setIsLargeTextMode(!isLargeTextMode)}
            />
            <ServicesMarketplacePage
              onNavigateHome={() => setCurrentPage('home')}
              onNavigateProducts={() => setCurrentPage('marketplace')}
              onNavigateProfile={(username) => {
                if (username) {
                  handleOpenSellerProfile(username);
                } else {
                  setCurrentPage('profile');
                }
              }}
              onOpenMessageProvider={(provider, ctx, initialMsg) => {
                handleOpenMessageWithUser(provider, ctx, initialMsg);
              }}
              onRequireAuth={() => setCurrentPage('login')}
            />
            <BottomNavigation
              activeTab="discover"
              onTabChange={handleNavTabChange}
              inboxBadge={totalUnreadCount}
            />
          </>
        );

      case 'transactions':
        return (
          <>
            <Header
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              onOpenAgePolicy={() => setIsAgePolicyOpen(true)}
              onNavigateLogin={() => setCurrentPage('login')}
              onNavigateRegister={() => setCurrentPage('register')}
              onNavigateProfile={() => setCurrentPage('profile')}
              onNavigateMarketplace={() => setCurrentPage('marketplace')}
              onNavigateServices={() => setCurrentPage('services')}
              onNavigateTalents={() => setCurrentPage('talents')}
              onNavigateTransactions={() => setCurrentPage('transactions')}
              pendingTransactionsCount={pendingTransactionsCount}
              onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
              unreadCount={notificationsCount}
              isLargeTextMode={isLargeTextMode}
              onToggleLargeTextMode={() => setIsLargeTextMode(!isLargeTextMode)}
            />
            <TransactionsDashboardPage
              onSelectOrder={(order) => setSelectedOrder(order)}
              onSelectBooking={(booking) => setSelectedBooking(booking)}
              onOpenMessage={(participant, ctx) => {
                handleOpenMessageWithUser(participant, ctx);
              }}
              onViewUserProfile={(u) => handleOpenSellerProfile(u)}
            />
            <BottomNavigation
              activeTab="profile"
              onTabChange={handleNavTabChange}
              inboxBadge={totalUnreadCount}
            />
          </>
        );

      case 'login':
        return (
          <LoginPage
            onNavigateRegister={() => setCurrentPage('register')}
            onNavigateHome={() => setCurrentPage('home')}
            onLoginSuccess={() => setCurrentPage('home')}
          />
        );

      case 'register':
        return (
          <RegistrationPage
            onNavigateLogin={() => setCurrentPage('login')}
            onNavigateHome={() => setCurrentPage('home')}
            onRegisterSuccess={() => setCurrentPage('profile-setup')}
            onOpenAgeCharter={() => setIsAgePolicyOpen(true)}
          />
        );

      case 'profile-setup':
        return (
          <ProfileSetupPage
            onComplete={() => setCurrentPage('profile')}
            onSkip={() => setCurrentPage('profile')}
          />
        );

      case 'profile':
        return (
          <>
            <UserProfilePage
              onNavigateHome={() => setCurrentPage('home')}
              onOpenEditProfile={() => setIsEditProfileOpen(true)}
              onOpenCreateProduct={() => setIsCreateProductOpen(true)}
              onOpenEditProduct={(prod) => setEditingProduct(prod)}
              onOpenAgeCharter={() => setIsAgePolicyOpen(true)}
              onSelectProduct={(prod) => setSelectedProduct(prod)}
              onOpenCreateService={() => setIsCreateServiceOpen(true)}
              onOpenEditService={(srv) => setEditingService(srv)}
              onSelectService={(srv) => setSelectedService(srv)}
              onOpenCreateTalent={() => setIsCreateTalentOpen(true)}
              onOpenEditTalent={(tPost) => setEditingTalent(tPost)}
              onSelectTalent={(tPost) => setSelectedTalent(tPost)}
              onViewUserProfile={handleOpenSellerProfile}
              onNavigateTransactions={() => {
                setCurrentPage('transactions');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenKycModal={() => setIsKycModalOpen(true)}
              onOpenReels={() => setIsReelsOpen(true)}
              onOpenExpandedMedia={(post) => setExpandedMediaPost(post)}
            />
            <BottomNavigation
              activeTab="profile"
              onTabChange={handleNavTabChange}
              inboxBadge={totalUnreadCount}
            />
          </>
        );

      case 'home':
      default:
        return (
          <div className={`min-h-screen bg-[#F8FAFC] pb-24 text-slate-800 ${isLargeTextMode ? 'text-[1.08rem]' : ''}`}>
            {/* Demonstration Banner & Age Reminder Notice */}
            <div className="bg-gradient-to-r from-[#2F106A] via-[#3B1376] to-[#4F28D9] text-white px-4 py-2 text-xs text-center flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 font-bold bg-amber-400 text-purple-950 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide">
                <Shield className="w-3 h-3 text-purple-950" />
                18+ Platform
              </span>
              <span className="opacity-90">
                KayaNatinTo Community Marketplace · Zero followers needed · Welcoming all adults & seniors
              </span>
              <button
                onClick={() => setIsAgePolicyOpen(true)}
                className="font-bold underline text-amber-300 hover:text-white transition-colors cursor-pointer"
              >
                Age Policy Info
              </button>
            </div>

            {/* 1. Header Component with Navigation & Admin Portal */}
            <Header
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              onOpenAgePolicy={() => setIsAgePolicyOpen(true)}
              onNavigateLogin={() => setCurrentPage('login')}
              onNavigateRegister={() => setCurrentPage('register')}
              onNavigateProfile={() => setCurrentPage('profile')}
              onNavigateMarketplace={() => setCurrentPage('marketplace')}
              onNavigateServices={() => setCurrentPage('services')}
              onNavigateTalents={() => setCurrentPage('talents')}
              onNavigateTransactions={() => {
                setCurrentPage('transactions');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
              pendingTransactionsCount={pendingTransactionsCount}
              unreadCount={notificationsCount}
              isLargeTextMode={isLargeTextMode}
              onToggleLargeTextMode={() => setIsLargeTextMode(!isLargeTextMode)}
            />

            <main className="space-y-6 pt-1">
              {/* 2. Hero Banner */}
              <HeroBanner
                onOpenJoin={() => {
                  if (currentUser) {
                    setCurrentPage('profile');
                  } else {
                    setCurrentPage('register');
                  }
                }}
                onOpenAgePolicy={() => setIsAgePolicyOpen(true)}
              />

              {/* 3. Community Category Showcase (Products, Talents, Services, Videos cards) */}
              <CommunityCategoryShowcase
                onNavigateProducts={() => {
                  setCurrentPage('marketplace');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateTalents={() => {
                  setCurrentPage('talents');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateServices={() => {
                  setCurrentPage('services');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />

              {/* 4. Discover Near You */}
              <DiscoverNearYou
                listings={filteredListings}
                onSelectListing={setSelectedListing}
                activeFilter={selectedCategory}
                onFilterChange={setSelectedCategory}
                onNavigateMarketplace={() => setCurrentPage('marketplace')}
              />

              {/* 5. People of KayaNatinTo */}
              <PeopleOfKayaNatinTo
                creators={filteredCreators}
                onSelectCreator={setSelectedCreator}
                onOpenAgePolicy={() => setIsAgePolicyOpen(true)}
              />

              {/* 6. Community Mission & 4 Steps Banner */}
              <MissionAndAgeBanner
                onOpenAgePolicy={() => setIsAgePolicyOpen(true)}
                onOpenJoin={() => {
                  if (currentUser) {
                    setCurrentPage('profile');
                  } else {
                    setCurrentPage('register');
                  }
                }}
              />
            </main>

            {/* 7. Community Deep Purple Footer */}
            <CommunityFooter
              onNavigateHome={() => {
                setCurrentPage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateProducts={() => {
                setCurrentPage('marketplace');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateServices={() => {
                setCurrentPage('services');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateTalents={() => {
                setCurrentPage('talents');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenAgePolicy={() => setIsAgePolicyOpen(true)}
              onNavigateTransactions={() => {
                setCurrentPage('transactions');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
            />

            {/* 6. Fixed Bottom Navigation */}
            <BottomNavigation
              activeTab={activeNavTab}
              onTabChange={handleNavTabChange}
              inboxBadge={totalUnreadCount}
            />
          </div>
        );
    }
  };

  const appView = renderCurrentPage();

  return (
    <>
      {/* Desktop View Switcher Controls (Fixed in bottom right for reviewers) */}
      <div className="hidden lg:flex fixed bottom-20 right-6 z-50 items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-purple-200">
        <span className="text-[11px] font-bold text-[#3B1376] px-2">View:</span>
        <button
          onClick={() => setDevicePreviewMode('responsive')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            devicePreviewMode === 'responsive'
              ? 'bg-[#3B1376] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          Responsive Wide
        </button>
        <button
          onClick={() => setDevicePreviewMode('mobile-frame')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            devicePreviewMode === 'mobile-frame'
              ? 'bg-[#3B1376] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          Mobile Frame (390px)
        </button>
      </div>

      {/* Render Mobile Frame Simulator on Desktop if selected */}
      {devicePreviewMode === 'mobile-frame' ? (
        <div className="hidden lg:flex min-h-screen bg-slate-900/90 py-8 px-4 items-center justify-center">
          <div className="relative w-[410px] h-[860px] bg-black rounded-[50px] p-3 shadow-2xl ring-1 ring-white/20 flex flex-col overflow-hidden">
            {/* Realistic iPhone Bezel & Dynamic Island / Status Bar */}
            <div className="w-full h-11 bg-white rounded-t-[38px] px-7 pt-2 flex items-center justify-between text-xs font-bold text-slate-800 shrink-0 z-50 border-b border-slate-100 select-none">
              <span>9:41</span>
              {/* Dynamic Island pill */}
              <div className="w-20 h-4 bg-black rounded-full" />
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" />
                <BatteryMedium className="w-4 h-4" />
              </div>
            </div>

            {/* Inner Mobile Scroll Area */}
            <div className="w-full flex-1 overflow-y-auto no-scrollbar bg-[#F8FAFC] rounded-b-[38px] relative">
              {appView}
            </div>

            {/* Bottom Home Indicator Bar */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/70 rounded-full pointer-events-none z-50" />
          </div>
        </div>
      ) : null}

      {/* Standard Responsive Render (visible on mobile/tablet or when responsive mode selected) */}
      <div className={devicePreviewMode === 'mobile-frame' ? 'lg:hidden' : 'block'}>
        {appView}
      </div>

      {/* Global Interactive Modals and Drawers */}
      <ListingDetailModal
        item={selectedListing}
        onClose={() => setSelectedListing(null)}
        onOpenSellerProfile={handleOpenSellerProfile}
        onOpenMessageSeller={(seller, ctx) =>
          handleOpenMessageWithUser(
            seller,
            ctx,
            `Kumusta po ${seller.name}! Nais ko po sanang magtanong tungkol sa "${ctx.title}".`
          )
        }
      />

      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenSellerProfile={handleOpenSellerProfile}
        onOpenMessageSeller={(seller, ctx) =>
          handleOpenMessageWithUser(
            seller,
            ctx,
            `Kumusta po ${seller.name}! Nais ko po sanang magtanong tungkol sa "${ctx.title}".`
          )
        }
        onOpenEditProduct={(prod) => {
          setSelectedProduct(null);
          setEditingProduct(prod);
        }}
        onOpenCreateOrder={(prod) => {
          setOrderingProduct(prod);
          setIsCreateOrderOpen(true);
        }}
      />

      <CreateProductModal
        isOpen={isCreateProductOpen}
        onClose={() => setIsCreateProductOpen(false)}
        onSuccess={() => {
          // Stay on current page or navigate to marketplace
        }}
      />

      <EditProductModal
        product={editingProduct}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSuccess={() => setEditingProduct(null)}
      />

      <CreatorProfileModal
        person={selectedCreator}
        onClose={() => setSelectedCreator(null)}
        onSelectOffering={(offeringTitle) => {
          setSelectedCreator(null);
          setCurrentPage('marketplace');
          setSearchQuery(offeringTitle);
        }}
        onOpenMessageCreator={(creator) =>
          handleOpenMessageWithUser(
            creator,
            undefined,
            `Kumusta po ${creator.name}! Nais ko po sanang makipag-ugnayan sa inyo sa KayaNatinTo.`
          )
        }
      />

      <AgePolicyModal
        isOpen={isAgePolicyOpen}
        onClose={() => setIsAgePolicyOpen(false)}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onOpenAgePolicy={() => setIsAgePolicyOpen(true)}
        onOpenConversation={() => {
          setIsNotificationsOpen(false);
          setIsInboxOpen(true);
        }}
        onOpenPost={(postId) => {
          setIsNotificationsOpen(false);
          const found = posts.find((p) => p.id === postId);
          if (found) {
            setSelectedTalent(found);
          } else {
            setCurrentPage('talents');
          }
        }}
        onOpenProfile={(username) => {
          setIsNotificationsOpen(false);
          setPublicProfileUser(username);
        }}
        onOpenOrder={(orderId) => {
          setIsNotificationsOpen(false);
          const found = getOrderById(orderId);
          if (found) setSelectedOrder(found);
        }}
        onOpenBooking={(bookingId) => {
          setIsNotificationsOpen(false);
          const found = getBookingById(bookingId);
          if (found) setSelectedBooking(found);
        }}
      />

      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <InboxDrawer
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
        onViewUserProfile={(username) => {
          setIsInboxOpen(false);
          setPublicProfileUser(username);
        }}
        onOpenOrder={(orderId) => {
          setIsInboxOpen(false);
          const found = getOrderById(orderId);
          if (found) setSelectedOrder(found);
        }}
        onOpenBooking={(bookingId) => {
          setIsInboxOpen(false);
          const found = getBookingById(bookingId);
          if (found) setSelectedBooking(found);
        }}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      {/* Stage 4 Service Modals */}
      {selectedService && (
        <ServiceDetailsModal
          service={selectedService}
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
          onEdit={() => {
            setEditingService(selectedService);
            setSelectedService(null);
          }}
          onViewProviderProfile={(username) => {
            setSelectedService(null);
            handleOpenSellerProfile(username);
          }}
          onOpenCreateBooking={(srv) => {
            setBookingService(srv);
            setIsCreateBookingOpen(true);
          }}
          onOpenMessageProvider={(provider, ctx, initialMsg) => {
            handleOpenMessageWithUser(provider, ctx, initialMsg);
          }}
        />
      )}

      {isCreateServiceOpen && (
        <CreateServiceModal
          isOpen={isCreateServiceOpen}
          onClose={() => setIsCreateServiceOpen(false)}
          onSuccess={(newService) => {
            setIsCreateServiceOpen(false);
            setSelectedService(newService);
          }}
          onRequireAuth={() => {
            setIsCreateServiceOpen(false);
            setCurrentPage('login');
          }}
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

      {/* Stage 5 Talent Modals */}
      {selectedTalent && (
        <TalentDetailsModal
          post={selectedTalent}
          isOpen={!!selectedTalent}
          onClose={() => setSelectedTalent(null)}
          onOpenCreatorProfile={(username) => {
            setSelectedTalent(null);
            handleOpenSellerProfile(username);
          }}
          onOpenLinkedProduct={(productId) => {
            setSelectedTalent(null);
            const prod = products.find((p) => p.id === productId);
            if (prod) {
              setSelectedProduct(prod);
            } else {
              setCurrentPage('marketplace');
            }
          }}
          onOpenLinkedService={(serviceId) => {
            setSelectedTalent(null);
            const srv = services.find((s) => s.id === serviceId);
            if (srv) {
              setSelectedService(srv);
            } else {
              setCurrentPage('services');
            }
          }}
          onOpenMessageCreator={(creator, ctx) => {
            handleOpenMessageWithUser(
              creator,
              ctx,
              `Kumusta po ${creator.name}! Nais ko po sanang magtanong tungkol sa inyong likha na "${ctx.title}".`
            );
          }}
          onEdit={(post) => {
            setSelectedTalent(null);
            setEditingTalent(post);
          }}
          onReport={(post) => {
            setSelectedTalent(null);
            setReportingTalent(post);
          }}
        />
      )}

      {isCreateTalentOpen && (
        <CreateTalentPostModal
          isOpen={isCreateTalentOpen}
          onClose={() => setIsCreateTalentOpen(false)}
          onSuccess={(newPost) => {
            setIsCreateTalentOpen(false);
            setSelectedTalent(newPost);
          }}
          onRequireAuth={() => {
            setIsCreateTalentOpen(false);
            setCurrentPage('login');
          }}
        />
      )}

      {editingTalent && (
        <EditTalentPostModal
          post={editingTalent}
          isOpen={!!editingTalent}
          onClose={() => setEditingTalent(null)}
          onSuccess={() => setEditingTalent(null)}
        />
      )}

      {reportingTalent && (
        <ReportPostModal
          post={reportingTalent}
          isOpen={!!reportingTalent}
          onClose={() => setReportingTalent(null)}
        />
      )}

      {/* Public Profile View Modal */}
      {publicProfileUser && (
        <PublicProfileModal
          usernameOrId={publicProfileUser}
          isOpen={!!publicProfileUser}
          onClose={() => setPublicProfileUser(null)}
          onOpenMessageWithUser={(u) => {
            setPublicProfileUser(null);
            handleOpenMessageWithUser(u);
          }}
          onSelectProduct={(p) => {
            setPublicProfileUser(null);
            setSelectedProduct(p);
          }}
          onSelectService={(s) => {
            setPublicProfileUser(null);
            setSelectedService(s);
          }}
          onSelectTalent={(t) => {
            setPublicProfileUser(null);
            setSelectedTalent(t);
          }}
        />
      )}

      {/* Quick Action Chooser Modal (+) */}
      <CreateActionModal
        isOpen={isCreateActionOpen}
        onClose={() => setIsCreateActionOpen(false)}
        onSelectTalent={() => setIsCreateTalentOpen(true)}
        onSelectProduct={() => setIsCreateProductOpen(true)}
        onSelectService={() => setIsCreateServiceOpen(true)}
      />

      <JoinModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onOpenAgePolicy={() => setIsAgePolicyOpen(true)}
      />

      {/* Stage 7 Order & Booking Modals */}
      <CreateOrderModal
        product={orderingProduct}
        isOpen={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
        onOrderSuccess={(ord) => {
          setSelectedOrder(ord);
        }}
        onOpenLogin={() => setCurrentPage('login')}
      />

      <CreateBookingModal
        service={bookingService}
        isOpen={isCreateBookingOpen}
        onClose={() => setIsCreateBookingOpen(false)}
        onBookingSuccess={(bk) => {
          setSelectedBooking(bk);
        }}
        onOpenLogin={() => setCurrentPage('login')}
      />

      <OrderDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOpenMessage={(participant, ctx) => {
          handleOpenMessageWithUser(participant, ctx);
        }}
        onViewUserProfile={handleOpenSellerProfile}
      />

      <BookingDetailModal
        booking={selectedBooking}
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onOpenMessage={(participant, ctx) => {
          handleOpenMessageWithUser(participant, ctx);
        }}
        onViewUserProfile={handleOpenSellerProfile}
      />

      {/* Stage 8 Admin Financial Portal Modal */}
      <AdminFinancialDashboardModal
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
      />

      {/* Stage 8.5: KYC Verification Modal */}
      <KycVerificationModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
      />

      {/* Stage 8.5: Dedicated Vertical Reels Feed Modal */}
      <ReelsFeedModal
        isOpen={isReelsOpen}
        onClose={() => setIsReelsOpen(false)}
        initialReelId={initialReelId}
        onOpenCreatorProfile={handleOpenSellerProfile}
        onShare={(t, tx, u) => setShareData({ title: t, text: tx, url: u })}
      />

      {/* Stage 8.5: Facebook-like Expanded Media Viewer Modal */}
      <ExpandedMediaViewerModal
        isOpen={!!expandedMediaPost}
        post={expandedMediaPost}
        allPosts={posts}
        onClose={() => setExpandedMediaPost(null)}
        onSelectPost={(p) => setExpandedMediaPost(p)}
        onOpenCreatorProfile={handleOpenSellerProfile}
        onShare={(t, tx, u) => setShareData({ title: t, text: tx, url: u })}
        onReport={(p) => {
          setReportingTalent(p);
          setExpandedMediaPost(null);
        }}
      />

      {/* Stage 8.5: Universal Share Modal */}
      <ShareModal
        isOpen={!!shareData}
        onClose={() => setShareData(null)}
        title={shareData?.title || 'KayaNatinTo'}
        text={shareData?.text}
        url={shareData?.url}
      />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ConnectionProvider>
            <MessagingProvider>
              <ProductProvider>
                <ServiceProvider>
                  <TransactionProvider>
                    <TalentProvider>
                      <ReelsProvider>
                        <MainApp />
                      </ReelsProvider>
                    </TalentProvider>
                  </TransactionProvider>
                </ServiceProvider>
              </ProductProvider>
            </MessagingProvider>
          </ConnectionProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
