import React from 'react';
import { UserPlus, Store, Compass, MessageSquare, ArrowRight } from 'lucide-react';

interface MissionAndAgeBannerProps {
  onOpenJoin: () => void;
  onOpenAgePolicy?: () => void;
}

export const MissionAndAgeBanner: React.FC<MissionAndAgeBannerProps> = ({
  onOpenJoin,
}) => {
  const steps = [
    {
      step: 1,
      title: 'Join KayaNatinTo',
      description: 'Create your free account in minutes. No experience needed.',
      icon: UserPlus,
    },
    {
      step: 2,
      title: 'Showcase what you offer',
      description: 'Add your products, skills, services, or talents to your profile.',
      icon: Store,
    },
    {
      step: 3,
      title: 'Get discovered',
      description: 'People nearby can find you through search and categories.',
      icon: Compass,
    },
    {
      step: 4,
      title: 'Connect with customers',
      description: 'Reach out, respond to inquiries, and build your community.',
      icon: MessageSquare,
    },
  ];

  return (
    <section className="py-8 px-4 sm:px-6 max-w-4xl mx-auto space-y-10 text-center" aria-label="How it works">
      {/* 1. Value Proposition Solid Purple Banner */}
      <div className="bg-[#6D28D9] text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-purple-900/20 max-w-2xl mx-auto">
        <h3 className="text-xl sm:text-2xl font-black font-display leading-snug">
          No follower counts. No popularity contests. Just real people.
        </h3>
      </div>

      {/* 2. How It Works Section */}
      <div className="space-y-3">
        <span className="inline-block px-4 py-1.5 rounded-full bg-purple-50 text-[#6D28D9] font-bold text-xs shadow-2xs border border-purple-100">
          How It Works
        </span>

        <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
          Get started in 4 simple steps
        </h2>

        {/* 4 Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 max-w-2xl mx-auto">
          {steps.map((st) => {
            const IconComp = st.icon;
            return (
              <div key={st.step} className="flex flex-col items-center text-center space-y-3">
                {/* Icon Box with Yellow Number Badge */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl bg-purple-50 border-2 border-purple-100 flex items-center justify-center text-[#6D28D9] shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-[#6D28D9] text-white flex items-center justify-center shadow-md">
                      <IconComp className="w-7 h-7 stroke-[2.2]" />
                    </div>
                  </div>
                  {/* Yellow Circle Number Badge */}
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#EAB308] text-slate-900 font-extrabold text-xs flex items-center justify-center shadow-sm">
                    {st.step}
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {st.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-xs leading-relaxed font-normal">
                  {st.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Call to Action Button */}
      <div className="pt-4 max-w-md mx-auto">
        <button
          onClick={onOpenJoin}
          className="w-full py-4 px-8 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-base shadow-lg shadow-purple-600/25 transition-all active:scale-98 cursor-pointer"
        >
          Join KayaNatinTo Today
        </button>
      </div>
    </section>
  );
};
