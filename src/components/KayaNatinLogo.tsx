import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface KayaNatinLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  variant?: 'light' | 'dark' | 'color';
  className?: string;
}

export const KayaNatinLogo: React.FC<KayaNatinLogoProps> = ({
  size = 'md',
  showSubtitle = false,
  variant = 'color',
  className = '',
}) => {
  const iconSizeClass = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const iconSvgClass = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-7 h-7' : 'w-6 h-6';
  const textSizeClass = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const dotSizeClass = size === 'sm' ? 'w-2.5 h-2.5 -top-0.5 -right-0.5' : 'w-3 h-3 -top-1 -right-1';

  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Community Shield Emblem with Yellow Dot Indicator */}
      <div
        className={`relative shrink-0 flex items-center justify-center rounded-2xl ${
          isLight
            ? 'bg-white/20 border border-white/30 text-white'
            : 'bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] text-white shadow-md shadow-purple-500/25'
        } ${iconSizeClass}`}
      >
        <ShieldCheck className={`${iconSvgClass} stroke-[2.5]`} />
        {/* Yellow Dot Badge at Top Right */}
        <span
          className={`absolute rounded-full bg-[#FACC15] ring-2 ring-white shadow-xs ${dotSizeClass}`}
        />
      </div>

      {/* Brand Name Lockup: Kaya (purple) + Natin (yellow) + To (purple) */}
      <div className="flex flex-col">
        <span className={`font-black tracking-tight leading-none ${textSizeClass}`}>
          <span className={isLight ? 'text-white' : 'text-[#6D28D9]'}>Kaya</span>
          <span className="text-[#F59E0B]">Natin</span>
          <span className={isLight ? 'text-white' : 'text-[#6D28D9]'}>To</span>
        </span>
        {showSubtitle && (
          <span
            className={`text-[11px] font-medium leading-none tracking-tight mt-0.5 ${
              isLight ? 'text-purple-200' : 'text-slate-500'
            }`}
          >
            Ipakita ang Talento · Bawat Isa May Pagkakataon
          </span>
        )}
      </div>
    </div>
  );
};
