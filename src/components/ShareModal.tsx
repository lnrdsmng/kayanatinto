import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send, MessageCircle, ExternalLink } from 'lucide-react';
import { useMessaging } from '../context/MessagingContext';
import { useAuth } from '../context/AuthContext';

export interface ShareItemData {
  type: 'post' | 'video' | 'reel' | 'product' | 'service' | 'profile';
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  creatorName?: string;
  creatorUsername?: string;
  url?: string;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: ShareItemData | null;
  title?: string;
  text?: string;
  url?: string;
  onNavigateInbox?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  item,
  title,
  text,
  url,
  onNavigateInbox,
}) => {
  const { currentUser } = useAuth();
  const { conversations, sendMessage } = useMessaging();
  const [copied, setCopied] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [shareNote, setShareNote] = useState('');
  const [sentMessage, setSentMessage] = useState(false);

  if (!isOpen) return null;

  const resolvedItem: ShareItemData = item || {
    type: 'post',
    id: 'share',
    title: title || 'KayaNatinTo',
    description: text,
    url: url || (typeof window !== 'undefined' ? window.location.href : ''),
  };

  const shareUrl = resolvedItem.url || (typeof window !== 'undefined' ? `${window.location.origin}/#${resolvedItem.type}/${resolvedItem.id}` : '');

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: resolvedItem.title,
          text: resolvedItem.description || `Silipin ito sa KayaNatinTo: ${resolvedItem.title}`,
          url: shareUrl,
        });
        onClose();
      } catch {
        // user cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSendInApp = async (convId: string) => {
    if (!currentUser) return;
    const msgText = `${shareNote ? `${shareNote}\n\n` : ''}📌 Ibinahagi mula sa KayaNatinTo:\n${resolvedItem.title}\n${shareUrl}`;
    await sendMessage(convId, msgText);
    setSentMessage(true);
    setTimeout(() => {
      setSentMessage(false);
      onClose();
      if (onNavigateInbox) onNavigateInbox();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 text-left text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#7C3AED]" />
            <h3 className="font-bold text-base">Ibahagi sa Komunidad</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item Preview Card */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
          {resolvedItem.imageUrl && (
            <img
              src={resolvedItem.imageUrl}
              alt={resolvedItem.title}
              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
            />
          )}
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              {resolvedItem.type}
            </span>
            <h4 className="font-bold text-xs truncate">{resolvedItem.title}</h4>
            {resolvedItem.creatorName && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Likha ni {resolvedItem.creatorName} {resolvedItem.creatorUsername ? `(@${resolvedItem.creatorUsername})` : ''}
              </p>
            )}
          </div>
        </div>

        {/* Action 1: Copy Link */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Link ng Nilalaman
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 text-xs font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl select-all truncate text-slate-700 dark:text-slate-300"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-xs'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Nakopya!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Kopyahin</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action 2: Native Share (Mobile) */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full py-2.5 px-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-[#7C3AED] dark:text-purple-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Ibahagi gamit ang ibang App (Messenger, Viber, SMS)</span>
          </button>
        )}

        {/* Action 3: In-App Direct Message Share */}
        {conversations.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ipadala nang Diretso sa Inbox
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {conversations.map((conv) => {
                const other = conv.participants.find((p) => p.id !== currentUser?.id);
                if (!other) return null;
                return (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {other.avatarUrl ? (
                        <img
                          src={other.avatarUrl}
                          alt={other.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-[#7C3AED] font-bold text-xs flex items-center justify-center shrink-0">
                          {other.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-xs truncate">{other.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">@{other.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendInApp(conv.id)}
                      className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Ipadala</span>
                    </button>
                  </div>
                );
              })}
            </div>
            {sentMessage && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold text-center animate-in fade-in">
                ✓ Matagumpay na naipadala sa usapan!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
