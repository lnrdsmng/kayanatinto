import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  Search,
  Bell,
  Shield,
  ShoppingBag,
  Briefcase,
  Sparkles,
  Wallet,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Type,
  LogIn,
  UserPlus,
  Sun,
  Moon,
} from 'lucide-react';
import { KayaNatinLogo } from './KayaNatinLogo';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNotifications: () => void;
  onOpenAgePolicy: () => void;
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
  onNavigateProfile: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateServices?: () => void;
  onNavigateTalents?: () => void;
  onNavigateTransactions?: () => void;
  onOpenAdminPortal?: () => void;
  pendingTransactionsCount?: number;
  unreadCount?: number;
  isLargeTextMode: boolean;
  onToggleLargeTextMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenNotifications,
  onOpenAgePolicy,
  onNavigateLogin,
  onNavigateRegister,
  onNavigateProfile,
  onNavigateMarketplace,
  onNavigateServices,
  onNavigateTalents,
  onNavigateTransactions,
  onOpenAdminPortal,
  pendingTransactionsCount = 0,
  unreadCount = 0,
  isLargeTextMode,
  onToggleLargeTextMode,
}) => {
  const { currentUser, logout } = useAuth();
  const { pendingWithdrawalsCount, outstandingCodCommissionsCount } = useTransactions();
  const { actualTheme, toggleDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuDrawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Left: KayaNatinTo Brand Emblem & Name */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center focus:outline-none rounded-xl text-left cursor-pointer transition-transform active:scale-98"
            aria-label="KayaNatinTo Homepage"
          >
            <KayaNatinLogo size="md" showSubtitle={false} />
          </button>

          {/* Right: Hamburger Menu Icon */}
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white" />
              </button>
            )}

            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 rounded-xl text-[#6D28D9] hover:bg-purple-50 transition-colors cursor-pointer"
              aria-label="Buksan ang Menu"
            >
              <Menu className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </header>

      {/* Hamburger Side Navigation Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-2xs transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Pane */}
          <div
            ref={menuDrawerRef}
            className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50/80 to-white">
              <KayaNatinLogo size="sm" showSubtitle={false} />
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Snippet in Drawer */}
            <div className="p-4 mx-4 mt-4 rounded-2xl bg-gradient-to-br from-[#3B1376] to-[#6D28D9] text-white">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatarUrl || '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png'}
                    alt={currentUser.fullName}
                    className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-white truncate">{currentUser.fullName}</p>
                    <p className="text-xs text-purple-200 truncate">@{currentUser.username}</p>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onNavigateProfile();
                      }}
                      className="mt-1 text-[11px] font-semibold text-yellow-300 hover:underline flex items-center gap-1"
                    >
                      <span>Aking Profile at Wallet</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-1 space-y-2">
                  <p className="text-xs text-purple-200">Sumali sa komunidad ng KayaNatinTo</p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onNavigateLogin();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white text-purple-900 font-bold text-xs"
                    >
                      Mag-login
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onNavigateRegister();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 text-purple-950 font-bold text-xs"
                    >
                      Magrehistro
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="p-4 space-y-1 flex-1">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-purple-50 text-slate-800 text-left font-semibold text-sm transition-colors"
              >
                <span>Tahanan (Home)</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {onNavigateMarketplace && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onNavigateMarketplace();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-purple-50 text-slate-800 text-left font-semibold text-sm transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-purple-600" />
                    <span>Pamilihan ng Produkto</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}

              {onNavigateServices && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onNavigateServices();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-purple-50 text-slate-800 text-left font-semibold text-sm transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                    <span>Mga Serbisyo at Kasanayan</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}

              {onNavigateTalents && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onNavigateTalents();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-purple-50 text-slate-800 text-left font-semibold text-sm transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Tanghalan ng Talento at Video</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}

              {onNavigateTransactions && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onNavigateTransactions();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-purple-50 text-slate-800 text-left font-semibold text-sm transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-purple-600" />
                    <span>Mga Transaksyon (Orders & Bookings)</span>
                  </span>
                  {pendingTransactionsCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-purple-950 font-bold text-xs">
                      {pendingTransactionsCount}
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              )}

              {/* Stage 8 Admin Financial Dashboard Trigger */}
              {onOpenAdminPortal && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenAdminPortal();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-left font-bold text-xs transition-colors border border-amber-200 mt-2"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Admin Financial Portal (Stage 8)</span>
                  </span>
                  {(pendingWithdrawalsCount > 0 || outstandingCodCommissionsCount > 0) && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  )}
                </button>
              )}

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenAgePolicy();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-purple-50 text-slate-700 text-left text-xs font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span>18+ Age & Senior Charter</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenNotifications();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-purple-50 text-slate-700 text-left text-xs font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-purple-600" />
                    <span>Mga Notipikasyon</span>
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-purple-600 text-white font-bold text-[10px]">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Senior Accessible Text Size Toggle */}
                <button
                  onClick={onToggleLargeTextMode}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-purple-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-left text-xs font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-purple-600" />
                    <span>Mas Malaking Letra (Senior Friendly)</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isLargeTextMode ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>
                    {isLargeTextMode ? 'Bukas' : 'Sarado'}
                  </span>
                </button>

                {/* Dark Mode Toggle (Stage 8.5 Part F) */}
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-purple-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-left text-xs font-medium"
                >
                  <span className="flex items-center gap-2">
                    {actualTheme === 'dark' ? (
                      <Moon className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-500" />
                    )}
                    <span>Madilim na Tema (Dark Mode)</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${actualTheme === 'dark' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>
                    {actualTheme === 'dark' ? 'Dark' : 'Light'}
                  </span>
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              {currentUser ? (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Mag-logout</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onNavigateLogin();
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-purple-200 text-purple-700 font-bold text-xs hover:bg-purple-50"
                  >
                    Mag-login
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onNavigateRegister();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700"
                  >
                    Magrehistro
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
