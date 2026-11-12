import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  Heart,
  ShoppingBag,
  Calendar,
  Star,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Wallet,
} from 'lucide-react';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAgePolicy: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  onOpenAgePolicy,
}) => {
  const [payoutRequested, setPayoutRequested] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full sm:max-w-md h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl shadow-2xl flex flex-col text-left overflow-hidden border border-slate-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#2F106A] via-[#3B1376] to-[#4F28D9] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 id="profile-title" className="text-base sm:text-lg font-bold font-display leading-tight">
                Aking Kita at Oportunidad
              </h2>
              <p className="text-xs text-purple-200">Earnings & Creator Dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Close profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Main Earnings Card (matching image 2 mockup) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 via-white to-amber-50/50 border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Kabuuang Kita (Total Earnings)</span>
              <span className="flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <TrendingUp className="w-3 h-3" />
                +12% this month
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">
                ₱2,850.00
              </span>
            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="p-3 rounded-xl bg-white border border-slate-100 flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                  <Heart className="w-4 h-4 fill-rose-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">₱1,200</p>
                  <p className="text-[10px] text-slate-400">Gifts & Cheers</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-100 flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">₱950</p>
                  <p className="text-[10px] text-slate-400">Product Orders</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-100 flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">₱550</p>
                  <p className="text-[10px] text-slate-400">Bookings / Services</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-100 flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <Star className="w-4 h-4 fill-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">₱150</p>
                  <p className="text-[10px] text-slate-400">Memberships</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setPayoutRequested(true);
                setTimeout(() => setPayoutRequested(false), 3000);
              }}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#3B1376] hover:bg-[#2F106A] text-white text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              {payoutRequested ? 'Payout Request Submitted (Demo)!' : 'Request Payout (Gcash / Bank)'}
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-1.5">
              Minimum payout: ₱500 · 0% commission for local community sellers
            </p>
          </div>

          {/* Ways to Earn */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Mga Paraan para Kumita (Ways to Earn)
            </h4>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-100 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Magbenta ng Produkto</h5>
                    <p className="text-[11px] text-slate-500">I-post ang lutong bahay, crafts, at ani</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-100 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Mag-alok ng Serbisyo</h5>
                    <p className="text-[11px] text-slate-500">Pananahi, pagkukumpuni, o pagtuturo</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-100 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-800">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Tumanggap ng Suporta & Gifts</h5>
                    <p className="text-[11px] text-slate-500">Direct appreciation mula sa komunidad</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Age Reminder */}
          <div className="p-3 bg-purple-50 rounded-xl text-[11px] text-[#3B1376] flex items-center justify-between">
            <span className="font-medium">18+ Age Policy verified for all payout receivers.</span>
            <button
              onClick={onOpenAgePolicy}
              className="font-bold underline text-xs"
            >
              Info
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 text-slate-800 text-xs font-semibold hover:bg-slate-300 transition-colors"
          >
            Isara (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
