import React from 'react';
import { ShoppingBag, Sparkles, Briefcase, Video, Check } from 'lucide-react';
import { Category, CATEGORIES } from '../data/mockData';

interface CategoryShortcutsProps {
  activeCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  ShoppingBag,
  Sparkles,
  Briefcase,
  Video,
};

export const CategoryShortcuts: React.FC<CategoryShortcutsProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <section className="py-3 px-4 sm:px-6 max-w-7xl mx-auto" aria-label="Category shortcuts">
      <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
        {CATEGORIES.map((cat) => {
          const IconComponent = CATEGORY_ICONS[cat.icon] || ShoppingBag;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isActive ? null : cat.id)}
              className={`group flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl border transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-[#3B1376] text-white border-[#3B1376] shadow-md shadow-purple-900/15 ring-2 ring-purple-600/30'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80 shadow-2xs'
              }`}
              aria-pressed={isActive}
            >
              {/* Icon container */}
              <div
                className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105 ${
                  isActive
                    ? 'bg-white/20 text-yellow-300'
                    : cat.id === 'products'
                    ? 'bg-amber-100 text-amber-700'
                    : cat.id === 'talents'
                    ? 'bg-yellow-100 text-yellow-700'
                    : cat.id === 'services'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              {/* Category label */}
              <span
                className={`text-[11px] sm:text-xs font-bold font-display tracking-tight truncate max-w-full ${
                  isActive ? 'text-white' : 'text-slate-800'
                }`}
              >
                {cat.name}
              </span>

              {/* Active Indicator indicator dot */}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {activeCategory && (
        <div className="mt-2.5 flex items-center justify-between text-xs px-1 text-slate-600 animate-in fade-in duration-150">
          <span className="font-medium">
            Filtering by: <strong className="text-[#3B1376] capitalize">{activeCategory}</strong>
          </span>
          <button
            onClick={() => onSelectCategory(null)}
            className="text-xs font-semibold text-purple-700 hover:text-purple-900 underline"
          >
            Ipakita Lahat (Reset)
          </button>
        </div>
      )}
    </section>
  );
};
