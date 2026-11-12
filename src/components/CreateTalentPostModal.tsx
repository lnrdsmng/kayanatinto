import React, { useState } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Video,
  Sparkles,
  MapPin,
  Hash,
  ShoppingBag,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Play
} from 'lucide-react';
import { TalentPost, TalentCategory, MediaType, TALENT_CATEGORIES } from '../types/talent';
import { useTalents } from '../context/TalentContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useServices } from '../context/ServiceContext';

interface CreateTalentPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPost: TalentPost) => void;
  onRequireAuth: () => void;
}

const PRESET_TALENT_MEDIA = [
  {
    label: 'Acoustic Harana (Kuya Jayson Video)',
    type: 'video' as MediaType,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
    duration: '2:10',
    category: 'music' as TalentCategory,
    caption: 'Nagbahagi ng acoustic guitar version ng paboritong OPM!',
  },
  {
    label: 'Tradisyunal na Pagluluto (Nanay Lita Video)',
    type: 'video' as MediaType,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    duration: '1:45',
    category: 'cooking-baking' as TalentCategory,
    caption: 'Sikreto sa masarap at malinis na handaang Pinoy.',
  },
  {
    label: 'Pananahi at Burda (Lola Mercy Photo)',
    type: 'photo' as MediaType,
    url: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
    category: 'handicrafts-diy' as TalentCategory,
    caption: 'Tradisyunal na filipiniana at barong repair.',
  },
  {
    label: 'Oil Portrait Painting (Mang Noel Photo)',
    type: 'photo' as MediaType,
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    category: 'drawing-painting' as TalentCategory,
    caption: 'Original acrylic and oil portrait painting on canvas.',
  },
];

