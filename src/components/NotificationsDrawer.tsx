import React, { useState, useMemo } from 'react';
import {
  X,
  Bell,
  ShieldCheck,
  Check,
  MessageCircle,
  Heart,
  UserPlus,
  Trash2,
  Sparkles,
  ExternalLink,
  CheckCheck,
  ShoppingBag,
  Calendar,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { COMMUNITY_NOTICES } from '../data/mockData';
import { NotificationType } from '../types/notification';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAgePolicy: () => void;
  onOpenConversation?: (conversationId: string) => void;
  onOpenPost?: (postId: string) => void;
  onOpenProfile?: (username: string) => void;
  onOpenOrder?: (orderId: string) => void;
  onOpenBooking?: (bookingId: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onOpenAgePolicy,
  onOpenConversation,
  onOpenPost,
  onOpenProfile,
  onOpenOrder,
  onOpenBooking,
}) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } =
    useNotifications();
  const [filter, setFilter] = useState<'all' | 'messages' | 'interactions' | 'notices'>('all');

  if (!isOpen) return null;

  // Filtered notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'messages') return n.type === 'message';
    if (filter === 'interactions')
      return n.type === 'like' || n.type === 'comment' || n.type === 'reply' || n.type === 'follow';
    if (filter === 'notices') return n.type === 'system';
    return true;
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-4 h-4 text-purple-600" />;
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-purple-700" />;
      case 'booking':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment':
      case 'reply':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-emerald-600" />;
      case 'system':
      default:
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
    }
  };

  const handleNotificationClick = (item: (typeof notifications)[0]) => {
    markAsRead(item.id);

    if (item.targetType === 'order' && item.targetId && onOpenOrder) {
      onClose();
      onOpenOrder(item.targetId);
    } else if (item.targetType === 'booking' && item.targetId && onOpenBooking) {
      onClose();
      onOpenBooking(item.targetId);
    } else if (item.targetType === 'conversation' && item.targetId && onOpenConversation) {
      onClose();
      onOpenConversation(item.targetId);
    } else if (item.targetType === 'post' && item.targetId && onOpenPost) {
      onClose();
      onOpenPost(item.targetId);
    } else if (item.targetType === 'profile' && onOpenProfile) {
      onClose();
      onOpenProfile(item.actorUsername || item.actorName || '');
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (60 * 1000));
      if (diffMins < 60) return `${Math.max(1, diffMins)}m nakalipas`;
      const diffHours = Math.floor(diffMins / (60 * 60 * 1000));
      if (diffHours < 24) return `${diffHours}h nakalipas`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d nakalipas`;
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full sm:max-w-md h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl shadow-2xl flex flex-col text-left overflow-hidden border border-slate-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#2F106A] via-[#3B1376] to-[#4F28D9] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 id="notif-title" className="text-base sm:text-lg font-bold font-display leading-tight">
                Mga Paalala at Abiso
              </h2>
              <p className="text-xs text-purple-200">
                {unreadCount > 0 ? `${unreadCount} bagong abiso` : 'Walang bagong abiso'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Isara ang notifications"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills and Mark all as read */}
        <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-[#3B1376] text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Lahat
            </button>
            <button
              type="button"
              onClick={() => setFilter('messages')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                filter === 'messages'
                  ? 'bg-[#3B1376] text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Mensahe
            </button>
            <button
              type="button"
              onClick={() => setFilter('interactions')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                filter === 'interactions'
                  ? 'bg-[#3B1376] text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Interactions
            </button>
            <button
              type="button"
              onClick={() => setFilter('notices')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                filter === 'notices'
                  ? 'bg-[#3B1376] text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Patakaran
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-[11px] font-bold text-[#3B1376] hover:underline whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>

        {/* Notices & Notifications List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notice) => (
              <div
                key={notice.id}
                onClick={() => handleNotificationClick(notice)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                  !notice.isRead
                    ? 'bg-purple-50/80 border-purple-200 shadow-xs hover:bg-purple-100/60'
                    : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2.5 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-white shadow-2xs">
                      {getNotificationIcon(notice.type)}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {notice.title}
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                    {formatTime(notice.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 pl-8 leading-relaxed">
                  {notice.message}
                </p>

                {/* Delete button on hover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notice.id);
                  }}
                  className="absolute bottom-2 right-2 p-1 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  title="Tanggalin"
                  aria-label="Delete notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 italic">
              Walang mga abiso sa kategoryang ito.
            </div>
          )}

          {/* Age Policy Spotlight Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>18+ Age & Senior Respect Policy</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Mahalaga sa KayaNatinTo ang tiwala, kaligtasan, at respeto sa bawat isa.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAgePolicy();
              }}
              className="text-xs font-bold text-[#3B1376] underline block pt-0.5"
            >
              Basahin ang Buong 18+ Charter →
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1 text-[11px]">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            Lahat ay na-update (Up to date)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-[#3B1376] hover:underline"
          >
            Isara
          </button>
        </div>
      </div>
    </div>
  );
};
