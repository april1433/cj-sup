import React from 'react';
import { ShieldCheck, MessageCircle, ArrowRightLeft, Sparkles, Heart } from 'lucide-react';

interface FooterProps {
  onOpenTradeIn: () => void;
  onOpenChat: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTradeIn, onOpenChat }) => {
  return (
    <footer className="bg-black text-gray-400 text-xs border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-1 .04-2.22.67-2.93 1.5-.63.72-1.18 1.83-1.03 2.89 1.12.09 2.28-.62 3.02-1.46z" />
                </svg>
              </div>
              <span className="text-white font-extrabold text-base tracking-tight">iVault</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Certified Apple iPhone marketplace. Browse public listings freely, sign in with Google or Facebook to chat with verified staff to buy or trade in.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>30-Point Hardware Check Guaranteed</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Marketplace</h4>
            <ul className="space-y-2">
              <li><a href="#phones-catalog" className="hover:text-white transition">Available In-Stock Phones</a></li>
              <li>
                <button onClick={onOpenTradeIn} className="hover:text-white transition text-left flex items-center gap-1 text-emerald-400">
                  <Sparkles className="w-3 h-3" />
                  Instant Sell Valuation
                </button>
              </li>
              <li><a href="#how-it-works" className="hover:text-white transition">How Buying & Selling Works</a></li>
              <li><a href="#guarantee" className="hover:text-white transition">Battery & Diagnostics Policy</a></li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Chat */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Direct Support</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={onOpenChat} className="hover:text-white transition text-left flex items-center gap-1.5 text-blue-400 font-semibold">
                  <MessageCircle className="w-3.5 h-3.5" />
                  Open Live Chat Desk
                </button>
              </li>
              <li><span className="text-gray-400">Staff Response: Under 5 mins</span></li>
              <li><span className="text-gray-400">Google & Facebook OAuth Verified</span></li>
              <li><span className="text-gray-400">Pickup & Worldwide Tracked Shipping</span></li>
            </ul>
          </div>

          {/* Col 4: Hosting & Infrastructure */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Infrastructure</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
              Built with Next-gen React, Supabase PostgreSQL, and optimized for instant deployment on Netlify & Hostinger.
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300">Netlify Ready</span>
              <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300">Hostinger Ready</span>
              <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300">Supabase RLS</span>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimers */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <p>
            © {new Date().getFullYear()} iVault. All rights reserved. Apple, iPhone, Face ID, and True Tone are trademarks of Apple Inc.
          </p>
          <div className="flex items-center gap-4">
            <a href="#privacy" className="hover:text-gray-400">Privacy Policy</a>
            <a href="#terms" className="hover:text-gray-400">Terms of Service</a>
            <a href="#cookies" className="hover:text-gray-400">Cookie Notice</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
