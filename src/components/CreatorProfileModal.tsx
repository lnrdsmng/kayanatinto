import React, { useState } from 'react';
import {
  X,
  MapPin,
  Star,
  Heart,
  Share2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  UserPlus,
  MessageCircle,
} from 'lucide-react';
import { CreatorPerson } from '../data/mockData';
import { ClippedMockupImage } from './ClippedMockupImage';
import { useConnections } from '../context/ConnectionContext';
import { useMessaging } from '../context/MessagingContext';

interface CreatorProfileModalProps {
  person: CreatorPerson | null;
  onClose: () => void;
  onSelectOffering?: (offeringTitle: string) => void;
  onOpenMessageCreator?: (creator: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    isSenior?: boolean;
    role?: string;
  }) => void;
}

export const CreatorProfileModal: React.FC<CreatorProfileModalProps> = ({
  person,
  onClose,
  onSelectOffering,
  onOpenMessageCreator,
}) => {
  const { isFollowing, followUser, unfollowUser } = useConnections();
  const { getOrCreateConversation } = useMessaging();
  const [cheered, setCheered] = useState(false);

  if (!person) return null;

  const following = isFollowing(person.id);

  const handleToggleFollow = () => {
    if (following) {
      unfollowUser(person.id);
    } else {
      followUser({
        id: person.id,
        name: person.name,
        username: person.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        isSenior: person.age >= 60,
      });
    }
  };

  const handleOpenMessage = () => {
    const creatorInfo = {
      id: person.id,
      name: person.name,
      username: person.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      isSenior: person.age >= 60,
      role: person.role,
    };

    if (onOpenMessageCreator) {
      onClose();
      onOpenMessageCreator(creatorInfo);
    } else {
      getOrCreateConversation(creatorInfo, `Kumusta po ${person.name}! Nais ko po sanang magtanong tungkol sa inyong gawa o talento.`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-purple-100 max-h-[92vh] flex flex-col text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="creator-name"
      >
        {/* Cover & Top Bar */}
        <div className="relative bg-gradient-to-r from-[#2F106A] via-[#3B1376] to-[#4F28D9] pt-6 pb-16 px-6 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-purple-950 uppercase tracking-wide">
              {person.badge}
            </span>
            <span className="text-xs text-purple-200">{person.categoryLabel}</span>
          </div>

          <h2 id="creator-name" className="text-2xl font-bold font-display mt-2">
            {person.name}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-purple-200 mt-1">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span>{person.location}</span>
          </div>
        </div>

        {/* Avatar Overlap */}
        <div className="relative px-6 -mt-12 flex items-end justify-between shrink-0">
          <div className="w-24 h-24 rounded-full ring-4 ring-white shadow-xl overflow-hidden bg-slate-200 shrink-0">
            <ClippedMockupImage
              crop={person.avatarCrop}
              alt={person.name}
              className="w-full h-full object-cover"
              fallbackGradient={person.fallbackGradient}
              fallbackIcon="User"
            />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={handleToggleFollow}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                following
                  ? 'bg-purple-100 text-[#3B1376]'
                  : 'bg-[#3B1376] hover:bg-[#2F106A] text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              {following ? 'Subaybay' : 'Follow'}
            </button>
            <button
              onClick={() => {
                setCheered(true);
                setTimeout(() => setCheered(false), 3000);
              }}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
              title="Send community cheers"
              aria-label="Send cheers"
            >
              <Heart className={`w-4 h-4 ${cheered ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Tagline / Bio Quote */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs sm:text-sm italic font-medium">
            {person.bio}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-2 py-3 px-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div>
              <p className="text-base sm:text-lg font-bold font-display text-slate-900">
                {person.stats.followers}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">Followers</p>
            </div>
            <div>
              <p className="text-base sm:text-lg font-bold font-display text-slate-900">
                {person.stats.offerings}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">Offerings</p>
            </div>
            <div>
              <p className="text-base sm:text-lg font-bold font-display text-amber-600 flex items-center justify-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-500" />
                {person.stats.rating}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">Feedback</p>
            </div>
            <div>
              <p className="text-base sm:text-lg font-bold font-display text-rose-600">
                {person.stats.likes}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">Cheers</p>
            </div>
          </div>

          {/* The Inspiring Story */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-4 h-4 text-purple-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Kwento ng Pagsisikap (Creator Story)
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-purple-50/40 p-4 rounded-2xl border border-purple-100/60">
              {person.story}
            </p>
          </div>

          {/* Sample Offerings / Specialties */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Mga Kilalang Produkto at Kakayahan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {person.sampleOfferings.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectOffering && onSelectOffering(item)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50/60 border border-slate-100 transition-colors cursor-pointer text-xs font-medium text-slate-800"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Age & Inclusion Notice */}
          <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              <strong>Pantay na Pagkakataon:</strong> On KayaNatinTo, age is honored and algorithms do not hide local creators. Open to adults aged 18+ to 100+.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={handleOpenMessage}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#3B1376] hover:bg-[#2F106A] text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Mensahe para kay {person.name.split(' ')[0]}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
