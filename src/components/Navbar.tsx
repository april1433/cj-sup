import React from 'react';
import { ShieldCheck, MessageCircle, LogIn, LogOut, ArrowRightLeft, Sparkles, User, Settings } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
  onOpenTradeIn: () => void;
  onOpenChat: () => void;
  onOpenStaffDashboard: () => void;
  onOpenEnvGuide: () => void;
  onLogout: () => void;
  activeConversationCount: number;
  isConfigured: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onOpenTradeIn,
  onOpenChat,
  onOpenStaffDashboard,
  onOpenEnvGuide,
  onLogout,
  activeConversationCount,
  isConfigured,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full apple-glass border-b border-gray-200/80 transition-all duration-200">
      {/* Top micro-banner for configuration & deployment status */}
      <div className="bg-gradient-to-r from-gray-900 via-neutral-900 to-black text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-gray-200">
              Verified Stock Live • 30-Point Battery & Diagnostics Passed
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenEnvGuide}
              className="text-gray-300 hover:text-white underline underline-offset-2 flex items-center gap-1 text-[11px] transition"
            >
              <Settings className="w-3 h-3 text-blue-400" />
              <span>{isConfigured ? 'Supabase Connected' : 'Setup Supabase & Hosting'}</span>
            </button>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400 text-[11px]">Deployable to Netlify + Hostinger</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-1 .04-2.22.67-2.93 1.5-.63.72-1.18 1.83-1.03 2.89 1.12.09 2.28-.62 3.02-1.46z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-gray-900 block leading-tight">
                iVault
              </span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">
                Direct Apple Trade
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#phones-catalog" className="hover:text-black transition">Available iPhones</a>
            <button 
              onClick={onOpenTradeIn}
              className="hover:text-black flex items-center gap-1.5 transition text-blue-600 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Sell Your iPhone
            </button>
            <a href="#how-it-works" className="hover:text-black transition">How It Works</a>
            <a href="#guarantee" className="hover:text-black transition">Warranty</a>
          </nav>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-3">
          {/* Sell Button Mobile/Tablet */}
          <button
            onClick={onOpenTradeIn}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 transition shadow-sm active:scale-95"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
            <span>Sell or Trade-In</span>
          </button>

          {/* Chat with Staff Button */}
          <button
            onClick={user ? onOpenChat : onOpenAuth}
            className="relative flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Live Chat</span>
            <span className="sm:hidden">Chat</span>
            {activeConversationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                {activeConversationCount}
              </span>
            )}
          </button>

          {/* User Status / Staff Portal */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              {(user.role === 'staff' || user.role === 'admin' || user.email?.toLowerCase() === 'dcjayshop@gmail.com') && (
                <button
                  onClick={onOpenStaffDashboard}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500/10 text-amber-700 border border-amber-300 hover:bg-amber-500/20 transition flex items-center gap-1"
                  title="Owner Management Portal"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Owner Panel</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-8 h-8 rounded-full border border-gray-300 object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs">
                    {user.full_name[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                
                <div className="hidden lg:block text-left text-xs">
                  <div className="font-semibold text-gray-900 truncate max-w-[110px]">
                    {user.full_name}
                  </div>
                  <div className="text-[10px] text-gray-500 font-semibold">
                    {user.email?.toLowerCase() === 'dcjayshop@gmail.com' ? 'Store Owner' : 'Verified Client'}
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-gray-100 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full text-gray-700 hover:text-black hover:bg-gray-100 transition"
            >
              <LogIn className="w-4 h-4 text-gray-500" />
              <span>Login with Google / FB</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
