import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRightLeft, 
  MessageCircle, 
  Phone, 
  Battery, 
  Box, 
  Award,
  Zap,
  Info
} from 'lucide-react';

import { IPhone, UserProfile, Conversation, TradeInInquiry } from './types';
import { getCurrentUser, signOut, fetchIPhones, getOrCreateConversation, isConfigured } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { IPhoneCard } from './components/IPhoneCard';
import { IPhoneDetailsModal } from './components/IPhoneDetailsModal';
import { AuthModal } from './components/AuthModal';
import { TradeInCalculatorModal } from './components/TradeInCalculatorModal';
import { ChatDrawer } from './components/ChatDrawer';
import { StaffDashboardModal } from './components/StaffDashboardModal';
import { EnvGuideModal } from './components/EnvGuideModal';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  // Authentication state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [phoneContextForAuth, setPhoneContextForAuth] = useState<IPhone | null>(null);
  const [tradeInContextForAuth, setTradeInContextForAuth] = useState(false);

  // Inventory state
  const [iphones, setIPhones] = useState<IPhone[]>([]);
  const [loadingPhones, setLoadingPhones] = useState(true);
  const [selectedPhoneForModal, setSelectedPhoneForModal] = useState<IPhone | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Modals & Chat Drawer
  const [tradeInModalOpen, setTradeInModalOpen] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [staffDashboardOpen, setStaffDashboardOpen] = useState(false);
  const [envGuideOpen, setEnvGuideOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  // Load initial User and Inventory
  useEffect(() => {
    const initialize = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (e) {
        console.error('Failed to get current user:', e);
      }

      try {
        setLoadingPhones(true);
        const phones = await fetchIPhones();
        setIPhones(phones);
      } catch (e) {
        console.error('Failed to load iPhones:', e);
      } finally {
        setLoadingPhones(false);
      }
    };

    initialize();
  }, []);

  const refreshInventory = async () => {
    try {
      const phones = await fetchIPhones();
      setIPhones(phones);
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered iPhones computed list
  const filteredIPhones = useMemo(() => {
    return iphones.filter((phone) => {
      // Search text query
      const matchesSearch = 
        phone.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phone.storage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phone.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phone.condition.toLowerCase().includes(searchQuery.toLowerCase());

      // Series filter
      const matchesSeries = 
        selectedSeries === 'all' || 
        phone.model.toLowerCase().includes(selectedSeries.toLowerCase());

      // Condition filter
      const matchesCondition = 
        selectedCondition === 'all' || 
        phone.condition.toLowerCase().includes(selectedCondition.toLowerCase());

      // Availability filter
      const matchesAvailability = !onlyAvailable || phone.status === 'available';

      return matchesSearch && matchesSeries && matchesCondition && matchesAvailability;
    });
  }, [iphones, searchQuery, selectedSeries, selectedCondition, onlyAvailable]);

  // Handle Inquire to Buy on an iPhone
  const handleInquirePhone = async (phone: IPhone) => {
    if (!user) {
      setPhoneContextForAuth(phone);
      setTradeInContextForAuth(false);
      setAuthModalOpen(true);
      return;
    }

    try {
      const conv = await getOrCreateConversation(user, phone);
      setActiveConversation(conv);
      setChatDrawerOpen(true);
    } catch (e) {
      console.error('Could not create conversation:', e);
    }
  };

  // Handle Trade-in submission completion
  const handleTradeInSubmitted = (inquiry: TradeInInquiry, convId: string) => {
    if (user) {
      getOrCreateConversation(user, undefined, `Trade-in: ${inquiry.model}`).then((conv) => {
        setActiveConversation(conv);
        setChatDrawerOpen(true);
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setActiveConversation(null);
    setChatDrawerOpen(false);
  };

  const scrollToCatalog = () => {
    document.getElementById('phones-catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col font-sans">
      {/* Global Navigation */}
      <Navbar
        user={user}
        onOpenAuth={() => {
          setPhoneContextForAuth(null);
          setTradeInContextForAuth(false);
          setAuthModalOpen(true);
        }}
        onOpenTradeIn={() => setTradeInModalOpen(true)}
        onOpenChat={() => {
          if (!user) {
            setAuthModalOpen(true);
          } else {
            setChatDrawerOpen(true);
          }
        }}
        onOpenStaffDashboard={() => setStaffDashboardOpen(true)}
        onOpenEnvGuide={() => setEnvGuideOpen(true)}
        onLogout={handleLogout}
        activeConversationCount={activeConversation ? 1 : 0}
        isConfigured={isConfigured}
      />

      <main className="flex-1">
        {/* Apple-styled Hero */}
        <Hero
          onOpenTradeIn={() => setTradeInModalOpen(true)}
          onExploreClick={scrollToCatalog}
        />

        {/* Live Marketplace Catalog Section */}
        <section id="phones-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Live In-Stock Inventory
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Available iPhones for Sale
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                All devices are certified pre-owned or brand new, fully inspected with guaranteed battery health.
              </p>
            </div>

            {/* Quick stats counter */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-700 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                {filteredIPhones.length} Phones Ready for Pickup / Delivery
              </span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs mb-8 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search input */}
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search model, color, or storage (e.g. 16 Pro, 256GB, Desert)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Series filter */}
              <div>
                <select
                  value={selectedSeries}
                  onChange={(e) => setSelectedSeries(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 bg-gray-50/60 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All iPhone Generations</option>
                  <option value="18">iPhone 18 Series (Latest)</option>
                  <option value="17">iPhone 17 Series</option>
                  <option value="16">iPhone 16 Series</option>
                  <option value="15">iPhone 15 Series</option>
                  <option value="14">iPhone 14 Series</option>
                  <option value="13">iPhone 13 Series</option>
                </select>
              </div>

              {/* Condition filter */}
              <div>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 bg-gray-50/60 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Any Condition</option>
                  <option value="Brand New">Brand New (Sealed)</option>
                  <option value="Like New">Like New (Grade A+)</option>
                  <option value="Good Condition">Good Condition (Grade A)</option>
                </select>
              </div>
            </div>

            {/* Quick tags row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-gray-400 mr-1">Quick Filter:</span>
                <button
                  onClick={() => { setSelectedSeries('all'); setSelectedCondition('all'); }}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                    selectedSeries === 'all' && selectedCondition === 'all'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Phones
                </button>
                <button
                  onClick={() => setSelectedSeries('18')}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                    selectedSeries === '18'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  iPhone 18 Pro
                </button>
                <button
                  onClick={() => setSelectedSeries('17')}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                    selectedSeries === '17'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  iPhone 17 / Air
                </button>
                <button
                  onClick={() => setSelectedSeries('16')}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                    selectedSeries === '16'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  iPhone 16 Series
                </button>
                <button
                  onClick={() => setSelectedCondition('Brand New')}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                    selectedCondition === 'Brand New'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Sealed New Only
                </button>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-black font-medium select-none">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
                />
                <span>Hide Reserved / Sold</span>
              </label>
            </div>
          </div>

          {/* iPhone Grid */}
          {loadingPhones ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 rounded-2xl bg-white border border-gray-200 animate-pulse p-4" />
              ))}
            </div>
          ) : filteredIPhones.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">No matching iPhones found</h3>
              <p className="text-xs text-gray-500 mb-4">
                We get new trade-ins daily! Message our staff to place a custom request for the exact model you want.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSeries('all');
                  setSelectedCondition('all');
                  setOnlyAvailable(false);
                }}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIPhones.map((phone) => (
                <IPhoneCard
                  key={phone.id}
                  phone={phone}
                  onSelectDetails={(p) => setSelectedPhoneForModal(p)}
                  onInquire={(p) => handleInquirePhone(p)}
                />
              ))}
            </div>
          )}
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="bg-white py-16 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
                Simple & Transparent
              </h2>
              <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                How Buying & Selling Works
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                No third-party marketplace fees. Speak directly with the store owners.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="relative p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-black text-white font-black text-sm flex items-center justify-center mb-4">
                  1
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1.5">
                  Browse Publicly
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Anyone can view actual photos, certified battery health %, storage, and exact pricing without making an account.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative p-6 rounded-2xl bg-blue-50/60 border border-blue-100">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center mb-4">
                  2
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1.5">
                  1-Click Social Login
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Before chatting, sign in securely with <strong>Google</strong> or <strong>Facebook</strong> to verify your identity and save your message thread.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-black text-white font-black text-sm flex items-center justify-center mb-4">
                  3
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1.5">
                  Direct Live Chat
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Chat 1-on-1 with our staff. Ask for video tests, reserve a phone, or negotiate a trade-in offer in real-time.
                </p>
              </div>

              {/* Step 4 */}
              <div className="relative p-6 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center mb-4">
                  4
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1.5">
                  Pickup or Delivery
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Meet in-store for hands-on inspection or receive secure door-to-door tracked delivery with a full 30-day warranty.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Guarantee Banner */}
        <section id="guarantee" className="bg-[#111113] text-white py-14 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
                  <Award className="w-3.5 h-3.5" />
                  <span>The iVault Quality Standard</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                  Never buy a blacklisted or disguised iPhone.
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  Every device we stock undergoes a proprietary 30-point diagnostic: genuine Apple display check, True Tone validation, Face ID infrared sweep, clean GSMA IMEI report, and battery load testing.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setTradeInModalOpen(true)}
                  className="px-6 py-3 rounded-full bg-white text-black hover:bg-gray-100 font-bold text-xs transition active:scale-95 shadow-md flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sell or Trade-In</span>
                </button>

                <button
                  onClick={() => {
                    if (!user) setAuthModalOpen(true);
                    else setChatDrawerOpen(true);
                  }}
                  className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition active:scale-95 shadow-md flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat with Specialist</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer
        onOpenTradeIn={() => setTradeInModalOpen(true)}
        onOpenChat={() => {
          if (!user) setAuthModalOpen(true);
          else setChatDrawerOpen(true);
        }}
      />

      {/* MODALS */}
      {/* 1. iPhone Quick View Modal */}
      <IPhoneDetailsModal
        phone={selectedPhoneForModal}
        onClose={() => setSelectedPhoneForModal(null)}
        onInquire={(p) => handleInquirePhone(p)}
      />

      {/* 2. Authentication Modal (Google / Facebook Login) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPhoneContextForAuth(null);
          setTradeInContextForAuth(false);
        }}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          if (phoneContextForAuth) {
            handleInquirePhone(phoneContextForAuth);
          } else if (tradeInContextForAuth) {
            setTradeInModalOpen(true);
          } else {
            setChatDrawerOpen(true);
          }
        }}
        phoneContext={phoneContextForAuth}
        tradeInContext={tradeInContextForAuth}
      />

      {/* 3. Trade-In Valuation Calculator */}
      <TradeInCalculatorModal
        isOpen={tradeInModalOpen}
        onClose={() => setTradeInModalOpen(false)}
        user={user}
        onRequireAuth={() => {
          setTradeInContextForAuth(true);
          setPhoneContextForAuth(null);
          setAuthModalOpen(true);
        }}
        onTradeInSubmitted={handleTradeInSubmitted}
      />

      {/* 4. Live Chat Drawer */}
      <ChatDrawer
        isOpen={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
        user={user}
        activeConversation={activeConversation}
        onSelectConversation={(c) => setActiveConversation(c)}
      />

      {/* 5. Staff Dashboard & Inventory Manager */}
      {user && user.role === 'staff' && (
        <StaffDashboardModal
          isOpen={staffDashboardOpen}
          onClose={() => setStaffDashboardOpen(false)}
          user={user}
          onSelectConversationForChat={(c) => {
            setActiveConversation(c);
            setChatDrawerOpen(true);
          }}
          onInventoryUpdated={refreshInventory}
        />
      )}

      {/* 6. Setup & Deployment Guide Modal */}
      <EnvGuideModal
        isOpen={envGuideOpen}
        onClose={() => setEnvGuideOpen(false)}
      />
    </div>
  );
};
