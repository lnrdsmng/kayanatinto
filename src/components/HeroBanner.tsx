import React from 'react';
import { ArrowRight, Sparkles, Users, Heart } from 'lucide-react';

interface HeroBannerProps {
  onOpenJoin: () => void;
  onExplore?: () => void;
  onOpenAgePolicy?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOpenJoin,
  onExplore,
  onOpenAgePolicy,
}) => {
  return (
    <section className="pt-4 pb-2 px-4 sm:px-6 max-w-4xl mx-auto text-center" aria-label="Hero banner">
      {/* Top Sparkle Pill Badge */}
      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200/80 text-[#6D28D9] text-xs font-bold mb-4 shadow-2xs">
        <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
        <span>Everyone deserves a chance to be discovered</span>
      </div>

      {/* Hero Headline */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-slate-900 leading-[1.15] max-w-2xl mx-auto">
        Your Skills. <span className="text-[#6D28D9]">Your Products.</span>
        <br />
        <span className="text-[#F59E0B]">Your Opportunities.</span>
      </h1>

      {/* Subtitle */}
      <p className="mt-3.5 text-xs sm:text-sm md:text-base text-slate-600 max-w-xl mx-auto leading-relaxed font-normal">
        Everyone has something valuable to offer. Discover local products, explore amazing skills, and connect with people who can help you find what you need. No fame or popularity required.
      </p>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
        <button
          onClick={onExplore || onOpenJoin}
          className="w-full sm:w-auto flex-1 py-3.5 px-7 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm sm:text-base shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
        >
          <span>Explore Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenJoin}
          className="w-full sm:w-auto flex-1 py-3.5 px-7 rounded-2xl border-2 border-purple-200 bg-white hover:bg-purple-50 text-[#6D28D9] font-bold text-sm sm:text-base transition-all active:scale-98 cursor-pointer"
        >
          Join KayaNatinTo
        </button>
      </div>

      {/* Community Stats Row */}
      <div className="mt-6 flex items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-800 font-bold">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-left leading-tight">
            <span className="block text-sm sm:text-base font-extrabold text-slate-900">12K+</span>
            <span className="text-[11px] text-slate-500 font-medium">Community Members</span>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
            <Heart className="w-4 h-4 fill-amber-400" />
          </div>
          <div className="text-left leading-tight">
            <span className="block text-sm sm:text-base font-extrabold text-slate-900">No Limits</span>
            <span className="text-[11px] text-slate-500 font-medium">All Ages Welcome</span>
          </div>
        </div>
      </div>

      {/* Hero Visual Image with Overlapping Floating Badges */}
      <div className="mt-8 relative max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-xl border border-purple-100">
        <img
          src="/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png"
          alt="Local Filipino vendors, artisans, and community members"
          className="w-full h-64 sm:h-80 md:h-96 object-cover"
        />

        {/* Floating Badge 1: Top Left */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-xl border border-white/70 flex items-center gap-2.5 text-left">
          <img
            src="/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png"
            alt="Vendor thumbnail"
            className="w-10 h-10 rounded-xl object-cover"
          />
          <div>
            <p className="font-bold text-xs text-slate-900">Local Vendors</p>
            <p className="text-[11px] text-slate-500">Showcasing products</p>
          </div>
        </div>

        {/* Floating Badge 2: Bottom Right */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-xl border border-white/70 flex items-center gap-2.5 text-left">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-500 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 fill-amber-400" />
          </div>
          <div>
            <p className="font-bold text-xs text-slate-900">All Generations</p>
            <p className="text-[11px] text-slate-500">Everyone welcome</p>
          </div>
        </div>
      </div>
    </section>
  );
};
