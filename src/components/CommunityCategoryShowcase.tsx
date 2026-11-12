import React from 'react';
import { ShoppingBag, Palette, Wrench, Video, ArrowRight } from 'lucide-react';

interface CommunityCategoryShowcaseProps {
  onNavigateProducts: () => void;
  onNavigateTalents: () => void;
  onNavigateServices: () => void;
}

export const CommunityCategoryShowcase: React.FC<CommunityCategoryShowcaseProps> = ({
  onNavigateProducts,
  onNavigateTalents,
  onNavigateServices,
}) => {
  const categories = [
    {
      id: 'products',
      title: 'Products',
      description: 'Discover products from local sellers and small businesses.',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
      icon: ShoppingBag,
      onClick: onNavigateProducts,
    },
    {
      id: 'talents',
      title: 'Talents',
      description: 'Explore the talents, creativity, and abilities of different individuals.',
      image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80',
      icon: Palette,
      onClick: onNavigateTalents,
    },
    {
      id: 'services',
      title: 'Services',
      description: 'Find skilled professionals and people offering useful services.',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      icon: Wrench,
      onClick: onNavigateServices,
    },
    {
      id: 'videos',
      title: 'Videos',
      description: 'Watch content, demonstrations, tutorials, and product showcases from the community.',
      image: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80',
      icon: Video,
      onClick: onNavigateTalents,
    },
  ];

  return (
    <section className="py-8 px-4 sm:px-6 max-w-4xl mx-auto text-left" aria-labelledby="categories-heading">
      {/* Header Badge & Title */}
      <div className="text-center mb-8">
        <span className="inline-block px-4 py-1.5 rounded-full bg-purple-50 text-[#6D28D9] font-bold text-xs mb-3 shadow-2xs border border-purple-100">
          Discover Categories
        </span>
        <h2 id="categories-heading" className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
          Explore what the community offers
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Browse through products, talents, services, and videos from people just like you.
        </p>
      </div>

      {/* 4 Rich Visual Category Cards */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const IconComp = cat.icon;
          return (
            <div
              key={cat.id}
              onClick={cat.onClick}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 hover:border-purple-300 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              {/* Large Image Header with Top-Left Icon Box */}
              <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-slate-900">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                {/* Floating Purple Icon Box */}
                <div className="absolute top-4 left-4 w-11 h-11 rounded-2xl bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center text-[#6D28D9]">
                  <IconComp className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>

              {/* Text Body */}
              <div className="p-5 sm:p-6 space-y-2">
                <h3 className="text-xl font-bold font-display text-slate-900 group-hover:text-[#6D28D9] transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {cat.description}
                </p>

                <div className="pt-2 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#6D28D9] group-hover:translate-x-1 transition-transform">
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
