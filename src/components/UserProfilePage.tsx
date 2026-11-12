import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Sparkles,
  ShoppingBag,
  Briefcase,
  Heart,
  Edit3,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Plus,
  TrendingUp,
  Wallet,
  Star,
  Settings,
  ChevronRight,
  Package,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  MessageCircle,
  Image as ImageIcon,
  Video,
  Play,
  Lock,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useServices } from '../context/ServiceContext';
import { useTalents } from '../context/TalentContext';
import { useConnections } from '../context/ConnectionContext';
import { useReels } from '../context/ReelsContext';
import { Product } from '../types/product';
import { Service } from '../types/service';
import { TalentPost } from '../types/talent';
import { ReelItem } from '../types/reels';
import { KayaNatinLogo } from './KayaNatinLogo';
import { FollowersListModal } from './FollowersListModal';
import { useMessaging } from '../context/MessagingContext';
import { useTransactions } from '../context/TransactionContext';
import { SellerWalletDashboard } from './SellerWalletDashboard';

interface UserProfilePageProps {
  onNavigateHome: () => void;
  onOpenEditProfile: () => void;
  onOpenCreateProduct: () => void;
  onOpenEditProduct: (product: Product) => void;
  onOpenAgeCharter: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenCreateService?: () => void;
  onOpenEditService?: (service: Service) => void;
  onSelectService?: (service: Service) => void;
  onOpenCreateTalent?: () => void;
  onOpenEditTalent?: (post: TalentPost) => void;
  onSelectTalent?: (post: TalentPost) => void;
  onViewUserProfile?: (username: string) => void;
  onNavigateTransactions?: () => void;
  onOpenKycModal?: () => void;
  onOpenReels?: (reelId?: string) => void;
  onOpenExpandedMedia?: (post: TalentPost) => void;
}

