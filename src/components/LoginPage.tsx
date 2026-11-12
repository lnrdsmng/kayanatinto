import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { KayaNatinLogo } from './KayaNatinLogo';

interface LoginPageProps {
  onNavigateRegister: () => void;
  onNavigateHome: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateRegister,
  onNavigateHome,
  onLoginSuccess,
}) => {
  const { login, quickLoginAsDemo, requestPasswordReset } = useAuth();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!emailOrUsername.trim()) {
      setError('Pakilagay ang inyong email address o username.');
      return;
    }
    if (!password) {
      setError('Pakilagay ang inyong password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(emailOrUsername, password);
    setIsSubmitting(false);

    if (result.success) {
      setSuccess('Matagumpay na nakapag-log in! Ililipat ka na sa iyong account...');
      setTimeout(() => {
        onLoginSuccess();
      }, 700);
    } else {
      setError(result.error || 'Hindi makapag-log in. Pakisubukang muli.');
    }
  };

  const handleQuickDemo = (key: 'nanaylita' | 'kuyajayson' | 'maria' | 'lolamercy') => {
    quickLoginAsDemo(key);
    setSuccess('Naka-log in gamit ang demo account!');
    setTimeout(() => {
      onLoginSuccess();
    }, 600);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotMessage({ type: 'error', text: 'Pakilagay ang inyong email address.' });
      return;
    }
    const res = await requestPasswordReset(forgotEmail);
    if (res.success) {
      setForgotMessage({ type: 'success', text: res.message });
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setForgotMessage(null);
        setForgotEmail('');
      }, 3500);
    } else {
      setForgotMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 text-left">
      {/* Back to Home Button */}
      <div className="max-w-md w-full mx-auto mb-4">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#3B1376] transition-colors p-2 rounded-xl hover:bg-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Bumalik sa Homepage</span>
        </button>
      </div>

      <div className="max-w-md w-full mx-auto">
        {/* Card Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
          {/* Logo & Headline */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <KayaNatinLogo size="md" showSubtitle={false} />
            </div>
            <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
              Mag-log In sa KayaNatinTo
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Malugod na pagbabalik! I-access ang iyong account at komunidad.
            </p>
          </div>

          {/* Quick Demo Sign-in Banner for Reviewers */}
          <div className="mb-5 p-3 rounded-2xl bg-purple-50/80 border border-purple-100 text-xs text-purple-950">
            <div className="flex items-center gap-1.5 font-bold text-[#3B1376] mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Subukan ang Demo Sign-in (1-Click):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('nanaylita')}
                className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 hover:border-purple-400 font-medium text-[11px] text-[#3B1376] transition-all hover:shadow-2xs active:scale-95"
              >
                Nanay Lita (Senior 68y/o)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('kuyajayson')}
                className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 hover:border-purple-400 font-medium text-[11px] text-[#3B1376] transition-all hover:shadow-2xs active:scale-95"
              >
                Kuya Jayson (Youth 22y/o)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('maria')}
                className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 hover:border-purple-400 font-medium text-[11px] text-[#3B1376] transition-all hover:shadow-2xs active:scale-95"
              >
                Maria (Buyer 34y/o)
              </button>
            </div>
          </div>

          {/* Error & Success Feedback Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email or Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address o Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="Halimbawa: nanaylita o lita@email.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#3B1376] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-900 underline"
                >
                  Nakalimutan ang password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ilagay ang inyong password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#3B1376] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Itago ang password' : 'Ipakita ang password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#3B1376] hover:bg-[#2F106A] text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 disabled:opacity-70 mt-2 flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Sumusuri...' : 'Mag-log In'}</span>
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Wala pa kayong account sa KayaNatinTo?{' '}
              <button
                type="button"
                onClick={onNavigateRegister}
                className="font-bold text-[#3B1376] hover:underline cursor-pointer"
              >
                Magrehistro Dito (Sign Up)
              </button>
            </p>
          </div>
        </div>

        {/* 18+ Age Notice Footer */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
            <span>Ang KayaNatinTo ay para sa mga edad 18 pataas. Malugod ang mga senior citizen.</span>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-left">
            <h3 className="text-lg font-bold font-display text-slate-900">
              I-reset ang Password
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Ilagay ang inyong email address at magpapadala kami ng verification link.
            </p>

            {forgotMessage && (
              <div
                className={`mt-3 p-3 rounded-xl text-xs flex items-start gap-2 ${
                  forgotMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {forgotMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{forgotMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Halimbawa: nanaylita@kayanatin.ph"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#3B1376]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Kanselahin
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#3B1376] hover:bg-[#2F106A] text-white text-xs font-bold shadow-sm"
                >
                  Ipadala ang Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
