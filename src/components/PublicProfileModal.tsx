import React, { useState, useMemo } from 'react';
import {
  X,
  MapPin,
  ShieldCheck,
  UserPlus,
  UserCheck,
  MessageCircle,
  MoreVertical,
  Flag,
  Ban,
  Sparkles,
  ShoppingBag,
  Briefcase,
  Heart,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useConnections } from '../context/ConnectionContext';
import { useMessaging } from '../context/MessagingContext';
import { useProducts } from '../context/ProductContext';
import { useServices } from '../context/ServiceContext';
import { useTalents } from '../context/TalentContext';
import { PEOPLE_OF_KAYANATINTO } from '../data/mockData';
import { ReportModal } from './ReportModal';
import { FollowersListModal } from './FollowersListModal';
import { Product } from '../types/product';
import { Service } from '../types/service';
import { TalentPost } from '../types/talent';

interface PublicProfileModalProps {
  usernameOrId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenMessageWithUser: (user: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    isSenior?: boolean;
    role?: string;
  }) => void;
  onSelectProduct?: (product: Product) => void;
  onSelectService?: (service: Service) => void;
  onSelectTalent?: (post: TalentPost) => void;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({
  usernameOrId,
  isOpen,
  onClose,
  onOpenMessageWithUser,
  onSelectProduct,
  onSelectService,
  onSelectTalent,
}) => {
  const { registeredUsers, currentUser } = useAuth();
  const {
    isFollowing,
    followUser,
    unfollowUser,
    getFollowersCount,
    getFollowingCount,
    getFollowers,
    getFollowing,
    blockUser,
    unblockUser,
    isBlocked,
  } = useConnections();
  const { getSellerProducts } = useProducts();
  const { getProviderServices } = useServices();
  const { getCreatorPosts } = useTalents();

  const [activeTab, setActiveTab] = useState<'talents' | 'products' | 'services'>('talents');
  const [showMenu, setShowMenu] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [showFollowersList, setShowFollowersList] = useState<'followers' | 'following' | null>(null);

  // Resolve target user
  const targetUser = useMemo(() => {
    if (!usernameOrId) return null;
    const clean = usernameOrId.toLowerCase().trim();

    // 1. Check in registeredUsers
    const reg = registeredUsers.find(
      (u) => u.username.toLowerCase() === clean || u.id.toLowerCase() === clean
    );
    if (reg) {
      return {
        id: reg.id,
        name: reg.fullName,
        username: reg.username,
        avatarUrl: reg.avatarUrl,
        isSenior: reg.isSenior,
        age: reg.age,
        location: `${reg.location.city}, ${reg.location.province}`,
        bio: reg.bio,
        skills: reg.skills,
        interests: reg.interests,
        accountType: reg.accountType,
      };
    }

    // 2. Check in PEOPLE_OF_KAYANATINTO mock list
    const mockPerson = PEOPLE_OF_KAYANATINTO.find(
      (p) =>
        p.name.toLowerCase().includes(clean) ||
        clean.includes(p.name.toLowerCase().split(' ')[0]) ||
        p.id.toLowerCase() === clean
    );
    if (mockPerson) {
      const generatedUsername = mockPerson.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      return {
        id: mockPerson.id,
        name: mockPerson.name,
        username: generatedUsername,
        avatarUrl: '',
        isSenior: mockPerson.age >= 60,
        age: mockPerson.age,
        location: mockPerson.location,
        bio: mockPerson.bio,
        skills: mockPerson.sampleOfferings,
        interests: ['Community Artisan', mockPerson.categoryLabel],
        accountType: 'seller',
      };
    }

    // Fallback user object
    return {
      id: `usr-${clean}`,
      name: clean.charAt(0).toUpperCase() + clean.slice(1),
      username: clean,
      avatarUrl: '',
      isSenior: false,
      age: 32,
      location: 'Laguna, Philippines',
      bio: 'Kasapi ng komunidad ng KayaNatinTo.',
      skills: [],
      interests: [],
      accountType: 'buyer',
    };
  }, [usernameOrId, registeredUsers]);

  if (!isOpen || !targetUser) return null;

  const isSelf = currentUser && (currentUser.id === targetUser.id || currentUser.username === targetUser.username);
  const following = isFollowing(targetUser.id);
  const blocked = isBlocked(targetUser.id);

  const followersCount = getFollowersCount(targetUser.id);
  const followingCount = getFollowingCount(targetUser.id);
  const followersList = getFollowers(targetUser.id);
  const followingList = getFollowing(targetUser.id);

  const userProducts = getSellerProducts(targetUser.username);
  const userServices = getProviderServices(targetUser.username);
  const userTalents = getCreatorPosts(targetUser.username);

  const handleMessage = () => {
    onClose();
    onOpenMessageWithUser({
      id: targetUser.id,
      name: targetUser.name,
      username: targetUser.username,
      avatarUrl: targetUser.avatarUrl,
      isSenior: targetUser.isSenior,
      role: targetUser.accountType,
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 max-h-[92vh] flex flex-col text-left">
          
          {/* Top Banner Gradient */}
          <div className="relative bg-gradient-to-r from-[#2F106A] via-[#3B1376] to-[#4F28D9] pt-6 pb-16 px-6 text-white shrink-0">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-purple-950 uppercase tracking-wide">
                {targetUser.accountType}
              </span>

              <div className="flex items-center gap-2">
                {/* 3-dots menu for block / report */}
                {!isSelf && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                      aria-label="More options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {showMenu && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-10 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 text-slate-800 animate-in fade-in zoom-in-95"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            if (blocked) {
                              unblockUser(targetUser.id);
                            } else {
                              blockUser({
                                id: targetUser.id,
                                name: targetUser.name,
                                username: targetUser.username,
                                avatarUrl: targetUser.avatarUrl,
                              });
                            }
                          }}
                          className="w-full px-3.5 py-2 text-xs font-semibold hover:bg-rose-50 text-slate-700 hover:text-rose-600 flex items-center gap-2 text-left"
                        >
                          <Ban className="w-3.5 h-3.5 text-rose-500" />
                          <span>{blocked ? 'I-unblock ang User' : 'I-block ang User'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            setIsReportOpen(true);
                          }}
                          className="w-full px-3.5 py-2 text-xs font-semibold hover:bg-rose-50 text-rose-600 flex items-center gap-2 text-left"
                        >
                          <Flag className="w-3.5 h-3.5" />
                          <span>I-report ang User</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Isara"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-2">
              <h2 className="text-xl font-bold font-display text-white">{targetUser.name}</h2>
              <p className="text-xs text-purple-200">@{targetUser.username}</p>
            </div>
          </div>

          {/* Avatar & Action Row */}
          <div className="px-6 -mt-10 flex items-end justify-between shrink-0 relative">
            <div className="w-20 h-20 rounded-full ring-4 ring-white shadow-xl overflow-hidden bg-purple-100 border-2 border-purple-200 shrink-0">
              {targetUser.avatarUrl ? (
                <img
                  src={targetUser.avatarUrl}
                  alt={targetUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-[#3B1376] text-xl">
                  {targetUser.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Follow & Message Buttons */}
            {!isSelf && (
              <div className="flex items-center gap-2 mb-1">
                <button
                  type="button"
                  onClick={() => {
                    if (following) {
                      unfollowUser(targetUser.id);
                    } else {
                      followUser({
                        id: targetUser.id,
                        name: targetUser.name,
                        username: targetUser.username,
                        avatarUrl: targetUser.avatarUrl,
                        isSenior: targetUser.isSenior,
                      });
                    }
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs ${
                    following
                      ? 'bg-purple-100 text-[#3B1376] hover:bg-purple-200'
                      : 'bg-[#3B1376] hover:bg-[#2F106A] text-white'
                  }`}
                >
                  {following ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Sinusubaybayan</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>I-follow</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleMessage}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Mensahe</span>
                </button>
              </div>
            )}
          </div>

          {/* User Bio and Stats */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {blocked && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
                <span>Naka-block ang user na ito. Hindi ka makatatanggap ng mensahe mula sa kanya.</span>
                <button
                  onClick={() => unblockUser(targetUser.id)}
                  className="font-bold underline text-rose-900 ml-2 shrink-0"
                >
                  I-unblock
                </button>
              </div>
            )}

            {/* Badges and Location */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {targetUser.location}
              </span>
              <span>·</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                  targetUser.isSenior
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-purple-100 text-[#3B1376]'
                }`}
              >
                {targetUser.isSenior
                  ? `Senior Member (${targetUser.age} y/o)`
                  : `Adult Member (${targetUser.age} y/o)`}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified 18+
              </span>
            </div>

            {/* Followers / Following Counters */}
            <div className="flex items-center gap-4 py-2 border-y border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setShowFollowersList('followers')}
                className="hover:text-[#3B1376] font-medium transition-colors"
              >
                <strong className="text-slate-900 font-bold text-sm mr-1">
                  {followersCount}
                </strong>
                <span className="text-slate-500">Tagasubaybay (Followers)</span>
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setShowFollowersList('following')}
                className="hover:text-[#3B1376] font-medium transition-colors"
              >
                <strong className="text-slate-900 font-bold text-sm mr-1">
                  {followingCount}
                </strong>
                <span className="text-slate-500">Sinusubaybayan (Following)</span>
              </button>
            </div>

            {/* Bio */}
            {targetUser.bio && (
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-purple-50/40 p-3.5 rounded-2xl border border-purple-100">
                {targetUser.bio}
              </p>
            )}

            {/* Offerings Tabs */}
            <div className="pt-2">
              <div className="flex items-center gap-4 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('talents')}
                  className={`text-xs font-bold pb-1 transition-colors ${
                    activeTab === 'talents'
                      ? 'border-b-2 border-[#3B1376] text-[#3B1376]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Talento ({userTalents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className={`text-xs font-bold pb-1 transition-colors ${
                    activeTab === 'products'
                      ? 'border-b-2 border-[#3B1376] text-[#3B1376]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Produkto ({userProducts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className={`text-xs font-bold pb-1 transition-colors ${
                    activeTab === 'services'
                      ? 'border-b-2 border-[#3B1376] text-[#3B1376]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Serbisyo ({userServices.length})
                </button>
              </div>

              {/* Tab Content */}
              <div className="pt-3">
                {activeTab === 'talents' && (
                  userTalents.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {userTalents.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => {
                            onClose();
                            if (onSelectTalent) onSelectTalent(t);
                          }}
                          className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 cursor-pointer hover:border-purple-300 transition-all"
                        >
                          <div className="aspect-video bg-black relative">
                            <img
                              src={t.videoThumbnailUrl || t.mediaUrl}
                              alt={t.caption}
                              className="w-full h-full object-cover"
                            />
                            {t.mediaType === 'video' && (
                              <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/70 text-white text-[9px]">
                                ▶ {t.videoDuration || 'Video'}
                              </span>
                            )}
                          </div>
                          <p className="p-2 text-[11px] font-semibold text-slate-800 line-clamp-1">
                            {t.caption}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-4 text-center italic">
                      Wala pang ibinahaging talento ang lumikhang ito.
                    </p>
                  )
                )}

                {activeTab === 'products' && (
                  userProducts.length > 0 ? (
                    <div className="space-y-2">
                      {userProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            onClose();
                            if (onSelectProduct) onSelectProduct(p);
                          }}
                          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between cursor-pointer hover:border-purple-300 transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={p.images[0] || '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png'}
                              alt={p.title}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                                {p.title}
                              </h4>
                              <p className="text-[11px] text-[#3B1376] font-extrabold">
                                ₱{p.price.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-[#3B1376]">Tingnan →</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-4 text-center italic">
                      Wala pang nakalistang produkto.
                    </p>
                  )
                )}

                {activeTab === 'services' && (
                  userServices.length > 0 ? (
                    <div className="space-y-2">
                      {userServices.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => {
                            onClose();
                            if (onSelectService) onSelectService(s);
                          }}
                          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between cursor-pointer hover:border-purple-300 transition-all"
                        >
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                              {s.title}
                            </h4>
                            <p className="text-[11px] text-[#3B1376] font-extrabold">
                              ₱{s.rate.toLocaleString()} / {s.rateUnit || 'serbisyo'}
                            </p>
                          </div>
                          <span className="text-[11px] font-bold text-[#3B1376]">Tingnan →</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-4 text-center italic">
                      Wala pang nakalistang serbisyo.
                    </p>
                  )
                )}
              </div>
            </div>

          </div>

          {/* Footer Action */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              KayaNatinTo Verified 18+ Creator Profile
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-700"
            >
              Isara
            </button>
          </div>

        </div>
      </div>

      {/* Report Modal */}
      {isReportOpen && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          targetType="user"
          targetId={targetUser.id}
          targetName={targetUser.name}
        />
      )}

      {/* Followers / Following List Modal */}
      {showFollowersList && (
        <FollowersListModal
          isOpen={!!showFollowersList}
          onClose={() => setShowFollowersList(null)}
          title={showFollowersList === 'followers' ? `Mga Tagasubaybay ni ${targetUser.name}` : `Mga Sinusubaybayan ni ${targetUser.name}`}
          type={showFollowersList}
          list={showFollowersList === 'followers' ? followersList : followingList}
          onSelectUser={(u) => {
            setShowFollowersList(null);
          }}
          onOpenMessageUser={(u) => {
            setShowFollowersList(null);
            onClose();
            onOpenMessageWithUser(u);
          }}
        />
      )}
    </>
  );
};
