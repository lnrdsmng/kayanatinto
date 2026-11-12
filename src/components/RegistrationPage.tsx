import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  AtSign,
  MapPin,
  ShieldCheck,
  HeartHandshake,
  Store,
  ShoppingBag,
  Briefcase,
  Sparkles,
  Users,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AccountType, ACCOUNT_TYPE_OPTIONS, calculateAge } from '../types/auth';
import { KayaNatinLogo } from './KayaNatinLogo';

interface RegistrationPageProps {
  onNavigateLogin: () => void;
  onNavigateHome: () => void;
  onRegisterSuccess: () => void;
  onOpenAgeCharter: () => void;
}

const ACCOUNT_ICONS: Record<string, React.ElementType> = {
  ShoppingBag,
  Store,
  Briefcase,
  Sparkles,
  Users,
};

export const RegistrationPage: React.FC<RegistrationPageProps> = ({
  onNavigateLogin,
  onNavigateHome,
  onRegisterSuccess,
  onOpenAgeCharter,
}) => {
  const { register, registeredUsers } = useAuth();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('Laguna');
  const [barangay, setBarangay] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('both');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Age Calculation
  const calculatedAge = useMemo(() => {
    if (!dateOfBirth) return null;
    return calculateAge(dateOfBirth);
  }, [dateOfBirth]);

  const isUnderage = calculatedAge !== null && calculatedAge < 18;
  const isSenior = calculatedAge !== null && calculatedAge >= 60;
  const isAgeValid = calculatedAge !== null && calculatedAge >= 18;

  // Live Username Uniqueness Check
  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
  const isUsernameTaken = useMemo(() => {
    if (!cleanUsername) return false;
    return registeredUsers.some((u) => u.username.toLowerCase() === cleanUsername);
  }, [cleanUsername, registeredUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Validate Full Name
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Pakilagay ang inyong buong pangalan.');
      return;
    }

    // 2. Validate Username
    if (!cleanUsername || cleanUsername.length < 3) {
      setError('Ang username ay dapat may 3 o higit pang letra o numero.');
      return;
    }
    if (isUsernameTaken) {
      setError(`Ang username na "@${cleanUsername}" ay ginagamit na. Pumili ng iba.`);
      return;
    }

    // 3. Validate Email
    if (!email.trim() || !email.includes('@')) {
      setError('Pakilagay ang isang wastong email address.');
      return;
    }

    // 4. Validate Date of Birth & 18+ REQUIREMENT
    if (!dateOfBirth) {
      setError('Pakilagay ang inyong petsa ng kapanganakan (Date of Birth).');
      return;
    }
    const age = calculateAge(dateOfBirth);
    if (age < 18) {
      setError(
        `Paumanhin: Ang KayaNatinTo ay eksklusibong nakalaan para sa mga may edad 18 taong gulang pataas (Kasalukuyang edad: ${age}). Hindi maaaring magpatuloy ang pagpaparehistro.`
      );
      return;
    }

    // 5. Validate Location
    if (!city.trim()) {
      setError('Pakilagay ang inyong lungsod o munisipalidad (Hal. Majayjay o San Pablo).');
      return;
    }

    // 6. Validate Password & Confirm
    if (password.length < 8) {
      setError('Ang password ay dapat may hindi bababa sa 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Hindi magkatugma ang password at confirm password.');
      return;
    }

    // 7. Terms agreement
    if (!termsAgreed) {
      setError('Pakilagyan ng tsek ang kumpirmasyon na kayo ay 18 taong gulang pataas.');
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      fullName,
      username: cleanUsername,
      email,
      dateOfBirth,
      location: {
        city: city.trim(),
        province: province.trim(),
        barangay: barangay.trim() || undefined,
      },
      accountType,
      password,
    });
    setIsSubmitting(false);

    if (result.success) {
      onRegisterSuccess();
    } else {
      setError(result.error || 'Nagkaroon ng problema sa pagpaparehistro.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 text-left">
      {/* Back to Home Button */}
      <div className="max-w-2xl w-full mx-auto mb-4">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#3B1376] transition-colors p-2 rounded-xl hover:bg-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Bumalik sa Homepage</span>
        </button>
      </div>

      <div className="max-w-2xl w-full mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <KayaNatinLogo size="md" showSubtitle={false} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Sumali sa KayaNatinTo
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
              Pantay-pantay na entablado para sa lahat ng Pilipino edad 18 pataas. Walang kailangan na libo-libong followers.
            </p>
          </div>

          {/* Age Requirement Highlight Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-amber-50/50 to-purple-50 border border-purple-200/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#3B1376] text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-700">
              <p className="font-bold text-slate-900 text-sm">
                Mahalagang Paalala sa Edad (Age Requirement)
              </p>
              <p className="mt-0.5 text-slate-600 leading-relaxed">
                Ang KayaNatinTo ay eksklusibong bukas para sa mga indibidwal na may edad <strong>18 taong gulang pataas</strong>. Walang maximum age limit—<strong>malugod at bukas ang ating plataporma sa mga Senior Citizens (Lolo at Lola)</strong>! Ang mga menor de edad (below 18) ay hindi pa kwalipikadong sumali.
              </p>
              <button
                type="button"
                onClick={onOpenAgeCharter}
                className="mt-1.5 font-bold text-[#3B1376] hover:underline inline-flex items-center gap-1"
              >
                <span>Basahin ang 18+ Community Charter</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold">May napansing isyu: </span>
                {error}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#3B1376] flex items-center gap-1.5 pb-1 border-b border-purple-100">
                <User className="w-4 h-4 text-amber-500" />
                <span>1. Pangunahing Impormasyon</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Buong Pangalan (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Halimbawa: Rosa Lita Hernandez"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#3B1376]"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Username *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <AtSign className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="hal. alingrosa"
                      className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
                        isUsernameTaken
                          ? 'border-rose-400 focus:border-rose-500'
                          : cleanUsername && !isUsernameTaken
                          ? 'border-emerald-400 focus:border-emerald-500'
                          : 'border-slate-200 focus:border-[#3B1376]'
                      }`}
                    />
                  </div>
                  {isUsernameTaken && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      Ginagamit na ang username na ito.
                    </p>
                  )}
                  {cleanUsername && !isUsernameTaken && (
                    <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Available ang username @{cleanUsername}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Halimbawa: nanayrosa@email.com"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#3B1376]"
                  />
                </div>
              </div>

              {/* Date of Birth & Live Age Verification */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Petsa ng Kapanganakan (Date of Birth) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#3B1376]"
                  />
                </div>

                {/* Real-time Age Feedback */}
                {calculatedAge !== null && (
                  <div className="mt-2.5">
                    {isUnderage && (
                      <div className="p-3 rounded-xl bg-rose-100/80 border border-rose-300 text-rose-900 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">
                            Edad: {calculatedAge} taong gulang — Hindi kwalipikado
                          </p>
                          <p className="text-[11px] mt-0.5">
                            Paumanhin: Ang KayaNatinTo ay para sa mga may edad 18 pataas upang masiguro ang kaligtasan at pagsunod sa batas ng kabuhayan.
                          </p>
                        </div>
                      </div>
                    )}

                    {isSenior && (
                      <div className="p-3 rounded-xl bg-amber-100/90 border border-amber-300 text-amber-950 text-xs flex items-start gap-2">
                        <HeartHandshake className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">
                            Edad: {calculatedAge} taong gulang — Malugod na Pagdating, Senior Citizen!
                          </p>
                          <p className="text-[11px] mt-0.5">
                            Ikinagagalak namin ang inyong presensya! Walang maximum age limit sa KayaNatinTo. Ibahagi ang inyong karanasan, lutong bahay, at gawang sining.
                          </p>
                        </div>
                      </div>
                    )}

                    {isAgeValid && !isSenior && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium">
                          Edad: {calculatedAge} taong gulang ✓ Kwalipikadong lumahok sa komunidad (18+).
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Location (City/Municipality and Barangay) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lalawigan (Province) *
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#3B1376]"
                  >
                    <option value="Laguna">Laguna</option>
                    <option value="Metro Manila">Metro Manila</option>
                    <option value="Batangas">Batangas</option>
                    <option value="Cavite">Cavite</option>
                    <option value="Rizal">Rizal</option>
                    <option value="Quezon">Quezon</option>
                    <option value="Cebu">Cebu</option>
                    <option value="Davao">Davao</option>
                    <option value="Iloilo">Iloilo</option>
                    <option value="Other">Iba Pang Lalawigan</option>
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lungsod / Bayan *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Hal. Majayjay o San Pablo"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#3B1376]"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Barangay (Opsyonal)
                  </label>
                  <input
                    type="text"
                    value={barangay}
                    onChange={(e) => setBarangay(e.target.value)}
                    placeholder="Hal. Brgy. Talojong"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#3B1376]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Account Type / Purpose Section */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#3B1376] flex items-center gap-1.5 pb-1">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>2. Layunin o Uri ng Account</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Piliin kung paano mo planong simulan ang paggamit sa KayaNatinTo:
                </p>
              </div>

              {/* 5 Options Grid */}
              <div className="space-y-2">
                {ACCOUNT_TYPE_OPTIONS.map((opt) => {
                  const Icon = ACCOUNT_ICONS[opt.iconName] || ShoppingBag;
                  const isSelected = accountType === opt.id;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => setAccountType(opt.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isSelected
                          ? 'bg-purple-50/90 border-[#3B1376] ring-2 ring-purple-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          isSelected
                            ? 'bg-[#3B1376] text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            {opt.title}
                          </h4>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isSelected ? 'bg-[#3B1376] text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {opt.tagalogTitle}
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-snug">
                          {opt.description}
                        </p>
                      </div>
                      <div className="shrink-0 self-center">
                        <input
                          type="radio"
                          name="accountType"
                          checked={isSelected}
                          onChange={() => setAccountType(opt.id)}
                          className="w-4 h-4 text-[#3B1376] focus:ring-[#3B1376]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Clarification Notice */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-950 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Hindi Ka Limitado Dito:</strong> Anumang uri ang piliin mo ngayon, bukas ang lahat ng features para sa iyo. Maaari kang magbenta, bumili, o magbahagi ng talento anumang oras nang walang limitasyon!
                </span>
              </div>
            </div>

            {/* 3. Password Section */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#3B1376] flex items-center gap-1.5 pb-1">
                <Lock className="w-4 h-4 text-amber-500" />
                <span>3. Password at Seguridad</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Hindi bababa sa 8 characters"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#3B1376]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && password.length < 8 && (
                    <p className="text-[11px] text-amber-700 mt-1">
                      Kailangan ng hindi bababa sa 8 characters ({password.length}/8).
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kumpirmahin ang Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulitin ang inyong password"
                      className={`w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
                        confirmPassword && password !== confirmPassword
                          ? 'border-rose-300 focus:border-rose-500'
                          : confirmPassword && password === confirmPassword
                          ? 'border-emerald-300 focus:border-emerald-500'
                          : 'border-slate-200 focus:border-[#3B1376]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      Hindi magkatugma ang dalawang password.
                    </p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Magkatugma ang password.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Mandatory Age & Terms Confirmation Checkbox */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="mt-0.5 rounded text-[#3B1376] focus:ring-[#3B1376] w-4 h-4 shrink-0"
                />
                <span className="text-xs text-amber-950 font-medium leading-relaxed">
                  <strong>Pahayag sa Edad:</strong> Kinukumpirma ko nang buong katapatan na ako ay may edad <strong>18 taong gulang pataas</strong>. Sumasang-ayon ako na ang KayaNatinTo ay eksklusibong nakalaan para sa mga nasa legal na edad at bukas sa mga senior citizen upang magsulong ng marangal na kabuhayan.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isUnderage || isUsernameTaken}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                isUnderage
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-[#3B1376] hover:bg-[#2F106A] text-white active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Ginagawa ang inyong account...'
                  : isUnderage
                  ? 'Hindi maaaring magpatuloy (Must be 18+)'
                  : 'Lumikha ng Account at Ituloy sa Profile Setup'}
              </span>
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Mayroon na kayong account sa KayaNatinTo?{' '}
              <button
                type="button"
                onClick={onNavigateLogin}
                className="font-bold text-[#3B1376] hover:underline cursor-pointer"
              >
                Mag-log In Dito
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
