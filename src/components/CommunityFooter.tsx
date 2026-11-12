import React from 'react';
import { KayaNatinLogo } from './KayaNatinLogo';

interface CommunityFooterProps {
  onNavigateHome: () => void;
  onNavigateProducts: () => void;
  onNavigateServices: () => void;
  onNavigateTalents: () => void;
  onOpenAgePolicy: () => void;
  onNavigateTransactions: () => void;
  onOpenAdminPortal?: () => void;
}

export const CommunityFooter: React.FC<CommunityFooterProps> = ({
  onNavigateHome,
  onNavigateProducts,
  onNavigateServices,
  onNavigateTalents,
  onOpenAgePolicy,
  onNavigateTransactions,
  onOpenAdminPortal,
}) => {
  return (
    <footer className="bg-[#4C1D95] text-white pt-12 pb-24 px-6 text-left">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Brand Lockup */}
        <div className="space-y-4">
          <button onClick={onNavigateHome} className="text-left cursor-pointer">
            <KayaNatinLogo size="md" variant="light" showSubtitle={false} />
          </button>
          <p className="text-xs sm:text-sm text-purple-200 leading-relaxed max-w-lg">
            KayaNatinTo is a community-based platform where everyone can showcase their products, skills, services, and talents. No fame or popularity required — everyone deserves a chance to be discovered.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-3 pt-1">
            {/* Facebook */}
            <a
              href="#facebook"
              aria-label="Facebook"
              className="w-10 h-10 rounded-2xl bg-purple-800/80 hover:bg-purple-700/80 text-white flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2v3.98h2v8.01z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="#instagram"
              aria-label="Instagram"
              className="w-10 h-10 rounded-2xl bg-purple-800/80 hover:bg-purple-700/80 text-white flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>

            {/* Twitter / X */}
            <a
              href="#twitter"
              aria-label="Twitter"
              className="w-10 h-10 rounded-2xl bg-purple-800/80 hover:bg-purple-700/80 text-white flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="#youtube"
              aria-label="YouTube"
              className="w-10 h-10 rounded-2xl bg-purple-800/80 hover:bg-purple-700/80 text-white flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M21.582 6.186a2.506 2.506 0 0 0-1.768-1.777C18.254 4 12 4 12 4s-6.254 0-7.814.409a2.505 2.505 0 0 0-1.768 1.777C2 7.756 2 12 2 12s0 4.244.418 5.814a2.505 2.505 0 0 0 1.768 1.777C5.746 20 12 20 12 20s6.254 0 7.814-.409a2.506 2.506 0 0 0 1.768-1.777C22 16.244 22 12 22 12s0-4.244-.418-5.814zM10 15.5v-7l6 3.5-6 3.5z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Link Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-4 border-t border-purple-800/60 text-xs">
          {/* PLATFORM */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-[#FACC15] tracking-wider uppercase text-xs">
              Platform
            </h4>
            <ul className="space-y-2 text-purple-200">
              <li>
                <button onClick={onOpenAgePolicy} className="hover:text-white transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={onOpenAgePolicy} className="hover:text-white transition-colors">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={onOpenAgePolicy} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={onOpenAgePolicy} className="hover:text-white transition-colors">
                  Terms and Conditions
                </button>
              </li>
            </ul>
          </div>

          {/* DISCOVER */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-[#FACC15] tracking-wider uppercase text-xs">
              Discover
            </h4>
            <ul className="space-y-2 text-purple-200">
              <li>
                <button onClick={onNavigateProducts} className="hover:text-white transition-colors">
                  Products
                </button>
              </li>
              <li>
                <button onClick={onNavigateTalents} className="hover:text-white transition-colors">
                  Talents
                </button>
              </li>
              <li>
                <button onClick={onNavigateServices} className="hover:text-white transition-colors">
                  Services
                </button>
              </li>
              <li>
                <button onClick={onNavigateTalents} className="hover:text-white transition-colors">
                  Videos
                </button>
              </li>
            </ul>
          </div>

          {/* COMMUNITY */}
          <div className="space-y-3 col-span-2 sm:col-span-1">
            <h4 className="font-extrabold text-[#FACC15] tracking-wider uppercase text-xs">
              Community
            </h4>
            <ul className="space-y-2 text-purple-200">
              <li>
                <button onClick={onOpenAgePolicy} className="hover:text-white transition-colors">
                  18+ Senior Charter
                </button>
              </li>
              <li>
                <button onClick={onNavigateTransactions} className="hover:text-white transition-colors">
                  Transaksyon at Wallet
                </button>
              </li>
              {onOpenAdminPortal && (
                <li>
                  <button onClick={onOpenAdminPortal} className="text-yellow-300 font-bold hover:underline">
                    Admin Settlement Portal (Stage 8)
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-purple-800/60 text-[11px] text-purple-300 flex flex-col sm:flex-row justify-between gap-2">
          <span>© 2026 KayaNatinTo. Bawat Isa May Pagkakataon.</span>
          <span>Pilipinas · Stage 8 Finance & Settlement Active</span>
        </div>
      </div>
    </footer>
  );
};
