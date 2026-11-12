import React, { useState } from 'react';
import { X, Upload, Plus, CheckCircle, AlertCircle, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Service, ServiceCategory, PricingType, ServiceArrangement, SERVICE_CATEGORIES } from '../types/service';
import { useServices } from '../context/ServiceContext';
import { useAuth } from '../context/AuthContext';

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newService: Service) => void;
  onRequireAuth: () => void;
}

const SAMPLE_SERVICE_PHOTOS = [
  {
    label: 'Pagkukumpuni at Carpentry',
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Pananahi at Alterations',
    url: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
  },
  {
    label: 'Guro at Pagtuturo',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Musika at Gitara',
    url: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
  },
  {
    label: 'Paglilinis ng Bahay',
    url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Litrato at Video',
    url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Hatid-Sundo at Sasakyan',
    url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
  },
];

export const CreateServiceModal: React.FC<CreateServiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onRequireAuth,
}) => {
  const { addService } = useServices();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('repair-maintenance');
  const [rate, setRate] = useState<string>('250');
  const [rateUnit, setRateUnit] = useState<string>('oras');
  const [pricingType, setPricingType] = useState<PricingType>('hourly');
  const [arrangement, setArrangement] = useState<ServiceArrangement>('flexible');
  const [availability, setAvailability] = useState('Lunes hanggang Sabado, 8:00 AM - 5:00 PM');
  const [experienceYears, setExperienceYears] = useState<string>('5');
  const [serviceArea, setServiceArea] = useState('');
  const [city, setCity] = useState(currentUser?.location?.city || 'Majayjay');
  const [province, setProvince] = useState(currentUser?.location?.province || 'Laguna');
  const [barangay, setBarangay] = useState(currentUser?.location?.barangay || '');
  const [photoUrl, setPhotoUrl] = useState('');
  const [selectedPresetPhoto, setSelectedPresetPhoto] = useState(SAMPLE_SERVICE_PHOTOS[0].url);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100">
          <div className="w-14 h-14 bg-purple-100 text-[#4F28D9] rounded-2xl flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Kailangan Mag-log In Para Mag-alok ng Serbisyo
          </h3>
          <p className="text-sm text-slate-600">
            Ang KayaNatinTo ay nagbibigay ng pantay na pagkakataon sa bawat kasapi ng komunidad na magpakitang-gilas ng kanilang galing at kasanayan.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Kanselahin
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequireAuth();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#3B1376] hover:bg-[#4F28D9] text-sm font-bold text-white shadow-md"
            >
              Mag-log In o Mag-rehistro
            </button>
          </div>
        </div>
      </div>
    );
  }

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!title.trim() || title.length < 5) {
      errs.title = 'Pakilagay ang buong pamagat ng serbisyo (kahit 5 letra).';
    }
    if (!description.trim() || description.length < 15) {
      errs.description = 'Maglagay ng maikling paglalarawan (kahit 15 letra).';
    }
    const numRate = parseFloat(rate);
    if (isNaN(numRate) || numRate <= 0) {
      errs.rate = 'Maglagay ng wastong presyo o halaga ng serbisyo.';
    }
    if (!city.trim()) {
      errs.city = 'Pakilagay ang iyong bayan o lungsod.';
    }
    if (!serviceArea.trim()) {
      errs.serviceArea = 'Pakitukoy ang lugar o mga bayan na kaya mong puntahan/serbisyuhan.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const finalImage = photoUrl.trim() || selectedPresetPhoto;
      const numExperience = experienceYears ? parseInt(experienceYears, 10) : undefined;
      const numRate = parseFloat(rate);

      const created = addService({
        providerId: currentUser.id,
        providerName: currentUser.fullName,
        providerUsername: currentUser.username,
        providerAvatarUrl: currentUser.avatarUrl || '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
        providerIsSenior: !!currentUser.isSenior,
        providerAge: currentUser.age || 25,
        providerLocation: {
          city: city.trim(),
          province: province.trim(),
          barangay: barangay.trim() || undefined,
        },
        title: title.trim(),
        description: description.trim(),
        category,
        rate: numRate,
        rateUnit: rateUnit.trim() || undefined,
        pricingType,
        arrangement,
        availability: availability.trim(),
        experienceYears: isNaN(numExperience as number) ? undefined : numExperience,
        portfolioImages: [finalImage],
        serviceArea: serviceArea.trim(),
        isAvailable: true,
      });

      setIsSubmitting(false);
      onSuccess(created);
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#3B1376] to-[#4F28D9] text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              Mag-alok ng Bagong Serbisyo o Talento
            </h2>
            <p className="text-xs text-purple-200">
              Walang bayad mag-lista. Pantay ang exposure sa buong komunidad.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-slate-800 text-sm">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Pamagat ng Serbisyo *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Halimbawa: Pananahi ng Barong at Custom Uniforms"
              className={`w-full p-3 rounded-xl border text-sm ${
                errors.title ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300 focus:ring-2 focus:ring-[#4F28D9]'
              } focus:outline-hidden`}
            />
            {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
          </div>

          {/* Category & Pricing Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Kategorya ng Serbisyo *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4F28D9] focus:outline-hidden bg-white text-sm"
              >
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.tagalogName} ({cat.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Uri ng Pagpepresyo (Pricing Type) *
              </label>
              <select
                value={pricingType}
                onChange={(e) => setPricingType(e.target.value as PricingType)}
                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4F28D9] focus:outline-hidden bg-white text-sm"
              >
                <option value="hourly">Bawat Oras (Hourly)</option>
                <option value="fixed">Nakatakdang Presyo (Fixed Price)</option>
                <option value="project">Bawat Proyekto o Trabaho (Per Project)</option>
                <option value="negotiable">Puwede Pag-usapan (Negotiable)</option>
              </select>
            </div>
          </div>

          {/* Rate & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Halaga / Presyo (₱) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-500 font-bold">₱</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  required
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="250"
                  className={`w-full pl-8 pr-3 py-3 rounded-xl border text-sm ${
                    errors.rate ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300 focus:ring-2 focus:ring-[#4F28D9]'
                  } focus:outline-hidden`}
                />
              </div>
              {errors.rate && <p className="text-xs text-rose-600 mt-1">{errors.rate}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Kaukulang Yunit (Hal: oras, araw, piraso, session)
              </label>
              <input
                type="text"
                value={rateUnit}
                onChange={(e) => setRateUnit(e.target.value)}
                placeholder="oras o session"
                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4F28D9] focus:outline-hidden text-sm"
              />
            </div>
          </div>

          {/* Service Arrangement (Home vs Shop vs Online) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Saan Isasagawa ang Serbisyo? (Arrangement) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'customer-location', label: 'Home Service (Bahay ng Customer)' },
                { id: 'provider-location', label: 'Sa Aking Shop / Talyer' },
                { id: 'online', label: 'Online / Virtual' },
                { id: 'flexible', label: 'Flexible / Kahit Saan' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setArrangement(item.id as ServiceArrangement)}
                  className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                    arrangement === item.id
                      ? 'border-[#4F28D9] bg-purple-50 text-[#3B1376] font-bold shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Buong Paglalarawan ng Serbisyo *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ibahagi ang iyong kaalaman, kagamitan, paraan ng paggawa, at kung bakit mapagkakatiwalaan ang iyong serbisyo..."
              className={`w-full p-3 rounded-xl border text-sm ${
                errors.description ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300 focus:ring-2 focus:ring-[#4F28D9]'
              } focus:outline-hidden resize-none`}
            />
            {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description}</p>}
          </div>

          {/* Schedule & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Oras at Araw na Available
              </label>
              <input
                type="text"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="Hal: Lunes - Sabado, 8am - 5pm"
                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4F28D9] focus:outline-hidden text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Taon ng Karanasan (Years of Experience)
              </label>
              <input
                type="number"
                min="0"
                max="70"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="Hal: 10"
                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4F28D9] focus:outline-hidden text-sm"
              />
            </div>
          </div>

          {/* Service Area & Location */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Lokasyon at Sakop na Bayan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Bayan o Lungsod *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Hal: Majayjay"
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Lalawigan (Province) *
                </label>
                <input
                  type="text"
                  required
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Hal: Laguna"
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Barangay (Opsiyonal)
                </label>
                <input
                  type="text"
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  placeholder="Hal: Brgy. San Roque"
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Lugar na Sinasakop (Coverage Area) *
              </label>
              <input
                type="text"
                required
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                placeholder="Hal: Majayjay, Liliw, Magdalena, at karatig bayan"
                className={`w-full p-2.5 rounded-lg border bg-white text-xs ${
                  errors.serviceArea ? 'border-rose-500' : 'border-slate-300'
                }`}
              />
              {errors.serviceArea && <p className="text-xs text-rose-600 mt-1">{errors.serviceArea}</p>}
            </div>
          </div>

          {/* Photo Portfolio Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Litrato o Sample ng Trabaho
            </label>
            <p className="text-xs text-slate-500">
              Pumili mula sa mga halimbawang litrato o maglagay ng sariling image link:
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {SAMPLE_SERVICE_PHOTOS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedPresetPhoto(item.url);
                    setPhotoUrl('');
                  }}
                  className={`relative rounded-xl overflow-hidden aspect-4/3 border-2 transition-all group ${
                    selectedPresetPhoto === item.url && !photoUrl
                      ? 'border-[#4F28D9] scale-102 shadow-md ring-2 ring-purple-200'
                      : 'border-slate-200 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                    <span className="text-[10px] text-white font-medium leading-tight truncate">
                      {item.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                O maglagay ng Custom Photo URL (Opsiyonal):
              </label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 text-xs sm:text-sm"
            >
              Kanselahin
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#3B1376] hover:bg-[#4F28D9] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-98 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {isSubmitting ? 'Ipinapaskil...' : 'I-publish ang Serbisyo'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