export const CreateTalentPostModal: React.FC<CreateTalentPostModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onRequireAuth,
}) => {
  const { createPost } = useTalents();
  const { currentUser } = useAuth();
  const { getSellerProducts } = useProducts();
  const { getProviderServices } = useServices();

  const [mediaType, setMediaType] = useState<MediaType>('photo');
  const [mediaUrl, setMediaUrl] = useState('');
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState('1:30');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<TalentCategory>('music');
  const [rawHashtags, setRawHashtags] = useState('#KayaNatinPH #Talento');
  const [city, setCity] = useState(currentUser?.location?.city || 'San Pablo City');
  const [province, setProvince] = useState(currentUser?.location?.province || 'Laguna');
  const [barangay, setBarangay] = useState(currentUser?.location?.barangay || '');
  const [linkedProductId, setLinkedProductId] = useState('');
  const [linkedServiceId, setLinkedServiceId] = useState('');

  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100">
          <div className="w-14 h-14 bg-purple-100 text-[#4F28D9] rounded-2xl flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Kailangan Mag-log In Para Mag-post ng Talento
          </h3>
          <p className="text-sm text-slate-600">
            Sa KayaNatinTo, ang bawat may talento—kabataan man o senior citizen—ay malugod na tinatanggap upang magbahagi ng kanilang sining at galing.
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

  // Get current user's products and services for optional cross-linking
  const userProducts = getSellerProducts(currentUser.username);
  const userServices = getProviderServices(currentUser.username);

  // File picker handler (supports real file selection with preview)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      setMediaType('video');
    } else {
      setMediaType('photo');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewDataUrl(result);
      setMediaUrl(result);
      if (file.type.startsWith('video/')) {
        setVideoThumbnailUrl('/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: typeof PRESET_TALENT_MEDIA[0]) => {
    setMediaType(preset.type);
    setMediaUrl(preset.url);
    setCategory(preset.category);
    if (preset.thumbnail) {
      setVideoThumbnailUrl(preset.thumbnail);
    }
    if (preset.duration) {
      setVideoDuration(preset.duration);
    }
    setPreviewDataUrl(preset.thumbnail || preset.url);
    if (!caption) {
      setCaption(preset.caption);
    }
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!caption.trim() || caption.length < 5) {
      errs.caption = 'Maglagay ng caption o paglalarawan ng iyong talento (kahit 5 letra).';
    }
    if (!mediaUrl && !previewDataUrl) {
      errs.media = 'Pumili ng litrato o video na ibabahagi.';
    }
    if (!city.trim()) {
      errs.city = 'Pakilagay ang iyong bayan o lungsod.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsUploading(true);

    try {
      // Parse hashtags
      const tags = rawHashtags
        .split(/[\s,]+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
        .map((t) => (t.startsWith('#') ? t : `#${t}`));

      const finalMedia = mediaUrl || previewDataUrl || '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png';

      const created = createPost({
        creatorId: currentUser.id,
        creatorName: currentUser.fullName,
        creatorUsername: currentUser.username,
        creatorAvatarUrl: currentUser.avatarUrl || '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
        creatorIsSenior: !!currentUser.isSenior,
        creatorAge: currentUser.age || 25,
        location: {
          city: city.trim(),
          province: province.trim(),
          barangay: barangay.trim() || undefined,
        },
        mediaType,
        mediaUrl: finalMedia,
        videoThumbnailUrl: mediaType === 'video' ? (videoThumbnailUrl || finalMedia) : undefined,
        videoDuration: mediaType === 'video' ? videoDuration : undefined,
        caption: caption.trim(),
        category,
        hashtags: tags,
        linkedProductId: linkedProductId || undefined,
        linkedServiceId: linkedServiceId || undefined,
      });

      setIsUploading(false);
      onSuccess(created);
      onClose();
    } catch {
      setIsUploading(false);
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
              Mag-post ng Iyong Talento o Likha
            </h2>
            <p className="text-xs text-purple-200">
              Walang algorithm filter. Pantay ang pagkakataong makita ng komunidad.
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
          
          {/* Media Type Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Uri ng Media
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMediaType('photo')}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  mediaType === 'photo'
                    ? 'border-[#4F28D9] bg-purple-50 text-[#3B1376] shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-purple-600" />
                <span>Litrato (Photo)</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaType('video')}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  mediaType === 'video'
                    ? 'border-[#4F28D9] bg-purple-50 text-[#3B1376] shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Video className="w-4 h-4 text-purple-600" />
                <span>Video Clip</span>
              </button>
            </div>
          </div>

          {/* Media Upload / Selection Area */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Pumili o Mag-upload ng Media *
            </label>

            {/* Upload box */}
            <div className="p-4 border-2 border-dashed border-slate-300 hover:border-purple-400 rounded-2xl text-center bg-slate-50 transition-colors relative">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-[#4F28D9] flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    I-click para mag-upload ng photo o video mula sa iyong device
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tumatanggap ng PNG, JPG, MP4 (hanggang 25MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Or choose from fast presets */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-2">
                O pumili mula sa mabilis na mga halimbawa (1-click preview):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_TALENT_MEDIA.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(item)}
                    className="p-2 rounded-xl border border-slate-200 hover:border-purple-300 text-left bg-white text-slate-700 transition-all hover:bg-purple-50/50"
                  >
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-100 mb-1.5 relative">
                      <img src={item.thumbnail || item.url} alt="" className="w-full h-full object-cover" />
                      {item.type === 'video' && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 text-white fill-current" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-800 line-clamp-1 leading-tight">
                      {item.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Media Preview if available */}
            {previewDataUrl && (
              <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-center gap-3">
                <div className="w-16 h-14 rounded-xl overflow-hidden bg-black shrink-0 relative">
                  <img src={previewDataUrl} alt="Preview" className="w-full h-full object-cover" />
                  {mediaType === 'video' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-current" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    Handa nang mai-post ({mediaType === 'video' ? 'Video' : 'Litrato'})
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Matagumpay na na-load ang media
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewDataUrl(null);
                    setMediaUrl('');
                  }}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Alisin
                </button>
              </div>
            )}
            {errors.media && <p className="text-xs text-rose-600 mt-1">{errors.media}</p>}
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Kategorya ng Talento *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TalentCategory)}
              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4F28D9] focus:outline-hidden bg-white text-sm"
            >
              {TALENT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.tagalogName} ({cat.name})
                </option>
              ))}
            </select>
          </div>

          {/* Caption / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Caption o Kuwento sa Likod ng Iyong Gawa *
            </label>
            <textarea
              required
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ibahagi kung bakit mo mahal ang talentong ito, paano mo ito natutunan, o ano ang mensahe mo sa komunidad..."
              className={`w-full p-3 rounded-xl border text-sm ${
                errors.caption ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300 focus:ring-2 focus:ring-[#4F28D9]'
              } focus:outline-hidden resize-none`}
            />
            {errors.caption && <p className="text-xs text-rose-600 mt-1">{errors.caption}</p>}
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Hashtags (Pang-tag sa Talento)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold">#</span>
              <input
                type="text"
                value={rawHashtags}
                onChange={(e) => setRawHashtags(e.target.value)}
                placeholder="KayaNatinPH Musika GawangLaguna"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4F28D9] focus:outline-hidden text-xs sm:text-sm"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Halimbawa: #KayaNatinPH #LutongBahay #Musika #Sining
            </p>
          </div>

          {/* Location */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              Lokasyon ng Gumawa
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
                  placeholder="Hal: San Pablo City"
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
                  placeholder="Hal: Brgy. San Jose"
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Optional Cross-Links: Link existing product or service */}
          {(userProducts.length > 0 || userServices.length > 0) && (
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200/80 space-y-3">
              <h4 className="text-xs font-bold text-[#3B1376] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                I-link ang Iyong Paninda o Serbisyo sa Post na Ito (Opsiyonal)
              </h4>
              <p className="text-xs text-purple-700">
                Maaari mong ikabit ang iyong produkto o serbisyo upang madaling makabili o mag-inquire ang mga makakapanood sa iyong talento.
              </p>

              {userProducts.length > 0 && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    I-link sa Produkto:
                  </label>
                  <select
                    value={linkedProductId}
                    onChange={(e) => setLinkedProductId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-purple-200 bg-white text-xs"
                  >
                    <option value="">-- Huwag munang mag-link ng produkto --</option>
                    {userProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} (₱{p.price})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {userServices.length > 0 && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    I-link sa Serbisyo:
                  </label>
                  <select
                    value={linkedServiceId}
                    onChange={(e) => setLinkedServiceId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-purple-200 bg-white text-xs"
                  >
                    <option value="">-- Huwag munang mag-link ng serbisyo --</option>
                    {userServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} (₱{s.rate})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Technical Transparency Note on Media Storage */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left">
            <p className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 text-[#4F28D9] shrink-0 mt-0.5" />
              <span>
                <strong>Paunawa sa Storage:</strong> Ang iyong mga ibinabahaging likha ay ligtas na naka-store sa client-side local storage ng iyong browser. Sa oras na ma-link ang produksyong Google Cloud Storage / Firebase bucket, awtomatikong magiging permanente at mabilis ang pag-load nito sa buong kapuluan.
              </span>
            </p>
          </div>

          {/* Action Buttons */}
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
              disabled={isUploading}
              className="px-6 py-2.5 rounded-xl bg-[#3B1376] hover:bg-[#4F28D9] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-98 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {isUploading ? 'Ipinapaskil...' : 'I-post ang Talento'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
