import React, { useState } from 'react';
import { X, Image, Video, Radio, Sparkles, Upload, CheckCircle2 } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'photo' | 'video' | 'live'>('photo');
  const [selectedCategory, setSelectedCategory] = useState('products');
  const [caption, setCaption] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-purple-100 flex flex-col text-left max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 id="create-title" className="text-base sm:text-lg font-bold font-display text-slate-900">
              Ibahagi ang Iyong Produkto o Talento
            </h2>
            <p className="text-xs text-slate-500">KayaNatinTo Creator Studio (Preview)</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setActiveTab('photo')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'photo'
                  ? 'bg-white text-[#3B1376] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Image className="w-4 h-4 text-amber-500" />
              Larawan (Photo)
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'video'
                  ? 'bg-white text-[#3B1376] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Video className="w-4 h-4 text-purple-600" />
              Video Reel
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'live'
                  ? 'bg-white text-[#3B1376] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Radio className="w-4 h-4 text-rose-500" />
              Go Live
            </button>
          </div>

          {/* Upload Box Simulation */}
          <div className="border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/40 rounded-2xl p-6 text-center transition-all cursor-pointer">
            <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 flex items-center justify-center text-[#3B1376] mb-2">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800">
              I-click upang mag-upload ng sample
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              PNG, JPG, MP4 hanggang 50MB
            </p>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Kategorya
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            >
              <option value="products">Pagluluto at Pagkain (Food & Products)</option>
              <option value="crafts">Gawang-Kamay at Pottery (Handmade Crafts)</option>
              <option value="services">Pananahi at Serbisyo (Tailoring & Services)</option>
              <option value="talents">Musika at Sining (Music & Arts)</option>
            </select>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Kwento o Deskripsyon
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ibahagi ang kwento ng iyong produkto, presyo, o talent..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
            />
          </div>

          {/* Age Eligibility Note */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-snug">
            <strong>Paalala sa Pag-post:</strong> Ang pag-post ay bukas para sa mga rehistradong miyembro na may edad <strong>18 pataas</strong>. Ang platform ay idinisenyo upang suportahan ang mga independent adult at senior artisans.
          </div>

          {submitted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Salamat! Ang feature na ito ay isa sa mga ilulunsad sa darating na official release.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Kanselahin
          </button>
          <button
            onClick={() => {
              setSubmitted(true);
              setTimeout(() => {
                setSubmitted(false);
                onClose();
              }, 2200);
            }}
            className="px-6 py-2.5 rounded-xl bg-[#3B1376] hover:bg-[#2F106A] text-white text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95"
          >
            I-Post (Demo Preview)
          </button>
        </div>
      </div>
    </div>
  );
};
