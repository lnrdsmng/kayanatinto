import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Gift,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  UserPlus,
  Sparkles,
  Play,
  Pause,
  AlertTriangle,
} from 'lucide-react';
import { useReels } from '../context/ReelsContext';
import { useAuth } from '../context/AuthContext';
import { ReelItem } from '../types/reels';
import { ReelsGiftModal } from './ReelsGiftModal';

interface ReelsFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReelId?: string;
  onOpenCreatorProfile?: (username: string) => void;
  onShare?: (title: string, text: string, url: string) => void;
}

export const ReelsFeedModal: React.FC<ReelsFeedModalProps> = ({
  isOpen,
  onClose,
  initialReelId,
  onOpenCreatorProfile,
  onShare,
}) => {
  const { reels, isReelLiked, toggleLikeReel, activeGiftAnimation, clearGiftAnimation } = useReels();
  const { currentUser } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (initialReelId && reels.length > 0) {
      const idx = reels.findIndex((r) => r.id === initialReelId);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [initialReelId, reels]);

  const activeReel: ReelItem | undefined = reels[currentIndex] || reels[0];

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Autoplay policy: fallback to muted
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(() => {});
        }
      });
      setIsPlaying(true);
    }
  }, [currentIndex, isOpen]);

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // loop
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(reels.length - 1);
    }
  };

  if (!isOpen || !activeReel) return null;

  const liked = isReelLiked(activeReel.id);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
      
      {/* Container simulating vertical 9:16 mobile container */}
      <div className="relative w-full h-full max-w-md bg-black flex flex-col justify-between overflow-hidden shadow-2xl">
        
        {/* Top Controls Overlay */}
        <div className="absolute top-0 inset-x-0 z-30 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-purple-600/90 text-white font-bold text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              KayaNatinTo Reels
            </span>
            <span className="text-white/70 text-xs">
              {currentIndex + 1} / {reels.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={handleToggleMute}
              className="w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center backdrop-blur-xs transition-colors"
              title={isMuted ? 'I-unmute' : 'I-mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center backdrop-blur-xs transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gift Animation Celebration Banner */}
        {activeGiftAnimation && (
          <div className="absolute top-16 inset-x-4 z-40 p-3 rounded-2xl bg-gradient-to-r from-purple-900/95 via-indigo-900/95 to-amber-900/95 border border-amber-400 text-white text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-3xl animate-bounce mb-1">
              {activeGiftAnimation.gift.icon}
            </div>
            <p className="font-bold text-sm text-amber-300">
              {activeGiftAnimation.senderName} nagpadala ng {activeGiftAnimation.gift.name}!
            </p>
            <p className="text-[11px] text-purple-200">
              +{activeGiftAnimation.gift.coinPrice} Coins para sa creator
            </p>
          </div>
        )}

        {/* Video Player */}
        <div
          className="relative flex-1 w-full bg-black flex items-center justify-center cursor-pointer"
          onClick={handleTogglePlay}
        >
          <video
            ref={videoRef}
            src={activeReel.videoUrl}
            poster={activeReel.videoThumbnailUrl}
            loop
            playsInline
            muted={isMuted}
            className="w-full h-full object-cover"
          />

          {/* Pause overlay icon */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center shadow-lg">
                <Play className="w-8 h-8 fill-white ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* Right Action Sidebar */}
        <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-4">
          
          {/* Creator Avatar with follow */}
          <div className="relative mb-1">
            <button
              type="button"
              onClick={() => {
                if (onOpenCreatorProfile) onOpenCreatorProfile(activeReel.creatorUsername);
              }}
              className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-md block"
            >
              <img
                src={activeReel.creatorAvatarUrl}
                alt={activeReel.creatorName}
                className="w-full h-full object-cover"
              />
            </button>
            <button
              type="button"
              onClick={() => {
                if (onOpenCreatorProfile) onOpenCreatorProfile(activeReel.creatorUsername);
              }}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center border border-white shadow-xs"
            >
              <UserPlus className="w-3 h-3" />
            </button>
          </div>

          {/* Like */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleLikeReel(activeReel.id);
            }}
            className="flex flex-col items-center text-white group"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xs transition-transform group-active:scale-125 ${
                liked ? 'bg-rose-600/90 text-white shadow-rose-500/50 shadow-md' : 'bg-black/50 hover:bg-black/70'
              }`}
            >
              <Heart className={`w-6 h-6 ${liked ? 'fill-white' : ''}`} />
            </div>
            <span className="text-[11px] font-bold mt-1 text-white drop-shadow-md">
              {activeReel.likesCount + (liked ? 1 : 0)}
            </span>
          </button>

          {/* Comments */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCommentsVisible(!commentsVisible);
            }}
            className="flex flex-col items-center text-white"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center backdrop-blur-xs transition-colors">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold mt-1 text-white drop-shadow-md">
              {activeReel.commentsCount}
            </span>
          </button>

          {/* Appreciation Gift Button (Stage 8.5 Highlight) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsGiftModalOpen(true);
            }}
            className="flex flex-col items-center text-amber-300 animate-pulse group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 flex items-center justify-center text-white shadow-lg ring-2 ring-amber-400">
              <Gift className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-extrabold mt-1 text-amber-300 drop-shadow-md">
              Mag-regalo
            </span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onShare) {
                onShare(
                  `KayaNatinTo Reel ni ${activeReel.creatorName}`,
                  activeReel.caption,
                  window.location.origin
                );
              }
            }}
            className="flex flex-col items-center text-white"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center backdrop-blur-xs transition-colors">
              <Share2 className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold mt-1 text-white drop-shadow-md">
              Share
            </span>
          </button>

          {/* Vertical Next / Prev arrows */}
          <div className="flex flex-col gap-1.5 pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
              title="Nakaraang Reel"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
              title="Susunod na Reel"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Bottom Creator Info & Caption Overlay */}
        <div className="absolute bottom-0 inset-x-0 z-20 p-4 pr-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
          <div className="flex items-center gap-2 mb-1.5">
            <button
              type="button"
              onClick={() => {
                if (onOpenCreatorProfile) onOpenCreatorProfile(activeReel.creatorUsername);
              }}
              className="font-bold text-sm hover:underline text-white flex items-center gap-1.5"
            >
              <span>{activeReel.creatorName}</span>
              <span className="text-xs text-purple-300 font-normal">@{activeReel.creatorUsername}</span>
            </button>
            {activeReel.creatorIsSenior && (
              <span className="text-[10px] font-semibold bg-amber-500/90 text-slate-900 px-2 py-0.5 rounded-full">
                Senior Creator
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-200 line-clamp-3 mb-2 leading-relaxed">
            {activeReel.caption}
          </p>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-1.5">
            {activeReel.hashtags.map((tag) => (
              <span key={tag} className="text-xs font-semibold text-purple-300">
                #{tag}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Gift Modal */}
      <ReelsGiftModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        reel={activeReel}
      />

    </div>
  );
};
