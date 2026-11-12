import React from 'react';
import { MapPin } from 'lucide-react';
import { CreatorPerson, PEOPLE_OF_KAYANATINTO } from '../data/mockData';

interface PeopleOfKayaNatinToProps {
  creators: CreatorPerson[];
  onSelectCreator: (creator: CreatorPerson) => void;
  onOpenAgePolicy?: () => void;
}

export const PeopleOfKayaNatinTo: React.FC<PeopleOfKayaNatinToProps> = ({
  creators = PEOPLE_OF_KAYANATINTO,
  onSelectCreator,
}) => {
  return (
    <section className="py-8 px-4 sm:px-6 max-w-4xl mx-auto text-left" aria-labelledby="people-heading">
      {/* Header Pill & Heading */}
      <div className="mb-6 space-y-2">
        <span className="inline-block px-4 py-1.5 rounded-full bg-purple-50 text-[#6D28D9] font-bold text-xs shadow-2xs border border-purple-100">
          People of KayaNatinTo
        </span>

        <h2 id="people-heading" className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
          Everyone has a story worth sharing
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed">
          From senior citizens to young entrepreneurs, from skilled workers to talented artists — everyone deserves an opportunity to be discovered.
        </p>
      </div>

      {/* Stack of Creator Story Cards */}
      <div className="space-y-4">
        {creators.map((person) => {
          return (
            <div
              key={person.id}
              onClick={() => onSelectCreator(person)}
              className="group bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 hover:border-purple-300 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-start gap-4"
            >
              {/* Left: Square Thumbnail */}
              <img
                src={person.avatar || person.avatarCrop?.src || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80'}
                alt={person.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shrink-0 border border-slate-200"
              />

              {/* Right: Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-[#6D28D9] transition-colors leading-snug truncate">
                  {person.name}
                </h3>
                <p className="font-semibold text-xs sm:text-sm text-amber-500 truncate">
                  {person.role}
                </p>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {person.bio}
                </p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{person.location}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
