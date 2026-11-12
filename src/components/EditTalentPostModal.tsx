import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, Check, Sparkles } from 'lucide-react';
import { TalentPost, TalentCategory, TALENT_CATEGORIES } from '../types/talent';
import { useTalents } from '../context/TalentContext';

interface EditTalentPostModalProps {
  post: TalentPost;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditTalentPostModal: React.FC<EditTalentPostModalProps> = ({
  post,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { updatePost, deletePost } = useTalents();

  const [caption, setCaption] = useState(post.caption);
  const [category, setCategory] = useState<TalentCategory>(post.category);
  const [rawHashtags, setRawHashtags] = useState(post.hashtags ? post.hashtags.join(' ') : '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!caption.trim() || caption.length < 5) {
      errs.caption = 'Maglagay ng caption o paglalarawan (kahit 5 letra).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const tags = rawHashtags
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    updatePost(post.id, {
      caption: caption.trim(),
      category,
      hashtags: tags,
    });

    onSuccess();
    onClose();
  };

  const handleDelete = () => {
    deletePost(post.id);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#3B1376] to-[#4F28D9] text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              I-edit ang Iyong Post ng Talento
            </h2>
            <p className="text-xs text-purple-200">
              Baguhin ang caption, kategorya, o hashtags.
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

        {/* Delete Confirmation View */}
        {showDeleteConfirm ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Sigurado ka bang nais mong tanggalin ang post na ito?
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Mawawala ang post na ito sa talent feed at profile. Hindi na ito maibabalik.
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
                Oo, Tanggalin ang Post
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-5 text-slate-800 text-sm">
            
            {/* Category */}
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

            {/* Caption */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Caption o Paglalarawan *
              </label>
              <textarea
                required
                rows={4}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className={`w-full p-3 rounded-xl border text-sm ${
                  errors.caption ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300 focus:ring-2 focus:ring-[#4F28D9]'
                } focus:outline-hidden resize-none`}
              />
              {errors.caption && <p className="text-xs text-rose-600 mt-1">{errors.caption}</p>}
            </div>

            {/* Hashtags */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Hashtags
              </label>
              <input
                type="text"
                value={rawHashtags}
                onChange={(e) => setRawHashtags(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Tanggalin ang Post
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
