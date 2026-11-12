import React from 'react';
import { X, Sparkles, ShoppingBag, Briefcase, ChevronRight } from 'lucide-react';

interface CreateActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTalent: () => void;
  onSelectProduct: () => void;
  onSelectService: () => void;
}

export const CreateActionModal: React.FC<CreateActionModalProps> = ({
  isOpen,
  onClose,
  onSelectTalent,
  onSelectProduct,
  onSelectService,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden text-left p-6 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
              Ano ang gusto mong gawin?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pumili ng uri ng pag-post sa komunidad ng KayaNatinTo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Large Choices matching Stage 8.5 Item 2 */}
        <div className="space-y-3">
          {/* Option A: Mag-post ng Talento o Likha */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectTalent();
            }}
            className="w-full p-4 rounded-2xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/80 dark:bg-purple-950/40 hover:bg-purple-100/90 dark:hover:bg-purple-900/50 transition-all flex items-center justify-between gap-3 text-left group cursor-pointer shadow-2xs hover:shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <Sparkles className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#3B1376] dark:text-purple-200 group-hover:text-purple-900 dark:group-hover:text-white">
                  Mag-post ng Talento o Likha
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  Ibahagi ang iyong talento, gawa, larawan, o video.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-purple-400 dark:text-purple-300 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          {/* Option B: Magbenta ng Produkto */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectProduct();
            }}
            className="w-full p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-950/40 hover:bg-amber-100/90 dark:hover:bg-amber-900/50 transition-all flex items-center justify-between gap-3 text-left group cursor-pointer shadow-2xs hover:shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-amber-950 dark:text-amber-200 group-hover:text-amber-900 dark:group-hover:text-white">
                  Magbenta ng Produkto
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  I-post ang iyong paninda, pagkain, o sariling likha.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          {/* Option C: Mag-alok ng Serbisyo */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectService();
            }}
            className="w-full p-4 rounded-2xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100/90 dark:hover:bg-blue-900/50 transition-all flex items-center justify-between gap-3 text-left group cursor-pointer shadow-2xs hover:shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-blue-950 dark:text-blue-200 group-hover:text-blue-900 dark:group-hover:text-white">
                  Mag-alok ng Serbisyo
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  Ipakita ang iyong skills, serbisyo, o mga aralin.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>
        </div>

        {/* Charter note */}
        <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center pt-1">
          Lahat ng post ay sumusunod sa 18+ KayaNatinTo Community Safety Guidelines.
        </p>

      </div>
    </div>
  );
};
