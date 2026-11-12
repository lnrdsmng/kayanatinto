import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Coins,
  Heart,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { useReels } from '../context/ReelsContext';
import { useAuth } from '../context/AuthContext';
import { ReelsGift, ReelItem } from '../types/reels';

interface ReelsGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  reel: ReelItem | null;
}

const COIN_PACKAGES = [
  { id: 'pkg-50', coins: 50, pricePhp: 50, label: 'Starter Pinoy Pack' },
  { id: 'pkg-100', coins: 100, pricePhp: 100, label: 'Community Supporter' },
  { id: 'pkg-250', coins: 250, pricePhp: 250, label: 'Talent Champion' },
  { id: 'pkg-500', coins: 500, pricePhp: 500, label: 'Gintong Pamana Pack' },
];

export const ReelsGiftModal: React.FC<ReelsGiftModalProps> = ({
  isOpen,
  onClose,
  reel,
}) => {
  const { catalog, reelsCoins, sendReelsGift } = useReels();
  const { currentUser } = useAuth();
  const [selectedGift, setSelectedGift] = useState<ReelsGift | null>(catalog[0] || null);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPackages, setShowPackages] = useState(false);

  if (!isOpen || !reel) return null;

  const handleSend = async () => {
    if (!selectedGift) return;
    setStatusMessage(null);

    if (reelsCoins < selectedGift.coinPrice) {
      setStatusMessage({
        type: 'error',
        text: `Kulang ang iyong Reels Coins (${reelsCoins} coins). Kailangan mo ng ${selectedGift.coinPrice} coins para sa regalong ito.`,
      });
      setShowConfirm(false);
      return;
    }

    setIsSending(true);
    const res = await sendReelsGift(reel.id, selectedGift.id);
    setIsSending(false);
    setShowConfirm(false);

    if (res.success) {
      setStatusMessage({
        type: 'success',
        text: `Matagumpay mong naipadala ang ${selectedGift.icon} ${selectedGift.name} kay ${reel.creatorName}!`,
      });
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 1500);
    } else {
      setStatusMessage({
        type: 'error',
        text: res.error || 'Hindi naipadala ang regalo. Subukan muli.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden text-left p-5 space-y-4">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Reels Appreciation Gift
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Regalo para kay <span className="font-semibold text-purple-600 dark:text-purple-400">{reel.creatorName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reels Coins Balance Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-100/60 to-purple-50 dark:from-amber-950/30 dark:via-purple-950/30 dark:to-slate-800 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                Iyong Reels Coins Pitaka
              </span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {reelsCoins} <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Coins</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPackages(!showPackages)}
              className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
            >
              Bumili ng Coins
            </button>
          </div>
        </div>

        {/* Coin Packages Section (Marked SOON per Stage 8.5 requirement) */}
        {showPackages && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Mga Coin Packages (Reels Coins)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 uppercase">
                Soon
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Alinsunod sa no-payment-gateway policy, ang pagbili ng coins sa pamamagitan ng manual bank/e-wallet verification ay darating sa susunod na update.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {COIN_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-slate-900 dark:text-white block">{pkg.coins} Coins</strong>
                    <span className="text-[10px] text-slate-400">₱{pkg.pricePhp}.00</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                    Soon
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback message */}
        {statusMessage && (
          <div
            className={`p-3 rounded-2xl text-xs sm:text-sm flex items-start gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>{statusMessage.text}</div>
          </div>
        )}

        {/* Confirmation Step (Stage 8.5 requirement: do not deduct before confirmation) */}
        {showConfirm && selectedGift ? (
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 space-y-3">
            <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-purple-700 dark:text-purple-400" />
              <span>Kumpirmahin ang Pagpapadala ng Regalo</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Nais mo bang ibawas ang <strong className="text-purple-700 dark:text-purple-300">{selectedGift.coinPrice} Reels Coins</strong> sa iyong pitaka upang ipadala ang <strong>{selectedGift.icon} {selectedGift.name}</strong> kay <strong>{reel.creatorName}</strong>?
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className="flex-1 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                {isSending ? 'Ipinapadala...' : 'Oo, Kumpirmahin at Ipadala'}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Kanselahin
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Gift Catalog Grid */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Pumili ng Regalo (Ayon sa halaga ng Coins):
              </label>
              <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {catalog.map((gift) => {
                  const isSelected = selectedGift?.id === gift.id;
                  const canAfford = reelsCoins >= gift.coinPrice;
                  return (
                    <button
                      key={gift.id}
                      type="button"
                      onClick={() => {
                        setSelectedGift(gift);
                        setShowConfirm(false);
                      }}
                      className={`relative p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/50 ring-2 ring-purple-500/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 hover:border-purple-300 dark:hover:border-purple-700'
                      } ${!canAfford ? 'opacity-70' : ''}`}
                    >
                      <span className="text-3xl filter drop-shadow-xs mb-1 transform hover:scale-110 transition-transform">
                        {gift.icon}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {gift.name.split(' ')[0]}
                      </span>
                      <div className="mt-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        <Coins className="w-3 h-3" />
                        <span>{gift.coinPrice}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Gift Breakdown */}
            {selectedGift && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="text-base">{selectedGift.icon}</span> {selectedGift.name}
                  </span>
                  <span className="font-bold text-purple-700 dark:text-purple-300">
                    {selectedGift.coinPrice} Coins (₱{selectedGift.coinPrice}.00)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {selectedGift.description}
                </p>
                <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Makukuha ng Creator (80% net):</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    ₱{(selectedGift.coinPrice * 0.8).toFixed(2)}
                  </strong>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Platform Community Share (20%):</span>
                  <span>₱{(selectedGift.coinPrice * 0.2).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Policy note */}
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-snug">
              * Ang Reels Coins ay nakalaan lamang para sa Reels content appreciation. Ang hiwalay na Livestream Coins ay nakalaan para sa Stage 10.
            </p>

            {/* Action Button */}
            <button
              type="button"
              disabled={!selectedGift || isSending || reelsCoins < (selectedGift?.coinPrice || 0)}
              onClick={() => setShowConfirm(true)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Magpadala ng Regalo ({selectedGift?.coinPrice} Coins)</span>
            </button>
          </>
        )}

      </div>
    </div>
  );
};