type ProfileTab =
  | 'posts'
  | 'products'
  | 'services'
  | 'photos'
  | 'videos'
  | 'reels'
  | 'about'
  | 'earnings'
  | 'privacy';

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  onNavigateHome,
  onOpenEditProfile,
  onOpenCreateProduct,
  onOpenEditProduct,
  onOpenAgeCharter,
  onSelectProduct,
  onOpenCreateService,
  onOpenEditService,
  onSelectService,
  onOpenCreateTalent,
  onOpenEditTalent,
  onSelectTalent,
  onViewUserProfile,
  onNavigateTransactions,
  onOpenKycModal,
  onOpenReels,
  onOpenExpandedMedia,
}) => {
  const { currentUser, logout } = useAuth();
  const { getSellerProducts, toggleProductAvailability, deleteProduct } = useProducts();
  const { getProviderServices, toggleServiceAvailability, deleteService } = useServices();
  const { getCreatorPosts, deletePost } = useTalents();
  const { reels } = useReels();
  const {
    getFollowersCount,
    getFollowingCount,
    getFollowers,
    getFollowing,
    blockedUsers,
    unblockUser,
    privacySettings,
    updatePrivacySettings,
  } = useConnections();
  const { getOrCreateConversation } = useMessaging();
  const { orders, bookings } = useTransactions();

  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showFollowersList, setShowFollowersList] = useState<'followers' | 'following' | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [talentToDelete, setTalentToDelete] = useState<TalentPost | null>(null);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <KayaNatinLogo size="md" showSubtitle={false} className="mb-4" />
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">
          Kailangan munang mag-log in
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
          Mag-log in upang makita at ma-edit ang iyong profile.
        </p>
        <button
          onClick={onNavigateHome}
          className="mt-4 px-6 py-2.5 rounded-xl bg-[#3B1376] text-white text-xs font-bold cursor-pointer"
        >
          Bumalik sa Homepage
        </button>
      </div>
    );
  }

  // Get products, services, posts, photos, videos, and reels
  const sellerProducts = getSellerProducts(currentUser.username);
  const providerServices = getProviderServices(currentUser.username);
  const userTalents = getCreatorPosts(currentUser.username);
  const userPhotos = userTalents.filter((p) => p.mediaType === 'photo');
  const userVideos = userTalents.filter((p) => p.mediaType === 'video');
  const userReels = reels.filter(
    (r) =>
      r.creatorId === currentUser.id ||
      r.creatorUsername.toLowerCase() === currentUser.username.toLowerCase()
  );

  const kycStatusLabel = {
    approved: 'Verified (KYC Approved)',
    under_review: 'Under Review',
    pending_review: 'Pending Review',
    rejected: 'Rejected',
    resubmission_required: 'Resubmission Required',
    not_submitted: 'Not Submitted',
  }[currentUser.kycStatus || 'not_submitted'];

  const kycStatusColor = {
    approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    under_review: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
    pending_review: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
    resubmission_required: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    not_submitted: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  }[currentUser.kycStatus || 'not_submitted'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 px-4 sm:px-6 lg:px-8 text-left pb-24 transition-colors">
      {/* Top Bar with Home & Logout */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-4">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#3B1376] dark:hover:text-purple-300 transition-colors p-2 rounded-xl hover:bg-white dark:hover:bg-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Bumalik sa Homepage</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenEditProfile}
            className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-[#3B1376] dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>I-edit ang Profile</span>
          </button>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Mag-log Out"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {/* Main Profile Header Card (Stage 8.5 Requirement 3) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-200/90 dark:border-slate-800">
          
          {/* Cover Photo Area */}
          <div
            className="h-36 sm:h-44 relative flex items-start justify-between px-6 pt-4 bg-gradient-to-r from-[#3B1376] via-[#6D28D9] to-[#2D0F55]"
            style={
              currentUser.coverPhotoUrl
                ? {
                    backgroundImage: `linear-gradient(rgba(45, 15, 85, 0.4), rgba(45, 15, 85, 0.6)), url(${currentUser.coverPhotoUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : undefined
            }
          >
            {/* Top Tag Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400 text-purple-950 uppercase tracking-wide shadow-xs">
                {currentUser.isSenior ? 'Senior Creator (60+)' : 'Verified Member'}
              </span>
            </div>

            <button
              onClick={onOpenAgeCharter}
              className="flex items-center gap-1 text-[11px] text-purple-100 hover:text-white bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Verified 18+ Member</span>
            </button>
          </div>

          {/* Centered Avatar and Identity Details */}
          <div className="px-6 pb-6 pt-0 relative text-center">
            
            {/* Avatar Overlapping Banner */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-slate-900 shadow-lg mx-auto -mt-14 sm:-mt-16 overflow-hidden bg-slate-200 dark:bg-slate-800">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-100 text-[#7C3AED] font-bold text-3xl">
                  {currentUser.fullName.charAt(0)}
                </div>
              )}
            </div>

            {/* Display Name & Handle */}
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white mt-3">
              {currentUser.fullName}
            </h1>
            <p className="text-sm font-semibold text-[#7C3AED] dark:text-purple-400 mt-0.5">
              @{currentUser.username}
            </p>

            {/* Location */}
            <div className="flex items-center justify-center gap-1 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {currentUser.location.city}, {currentUser.location.province}
              </span>
            </div>

            {/* Profile Tags (Stage 8.5 Requirement 3: Talento, Product Seller, Service Provider, Creator) */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 max-w-md mx-auto">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                ✨ Talento
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                🛍️ Product Seller
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                🛠️ Service Provider
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-pink-100 text-pink-900 dark:bg-pink-950 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
                🎬 Creator
              </span>
            </div>

            {/* Bio */}
            {currentUser.bio && (
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-lg mx-auto mt-3 font-normal leading-relaxed">
                {currentUser.bio}
              </p>
            )}

            {/* Quick Actions Row */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={onOpenEditProfile}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-[#7C3AED] dark:text-purple-400" />
                <span>Edit Profile</span>
              </button>

              <button
                disabled
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-400 text-xs font-medium flex items-center gap-1.5 cursor-not-allowed"
                title="Sariling profile: Hindi maaaring i-message ang sarili"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Mensahe (Message)</span>
              </button>
            </div>

            {/* Followers, Following & Fast Creation Shortcuts */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setShowFollowersList('followers')}
                  className="hover:text-[#7C3AED] font-medium transition-colors cursor-pointer"
                >
                  <strong className="text-slate-900 dark:text-white font-bold">{getFollowersCount(currentUser.id)}</strong>
                  <span className="text-slate-500 dark:text-slate-400 ml-1">Tagasubaybay</span>
                </button>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <button
                  type="button"
                  onClick={() => setShowFollowersList('following')}
                  className="hover:text-[#7C3AED] font-medium transition-colors cursor-pointer"
                >
                  <strong className="text-slate-900 dark:text-white font-bold">{getFollowingCount(currentUser.id)}</strong>
                  <span className="text-slate-500 dark:text-slate-400 ml-1">Sinusubaybayan</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {onOpenCreateTalent && (
                  <button
                    onClick={onOpenCreateTalent}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Mag-post</span>
                  </button>
                )}
                <button
                  onClick={onOpenCreateProduct}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 text-xs font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Magtinda</span>
                </button>
                {onOpenCreateService && (
                  <button
                    onClick={onOpenCreateService}
                    className="px-3 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-amber-300" />
                    <span>Serbisyo</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* TAB NAVIGATION (Stage 8.5 Requirement 3: Posts, Products, Services, Photos, Videos, Reels, About) */}
          <div className="border-t border-slate-100 dark:border-slate-800 px-4 sm:px-6 flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-none bg-slate-50/50 dark:bg-slate-900/60">
            {/* 1. Posts */}
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'posts'
                  ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>Posts</span>
              <span className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-950 text-[#7C3AED] dark:text-purple-300 text-[10px] flex items-center justify-center font-bold">
                {userTalents.length}
              </span>
            </button>

            {/* 2. Products */}
            <button
              onClick={() => setActiveTab('products')}
              className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'products'
                  ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>Products</span>
              <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-[10px] flex items-center justify-center font-bold">
                {sellerProducts.length}
              </span>
            </button>

            {/* 3. Services */}
            <button
              onClick={() => setActiveTab('services')}
              className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'services'
                  ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>Services</span>
              <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 text-[10px] flex items-center justify-center font-bold">
                {providerServices.length}
              </span>
            </button>

            {/* 4. Photos */}
            <button
              onClick={() => setActiveTab('photos')}
              className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'photos'
                  ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>Photos</span>
              <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] flex items-center justify-center font-bold">
                {userPhotos.length}
              </span>
            </button>

            {/* 5. Videos */}
            <button
              onClick={() => setActiveTab('videos')}
              className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'videos'
                  ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>Videos</span>
              <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] flex items-center justify-center font-bold">
                {userVideos.length}
              </span>
            </button>

            {/* 6. Reels */}
            <button
              onClick={() => setActiveTab('reels')}
              className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'reels'
                  ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>Reels</span>
              <span className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] flex items-center justify-center font-bold">
                {userReels.length}
              </span>
            </button>

            {/* 7. About */}
            <button
              onClick={() => setActiveTab('about')}
              className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'about'
                  ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              About
            </button>

            {/* 8. Earnings Wallet */}
            <button
              onClick={() => setActiveTab('earnings')}
              className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'earnings'
                  ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Kita at Pitaka
            </button>

            {/* 9. Privacy */}
            <button
              onClick={() => setActiveTab('privacy')}
              className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'privacy'
                  ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Privacy
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: ALL POSTS                                         */}
        {/* ======================================================== */}
        {activeTab === 'posts' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Lahat ng Posts ({userTalents.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  I-tap ang anumang larawan o video upang buksan ang expanded media viewer.
                </p>
              </div>
              {onOpenCreateTalent && (
                <button
                  onClick={onOpenCreateTalent}
                  className="px-3.5 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Mag-post</span>
                </button>
              )}
            </div>

            {userTalents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userTalents.map((tPost) => (
                  <div
                    key={tPost.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between gap-3 transition-all"
                  >
                    <div
                      onClick={() =>
                        onOpenExpandedMedia ? onOpenExpandedMedia(tPost) : (onSelectTalent && onSelectTalent(tPost))
                      }
                      className="cursor-pointer space-y-2.5"
                    >
                      <div className="aspect-video w-full rounded-xl bg-black overflow-hidden relative group">
                        <img
                          src={tPost.videoThumbnailUrl || tPost.mediaUrl}
                          alt={tPost.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {tPost.mediaType === 'video' && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <span className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 text-[#7C3AED] dark:text-purple-400 flex items-center justify-center shadow-md">
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            </span>
                          </div>
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white shadow-xs">
                          {tPost.mediaType === 'video' ? 'Video' : 'Litrato'}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                        {tPost.caption}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-rose-500" />
                          {tPost.likesCount}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5 text-purple-600" />
                          {tPost.comments.length}
                        </span>
                        <span>·</span>
                        <span className="text-slate-400 capitalize">
                          {tPost.category.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Owner Management Controls */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      {onOpenEditTalent && (
                        <button
                          type="button"
                          onClick={() => onOpenEditTalent(tPost)}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-[#7C3AED] dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>I-edit</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setTalentToDelete(tPost)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Burahin ang post"
                        aria-label="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <Sparkles className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Wala ka pang naibabahaging post
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Ipakita ang iyong galing sa pagkanta, pagluluto, pagtahi, o pagpipinta gamit ang photo o video.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PRODUCTS                                          */}
        {/* ======================================================== */}
        {activeTab === 'products' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Pamamahala ng Aking Mga Produkto ({sellerProducts.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  I-update ang presyo, stock, at availability ng iyong mga paninda.
                </p>
              </div>
              <button
                onClick={onOpenCreateProduct}
                className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Magdagdag ng Produkto</span>
              </button>
            </div>

            {sellerProducts.length > 0 ? (
              <div className="space-y-3">
                {sellerProducts.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                  >
                    <div
                      onClick={() => onSelectProduct(item)}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                        <img
                          src={item.images[0] || './assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png'}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs">
                          <span className="font-extrabold text-[#7C3AED] dark:text-purple-400">
                            ₱{item.price.toLocaleString()} {item.priceUnit ? `/ ${item.priceUnit}` : ''}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                          <span className="text-slate-500 dark:text-slate-400">Stock: {item.stock}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.isAvailable && item.stock > 0
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {item.isAvailable && item.stock > 0 ? 'Available' : 'Sold Out / Unavailable'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800">
                      <button
                        onClick={() => toggleProductAvailability(item.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
                      >
                        {item.isAvailable ? 'Mark Sold' : 'Make Available'}
                      </button>
                      <button
                        onClick={() => onOpenEditProduct(item)}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-[#7C3AED] dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>I-edit</span>
                      </button>
                      <button
                        onClick={() => setProductToDelete(item)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Wala ka pang ibinebentang produkto
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  I-post ang iyong lutong bahay, sariwang ani, o gawang-kamay na produkto.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: SERVICES                                          */}
        {/* ======================================================== */}
        {activeTab === 'services' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Pamamahala ng Aking Mga Serbisyo ({providerServices.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  I-update ang rate, iskedyul, at availability ng iyong serbisyo.
                </p>
              </div>
              {onOpenCreateService && (
                <button
                  onClick={onOpenCreateService}
                  className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Mag-alok ng Serbisyo</span>
                </button>
              )}
            </div>

            {providerServices.length > 0 ? (
              <div className="space-y-3">
                {providerServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                  >
                    <div
                      onClick={() => onSelectService && onSelectService(srv)}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                        <img
                          src={
                            (srv.portfolioImages && srv.portfolioImages[0]) ||
                            srv.providerAvatarUrl ||
                            'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80'
                          }
                          alt={srv.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                          {srv.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs">
                          <span className="font-extrabold text-[#7C3AED] dark:text-purple-400">
                            ₱{srv.rate.toLocaleString()} {srv.rateUnit ? `/ ${srv.rateUnit}` : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800">
                      <button
                        onClick={() => toggleServiceAvailability(srv.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
                      >
                        {srv.isAvailable ? 'I-pause' : 'I-activate'}
                      </button>
                      {onOpenEditService && (
                        <button
                          onClick={() => onOpenEditService(srv)}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-[#7C3AED] dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>I-edit</span>
                        </button>
                      )}
                      <button
                        onClick={() => setServiceToDelete(srv)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Wala ka pang iniaalok na serbisyo
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Marunong ka bang mag-ayos ng sirang gamit, magturo, o magtahi? I-post ang iyong kasanayan.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: PHOTOS (Stage 8.5 Requirement 3)                  */}
        {/* ======================================================== */}
        {activeTab === 'photos' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                  <span>Mga Larawan / Photos ({userPhotos.length})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  I-tap ang larawan upang buksan ang full-screen expanded photo viewer.
                </p>
              </div>
            </div>

            {userPhotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {userPhotos.map((post) => (
                  <div
                    key={post.id}
                    onClick={() =>
                      onOpenExpandedMedia ? onOpenExpandedMedia(post) : (onSelectTalent && onSelectTalent(post))
                    }
                    className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer relative group"
                  >
                    <img
                      src={post.mediaUrl}
                      alt={post.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                      <p className="text-[11px] text-white line-clamp-2 font-medium">
                        {post.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <ImageIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Wala ka pang naibabahaging photo posts
                </h4>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: VIDEOS (Stage 8.5 Requirement 3)                  */}
        {/* ======================================================== */}
        {activeTab === 'videos' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-600" />
                  <span>Mga Video ({userVideos.length})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  I-tap ang video upang manood gamit ang playback controls at komento.
                </p>
              </div>
            </div>

            {userVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userVideos.map((post) => (
                  <div
                    key={post.id}
                    onClick={() =>
                      onOpenExpandedMedia ? onOpenExpandedMedia(post) : (onSelectTalent && onSelectTalent(post))
                    }
                    className="aspect-video rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-slate-700 cursor-pointer relative group"
                  >
                    <img
                      src={post.videoThumbnailUrl || post.mediaUrl}
                      alt={post.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="w-12 h-12 rounded-full bg-white/90 dark:bg-slate-900/90 text-[#7C3AED] dark:text-purple-400 flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      </span>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <p className="text-xs text-white font-medium line-clamp-1">
                        {post.caption}
                      </p>
                      <span className="text-[10px] text-purple-300">
                        Duration: {post.videoDuration || '1:30'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <Video className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Wala ka pang naibabahaging video posts
                </h4>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: REELS (Stage 8.5 Requirement 3)                   */}
        {/* ======================================================== */}
        {activeTab === 'reels' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Mga Reels ({userReels.length})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Maikling vertical videos na tumatanggap ng Reels Appreciation Gifts.
                </p>
              </div>
              {onOpenReels && (
                <button
                  type="button"
                  onClick={() => onOpenReels()}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Manood ng Reels</span>
                </button>
              )}
            </div>

            {userReels.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {userReels.map((reel) => (
                  <div
                    key={reel.id}
                    onClick={() => onOpenReels && onOpenReels(reel.id)}
                    className="aspect-[9/16] rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-slate-700 cursor-pointer relative group"
                  >
                    <img
                      src={reel.videoThumbnailUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'}
                      alt={reel.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
                      <p className="text-xs font-semibold line-clamp-2">
                        {reel.caption}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-amber-300">
                        <span>❤️ {reel.likesCount}</span>
                        <span>·</span>
                        <span>🎁 {reel.giftsReceivedCount} gifts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <Sparkles className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Wala ka pang Reels na na-upload
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Mag-upload ng short vertical video upang makatanggap ng virtual gifts mula sa komunidad.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: ABOUT & ACCOUNT INFORMATION                       */}
        {/* ======================================================== */}
        {activeTab === 'about' && (
          <div className="space-y-4">
            {/* Account Information Card (Stage 8.5 Requirement 4) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Impormasyon ng Account (Account Information)
                  </h3>
                </div>
                <button
                  onClick={onOpenEditProfile}
                  className="text-xs font-semibold text-[#7C3AED] dark:text-purple-400 hover:underline cursor-pointer"
                >
                  I-edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Email</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 break-all">
                    {currentUser.email || 'Hindi nakatala'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Araw ng Kapanganakan (DOB)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {currentUser.dateOfBirth} ({currentUser.age} taong gulang)
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Tirahan / Address</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {currentUser.location.barangay ? `${currentUser.location.barangay}, ` : ''}
                    {currentUser.location.city}, {currentUser.location.province}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Account Verification (KYC)</span>
                  <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${kycStatusColor}`}>
                    {kycStatusLabel}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">18+ Eligibility Status</span>
                  <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Kwalipikadong Miyembro (18+)</span>
                  </span>
                </div>
              </div>

              {/* Reminder Banner (Stage 8.5 Requirement 4 verbatim) */}
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Para sa mga 18 taong gulang pataas ang KayaNatinTo.</p>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                    Nananatiling ligtas at nakatago ang iyong sensitibong impormasyon. Hindi ito ipinapakita sa pampublikong profile alinsunod sa Data Privacy Act ng Pilipinas.
                  </p>
                </div>
              </div>
            </div>

            {/* Skills & Talents Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Mga Kasanayan, Talento, o Serbisyo</span>
              </h3>
              {currentUser.skills && currentUser.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {currentUser.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#3B1376] dark:text-purple-300 text-xs font-semibold border border-purple-200 dark:border-purple-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  Wala pang nailalagay na kasanayan.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 8: EARNINGS WALLET DASHBOARD                         */}
        {/* ======================================================== */}
        {activeTab === 'earnings' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Pitaka ng Nagbebenta at Buod ng Kita
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pamahalaan ang kita mula sa mga produkto, serbisyo, at Reels gifts appreciation.
                </p>
              </div>
              {onNavigateTransactions && (
                <button
                  type="button"
                  onClick={onNavigateTransactions}
                  className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                  <span>Transaksyon Dashboard</span>
                </button>
              )}
            </div>

            {/* Seller Wallet Dashboard Component */}
            <SellerWalletDashboard onOpenKycModal={onOpenKycModal} />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 9: PRIVACY & SAFETY SETTINGS                         */}
        {/* ======================================================== */}
        {activeTab === 'privacy' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Kaligtasan, Moderation, at Privacy Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pamahalaan ang visibility ng iyong profile, privacy sa mga mensahe, at mga naka-block na account.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Visibility ng Profile
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {privacySettings.profileVisibility === 'public'
                      ? 'Pampubliko: Makikita ng lahat ng miyembro sa KayaNatinTo'
                      : 'Eksklusibo sa mga rehistradong miyembro lamang'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updatePrivacySettings({
                      profileVisibility:
                        privacySettings.profileVisibility === 'public' ? 'members-only' : 'public',
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    privacySettings.profileVisibility === 'public'
                      ? 'bg-[#7C3AED] text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {privacySettings.profileVisibility === 'public' ? 'Public' : 'Members Only'}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Sino ang maaaring magpadala ng Mensahe
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {privacySettings.allowMessagesFrom === 'everyone'
                      ? 'Lahat ng 18+ miyembro (Inirerekomenda para sa mga nagtitinda)'
                      : 'Mga sinusubaybayan ko lamang'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updatePrivacySettings({
                      allowMessagesFrom:
                        privacySettings.allowMessagesFrom === 'everyone' ? 'following' : 'everyone',
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    privacySettings.allowMessagesFrom === 'everyone'
                      ? 'bg-purple-100 dark:bg-purple-950 text-[#7C3AED] dark:text-purple-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {privacySettings.allowMessagesFrom === 'everyone' ? 'Lahat (18+)' : 'Following Lang'}
                </button>
              </div>
            </div>

            {/* Blocked Users Manager */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-2">
                Mga Naka-block na Account ({blockedUsers.length})
              </h4>
              {blockedUsers.length > 0 ? (
                <div className="space-y-2">
                  {blockedUsers.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs">
                          {b.blockedUserName.charAt(0)}
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-slate-900 dark:text-white">{b.blockedUserName}</h5>
                          <p className="text-[10px] text-slate-400">@{b.blockedUsername}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => unblockUser(b.blockedUserId)}
                        className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                      >
                        I-unblock
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl text-center">
                  Walang naka-block na user sa iyong account.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Followers & Following Modal */}
      {showFollowersList && (
        <FollowersListModal
          isOpen={true}
          onClose={() => setShowFollowersList(null)}
          title={showFollowersList === 'followers' ? 'Mga Tagasubaybay (Followers)' : 'Sinusubaybayan (Following)'}
          type={showFollowersList}
          list={showFollowersList === 'followers' ? getFollowers(currentUser.id) : getFollowing(currentUser.id)}
          onSelectUser={(username: string) => {
            setShowFollowersList(null);
            if (onViewUserProfile) onViewUserProfile(username);
          }}
        />
      )}

      {/* Delete Talent Post Confirmation Modal */}
      {talentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Burahin ang Post na Ito?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hindi na maibabalik ang post na "{talentToDelete.caption.slice(0, 30)}..." kapag ito ay binura.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTalentToDelete(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Kanselahin
              </button>
              <button
                type="button"
                onClick={() => {
                  deletePost(talentToDelete.id);
                  setTalentToDelete(null);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer"
              >
                Oo, Burahin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Burahin ang Produkto?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hindi na maibabalik ang produktong "{productToDelete.title}" kapag ito ay binura.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Kanselahin
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer"
              >
                Oo, Burahin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Service Confirmation Modal */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Burahin ang Serbisyo?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hindi na maibabalik ang serbisyong "{serviceToDelete.title}" kapag ito ay binura.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Kanselahin
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteService(serviceToDelete.id);
                  setServiceToDelete(null);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer"
              >
                Oo, Burahin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/60 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Nais mo bang mag-log out?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Maaari kang mag-log in muli anumang oras gamit ang iyong email at password.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Kanselahin
              </button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setShowLogoutConfirm(false);
                  onNavigateHome();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer"
              >
                Mag-log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
