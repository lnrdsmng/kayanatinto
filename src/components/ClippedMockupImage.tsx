import React, { useState } from 'react';
import {
  Utensils,
  Scissors,
  Flame,
  Palette,
  Music,
  ShoppingBag,
  Sparkles,
  Cake,
  User,
} from 'lucide-react';

interface CropConfig {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ClippedMockupImageProps {
  crop: CropConfig;
  alt: string;
  className?: string;
  fallbackGradient?: string;
  fallbackIcon?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  Scissors,
  Flame,
  Palette,
  Music,
  ShoppingBag,
  Sparkles,
  Cake,
  User,
};

export const ClippedMockupImage: React.FC<ClippedMockupImageProps> = ({
  crop,
  alt,
  className = '',
  fallbackGradient = 'from-purple-900 to-indigo-900',
  fallbackIcon = 'ShoppingBag',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Auto detect natural dimensions based on file name
  const isImage1 = crop.src.includes('file_00000000f26082078ed9ec1d1d45c30d');
  const naturalWidth = isImage1 ? 1199 : 1213;
  const naturalHeight = isImage1 ? 1312 : 1297;

  const FallbackIconComponent = ICON_MAP[fallbackIcon] || ShoppingBag;

  if (hasError) {
    return (
      <div
        className={`w-full h-full bg-gradient-to-br ${fallbackGradient} flex flex-col items-center justify-center text-white p-3 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <FallbackIconComponent className="w-8 h-8 mb-1.5 opacity-90" />
        <span className="text-xs font-medium line-clamp-1 opacity-90">{alt}</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden w-full h-full bg-slate-100 ${className}`}>
      {/* Background skeleton while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
          <FallbackIconComponent className="w-6 h-6 text-slate-400" />
        </div>
      )}

      <svg
        viewBox={`${crop.x} ${crop.y} ${crop.w} ${crop.h}`}
        preserveAspectRatio="xMidYMid slice"
        className={`w-full h-full block transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label={alt}
        role="img"
      >
        <image
          href={crop.src}
          x="0"
          y="0"
          width={naturalWidth}
          height={naturalHeight}
          preserveAspectRatio="none"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      </svg>
    </div>
  );
};
