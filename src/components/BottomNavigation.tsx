import React from 'react';
import { Home, Compass, Plus, Inbox, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab = 'home' | 'discover' | 'create' | 'inbox' | 'profile';

interface BottomNavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  inboxBadge?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  inboxBadge = 0,
}) => {
  const { currentUser } = useAuth();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white/98 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]"
      aria-label="Mobile Navigation"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
        {/* Tab 1: Home */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'home'
              ? 'text-[#7C3AED] font-bold'
              : 'text-slate-400 hover:text-slate-700 font-medium'
          }`}
          aria-label="Home tab"
        >
          <Home
            className={`w-6 h-6 transition-transform ${
              activeTab === 'home' ? 'text-[#7C3AED]' : 'text-slate-400'
            }`}
          />
          <span className="text-[11px] tracking-tight mt-1 leading-none">Home</span>
        </button>

        {/* Tab 2: Discover */}
        <button
          onClick={() => onTabChange('discover')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'discover'
              ? 'text-[#7C3AED] font-bold'
              : 'text-slate-400 hover:text-slate-700 font-medium'
          }`}
          aria-label="Discover tab"
        >
          <Compass
            className={`w-6 h-6 transition-transform ${
              activeTab === 'discover' ? 'text-[#7C3AED]' : 'text-slate-400'
            }`}
          />
          <span className="text-[11px] tracking-tight mt-1 leading-none">Discover</span>
        </button>

        {/* Tab 3: Create (+) Center Elevated Floating Button */}
        <div className="flex flex-col items-center justify-center -mt-5">
          <button
            onClick={() => onTabChange('create')}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#6D28D9] to-[#9333EA] text-white flex items-center justify-center shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all ring-4 ring-white cursor-pointer"
            aria-label="Create Post or Listing"
          >
            <Plus className="w-7 h-7 stroke-[2.8]" />
          </button>
          <span className="text-[11px] tracking-tight mt-1 leading-none text-[#7C3AED] font-bold">
            Create
          </span>
        </div>

        {/* Tab 4: Inbox (Tray Icon) */}
        <button
          onClick={() => onTabChange('inbox')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative ${
            activeTab === 'inbox'
              ? 'text-[#7C3AED] font-bold'
              : 'text-slate-400 hover:text-slate-700 font-medium'
          }`}
          aria-label="Inbox tab"
        >
          <div className="relative">
            <Inbox
              className={`w-6 h-6 transition-transform ${
                activeTab === 'inbox' ? 'text-[#7C3AED]' : 'text-slate-400'
              }`}
            />
            {inboxBadge > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 min-w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {inboxBadge}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight mt-1 leading-none">Inbox</span>
        </button>

        {/* Tab 5: Profile (User Avatar Photo) */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'profile'
              ? 'text-[#7C3AED] font-bold'
              : 'text-slate-400 hover:text-slate-700 font-medium'
          }`}
          aria-label="Profile tab"
        >
          {currentUser?.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt="Profile"
              className={`w-6 h-6 rounded-full object-cover ring-2 ${
                activeTab === 'profile' ? 'ring-[#7C3AED]' : 'ring-slate-300'
              }`}
            />
          ) : (
            <User
              className={`w-6 h-6 ${
                activeTab === 'profile' ? 'text-[#7C3AED]' : 'text-slate-400'
              }`}
            />
          )}
          <span className="text-[11px] tracking-tight mt-1 leading-none">Profile</span>
        </button>
      </div>
    </nav>
  );
};
