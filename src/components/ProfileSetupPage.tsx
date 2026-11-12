import React, { useState } from 'react';
import {
  User,
  Camera,
  MapPin,
  Sparkles,
  ShoppingBag,
  Briefcase,
  Plus,
  X,
  CheckCircle2,
  HeartHandshake,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { KayaNatinLogo } from './KayaNatinLogo';

interface ProfileSetupPageProps {
  onComplete: () => void;
  onSkip: () => void;
}

// Preset Filipino Creator Avatars
const AVATAR_PRESETS = [
  {
    id: 'nanay-cook',
    label: 'Nanay Cook',
    url: './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    role: 'Home Cook & Baker',
  },
  {
    id: 'kuya-music',
    label: 'Youth Musician',
    url: './assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    role: 'Musician & Artist',
  },
  {
    id: 'lola-sew',
    label: 'Elder Artisan',
    url: './assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    role: 'Master Seamstress',
  },
];

const SUGGESTED_SKILLS = [
  'Lutong Bahay',
  'Kakanin & Pastries',
  'Pananahi at Alterations',
  'Handmade Pottery',
  'Woodworking at Pag-uukit',
  'Acoustic Guitar & OPM',
  'Sining at Pagpipinta',
  'Pagtuturo (Tutoring)',
  'Halaman at Gardening',
  'Pagkukumpuni sa Bahay',
];

const SUGGESTED_INTERESTS = [
  'Lokal na Pagkain',
  'Sariling Likhang Pinoy',
  'Sinaunang Kakanin',
  'Acoustic Musika',
  'Native Plants',
  'Suportahan ang mga Lolo at Lola',
  'Eco-Friendly Crafts',
];

export const ProfileSetupPage: React.FC<ProfileSetupPageProps> = ({
  onComplete,
  onSkip,
}) => {
  const { currentUser, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [city, setCity] = useState(currentUser?.location.city || '');
  const [province, setProvince] = useState(currentUser?.location.province || 'Laguna');
  const [barangay, setBarangay] = useState(currentUser?.location.barangay || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || AVATAR_PRESETS[0].url);

  // Skills & Interests
  const [skills, setSkills] = useState<string[]>(
    currentUser?.skills.length ? currentUser.skills : ['Lutong Bahay']
  );
  const [customSkill, setCustomSkill] = useState('');

  const [interests, setInterests] = useState<string[]>(
    currentUser?.interests.length ? currentUser.interests : ['Lokal na Pagkain', 'Sariling Likhang Pinoy']
  );
  const [customInterest, setCustomInterest] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setCustomSkill('');
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const addCustomInterest = () => {
    const trimmed = customInterest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
      setCustomInterest('');
    }
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
      skills,
      interests,
    });

    setIsSaving(false);
    setSuccessNotice(true);
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-2xl w-full mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <KayaNatinLogo size="md" showSubtitle={false} />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 uppercase tracking-wide">
              Hakbang 2: Pag-ayos ng Profile
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight mt-2">
              Ibahagi ang Kwento ng Iyong Galing
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
              Tulungan ang iyong mga kapitbahay at komunidad na makilala ang iyong mga talento, likha, at serbisyo.
            </p>
          </div>

          {/* Success notice */}
          {successNotice && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Matagumpay na na-save ang inyong profile! Ililipat ka na sa iyong account...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Profile Photo Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Larawan sa Profile (Profile Photo)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-200 ring-4 ring-[#3B1376]/20 shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Selected avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <p className="text-xs font-bold text-slate-800">Pumili ng Creator Avatar Preset:</p>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Maaari kang pumili ng isa sa mga authentic Filipino avatar o magpalit sa susunod.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setAvatarUrl(preset.url)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                          avatarUrl === preset.url
                            ? 'bg-[#3B1376] text-white border-[#3B1376] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Full Name & Short Bio */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Kwento at Pagpapakilala
              </label>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Pangalan na Makikita sa Profile
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#3B1376]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Maikling Pagpapakilala o Bio (Short Bio)
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Halimbawa: Isang masugid na nagluluto ng kakanin sa Majayjay, Laguna na may pagmamahal sa tradisyunal na pagkaing Pinoy."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#3B1376] resize-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Isulat kung ano ang iyong inspirasyon, gaano ka na katagal gumagawa, o kung ano ang espesyal sa iyong mga likha.
                </p>
              </div>
            </div>

            {/* 3. Location Confirmation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. Lokasyon sa Komunidad
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Lungsod / Bayan
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#3B1376]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Barangay
                  </label>
                  <input
                    type="text"
                    value={barangay}
                    onChange={(e) => setBarangay(e.target.value)}
                    placeholder="Hal. Brgy. Poblacion"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#3B1376]"
                  />
                </div>
              </div>
            </div>

            {/* 4. Skills, Talents, or Services */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  4. Mga Kasanayan, Talento, o Serbisyo (Opsyonal)
                </label>
                <span className="text-[11px] text-purple-700 font-semibold">
                  {skills.length} napili
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-2.5">
                I-click ang mga angkop sa iyong kakayahan, o magdagdag ng sariling galing:
              </p>

              {/* Tag Selection */}
              <div className="flex flex-wrap gap-2 mb-3">
                {SUGGESTED_SKILLS.map((item) => {
                  const isSelected = skills.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleSkill(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#3B1376] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {item} {isSelected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Skill */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomSkill();
                    }
                  }}
                  placeholder="Magdagdag ng ibang kasanayan (Hal. Pag-gawa ng pastillas)..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#3B1376]"
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-[#3B1376] text-xs font-bold transition-colors"
                >
                  Idagdag
                </button>
              </div>
            </div>

            {/* 5. Products or Interests */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  5. Mga Produkto o Interes (Opsyonal)
                </label>
                <span className="text-[11px] text-purple-700 font-semibold">
                  {interests.length} napili
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-2.5">
                Ano ang mga hilig mong bilhin o suportahan sa KayaNatinTo?
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {SUGGESTED_INTERESTS.map((item) => {
                  const isSelected = interests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-purple-950 shadow-2xs font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {item} {isSelected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomInterest();
                    }
                  }}
                  placeholder="Magdagdag ng ibang interes o hilig..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#3B1376]"
                />
                <button
                  type="button"
                  onClick={addCustomInterest}
                  className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors"
                >
                  Idagdag
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={onSkip}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline order-2 sm:order-1"
              >
                Laktawan muna (I-setup mamaya sa profile)
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#3B1376] hover:bg-[#2F106A] text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 order-1 sm:order-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Sine-save...' : 'I-save ang Profile at Magpatuloy'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
