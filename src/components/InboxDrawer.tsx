import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Search,
  Send,
  Image as ImageIcon,
  Check,
  CheckCheck,
  Shield,
  ShieldAlert,
  Ban,
  ArrowLeft,
  MoreVertical,
  Flag,
  Trash2,
  Sparkles,
  ShoppingBag,
  Briefcase,
  AlertCircle,
  ExternalLink,
  User,
  Clock,
  Camera,
  Maximize2,
} from 'lucide-react';
import { useMessaging } from '../context/MessagingContext';
import { useAuth } from '../context/AuthContext';
import { useConnections } from '../context/ConnectionContext';
import { Conversation, Message } from '../types/messaging';
import { ReportModal } from './ReportModal';
import { ReportTargetType } from '../types/connection';

interface InboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onViewUserProfile?: (username: string) => void;
  onOpenOrder?: (orderId: string) => void;
  onOpenBooking?: (bookingId: string) => void;
}

// Preset sample photo attachments for quick demonstration of image sharing
const SAMPLE_IMAGE_ATTACHMENTS = [
  {
    label: 'Halimbawang Larawan ng Order',
    url: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
  },
  {
    label: 'Halimbawang Detalye ng Likha',
    url: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
  },
  {
    label: 'Resibo o Palatandaan',
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
  },
];

// Quick response template chips designed for convenience (especially for seniors and mobile buyers)
const QUICK_REPLY_TEMPLATES = [
  'Magandang araw po! Available pa po ba ito?',
  'Magkano po ang delivery o pickup sa aming lugar?',
  'Maaari po bang magpa-reserve para sa darating na linggo?',
  'Maraming salamat po sa maagang tugon!',
  'Pakibigay po ang inyong address o palatandaan para sa meetup.',
];

