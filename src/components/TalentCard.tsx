import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Play,
  MapPin,
  MoreVertical,
  Flag,
  Edit3,
  Trash2,
  ShoppingBag,
  Briefcase,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { TalentPost, TALENT_CATEGORIES } from '../types/talent';
import { useTalents } from '../context/TalentContext';
import { useAuth } from '../context/AuthContext';

interface TalentCardProps {
  post: TalentPost;
  onClick: () => void;
  onOpenCreatorProfile?: (username: string) => void;
  onOpenLinkedProduct?: (productId: string) => void;
  onOpenLinkedService?: (serviceId: string) => void;
  onEdit?: (post: TalentPost) => void;
  onReport?: (post: TalentPost) => void;
  onOpenMessageCreator?: (
    creator: {
      id: string;
      name: string;
      username: string;
      avatarUrl?: string;
      isSenior?: boolean;
    },
    contextItem: {
      type: 'talent';
      id: string;
      title: string;
      imageUrl?: string;
    }
  ) => void;
}

export const TalentCard: React.FC<TalentCardProps> = ({
  post,
  onClick,
  onOpenCreatorProfile,
  onOpenLinkedProduct,
  onOpenLinkedService,
  onEdit,
  onReport,
  onOpenMessageCreator,
}) => {
  const { toggleLikePost, isPostLiked, toggleBookmarkPost, isPostBookmarked } = useTalents();
  const { currentUser } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const liked = isPostLiked(post.id);
  const bookmarked = isPostBookmarked(post.id);
  const isOwner = currentUser && (currentUser.id === post.creatorId || currentUser.username === post.creatorUsername);

  const categoryMeta = TALENT_CATEGORIES.find((c) => c.id === post.category);

  // Format relative time in Tagalog / English
  const getRelativeTime = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / (60 * 1000));
      if (diffMins < 60) return `${Math.max(1, diffMins)}m ang nakalipas`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ang nakalipas`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ang nakalipas`;
    } catch {
      return '';
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: post.caption.slice(0, 40),
        text: `Tingnan ang talentong ito sa KayaNatinTo: ${post.caption.slice(0, 100)}`,
        url: window.location.href,
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  const mediaSource = post.mediaType === 'video'
    ? (post.videoThumbnailUrl || post.mediaUrl)
    : post.mediaUrl;

  return (
    <article
      onClick={onClick}
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col text-left cursor-pointer group relative"
    >
      {/* 1. Header: Creator & Metadata */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 border-b border-slate-100">
        <div
          onClick={(e) => {
            if (onOpenCreatorProfile) {
              e.stopPropagation();
              onOpenCreatorProfile(post.creatorUsername);
            }
          }}
          className="flex items-center gap-2.5 min-w-0 hover:opacity-90 transition-opacity"
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-purple-100 border border-purple-200 shrink-0">
            <img
              src={post.creatorAvatarUrl || './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png'}
              alt={post.creatorName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {post.creatorIsSenior && (
              <span
                className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-amber-400 border border-white"
                title="Senior Citizen Creator"
              />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                {post.creatorName}
              </span>
              {post.creatorIsSenior && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Senior ({post.creatorAge})
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="truncate">@{post.creatorUsername}</span>
              <span>·</span>
              <span className="flex items-center gap-0.5 text-slate-400">
                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                {post.location?.city || 'Laguna'}
              </span>
              <span>·</span>
              <span className="text-slate-400">{getRelativeTime(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Options dropdown button */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-8 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95"
            >
              <button
                type="button"
                onClick={(e) => {
                  setShowMenu(false);
                  handleShare(e);
                }}
                className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 flex items-center gap-2"
              >
                <Share2 className="w-3.5 h-3.5 text-purple-600" />
                <span>I-share ang Post</span>
              </button>

              {isOwner ? (
                <>
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(post);
                      }}
                      className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 flex items-center gap-2"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                      <span>I-edit ang Post</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  {onOpenMessageCreator && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onOpenMessageCreator(
                          {
                            id: post.creatorId,
                            name: post.creatorName,
                            username: post.creatorUsername,
                            avatarUrl: post.creatorAvatarUrl,
                            isSenior: post.creatorIsSenior,
                          },
                          {
                            type: 'talent',
                            id: post.id,
                            title: post.caption.slice(0, 45),
                            imageUrl: post.videoThumbnailUrl || post.mediaUrl,
                          }
                        );
                      }}
                      className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 flex items-center gap-2"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#3B1376]" />
                      <span>Mensahe sa Lumikha</span>
                    </button>
                  )}

                  {onReport && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onReport(post);
                      }}
                      className="w-full px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>I-report sa Komunidad</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Media Container */}
      <div className="relative aspect-4/3 w-full bg-slate-900 overflow-hidden">
        <img
          src={mediaSource}
          alt={post.caption}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          loading="lazy"
        />

        {/* Video Play Badge overlay */}
        {post.mediaType === 'video' && (
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
            <div className="w-13 h-13 rounded-full bg-white/90 backdrop-blur-md shadow-xl flex items-center justify-center text-[#3B1376] group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            </div>
            {post.videoDuration && (
              <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold">
                {post.videoDuration}
              </span>
            )}
          </div>
        )}

        {/* Category Pill on top left */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md bg-white/95 shadow-sm border ${
              categoryMeta ? categoryMeta.borderClass : 'border-slate-200'
            } ${categoryMeta ? categoryMeta.colorClass : 'text-slate-800'}`}
          >
            {categoryMeta ? categoryMeta.tagalogName : 'Talento'}
          </span>
        </div>

        {/* Share copied toast */}
        {shareSuccess && (
          <div className="absolute top-3 right-3 bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-md animate-in fade-in">
            Link copied!
          </div>
        )}
      </div>

      {/* 3. Actions & Social Engagement Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          {/* Like Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleLikePost(post.id);
            }}
            className={`inline-flex items-center gap-1.5 text-xs font-bold py-1 px-2.5 rounded-xl transition-all ${
              liked
                ? 'bg-rose-50 text-rose-600'
                : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'
            }`}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current text-rose-500' : ''}`} />
            <span>{post.likesCount}</span>
          </button>

          {/* Comment Button */}
          <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1.5 text-xs font-bold py-1 px-2.5 rounded-xl text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
            aria-label="Comments"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.comments.length}</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 rounded-xl text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
            title="I-share"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenMessageCreator && !isOwner && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenMessageCreator(
                  {
                    id: post.creatorId,
                    name: post.creatorName,
                    username: post.creatorUsername,
                    avatarUrl: post.creatorAvatarUrl,
                    isSenior: post.creatorIsSenior,
                  },
                  {
                    type: 'talent',
                    id: post.id,
                    title: post.caption.slice(0, 50),
                    imageUrl: post.videoThumbnailUrl || post.mediaUrl,
                  }
                );
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#3B1376] text-xs font-semibold transition-colors border border-purple-100"
              title="I-chat ang Lumikha"
              aria-label="I-chat ang Lumikha"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#4F28D9]" />
              <span className="hidden sm:inline">I-chat</span>
            </button>
          )}

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmarkPost(post.id);
            }}
            className={`p-1.5 rounded-xl transition-colors ${
              bookmarked
                ? 'text-purple-700 bg-purple-50'
                : 'text-slate-400 hover:text-purple-700 hover:bg-slate-50'
            }`}
            title={bookmarked ? 'Naka-save' : 'I-save ang post'}
            aria-label="Bookmark"
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4. Caption & Hashtags */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed line-clamp-3">
            <strong className="text-slate-900 font-bold mr-1.5">
              {post.creatorName}
            </strong>
            {post.caption}
          </p>

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {post.hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-semibold text-[#4F28D9] hover:underline"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 5. Cross-Link: Products or Services Offered by this Creator */}
        {(post.linkedProductId || post.linkedServiceId) && (
          <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="font-semibold text-slate-800">Iniaalok din ng lumikha:</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-1.5">
              {post.linkedProductId && onOpenLinkedProduct && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLinkedProduct(post.linkedProductId!);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#3B1376] text-[11px] font-bold border border-purple-200 transition-colors"
                >
                  <ShoppingBag className="w-3 h-3 text-[#4F28D9]" />
                  <span>Tingnan ang Produkto</span>
                </button>
              )}

              {post.linkedServiceId && onOpenLinkedService && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLinkedService(post.linkedServiceId!);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 text-[11px] font-bold border border-amber-200 transition-colors"
                >
                  <Briefcase className="w-3 h-3 text-amber-700" />
                  <span>Tingnan ang Serbisyo</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 6. Comment Snippet Preview (if comments exist) */}
        {post.comments && post.comments.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-500 truncate">
              <span className="font-bold text-slate-700 mr-1">
                {post.comments[post.comments.length - 1].authorName}:
              </span>
              "{post.comments[post.comments.length - 1].content}"
            </p>
          </div>
        )}
      </div>
    </article>
  );
};
