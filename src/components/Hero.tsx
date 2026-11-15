import React from 'react';
import { ShieldCheck, MessageSquare, ArrowRight, Zap, RefreshCw, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onOpenTradeIn: () => void;
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenTradeIn, onExploreClick }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#111113] via-[#1a1a1d] to-[#111113] text-white pt-16 pb-20 md:pt-24 md:pb-28">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-gray-200 mb-6 backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">Direct Peer-to-Store Apple Marketplace</span>
            <span className="text-gray-400">•</span>
            <span className="text-blue-400">Live Realtime Support</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Buy verified iPhones. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-200">
              Or sell yours in minutes.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-300 mb-9 leading-relaxed font-normal max-w-2xl mx-auto">
            Browse genuine in-stock iPhones with authentic battery health and condition reports freely. 
            Sign in with <strong className="text-white font-semibold">Google</strong> to chat directly with our store specialists to buy, reserve, or trade-in.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onExploreClick}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 group active:scale-95"
            >
              <span>Explore In-Stock Phones</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={onOpenTradeIn}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition backdrop-blur-sm flex items-center justify-center gap-2 active:scale-95"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <span>Instant Sell Valuation</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-10 border-t border-white/10 text-left">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">30-Point Checked</div>
                <div className="text-[11px] text-gray-400">Cameras, TrueTone, Face ID</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Real Battery Health</div>
                <div className="text-[11px] text-gray-400">No boosted BMS chips</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Direct Staff Chat</div>
                <div className="text-[11px] text-gray-400">No bots, real humans</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Fast Fair Trade-In</div>
                <div className="text-[11px] text-gray-400">Cash or phone swap</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
