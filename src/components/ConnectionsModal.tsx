import React, { useState } from 'react';
import {
  X,
  Users,
  Search,
  UserCheck,
  UserPlus,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import { UserConnectionProfile } from '../types/community';

interface ConnectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'followers' | 'following';
  targetUserId?: string;
  targetUserName?: string;
  onSelectUserToChat?: (user: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
    isSenior?: boolean;
    city?: string;
  }) => void;
}

export const ConnectionsModal: React.FC<ConnectionsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'following',
  targetUserId,
  targetUserName = 'Aking Koneksyon',
  onSelectUserToChat,
}) => {
  const { isFollowing, toggleFollow, getConnectionsList } = useCommunity();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const { followers, following } = getConnectionsList(targetUserId);
  const activeList = activeTab === 'followers' ? followers : following;

  const filteredList = activeList.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.city && u.city.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-purple-100 flex flex-col text-left max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="connections-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#2F106A] to-[#4F28D9] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 id="connections-title" className="text-base sm:text-lg font-bold font-display leading-tight">
                {targetUserName}
              </h3>
              <p className="text-xs text-purple-200">Komunidad at Koneksyon</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Isara"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
          <button
            onClick={() => setActiveTab('followers')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'followers'
                ? 'border-[#3B1376] text-[#3B1376] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Mga Sumusubaybay</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-100 text-[#3B1376] font-bold">
              {followers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'following'
                ? 'border-[#3B1376] text-[#3B1376] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Sinusubaybayan</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-100 text-[#3B1376] font-bold">
              {following.length}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-white border-b border-slate-100 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Maghanap ng pangalan o username..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 focus:bg-white focus:border-purple-500 text-xs sm:text-sm outline-none transition-all"
            />
          </div>
        </div>

        {/* Equal Opportunity Banner */}
        <div className="px-4 py-2.5 bg-amber-50/80 border-b border-amber-200/60 text-[11px] text-amber-900 flex items-start gap-2 shrink-0">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>Pantay na Pagkakataon:</strong> Sa KayaNatinTo, ang dami ng followers ay hindi hadlang upang matuklasan ang iyong galing. Ang bawat baguhan at nakatatanda ay may parehas na liwanag sa pamayanan.
          </p>
        </div>

        {/* Users List */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2.5 flex-1 divide-y divide-slate-100">
          {filteredList.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-400 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-700">Walang natagpuang miyembro</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchQuery ? 'Subukang maghanap ng ibang pangalan.' : 'Wala pang nakatalang koneksyon sa bahaging ito.'}
              </p>
            </div>
          ) : (
            filteredList.map((user) => {
              const followingUser = isFollowing(user.id);
              const isSelf = currentUser && currentUser.id === user.id;

              return (
                <div key={user.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
                  {/* Avatar & Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName}
                          className="w-11 h-11 rounded-full object-cover border border-purple-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                          {user.fullName.charAt(0)}
                        </div>
                      )}
                      {user.isSenior && (
                        <span
                          title="Senior Citizen (60+)"
                          className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-amber-400 text-purple-950 font-black text-[9px] rounded-full border border-white shadow-xs"
                        >
                          60+
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {user.fullName}
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-700 font-medium">@{user.username}</p>
                      {user.city && (
                        <p className="text-[10px] text-slate-400 flex items-center gap-0.5 truncate mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{user.city}, {user.province}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {onSelectUserToChat && !isSelf && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectUserToChat({
                            id: user.id,
                            fullName: user.fullName,
                            username: user.username,
                            avatarUrl: user.avatarUrl,
                            isSenior: user.isSenior,
                            city: user.city,
                          });
                        }}
                        className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#3B1376] border border-purple-200 transition-colors"
                        title="Magpadala ng mensahe"
                        aria-label={`Mensahe kay ${user.fullName}`}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}

                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() =>
                          toggleFollow({
                            id: user.id,
                            fullName: user.fullName,
                            username: user.username,
                            avatarUrl: user.avatarUrl,
                            isSenior: user.isSenior,
                            city: user.city,
                          })
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs ${
                          followingUser
                            ? 'bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300'
                            : 'bg-[#3B1376] hover:bg-[#2F106A] text-white shadow-purple-900/20'
                        }`}
                      >
                        {followingUser ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Sundan</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>KayaNatinTo Komunidad</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300 transition-colors"
          >
            Isara
          </button>
        </div>
      </div>
    </div>
  );
};
