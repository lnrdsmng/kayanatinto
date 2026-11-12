import React, { useState, useRef } from 'react';
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  Send,
  Volume2,
  VolumeX,
  Play,
  Pause,
  CornerDownRight,
  ShieldAlert,
} from 'lucide-react';
import { TalentPost, TalentComment } from '../types/talent';
import { useAuth } from '../context/AuthContext';
import { useTalents } from '../context/TalentContext';

interface ExpandedMediaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: TalentPost | null;
  onSelectPost?: (post: TalentPost) => void;
  allPosts?: TalentPost[];
  onOpenCreatorProfile?: (username: string) => void;
  onShare?: (title: string, text: string, url: string) => void;
  onReport?: (post: TalentPost) => void;
}

export const ExpandedMediaViewerModal: React.FC<ExpandedMediaViewerModalProps> = ({
  isOpen,
  onClose,
  post,
  onSelectPost,
  allPosts = [],
  onOpenCreatorProfile,
  onShare,
  onReport,
}) => {
  const { currentUser } = useAuth();
  const { posts, isPostLiked, toggleLikePost, addComment, addReplyToComment } = useTalents();

  const [commentText, setCommentText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  if (!isOpen || !post) return null;

  const currentPost = posts.find((p) => p.id === post.id) || post;

  const currentIndex = allPosts.findIndex((p) => p.id === currentPost.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < allPosts.length - 1;

  const handlePrev = () => {
    if (hasPrev && onSelectPost) {
      onSelectPost(allPosts[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onSelectPost) {
      onSelectPost(allPosts[currentIndex + 1]);
    }
  };

  const isLiked = isPostLiked(currentPost.id);

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

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(currentPost.id, commentText.trim());
    setCommentText('');
  };

  const handleAddReply = (commentId: string) => {
    if (!replyText.trim()) return;
    addReplyToComment(currentPost.id, commentId, replyText.trim());
    setReplyText('');
    setReplyingToCommentId(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4">
      
      {/* Top Floating Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Main Container */}
      <div className="relative w-full h-full max-w-6xl bg-black sm:bg-white sm:dark:bg-slate-900 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left Side: Media Display */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] lg:min-h-[600px] overflow-hidden select-none">
          
          {currentPost.mediaType === 'video' ? (
            <div
              className="relative w-full h-full flex items-center justify-center cursor-pointer"
              onClick={handleTogglePlay}
            >
              <video
                ref={videoRef}
                src={currentPost.mediaUrl}
                poster={currentPost.videoThumbnailUrl}
                loop
                autoPlay
                playsInline
                muted={isMuted}
                className="max-h-full max-w-full object-contain"
              />

              {/* Play / Pause Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-black/70 text-white flex items-center justify-center shadow-lg">
                    <Play className="w-8 h-8 fill-white ml-1" />
                  </div>
                </div>
              )}

              {/* Audio Control */}
              <button
                type="button"
                onClick={handleToggleMute}
                className="absolute bottom-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          ) : (
            <img
              src={currentPost.mediaUrl}
              alt={currentPost.caption}
              className="max-h-full max-w-full object-contain"
            />
          )}

          {/* Navigation Arrows */}
          {hasPrev && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
              title="Nakaraang Post"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {hasNext && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
              title="Susunod na Post"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Right Side: Interaction Panel */}
        <div className="w-full lg:w-96 xl:w-[420px] bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col h-1/2 lg:h-full max-h-full overflow-hidden">
          
          {/* Creator Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onOpenCreatorProfile) onOpenCreatorProfile(currentPost.creatorUsername);
                }}
                className="w-11 h-11 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 block cursor-pointer"
              >
                <img
                  src={currentPost.creatorAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                  alt={currentPost.creatorName}
                  className="w-full h-full object-cover"
                />
              </button>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenCreatorProfile) onOpenCreatorProfile(currentPost.creatorUsername);
                  }}
                  className="font-bold text-sm text-slate-900 dark:text-white hover:underline text-left block cursor-pointer"
                >
                  {currentPost.creatorName}
                </button>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>@{currentPost.creatorUsername}</span>
                  {currentPost.creatorIsSenior && (
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold px-1.5 py-0.5 rounded-full">
                      Senior
                    </span>
                  )}
                  <span>&bull;</span>
                  <span>{currentPost.location.city}</span>
                </div>
              </div>
            </div>

            {onReport && (
              <button
                type="button"
                onClick={() => onReport(currentPost)}
                className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors cursor-pointer"
                title="I-report ang post"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Caption & Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
            
            {/* Caption */}
            <div className="space-y-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                {currentPost.caption}
              </p>
              {currentPost.hashtags && currentPost.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {currentPost.hashtags.map((tag) => (
                    <span key={tag} className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <span className="text-[11px] text-slate-400 block">
                {new Date(currentPost.createdAt).toLocaleDateString('fil-PH', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {/* Comments Thread */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Mga Komento ({currentPost.comments?.length || 0})
              </h5>

              {currentPost.comments && currentPost.comments.length > 0 ? (
                currentPost.comments.map((comment: TalentComment) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex items-start gap-2.5">
                      <button
                        type="button"
                        onClick={() => onOpenCreatorProfile && onOpenCreatorProfile(comment.authorUsername)}
                        className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        {comment.authorAvatarUrl ? (
                          <img src={comment.authorAvatarUrl} alt={comment.authorName} className="w-full h-full object-cover" />
                        ) : (
                          comment.authorName[0]
                        )}
                      </button>
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-2xl">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => onOpenCreatorProfile && onOpenCreatorProfile(comment.authorUsername)}
                            className="font-semibold text-xs text-slate-900 dark:text-white hover:underline text-left cursor-pointer"
                          >
                            {comment.authorName}
                          </button>
                          <span className="text-[10px] text-slate-400">
                            {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                          {comment.content}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id);
                          }}
                          className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline mt-1 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <CornerDownRight className="w-3 h-3" />
                          Sumagot (Reply)
                        </button>
                      </div>
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="pl-8 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-2">
                            <button
                              type="button"
                              onClick={() => onOpenCreatorProfile && onOpenCreatorProfile(reply.authorUsername)}
                              className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
                            >
                              {reply.authorAvatarUrl ? (
                                <img src={reply.authorAvatarUrl} alt={reply.authorName} className="w-full h-full object-cover" />
                              ) : (
                                reply.authorName[0]
                              )}
                            </button>
                            <div className="flex-1 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-xs">
                              <button
                                type="button"
                                onClick={() => onOpenCreatorProfile && onOpenCreatorProfile(reply.authorUsername)}
                                className="font-semibold text-slate-900 dark:text-white hover:underline text-left cursor-pointer"
                              >
                                {reply.authorName}
                              </button>
                              <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline reply box */}
                    {replyingToCommentId === comment.id && (
                      <div className="pl-8 flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Sumagot kay ${comment.authorName}...`}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddReply(comment.id)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-medium text-xs hover:bg-purple-700 cursor-pointer"
                        >
                          Ipadala
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">
                  Wala pang komento. Maging una sa pagbati o pag-iwan ng mensahe!
                </p>
              )}
            </div>

          </div>

          {/* Action Engagement Bar */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => toggleLikePost(currentPost.id)}
                className={`flex items-center gap-1.5 text-xs font-bold transition-transform active:scale-110 cursor-pointer ${
                  isLiked ? 'text-rose-600' : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-600' : ''}`} />
                <span>{currentPost.likesCount} Puso</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{currentPost.comments?.length || 0}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onShare) {
                  onShare(
                    `Likha ni ${currentPost.creatorName} sa KayaNatinTo`,
                    currentPost.caption,
                    typeof window !== 'undefined' ? `${window.location.origin}/#post/${currentPost.id}` : ''
                  );
                }
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>I-share</span>
            </button>
          </div>

          {/* New Comment Input */}
          <form
            onSubmit={handleAddComment}
            className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-900"
          >
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Sumulat ng magalang na komento..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="w-9 h-9 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
