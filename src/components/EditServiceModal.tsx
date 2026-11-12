import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, Check, Sparkles } from 'lucide-react';
import { Service, ServiceCategory, PricingType, ServiceArrangement, SERVICE_CATEGORIES } from '../types/service';
import { useServices } from '../context/ServiceContext';

interface EditServiceModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditServiceModal: React.FC<EditServiceModalProps> = ({
  service,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { updateService, deleteService } = useServices();

  const [title, setTitle] = useState(service.title);
  const [description, setDescription] = useState(service.description);
  const [category, setCategory] = useState<ServiceCategory>(service.category);
  const [rate, setRate] = useState<string>(service.rate.toString());
  const [rateUnit, setRateUnit] = useState<string>(service.rateUnit || '');
  const [pricingType, setPricingType] = useState<PricingType>(service.pricingType);
  const [arrangement, setArrangement] = useState<ServiceArrangement>(service.arrangement);
  const [availability, setAvailability] = useState(service.availability || '');
  const [experienceYears, setExperienceYears] = useState<string>(
    service.experienceYears ? service.experienceYears.toString() : ''
  );
  const [serviceArea, setServiceArea] = useState(service.serviceArea || '');
  const [isAvailable, setIsAvailable] = useState(service.isAvailable);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

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
    if (!serviceArea.trim()) {
      errs.serviceArea = 'Pakitukoy ang sakop na mga bayan o lugar.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const numExp = experienceYears ? parseInt(experienceYears, 10) : undefined;

    updateService(service.id, {
      title: title.trim(),
      description: description.trim(),
      category,
      rate: parseFloat(rate),
      rateUnit: rateUnit.trim() || undefined,
      pricingType,
      arrangement,
      availability: availability.trim(),
      experienceYears: isNaN(numExp as number) ? undefined : numExp,
      serviceArea: serviceArea.trim(),
      isAvailable,
    });

    onSuccess();
    onClose();
  };

  const handleDelete = () => {
    deleteService(service.id);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#3B1376] to-[#4F28D9] text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              I-edit ang Detalye ng Serbisyo
            </h2>
            <p className="text-xs text-purple-200">
              I-update ang rate, kategorya, availability o lugar ng serbisyo.
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

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Sigurado ka bang nais mong tanggalin ang serbisyong ito?
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Hindi na makikita ng ibang mga kapitbahay ang serbisyong ito kapag tinanggal. Maaari mo rin itong i-pause lamang pansamantala sa halip na burahin.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Huwag Burahin
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
              >
                Oo, Tanggalin ang Serbisyo
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-slate-800 text-sm">
            
            {/* Availability Toggle */}
            <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/60 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                  Status ng Availability
                </h4>
                <p className="text-xs text-purple-700 mt-0.5">
                  {isAvailable
                    ? 'Bukas at makikita ng mga customer sa marketplace.'
                    : 'Pansamantalang naka-pause (hindi makakatanggap ng bagong katanungan).'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isAvailable ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isAvailable ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

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
                  Uri ng Pagpepresyo *
                </label>
                <select
                  value={pricingType}
                  onChange={(e) => setPricingType(e.target.value as PricingType)}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4F28D9] focus:outline-hidden bg-white text-sm"
                >
                  <option value="hourly">Bawat Oras (Hourly)</option>
                  <option value="fixed">Nakatakdang Presyo (Fixed Price)</option>
                  <option value="project">Bawat Proyekto (Per Project)</option>
                  <option value="negotiable">Puwede Pag-usapan (Negotiable)</option>
                </select>
              </div>
            </div>

            {/* Rate & Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Halaga / Rate (₱) *
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
                    className={`w-full pl-8 pr-3 py-3 rounded-xl border text-sm ${
                      errors.rate ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300 focus:ring-2 focus:ring-[#4F28D9]'
                    } focus:outline-hidden`}
                  />
                </div>
                {errors.rate && <p className="text-xs text-rose-600 mt-1">{errors.rate}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Yunit ng Rate (oras, araw, session)
                </label>
                <input
                  type="text"
                  value={rateUnit}
                  onChange={(e) => setRateUnit(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4F28D9] focus:outline-hidden text-sm"
                />
              </div>
            </div>

            {/* Arrangement */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Saan Isasagawa ang Serbisyo? (Arrangement)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'customer-location', label: 'Home Service' },
                  { id: 'provider-location', label: 'Sa Aking Shop / Talyer' },
                  { id: 'online', label: 'Online / Virtual' },
                  { id: 'flexible', label: 'Flexible / Kahit Saan' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setArrangement(item.id as ServiceArrangement)}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
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
                Paglalarawan ng Serbisyo *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                  Iskedyul / Availability
                </label>
                <input
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Taon ng Karanasan
                </label>
                <input
                  type="number"
                  min="0"
                  max="70"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>

            {/* Service Area */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Lugar na Sinasakop (Coverage Area) *
              </label>
              <input
                type="text"
                required
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                className={`w-full p-3 rounded-xl border text-sm ${
                  errors.serviceArea ? 'border-rose-500' : 'border-slate-300'
                }`}
              />
              {errors.serviceArea && <p className="text-xs text-rose-600 mt-1">{errors.serviceArea}</p>}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Tanggalin ang Serbisyo
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 text-xs"
                >
                  Kanselahin
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#3B1376] hover:bg-[#4F28D9] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  I-save ang Pagbabago
                </button>
              </div>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
