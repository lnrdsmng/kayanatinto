import React from 'react';
import { X, Users, UserPlus, UserCheck, ShieldCheck, MessageSquare } from 'lucide-react';
import { FollowRecord } from '../types/connection';
import { useConnections } from '../context/ConnectionContext';
import { useAuth } from '../context/AuthContext';

interface FollowersListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  list: FollowRecord[];
  type: 'followers' | 'following';
  onSelectUser: (username: string) => void;
  onOpenMessageUser?: (user: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    isSenior?: boolean;
  }) => void;
}

export const FollowersListModal: React.FC<FollowersListModalProps> = ({
  isOpen,
  onClose,
  title,
  list,
  type,
  onSelectUser,
  onOpenMessageUser,
}) => {
  const { isFollowing, followUser, unfollowUser } = useConnections();
  const { currentUser } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#2F106A] to-[#4F28D9] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">{title}</h3>
              <p className="text-xs text-purple-200">
                {list.length} {type === 'followers' ? 'tagasubaybay' : 'sinusubaybayan'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List Content */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {list.length > 0 ? (
            list.map((item) => {
              const followingThis = isFollowing(item.followerId);
              const isSelf = currentUser && (currentUser.id === item.followerId || currentUser.username === item.followerUsername);

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 hover:bg-purple-50/40 transition-colors"
                >
                  <div
                    onClick={() => {
                      onClose();
                      onSelectUser(item.followerUsername);
                    }}
                    className="flex items-center gap-3 cursor-pointer min-w-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-200 overflow-hidden shrink-0 border border-purple-300">
                      {item.followerAvatarUrl ? (
                        <img
                          src={item.followerAvatarUrl}
                          alt={item.followerName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-[#3B1376] text-sm">
                          {item.followerName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {item.followerName}
                        </h4>
                        {item.followerIsSenior && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900">
                            Senior
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        @{item.followerUsername}
                      </p>
                    </div>
                  </div>

                  {!isSelf && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {onOpenMessageUser && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenMessageUser({
                              id: item.followerId,
                              name: item.followerName,
                              username: item.followerUsername,
                              avatarUrl: item.followerAvatarUrl,
                              isSenior: item.followerIsSenior,
                            });
                          }}
                          className="p-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#3B1376] transition-colors"
                          title={`Magpadala ng mensahe kay ${item.followerName}`}
                          aria-label={`Mensahe para kay ${item.followerName}`}
                        >
                          <MessageSquare className="w-4 h-4 text-[#4F28D9]" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (followingThis) {
                            unfollowUser(item.followerId);
                          } else {
                            followUser({
                              id: item.followerId,
                              name: item.followerName,
                              username: item.followerUsername,
                              avatarUrl: item.followerAvatarUrl,
                              isSenior: item.followerIsSenior,
                            });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                          followingThis
                            ? 'bg-purple-100 text-[#3B1376] hover:bg-purple-200'
                            : 'bg-[#3B1376] hover:bg-[#2F106A] text-white shadow-xs'
                        }`}
                      >
                        {followingThis ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Subaybay</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>I-follow</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              Wala pang rekord sa talaang ito.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500">
            Ang dami ng tagasubaybay ay hindi nakakaapekto sa pagiging madiskubre sa KayaNatinTo.
          </p>
        </div>

      </div>
    </div>
  );
};
