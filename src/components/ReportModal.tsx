import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useConnections } from '../context/ConnectionContext';
import { ReportTargetType } from '../types/connection';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  targetName: string;
}

const REPORT_REASON_OPTIONS: Record<ReportTargetType, string[]> = {
  user: [
    'Lumalabag sa 18+ Age Requirement (Menor de edad o gumagamit ng pekeng edad)',
    'Pambabastos o Harassment (Hindi magandang asal o pananakot)',
    'Panloloko o Scam (Maling alok, pekeng pagkakakilanlan, o hindi tumupad sa usapan)',
    'Spam o Panggugulo sa komunidad',
    'Iba pang paglabag sa KayaNatinTo Community Rules',
  ],
  message: [
    'Mapanira, malaswa, o mapang-abusong pananalita (Inappropriate content)',
    'Hinihingan ng labas na transaksyon o kahina-hinalang links (Phishing / Scam)',
    'Panggigipit o pamimilit (Harassment)',
    'Spam o paulit-ulit na mensahe',
  ],
  comment: [
    'Hindi magalang o mapanirang komento (Hate speech o bullying)',
    'Patalastas o Spam na walang kinalaman sa talento o post',
    'Maling impormasyon o panloloko',
  ],
  post: [
    'Lumalabag sa 18+ Age Requirement (May batang gumagamit o lumalahok)',
    'Hindi angkop o mapanirang nilalaman (Harassment o Hate Speech)',
    'Maling impormasyon o Pandaraya (Scam o Misleading)',
    'Spam o Paulit-ulit na pag-post',
  ],
  product: [
    'Ipinagbabawal o mapanganib na kalakal',
    'Maling presyo o pekeng larawan ng produkto',
    'Hindi tunay o sirang paninda',
    'Lumalabag sa lokal na patakaran ng pagkain o kaligtasan',
  ],
  service: [
    'Hindi kwalipikado o mapanganib na serbisyo',
    'Maling rates o paniningil na labag sa napagkasunduan',
    'Pekeng kredensyal o hindi sumipot sa serbisyo',
  ],
};

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
}) => {
  const { submitReport } = useConnections();
  const reasons = REPORT_REASON_OPTIONS[targetType] || REPORT_REASON_OPTIONS.user;

  const [selectedReason, setSelectedReason] = useState(reasons[0]);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const getTargetTypeLabel = (type: ReportTargetType) => {
    switch (type) {
      case 'user':
        return 'Miyembro / User';
      case 'message':
        return 'Pribadong Mensahe';
      case 'comment':
        return 'Komento';
      case 'post':
        return 'Talent Post';
      case 'product':
        return 'Produkto';
      case 'service':
        return 'Serbisyo';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport({
      targetType,
      targetId,
      targetName,
      reason: selectedReason,
      details: details.trim() || undefined,
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">
                I-report ang {getTargetTypeLabel(targetType)}
              </h3>
              <p className="text-[11px] text-slate-300">
                Pangangalaga sa Kaligtasan ng Komunidad (18+)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
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
              Naisumite na ang Iyong Ulat
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Maraming salamat sa iyong pagmamalasakit. Sinusuri ng ating Community Safety team ang ini-ulat na {getTargetTypeLabel(targetType).toLowerCase()} upang mapanatiling ligtas at magalang ang ating komunidad.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm text-slate-800">
            <div>
              <p className="text-xs text-slate-600">
                Iniuulat: <strong className="text-slate-900 font-bold">{targetName}</strong>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pumili ng angkop na dahilan kung bakit ito lumalabag sa ating pamantayan:
              </p>
            </div>

            <div className="space-y-2">
              {reasons.map((reason, idx) => (
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
                placeholder="Maaari mong ipaliwanag ang buong pangyayari..."
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