export const InboxDrawer: React.FC<InboxDrawerProps> = ({
  isOpen,
  onClose,
  onViewUserProfile,
  onOpenOrder,
  onOpenBooking,
}) => {
  const { currentUser } = useAuth();
  const {
    conversations,
    activeConversation,
    activeConversationId,
    activeMessages,
    setActiveConversationId,
    sendMessage,
    blockConversation,
    unblockConversation,
    deleteConversation,
    searchConversations,
  } = useMessaging();
  const { blockUser, unblockUser, isBlocked } = useConnections();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'blocked'>('all');
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string; type: ReportTargetType } | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload handler for photos from device (Camera or Gallery)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('Ang sukat ng larawan ay dapat hindi lalampas sa 5MB.');
      setTimeout(() => setImageUploadError(null), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedImage(reader.result);
        setShowImagePicker(false);
        setImageUploadError(null);
      }
    };
    reader.readAsDataURL(file);
    // Reset input value to allow selecting same file again if desired
    e.target.value = '';
  };

  // Auto scroll to latest message
  useEffect(() => {
    if (activeConversationId && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages, activeConversationId]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let list = searchConversations(searchQuery);
    const currentId = currentUser ? currentUser.id : 'user-maria-santos';

    if (filterTab === 'unread') {
      list = list.filter((c) => (c.unreadCount[currentId] || 0) > 0);
    } else if (filterTab === 'blocked') {
      list = list.filter((c) => c.isBlocked || c.participants.some((p) => isBlocked(p.id)));
    }
    return list;
  }, [searchConversations, searchQuery, filterTab, currentUser, isBlocked]);

  // Recipient user in active conversation
  const recipient = useMemo(() => {
    if (!activeConversation) return null;
    const currentId = currentUser ? currentUser.id : 'user-maria-santos';
    const currentUsername = currentUser ? currentUser.username : 'mariasantos';

    return (
      activeConversation.participants.find(
        (p) => p.id !== currentId && p.username.toLowerCase() !== currentUsername.toLowerCase()
      ) || activeConversation.participants[0]
    );
  }, [activeConversation, currentUser]);

  const isCurrentBlocked = recipient ? isBlocked(recipient.id) || activeConversation?.isBlocked : false;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConversationId) return;
    if (!inputMessage.trim() && !selectedImage) return;

    sendMessage(activeConversationId, inputMessage.trim(), selectedImage || undefined);
    setInputMessage('');
    setSelectedImage(null);
    setShowImagePicker(false);
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-end sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div
          className="bg-white w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl shadow-2xl flex flex-col text-left overflow-hidden border border-slate-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inbox-main-title"
        >
          {/* Main Drawer Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-[#2F106A] via-[#3B1376] to-[#4F28D9] text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              {activeConversationId ? (
                <button
                  type="button"
                  onClick={() => setActiveConversationId(null)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                  aria-label="Back to conversations list"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Lahat</span>
                </button>
              ) : (
                <div className="p-2 rounded-xl bg-white/10 text-amber-300">
                  <MessageSquare className="w-5 h-5" />
                </div>
              )}

              <div>
                <h2 id="inbox-main-title" className="text-base sm:text-lg font-bold font-display leading-tight">
                  {activeConversation && recipient ? recipient.name : 'Inbox at Mga Mensahe'}
                </h2>
                <p className="text-xs text-purple-200 flex items-center gap-1.5">
                  {activeConversation && recipient ? (
                    <>
                      <span>@{recipient.username}</span>
                      {recipient.isSenior && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400 text-purple-950">
                          Senior
                        </span>
                      )}
                      <span>·</span>
                      <span className="text-emerald-300 font-medium">Aktibo sa Komunidad</span>
                    </>
                  ) : (
                    <span>Direct One-on-One Messaging · 18+ Only</span>
                  )}
                </p>
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-1.5">
              {activeConversation && recipient && (
                <>
                  {onViewUserProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        onViewUserProfile(recipient.username);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors hidden sm:inline-flex items-center gap-1"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Profile</span>
                    </button>
                  )}

                  {/* Conversation 3-dots Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                      aria-label="Conversation options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {showMenu && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-10 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 text-slate-800 animate-in fade-in zoom-in-95"
                      >
                        {onViewUserProfile && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowMenu(false);
                              onViewUserProfile(recipient.username);
                            }}
                            className="w-full px-3.5 py-2 text-xs font-semibold hover:bg-purple-50 text-slate-700 flex items-center gap-2 text-left sm:hidden"
                          >
                            <User className="w-3.5 h-3.5 text-purple-600" />
                            <span>Tingnan ang Profile</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            if (isCurrentBlocked) {
                              unblockUser(recipient.id);
                              unblockConversation(activeConversation.id);
                            } else {
                              blockUser({
                                id: recipient.id,
                                name: recipient.name,
                                username: recipient.username,
                                avatarUrl: recipient.avatarUrl,
                              });
                              blockConversation(activeConversation.id);
                            }
                          }}
                          className="w-full px-3.5 py-2 text-xs font-semibold hover:bg-rose-50 text-slate-700 hover:text-rose-600 flex items-center gap-2 text-left"
                        >
                          <Ban className="w-3.5 h-3.5 text-rose-500" />
                          <span>{isCurrentBlocked ? 'I-unblock ang User' : 'I-block ang User'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            setReportTarget({ id: recipient.id, name: recipient.name, type: 'user' });
                          }}
                          className="w-full px-3.5 py-2 text-xs font-semibold hover:bg-rose-50 text-rose-600 flex items-center gap-2 text-left"
                        >
                          <Flag className="w-3.5 h-3.5" />
                          <span>I-report sa Moderation</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            deleteConversation(activeConversation.id);
                          }}
                          className="w-full px-3.5 py-2 text-xs font-semibold hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center gap-2 text-left border-t border-slate-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Burahin ang Mensahe</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                aria-label="Isara ang inbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MAIN BODY AREA */}
          <div className="flex-1 flex overflow-hidden relative">
            
            {/* VIEW A: CONVERSATION LIST (Shown when no conversation is selected or on wide screens) */}
            <div
              className={`w-full flex-col h-full bg-slate-50 ${
                activeConversationId ? 'hidden md:flex md:w-5/12 border-r border-slate-200' : 'flex'
              }`}
            >
              {/* Search & Filter Bar */}
              <div className="p-3 bg-white border-b border-slate-100 space-y-2 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Maghanap ng tao o mensahe..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100 border border-transparent focus:bg-white focus:border-[#4F28D9] text-xs focus:outline-hidden transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setFilterTab('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      filterTab === 'all'
                        ? 'bg-[#3B1376] text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Lahat ({conversations.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('unread')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      filterTab === 'unread'
                        ? 'bg-[#3B1376] text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Hindi pa Nababasa
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('blocked')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      filterTab === 'blocked'
                        ? 'bg-rose-700 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Naka-block
                  </button>
                </div>
              </div>

              {/* Conversations Scroll Area */}
              <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conv) => {
                    const currentId = currentUser ? currentUser.id : 'user-maria-santos';
                    const currentUsername = currentUser ? currentUser.username : 'mariasantos';
                    const otherUser =
                      conv.participants.find(
                        (p) => p.id !== currentId && p.username.toLowerCase() !== currentUsername.toLowerCase()
                      ) || conv.participants[0];
                    const isSelected = conv.id === activeConversationId;
                    const unread = conv.unreadCount[currentId] || 0;
                    const blocked = conv.isBlocked || (otherUser && isBlocked(otherUser.id));

                    return (
                      <div
                        key={conv.id}
                        onClick={() => setActiveConversationId(conv.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'bg-purple-100/90 border-[#3B1376] shadow-sm'
                            : unread > 0
                            ? 'bg-purple-50/70 border-purple-200 hover:bg-purple-100/50'
                            : 'bg-white border-slate-100 hover:bg-slate-100/80'
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative w-11 h-11 rounded-full bg-purple-200 overflow-hidden shrink-0 border border-purple-300">
                          {otherUser?.avatarUrl ? (
                            <img
                              src={otherUser.avatarUrl}
                              alt={otherUser.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-[#3B1376] text-sm">
                              {otherUser?.name.charAt(0) || 'U'}
                            </div>
                          )}
                          {otherUser?.isSenior && (
                            <span
                              className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-amber-400 border border-white"
                              title="Senior"
                            />
                          )}
                        </div>

                        {/* Summary Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center gap-1.5 truncate">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {otherUser?.name}
                              </h4>
                              {blocked && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800">
                                  Blocked
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-1">
                              {formatTimestamp(conv.updatedAt)}
                            </span>
                          </div>

                          {/* Context item preview if any */}
                          {conv.contextItem && (
                            <div className="flex items-center gap-1 text-[11px] text-[#4F28D9] font-semibold truncate mb-0.5">
                              {conv.contextItem.type === 'product' && <ShoppingBag className="w-3 h-3 shrink-0" />}
                              {conv.contextItem.type === 'service' && <Briefcase className="w-3 h-3 shrink-0" />}
                              {conv.contextItem.type === 'talent' && <Sparkles className="w-3 h-3 shrink-0" />}
                              <span className="truncate">{conv.contextItem.title}</span>
                            </div>
                          )}

                          {/* Message snippet */}
                          <p
                            className={`text-xs truncate ${
                              unread > 0 ? 'font-bold text-slate-900' : 'text-slate-500'
                            }`}
                          >
                            {conv.lastMessage?.content || (conv.lastMessage?.imageUrl ? '📷 Nagpadala ng larawan' : 'Walang mensahe')}
                          </p>
                        </div>

                        {/* Unread badge */}
                        {unread > 0 && (
                          <div className="w-5 h-5 rounded-full bg-[#3B1376] text-white text-[10px] font-extrabold flex items-center justify-center shrink-0 self-center">
                            {unread}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center space-y-2">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-800">Walang natagpuang mensahe</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Makipag-ugnayan sa mga nagtitinda, nag-aalok ng serbisyo, o lumikha ng talento sa pamamagitan ng pag-click sa "Makipag-ugnayan" o "Mensahe".
                    </p>
                  </div>
                )}
              </div>

              {/* Safety notice in sidebar */}
              <div className="p-3 bg-amber-50/70 border-t border-amber-100 text-[11px] text-amber-900 flex items-center gap-2 shrink-0">
                <Shield className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Ligtas at pribadong komunikasyon sa pagitan ng mga kasapi edad 18 pataas.
                </span>
              </div>
            </div>

            {/* VIEW B: CHAT CONVERSATION VIEW */}
            {activeConversation && recipient ? (
              <div
                className={`w-full flex-col h-full bg-slate-50/50 ${
                  activeConversationId ? 'flex' : 'hidden md:flex md:w-7/12'
                }`}
              >
                {/* Context Item Header Card (if inquiry started from product/service/talent) */}
                {activeConversation.contextItem && (
                  <div className="p-3 bg-purple-50/90 border-b border-purple-200 flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {activeConversation.contextItem.imageUrl && (
                        <img
                          src={activeConversation.contextItem.imageUrl}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-purple-200 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-[#4F28D9] uppercase tracking-wider block">
                          Pinag-uusapang {activeConversation.contextItem.type}:
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {activeConversation.contextItem.title}
                        </h4>
                        {activeConversation.contextItem.priceOrRate && (
                          <span className="text-xs font-extrabold text-[#3B1376]">
                            {activeConversation.contextItem.priceOrRate}
                          </span>
                        )}
                      </div>
                    </div>

                    {((activeConversation.contextItem.type === 'order' && onOpenOrder) ||
                      (activeConversation.contextItem.type === 'booking' && onOpenBooking)) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (activeConversation.contextItem?.type === 'order' && onOpenOrder) {
                            onOpenOrder(activeConversation.contextItem.id);
                          } else if (activeConversation.contextItem?.type === 'booking' && onOpenBooking) {
                            onOpenBooking(activeConversation.contextItem.id);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-purple-100 text-[#3B1376] text-[11px] font-bold border border-purple-200 shrink-0 shadow-2xs transition-colors"
                      >
                        Tingnan ang Detalye →
                      </button>
                    )}
                  </div>
                )}

                {/* Blocked banner notice if conversation is blocked */}
                {isCurrentBlocked && (
                  <div className="p-3 bg-rose-50 border-b border-rose-200 text-xs text-rose-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <Ban className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>
                        Naka-block ang user na ito. Hindi ka maaaring magpadala o tumanggap ng mensahe.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        unblockUser(recipient.id);
                        unblockConversation(activeConversation.id);
                      }}
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0"
                    >
                      I-unblock
                    </button>
                  </div>
                )}

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                  {/* Encrypted / Private Banner */}
                  <div className="text-center py-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/70 text-slate-600 text-[10px] font-medium">
                      <Shield className="w-3 h-3 text-[#3B1376]" />
                      <span>Pribadong pag-uusap ni {currentUser?.fullName || 'Maria'} at {recipient.name}</span>
                    </span>
                  </div>

                  {activeMessages.map((msg) => {
                    const isSender =
                      currentUser &&
                      (currentUser.id === msg.senderId ||
                        currentUser.username.toLowerCase() === msg.senderUsername.toLowerCase());

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col group ${isSender ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`flex items-center gap-1.5 max-w-[88%] sm:max-w-[78%] ${isSender ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div
                            className={`rounded-2xl p-3 sm:p-3.5 shadow-2xs space-y-2 w-full ${
                              isSender
                                ? 'bg-[#3B1376] text-white rounded-tr-xs'
                                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                            }`}
                          >
                            {/* Image Attachment (if any) */}
                            {msg.imageUrl && (
                              <div
                                onClick={() => setPreviewImageUrl(msg.imageUrl || null)}
                                className="rounded-xl overflow-hidden max-h-60 bg-black/10 cursor-pointer relative group/img"
                                title="I-click para tingnan nang buo ang larawan"
                              >
                                <img
                                  src={msg.imageUrl}
                                  alt="Attachment"
                                  className="w-full h-full object-cover transition-transform group-hover/img:scale-102"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                                  <Maximize2 className="w-4 h-4 text-amber-300" />
                                  <span>Palakihin</span>
                                </div>
                              </div>
                            )}

                            {/* Text Content */}
                            {msg.content && (
                              <p className="text-xs sm:text-sm whitespace-pre-line leading-relaxed">
                                {msg.content}
                              </p>
                            )}

                            {/* Footer with Timestamp and Read status */}
                            <div
                              className={`flex items-center justify-end gap-1.5 text-[10px] pt-0.5 ${
                                isSender ? 'text-purple-200' : 'text-slate-400'
                              }`}
                            >
                              <span>{formatTimestamp(msg.createdAt)}</span>
                              {isSender && (
                                <span>
                                  {msg.status === 'read' ? (
                                    <span className="flex items-center text-amber-300 font-bold" title="Nabasa na">
                                      <CheckCheck className="w-3.5 h-3.5" />
                                    </span>
                                  ) : (
                                    <span className="flex items-center" title="Naipadala">
                                      <Check className="w-3.5 h-3.5" />
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Individual Message Report Flag (for incoming messages) */}
                          {!isSender && (
                            <button
                              type="button"
                              onClick={() =>
                                setReportTarget({
                                  id: msg.id,
                                  name: `Mensahe mula kay ${msg.senderName}`,
                                  type: 'message',
                                })
                              }
                              className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-rose-500 rounded-lg shrink-0"
                              title="I-report ang mensaheng ito sa Moderation"
                              aria-label="I-report ang mensaheng ito sa Moderation"
                            >
                              <Flag className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Reply Suggestions (Especially helpful for elderly & mobile users) */}
                {!isCurrentBlocked && (
                  <div className="px-3 py-1.5 bg-slate-100/90 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap pl-1">
                      Mabilisang Tugon:
                    </span>
                    {QUICK_REPLY_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setInputMessage(tmpl)}
                        className="px-2.5 py-1 rounded-full bg-white hover:bg-purple-100 text-slate-700 hover:text-[#3B1376] text-[11px] font-medium border border-slate-200 whitespace-nowrap transition-colors"
                      >
                        {tmpl}
                      </button>
                    ))}
                  </div>
                )}

                {/* Hidden File Input for Device Uploads */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileUpload}
                />

                {/* Image Picker Dropdown Preview */}
                {showImagePicker && !isCurrentBlocked && (
                  <div className="p-3 bg-purple-50/90 border-t border-purple-200 space-y-2.5 shrink-0">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Maglakip ng Larawan (Image Attachment)</span>
                      <button
                        type="button"
                        onClick={() => setShowImagePicker(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {imageUploadError && (
                      <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{imageUploadError}</span>
                      </div>
                    )}

                    {/* Local File Upload Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-2.5 rounded-xl bg-white hover:bg-purple-100/80 text-[#3B1376] text-xs font-bold transition-all border border-purple-300 flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <Camera className="w-4 h-4 text-[#4F28D9]" />
                      <span>Pumili ng Larawan sa Telepono o PC (Gallery o Camera)</span>
                    </button>

                    <div className="text-[11px] font-semibold text-slate-500 pt-1">
                      O pumili mula sa mga halimbawa:
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {SAMPLE_IMAGE_ATTACHMENTS.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedImage(item.url);
                            setShowImagePicker(false);
                          }}
                          className="w-20 h-16 rounded-xl overflow-hidden border-2 border-purple-200 hover:border-[#4F28D9] shrink-0 relative group"
                        >
                          <img src={item.url} alt="" className="w-full h-full object-cover" />
                          <span className="absolute inset-0 bg-black/40 text-[9px] text-white flex items-center justify-center font-bold p-1 text-center">
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-0.5">
                      <input
                        type="url"
                        value={customImageUrl}
                        onChange={(e) => setCustomImageUrl(e.target.value)}
                        placeholder="O mag-paste ng Image Link / URL dito..."
                        className="flex-1 p-2 bg-white rounded-xl text-xs border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customImageUrl.trim()) {
                            setSelectedImage(customImageUrl.trim());
                            setCustomImageUrl('');
                            setShowImagePicker(false);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#3B1376] hover:bg-[#2F106A] text-white text-xs font-bold"
                      >
                        Gamitin
                      </button>
                    </div>
                  </div>
                )}

                {/* Selected Image Thumbnail preview in composer */}
                {selectedImage && (
                  <div className="px-3 py-2 bg-purple-50 border-t border-purple-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <img
                        src={selectedImage}
                        alt="Selected"
                        className="w-12 h-12 rounded-lg object-cover border border-purple-300"
                      />
                      <span className="text-xs text-purple-900 font-semibold">
                        Kasama ang larawan sa mensahe
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="p-1 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700"
                      title="Alisin ang larawan"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Message Composer Input Form */}
                <form
                  onSubmit={handleSend}
                  className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
                >
                  <button
                    type="button"
                    disabled={isCurrentBlocked}
                    onClick={() => setShowImagePicker(!showImagePicker)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-[#3B1376] transition-colors disabled:opacity-40"
                    title="Maglakip ng Larawan (Attach Image)"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    disabled={isCurrentBlocked}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={
                      isCurrentBlocked
                        ? 'Naka-block ang pakikipag-usap sa user na ito.'
                        : 'Mag-type ng mensahe para kay ' + recipient.name.split(' ')[0] + '...'
                    }
                    className="flex-1 py-2.5 px-3.5 rounded-xl bg-slate-100 border border-transparent focus:bg-white focus:border-[#4F28D9] text-xs sm:text-sm focus:outline-hidden transition-all disabled:bg-slate-100 disabled:text-slate-400"
                  />

                  <button
                    type="submit"
                    disabled={isCurrentBlocked || (!inputMessage.trim() && !selectedImage)}
                    className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-[#3B1376] hover:bg-[#2F106A] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Ipadala</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="hidden md:flex md:w-7/12 items-center justify-center p-8 text-center text-slate-400 bg-slate-50/40">
                <div>
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">Pumili ng Pag-uusap</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Mag-click sa listahan sa kaliwa upang magpatuloy sa pakikipag-chat.
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Drawer Footer (Shown only on list view) */}
          {!activeConversationId && (
            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span>KayaNatinTo Community Messenger</span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors"
              >
                Isara (Close)
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Image Lightbox Preview Modal */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-70 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
          onClick={() => setPreviewImageUrl(null)}
          role="dialog"
          aria-label="Image Preview"
        >
          <div
            className="relative max-w-4xl max-h-[92vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 bg-slate-950 text-white flex items-center justify-between border-b border-white/10">
              <span className="text-xs text-purple-200 font-semibold flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-300" />
                <span>Larawan sa Mensahe (Attached Image)</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Isara ang preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 sm:p-4 overflow-auto flex items-center justify-center bg-black/60 max-h-[82vh]">
              <img
                src={previewImageUrl}
                alt="Attachment Preview"
                className="max-h-[76vh] w-auto max-w-full rounded-2xl object-contain shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportTarget && (
        <ReportModal
          isOpen={!!reportTarget}
          onClose={() => setReportTarget(null)}
          targetType={reportTarget.type}
          targetId={reportTarget.id}
          targetName={reportTarget.name}
        />
      )}
    </>
  );
};
