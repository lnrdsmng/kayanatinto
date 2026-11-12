import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  User,
  Camera,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Moon,
  Sun,
  Laptop,
  Lock,
  Mail,
  Calendar,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenKycModal?: () => void;
}

const AVATAR_OPTIONS = [
  { label: 'Nanay Cook', url: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png' },
  { label: 'Youth Musician', url: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png' },
  { label: 'Elder Seamstress', url: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png' },
  { label: 'Artisan Potter', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80' },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenKycModal,
}) => {
  const { currentUser, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [city, setCity] = useState(currentUser?.location.city || '');
  const [province, setProvince] = useState(currentUser?.location.province || 'Laguna');
  const [barangay, setBarangay] = useState(currentUser?.location.barangay || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(currentUser?.coverPhotoUrl || '');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(currentUser?.skills || []);
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState<string[]>(currentUser?.interests || []);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleAddSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (item: string) => {
    setSkills(skills.filter((s) => s !== item));
  };

  const handleAddInterest = () => {
    const i = interestInput.trim();
    if (i && !interests.includes(i)) {
      setInterests([...interests, i]);
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (item: string) => {
    setInterests(interests.filter((i) => i !== item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile({
      fullName: fullName.trim(),
      bio: bio.trim(),
      location: {
        city: city.trim(),
        province: province.trim(),
        barangay: barangay.trim() || undefined,
      },
      avatarUrl,
      coverPhotoUrl: coverPhotoUrl.trim() || undefined,
      skills,
      interests,
    });
    setIsSaving(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 900);
  };

  const kycStatusLabel = {
    approved: 'Verified (KYC Approved)',
    under_review: 'Under Review',
    pending_review: 'Pending Review',
    rejected: 'Rejected / Kailangan ng Pagbabago',
    resubmission_required: 'Resubmission Required',
    not_submitted: 'Not Submitted',
  }[currentUser.kycStatus || 'not_submitted'];

  const kycStatusColor = {
    approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    under_review: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
    pending_review: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
    resubmission_required: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    not_submitted: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  }[currentUser.kycStatus || 'not_submitted'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-purple-100 dark:border-slate-800 flex flex-col text-left max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div>
            <h2 id="edit-profile-title" className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white">
              Mga Setting at Profile
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              I-update ang iyong impormasyon, tema (Dark Mode), at kasanayan
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Matagumpay na na-update ang iyong profile!</span>
            </div>
          )}

          {/* SECTION 1: Dark Mode Toggle (Stage 8.5 Requirement 23) */}
          <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 space-y-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Moon className="w-4 h-4 text-[#7C3AED]" />
                <span>Dark Mode</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Piliin ang itsura ng iyong app.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white dark:bg-slate-800 border-purple-600 text-purple-700 dark:text-purple-300 shadow-sm ring-2 ring-purple-500/20'
                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-white dark:bg-slate-800 border-purple-600 text-purple-700 dark:text-purple-300 shadow-sm ring-2 ring-purple-500/20'
                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white'
                }`}
              >
                <Moon className="w-4 h-4 text-purple-600" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'bg-white dark:bg-slate-800 border-purple-600 text-purple-700 dark:text-purple-300 shadow-sm ring-2 ring-purple-500/20'
                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white'
                }`}
              >
                <Laptop className="w-4 h-4 text-blue-500" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: Account Information (Stage 8.5 Requirement 4) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Impormasyon ng Account (Account Information)
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Pribado</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Email</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 break-all">
                  {currentUser.email || 'Hindi nakatala'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Araw ng Kapanganakan (DOB)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {currentUser.dateOfBirth} ({currentUser.age} taong gulang)
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Tirahan / Address</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {currentUser.location.barangay ? `${currentUser.location.barangay}, ` : ''}
                  {currentUser.location.city}, {currentUser.location.province}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Account Verification (KYC)</span>
                <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${kycStatusColor}`}>
                  {kycStatusLabel}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">18+ Eligibility Status</span>
                <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Kwalipikadong Miyembro (18+)</span>
                </span>
              </div>
            </div>

            {/* Mandatory Reminder per Stage 8.5 Requirement 4 */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Para sa mga 18 taong gulang pataas ang KayaNatinTo.</p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                  Ligtas at protektado ang iyong mga pribadong detalye. Hindi ito kailanman ibinubunyag sa pampublikong profile.
                </p>
              </div>
            </div>

            {currentUser.kycStatus !== 'approved' && onOpenKycModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenKycModal();
                }}
                className="w-full py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>I-verify ang Account para sa Payouts</span>
              </button>
            )}
          </div>

          {/* SECTION 3: Editable Public Profile Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Pampublikong Profile (Public Profile)
              </h3>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Buong Pangalan (Display Name)
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            {/* Avatar Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Pumili ng Larawan / Avatar
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AVATAR_OPTIONS.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(opt.url)}
                    className={`p-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      avatarUrl === opt.url
                        ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 border-[#7C3AED] ring-2 ring-purple-500/20'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                    }`}
                  >
                    <img src={opt.url} alt={opt.label} className="w-10 h-10 rounded-full object-cover" />
                    <span className="text-[10px] truncate max-w-full">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cover Photo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Cover Photo URL (Opsyonal)
              </label>
              <input
                type="url"
                value={coverPhotoUrl}
                onChange={(e) => setCoverPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Maikling Pagpapakilala (Bio)
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ibahagi ang iyong kwento at hilig..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Barangay
                </label>
                <input
                  type="text"
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Lungsod / Bayan
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Lalawigan
                </label>
                <input
                  type="text"
                  required
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Kasanayan o Talento
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {skills.map((sk, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 text-xs font-semibold border border-purple-200 dark:border-purple-800"
                  >
                    <span>{sk}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(sk)}
                      className="text-purple-500 hover:text-purple-800 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Magdagdag ng talento..."
                  className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Idagdag
                </button>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Kanselahin
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                {isSaving ? 'Sine-save...' : 'I-save ang Pagbabago'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
