import React, { useState } from 'react';
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MapPin,
  Send,
  Trash2,
  Edit3,
  Flag,
  Sparkles,
  ShoppingBag,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Play,
  Volume2,
  CornerDownRight,
  Reply,
} from 'lucide-react';
import { TalentPost, TALENT_CATEGORIES } from '../types/talent';
import { useTalents } from '../context/TalentContext';
import { useAuth } from '../context/AuthContext';
import { useMessaging } from '../context/MessagingContext';

interface TalentDetailsModalProps {
  post: TalentPost;
  isOpen: boolean;
  onClose: () => void;
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

export const TalentDetailsModal: React.FC<TalentDetailsModalProps> = ({
  post,
  isOpen,
  onClose,
  onOpenCreatorProfile,
  onOpenLinkedProduct,
  onOpenLinkedService,
  onEdit,
  onReport,
  onOpenMessageCreator,
}) => {
  const {
    toggleLikePost,
    isPostLiked,
    toggleBookmarkPost,
    isPostBookmarked,
    addComment,
    addReply,
    updateComment,
    deleteComment,
  } = useTalents();
  const { currentUser } = useAuth();
  const { getOrCreateConversation } = useMessaging();

  const [commentText, setCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  // Nested reply state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Comment edit state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const liked = isPostLiked(post.id);
  const bookmarked = isPostBookmarked(post.id);
  const isOwner = currentUser && (currentUser.id === post.creatorId || currentUser.username === post.creatorUsername);
  const categoryMeta = TALENT_CATEGORIES.find((c) => c.id === post.category);

  const handleMessageCreator = () => {
    const creatorInfo = {
      id: post.creatorId || `creator-${post.creatorUsername}`,
      name: post.creatorName,
      username: post.creatorUsername,
      avatarUrl: post.creatorAvatarUrl,
      isSenior: post.creatorIsSenior,
    };

    const contextItem = {
      type: 'talent' as const,
      id: post.id,
      title: post.caption.slice(0, 50),
      imageUrl: post.videoThumbnailUrl || post.mediaUrl,
    };

    if (onOpenMessageCreator) {
      onClose();
      onOpenMessageCreator(creatorInfo, contextItem);
    } else {
      getOrCreateConversation(
        creatorInfo,
        `Kumusta po ${post.creatorName}! Napanood at nagustuhan ko ang iyong talento sa Tanghalan ("${post.caption.slice(0, 40)}...").`,
        contextItem
      );
      onClose();
    }
  };

  const handleAddReply = (parentId: string) => {
    if (!replyText.trim()) return;
    if (!currentUser) {
      setAuthNotice('Kailangan munang mag-log in upang tumugon sa komento.');
      setTimeout(() => setAuthNotice(null), 4000);
      return;
    }

    addReply(post.id, parentId, {
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorUsername: currentUser.username,
      authorAvatarUrl: currentUser.avatarUrl,
      authorIsSenior: currentUser.isSenior,
      content: replyText.trim(),
    });

    setReplyText('');
    setReplyingToId(null);
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editingText.trim()) return;
    updateComment(post.id, commentId, editingText.trim());
    setEditingCommentId(null);
    setEditingText('');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.caption.slice(0, 40),
        text: post.caption,
        url: window.location.href,
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!currentUser) {
      setAuthNotice('Kailangan munang mag-log in upang makapag-iwan ng komento o suporta sa lumikha.');
      setTimeout(() => setAuthNotice(null), 4000);
      return;
    }

    addComment(post.id, {
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorUsername: currentUser.username,
      authorAvatarUrl: currentUser.avatarUrl,
      authorIsSenior: currentUser.isSenior,
      content: commentText.trim(),
    });

    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-4 flex flex-col lg:flex-row max-h-[92vh]">
        
        {/* Close Button top-right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-all shadow-md"
          aria-label="Isara"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Share copied toast */}
        {copiedLink && (
          <div className="absolute top-14 right-4 z-40 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg">
            Na-kopya ang link sa clipboard!
          </div>
        )}

        {/* LEFT COLUMN: Media Showcase (Video Player or Large Photo) */}
        <div className="w-full lg:w-3/5 bg-black flex items-center justify-center relative min-h-[300px] lg:min-h-[550px] overflow-hidden">
          {post.mediaType === 'video' ? (
            <div className="w-full h-full flex items-center justify-center relative">
              {isPlayingVideo ? (
                <video
                  src={post.mediaUrl}
                  controls
                  autoPlay
                  className="w-full h-full max-h-[75vh] object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div
                  onClick={() => setIsPlayingVideo(true)}
                  className="relative w-full h-full flex items-center justify-center cursor-pointer group"
                >
                  <img
                    src={post.videoThumbnailUrl || post.mediaUrl}
                    alt={post.caption}
                    className="w-full h-full max-h-[75vh] object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/95 backdrop-blur-md text-[#3B1376] flex items-center justify-center shadow-2xl group-hover:scale-115 transition-transform">
                      <Play className="w-8 h-8 fill-current translate-x-0.5" />
                    </div>
                  </div>
                  {post.videoDuration && (
                    <span className="absolute bottom-4 right-4 px-2.5 py-1 rounded-md bg-black/80 text-white text-xs font-bold">
                      {post.videoDuration}
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <img
              src={post.mediaUrl}
              alt={post.caption}
              className="w-full h-full max-h-[75vh] object-contain"
            />
          )}

          {/* Category Chip overlay */}
          <div className="absolute top-4 left-4 z-20">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md bg-white/95 shadow-md border ${
                categoryMeta ? categoryMeta.borderClass : 'border-slate-200'
              } ${categoryMeta ? categoryMeta.colorClass : 'text-slate-800'}`}
            >
              {categoryMeta ? categoryMeta.tagalogName : 'Talento'}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Creator, Caption, Cross-links & Comments */}
        <div className="w-full lg:w-2/5 flex flex-col justify-between max-h-[92vh] bg-white">
          
          {/* 1. Creator Profile Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3">
            <div
              onClick={() => {
                if (onOpenCreatorProfile) {
                  onClose();
                  onOpenCreatorProfile(post.creatorUsername);
                }
              }}
              className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity min-w-0"
            >
              <img
                src={post.creatorAvatarUrl || '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png'}
                alt={post.creatorName}
                className="w-11 h-11 rounded-full object-cover border-2 border-purple-200 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-bold text-slate-900 text-sm truncate">
                    {post.creatorName}
                  </h3>
                  {post.creatorIsSenior && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      Senior ({post.creatorAge})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span>@{post.creatorUsername}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5 text-slate-400">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    {post.location.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Follow / View & Message Button */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleMessageCreator}
                className="px-2.5 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 text-xs font-bold transition-all active:scale-95 flex items-center gap-1 shadow-2xs"
                title="Magpadala ng mensahe sa lumikha"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Mensahe</span>
              </button>

              {onOpenCreatorProfile && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCreatorProfile(post.creatorUsername);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#3B1376] text-xs font-bold border border-purple-200 transition-colors"
                >
                  Profile
                </button>
              )}
            </div>
          </div>

          {/* 2. Scrollable Middle Body: Caption + Linked Offerings + Comments */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            
            {/* Caption */}
            <div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {post.caption}
              </p>

              {/* Hashtags */}
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {post.hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold text-[#4F28D9] bg-purple-50/70 px-2 py-0.5 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Cross-Link Card: Products or Services by this Creator */}
            {(post.linkedProductId || post.linkedServiceId) && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 to-amber-50/40 border border-purple-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Iba pang iniaalok ni {post.creatorName.split(' ')[0]}</span>
                </div>

                <div className="flex flex-col gap-2">
                  {post.linkedProductId && onOpenLinkedProduct && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLinkedProduct(post.linkedProductId!);
                      }}
                      className="p-2.5 rounded-xl bg-white border border-purple-200 text-left hover:border-[#4F28D9] transition-all flex items-center justify-between gap-2 shadow-2xs group"
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-[#4F28D9]" />
                        <span className="text-xs font-bold text-slate-800 group-hover:text-[#4F28D9]">
                          Bumili sa Kanyang Paninda
                        </span>
                      </div>
                      <span className="text-[11px] text-[#4F28D9] font-semibold">Tingnan →</span>
                    </button>
                  )}

                  {post.linkedServiceId && onOpenLinkedService && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLinkedService(post.linkedServiceId!);
                      }}
                      className="p-2.5 rounded-xl bg-white border border-amber-200 text-left hover:border-amber-500 transition-all flex items-center justify-between gap-2 shadow-2xs group"
                    >
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-amber-700" />
                        <span className="text-xs font-bold text-slate-800 group-hover:text-amber-800">
                          Mag-inquire sa Kanyang Serbisyo
                        </span>
                      </div>
                      <span className="text-[11px] text-amber-800 font-semibold">Tingnan →</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Comments Header */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-[#4F28D9]" />
                  Mga Komento ({post.comments.length})
                </h4>
              </div>

              {/* Comments List */}
              {post.comments.length > 0 ? (
                <div className="space-y-3">
                  {post.comments.map((comm) => {
                    const isCommentOwner = currentUser && currentUser.id === comm.authorId;
                    const isEditing = editingCommentId === comm.id;
                    const isReplying = replyingToId === comm.id;

                    return (
                      <div key={comm.id} className="space-y-2">
                        {/* Parent Comment Card */}
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-2 text-xs">
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <img
                              src={comm.authorAvatarUrl || '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png'}
                              alt={comm.authorName}
                              className="w-7 h-7 rounded-full object-cover border border-purple-200 shrink-0 mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-900 truncate">
                                  {comm.authorName}
                                </span>
                                {comm.authorIsSenior && (
                                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900">
                                    Senior
                                  </span>
                                )}
                                {comm.isEdited && (
                                  <span className="text-[10px] text-slate-400 italic">
                                    (na-edit)
                                  </span>
                                )}
                              </div>

                              {/* Comment Content or Edit Form */}
                              {isEditing ? (
                                <div className="mt-1.5 space-y-2">
                                  <textarea
                                    rows={2}
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    className="w-full p-2 bg-white rounded-xl border border-purple-300 text-xs focus:outline-hidden"
                                  />
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEdit(comm.id)}
                                      className="px-2.5 py-1 rounded-lg bg-[#3B1376] text-white text-[11px] font-bold"
                                    >
                                      I-save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingCommentId(null)}
                                      className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 text-[11px] font-semibold"
                                    >
                                      Kanselahin
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-slate-700 mt-1 leading-relaxed">
                                  {comm.content}
                                </p>
                              )}

                              {/* Actions: Reply button & Edit */}
                              {!isEditing && (
                                <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-500 font-semibold">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReplyingToId(isReplying ? null : comm.id);
                                      setReplyText('');
                                    }}
                                    className="hover:text-[#3B1376] flex items-center gap-1 transition-colors"
                                  >
                                    <Reply className="w-3 h-3" />
                                    <span>Tumugon (Reply)</span>
                                  </button>

                                  {isCommentOwner && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingCommentId(comm.id);
                                        setEditingText(comm.content);
                                      }}
                                      className="hover:text-[#3B1376] flex items-center gap-1 transition-colors"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                      <span>I-edit</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {isCommentOwner && !isEditing && (
                            <button
                              type="button"
                              onClick={() => deleteComment(post.id, comm.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200 transition-colors shrink-0"
                              title="Burahin ang komento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Inline Reply Composer */}
                        {isReplying && (
                          <div className="pl-6 pt-1 flex items-center gap-2">
                            <CornerDownRight className="w-4 h-4 text-purple-600 shrink-0" />
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Tumugon kay ${comm.authorName}...`}
                              className="flex-1 py-1.5 px-3 rounded-xl border border-purple-200 text-xs bg-white focus:outline-hidden focus:border-[#4F28D9]"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleAddReply(comm.id)}
                              disabled={!replyText.trim()}
                              className="px-3 py-1.5 rounded-xl bg-[#3B1376] hover:bg-[#2F106A] disabled:bg-slate-200 text-white text-xs font-bold shrink-0 transition-colors"
                            >
                              Ipadala
                            </button>
                            <button
                              type="button"
                              onClick={() => setReplyingToId(null)}
                              className="text-xs text-slate-400 hover:text-slate-600"
                            >
                              Kanselahin
                            </button>
                          </div>
                        )}

                        {/* Nested Replies Stream */}
                        {comm.replies && comm.replies.length > 0 && (
                          <div className="pl-6 space-y-2 border-l-2 border-purple-100 ml-3">
                            {comm.replies.map((reply) => {
                              const isReplyOwner = currentUser && currentUser.id === reply.authorId;
                              return (
                                <div
                                  key={reply.id}
                                  className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100/60 flex items-start justify-between gap-2 text-xs"
                                >
                                  <div className="flex items-start gap-2 flex-1 min-w-0">
                                    <img
                                      src={reply.authorAvatarUrl || '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png'}
                                      alt={reply.authorName}
                                      className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-slate-900 truncate">
                                          {reply.authorName}
                                        </span>
                                        {reply.authorIsSenior && (
                                          <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-amber-100 text-amber-900">
                                            Senior
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-slate-700 mt-0.5 leading-relaxed">
                                        {reply.content}
                                      </p>
                                    </div>
                                  </div>

                                  {isReplyOwner && (
                                    <button
                                      type="button"
                                      onClick={() => deleteComment(post.id, reply.id)}
                                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                                      title="Burahin ang tugon"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4 italic">
                  Wala pang komento. Maging una sa pagbati o pagsuporta sa lumikha!
                </p>
              )}
            </div>

          </div>

          {/* 3. Footer Action Bar & Comment Input */}
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            
            {/* Action Buttons row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleLikePost(post.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    liked
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-current text-rose-500' : ''}`} />
                  <span>{post.likesCount} Likes</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleBookmarkPost(post.id)}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                    bookmarked
                      ? 'bg-purple-100 text-[#3B1376] border-purple-300'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                  title={bookmarked ? 'Naka-save' : 'I-save'}
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
                  title="I-share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Owner actions or Report button */}
              <div>
                {isOwner ? (
                  <div className="flex items-center gap-2">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onEdit(post);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#3B1376] text-white text-xs font-bold hover:bg-[#4F28D9] flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>I-edit</span>
                      </button>
                    )}
                  </div>
                ) : (
                  onReport && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onReport(post);
                      }}
                      className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 font-medium"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>Report</span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Auth notice banner */}
            {authNotice && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold animate-in fade-in">
                {authNotice}
              </div>
            )}

            {/* Add Comment Input Form */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Mag-iwan ng magandang komento o suporta..."
                className="flex-1 py-2.5 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#4F28D9] bg-white"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#3B1376] hover:bg-[#4F28D9] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>

        </div>

      </div>
    </div>
  );
};
