import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Send,
  Flag,
  UserX,
  FileText,
} from 'lucide-react';
import {
  ModerationReason,
  ModerationReportType,
  REPORT_REASONS_MAP,
} from '../types/community';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';

interface UniversalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ModerationReportType;
  targetId: string;
  targetTitleOrName: string;
  targetAuthorUsername?: string;
}

export const UniversalReportModal: React.FC<UniversalReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitleOrName,
  targetAuthorUsername = 'community_member',
}) => {
  const { submitReport, blockUser } = useCommunity();
  const { currentUser } = useAuth();

  const [selectedReason, setSelectedReason] = useState<ModerationReason>('underage');
  const [explanation, setExplanation] = useState('');
  const [alsoBlockUser, setAlsoBlockUser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await submitReport({
        reporterId: currentUser?.id || 'guest-reporter',
        reporterUsername: currentUser?.username || 'anonymous',
        targetType,
        targetId,
        targetAuthorUsername,
        reason: selectedReason,
        explanation: explanation.trim(),
      });

      if (alsoBlockUser && targetAuthorUsername) {
        blockUser(targetAuthorUsername, selectedReason);
      }

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setExplanation('');
        onClose();
      }, 2500);
    } catch {
      setErrorMessage('Nagkaroon ng problema sa pagpapadala ng ulat. Pakisubukang muli.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTargetTypeLabel = () => {
    switch (targetType) {
      case 'user':
        return 'Miyembro / Account';
      case 'message':
        return 'Pribadong Mensahe';
      case 'comment':
        return 'Komento';
      case 'post':
        return 'Talent / Video Post';
      default:
        return 'Nilalaman';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-red-100 flex flex-col text-left max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-900 via-rose-900 to-[#3B1376] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <Flag className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <h3 id="report-modal-title" className="text-base sm:text-lg font-bold font-display leading-tight">
                I-ulat ang Nilalaman (Report)
              </h3>
              <p className="text-xs text-rose-200">18+ Ligtas at Mapagkakatiwalaang Komunidad</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Isara"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Naisumite ang Inyong Ulat</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Maraming salamat sa inyong pagmamalasakit. Susuriin agad ito ng ating Community Safety Team upang panatilihing ligtas, may dignidad, at pantay ang KayaNatinTo.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            {/* Target Details Badge */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Uri: {getTargetTypeLabel()}</span>
                <span>@{targetAuthorUsername}</span>
              </div>
              <p className="font-bold text-slate-800 truncate">{targetTitleOrName}</p>
            </div>

            {/* Safety Charter Reminder */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Alituntunin ng KayaNatinTo:</strong> Ang mga account na pagmamay-ari ng wala pang 18 taong gulang, scam, o mapanirang gawi ay agad na aaksyunan.
              </div>
            </div>

            {/* Reasons Radio Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Pumili ng Dahilan ng Pag-ulat
              </label>
              <div className="space-y-2">
                {REPORT_REASONS_MAP.map((reason) => {
                  const isChecked = selectedReason === reason.id;
                  return (
                    <label
                      key={reason.id}
                      className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-300'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={reason.id}
                        checked={isChecked}
                        onChange={() => setSelectedReason(reason.id)}
                        className="mt-0.5 accent-rose-600"
                      />
                      <div className="text-left flex-1">
                        <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                          <span>{reason.tagalogLabel}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({reason.label})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {reason.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Explanation Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Karagdagang Paliwanag (Opsyonal)
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Ilarawan nang maikli ang sitwasyon o katibayan..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-xs sm:text-sm resize-none outline-none"
              />
            </div>

            {/* Also Block User Checkbox */}
            <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={alsoBlockUser}
                onChange={(e) => setAlsoBlockUser(e.target.checked)}
                className="rounded accent-rose-600 w-4 h-4"
              />
              <div className="text-xs text-slate-700">
                <span className="font-bold flex items-center gap-1">
                  <UserX className="w-3.5 h-3.5 text-rose-600" />
                  I-block din ang miyembrong ito
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Hindi na siya makakapagpadala ng mga pribadong mensahe sa iyo.
                </span>
              </div>
            </label>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
              >
                Kanselahin
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Ipadala ang Ulat</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
