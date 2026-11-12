import React from 'react';
import { X, ShieldCheck, HeartHandshake, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AgePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgePolicyModal: React.FC<AgePolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-purple-100 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-policy-title"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#2F106A] to-[#4F28D9] p-6 text-white text-left">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-purple-950 uppercase tracking-wide">
              Patakaran sa Edad
            </span>
            <span className="text-xs text-purple-200">Community Standard</span>
          </div>
          <h2 id="age-policy-title" className="text-xl sm:text-2xl font-bold font-display leading-tight">
            18+ Platform & Senior Welcoming Charter
          </h2>
          <p className="text-xs sm:text-sm text-purple-100 mt-1">
            Equal opportunities for all adults — with no maximum age limit.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-left text-slate-700 text-sm leading-relaxed">
          {/* Key Requirement Callout */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950 text-sm">
                Minimum Age Requirement: 18 Taong Gulang Pataas
              </p>
              <p className="text-xs text-amber-900 mt-1">
                Ang KayaNatinTo ay eksklusibong nakalaan para sa mga indibidwal na may edad 18 taong gulang pataas. Ang mga menor de edad (below 18) ay hindi pa kwalipikadong sumali upang masiguro ang proteksyon ng kabataan at legal na pagsunod sa mga transaksyon at serbisyo.
              </p>
            </div>
          </div>

          {/* Pillars */}
          <div className="space-y-3.5">
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800 shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">
                  Senior Citizens are Fully Welcome (Walang Maximum Age)
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Ipinagmamalaki natin ang ating mga lolo at lola! Kung ikaw ay 60, 70, o 80+ taong gulang na may lutong bahay, gawang sining, o pananahi, bukas ang KayaNatinTo upang mabigyan kayo ng marangal na kabuhayan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">
                  Pantay na Pagkakataon (No Popularity Needed)
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Hindi kailangan ng libo-libong followers o malaking advertising budget. Ang iyong husay, galing, at tiyaga ang nagpapakita sa komunidad.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">
                  Future Registration System Design
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Sa pagbubukas ng pagpaparehistro, magpapatupad ng simpleng age verification upang kumpirmahin ang edad 18+. Walang kumplikadong papeles para sa mga senior citizen—gawin itong madali at maunawain para sa lahat.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-purple-50/60 rounded-xl text-xs text-purple-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
            <span>Mula sa kabataan ng 18 hanggang sa karunungan ng 80+, kaya natin to!</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#3B1376] hover:bg-[#2F106A] text-white text-sm font-semibold transition-all shadow-md active:scale-95"
          >
            Naiintindihan Ko (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
