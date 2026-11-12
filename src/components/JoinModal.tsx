import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, HeartHandshake, Sparkles, Send } from 'lucide-react';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAgePolicy: () => void;
}

export const JoinModal: React.FC<JoinModalProps> = ({
  isOpen,
  onClose,
  onOpenAgePolicy,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'seller' | 'buyer' | 'senior'>('seller');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ageConfirmed) {
      setError('Pakikumpirma po na kayo ay may edad 18 taong gulang pataas.');
      return;
    }
    setError('');
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
      onClose();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-purple-100 flex flex-col text-left max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-title"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#2F106A] via-[#3B1376] to-[#4F28D9] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-purple-950 uppercase tracking-wide">
              Komunidad ng May Kakayahan
            </span>
          </div>
          <h2 id="join-title" className="text-xl sm:text-2xl font-bold font-display leading-tight">
            Maging Bahagi ng KayaNatinTo
          </h2>
          <p className="text-xs sm:text-sm text-purple-200 mt-1">
            Pantay na entablado para sa lahat ng Pilipino edad 18 pataas.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Mission Note */}
          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100 text-xs text-purple-950 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#3B1376] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-purple-900">Walang Popularity Contest</p>
              <p className="mt-0.5 text-purple-800">
                Hindi mo kailangang maging influencer o may libo-libong followers. Ang iyong galing, tiyaga, at sariling likha ang titingnan ng mga mamimili.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nais Kong Sumali Bilang:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                    role === 'seller'
                      ? 'bg-purple-100 text-[#3B1376] border-purple-300 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Seller / Artisan
                </button>
                <button
                  type="button"
                  onClick={() => setRole('senior')}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                    role === 'senior'
                      ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Senior Creator (60+)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                    role === 'buyer'
                      ? 'bg-blue-100 text-blue-900 border-blue-300 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Supporter / Buyer
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address o Mobile Number (para sa updates)
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Halimbawa: juan@example.com o 0917..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            {/* Age Confirmation Checkbox - CRITICAL */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <span className="text-xs text-amber-950 font-medium leading-snug">
                  <strong>Kinukumpirma ko na ako ay 18 taong gulang pataas.</strong> Naiintindihan ko na ang KayaNatinTo ay nakalaan para sa mga nasa wastong gulang (18+) at bukas sa mga senior citizen na walang maximum age limit.{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenAgePolicy();
                    }}
                    className="text-purple-700 font-bold underline inline ml-1"
                  >
                    Basahin ang patakaran
                  </button>
                </span>
              </label>
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-medium">{error}</p>
            )}

            {submitted && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Maraming salamat! Nai-tala na ang inyong interes para sa darating na paglulunsad.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitted}
              className="w-full py-3 rounded-xl bg-[#3B1376] hover:bg-[#2F106A] text-white text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Sumali sa KayaNatinTo Waitlist
            </button>
          </form>

          {/* Registration Notice */}
          <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Ang opisyal na self-service registration ay magbubukas sa pampublikong paglabas.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
