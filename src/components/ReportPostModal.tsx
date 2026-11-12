import React, { useState } from 'react';
import { X, Flag, CheckCircle2, ShieldAlert } from 'lucide-react';
import { TalentPost } from '../types/talent';
import { useTalents } from '../context/TalentContext';

interface ReportPostModalProps {
  post: TalentPost;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  'Lumalabag sa 18+ Age Requirement (May batang gumagamit o lumalahok)',
  'Hindi angkop o mapanirang nilalaman (Harassment o Hate Speech)',
  'Maling impormasyon o Pandaraya (Scam o Misleading)',
  'Spam o Paulit-ulit na pag-post',
  'Iba pang dahilan na lumalabag sa KayaNatinTo Community Charter',
];

export const ReportPostModal: React.FC<ReportPostModalProps> = ({
  post,
  isOpen,
  onClose,
}) => {
  const { reportPost } = useTalents();
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportPost(post.id, `${selectedReason}${details ? `: ${details}` : ''}`);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">I-report ang Nilalaman sa Moderation</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">
              Salamat sa Pag-report!
            </h4>
            <p className="text-xs text-slate-600">
              Sinusuri ng ating Community Safety team ang ini-report na post alinsunod sa ating 18+ Charter at mga panuntunan sa komunidad.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm text-slate-800">
            <p className="text-xs text-slate-600">
              Pumili ng pinaka-angkop na dahilan sa pag-report ng post ni{' '}
              <strong className="text-slate-900">{post.creatorName}</strong>:
            </p>

            <div className="space-y-2">
              {REPORT_REASONS.map((reason, idx) => (
                <label
                  key={idx}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    selectedReason === reason
                      ? 'border-purple-600 bg-purple-50/70 text-purple-950 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mt-0.5 text-[#3B1376] focus:ring-[#3B1376]"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Karagdagang Paliwanag (Opsiyonal)
              </label>
              <textarea
                rows={2}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Ilarawan ang nakitang paglabag..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#4F28D9] focus:outline-hidden resize-none bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Kanselahin
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Isumite ang Ulat
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
