import React, { useState, useMemo } from 'react';
import { X, ArrowRightLeft, Sparkles, CheckCircle2, AlertCircle, Camera, Shield, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { IPHONE_MODELS, STORAGE_OPTIONS, calculateTradeInEstimate } from '../data/mockData';
import { UserProfile, TradeInInquiry } from '../types';
import { submitTradeIn, getOrCreateConversation, sendMessage } from '../lib/supabase';

interface TradeInCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onRequireAuth: () => void;
  onTradeInSubmitted: (inquiry: TradeInInquiry, convId: string) => void;
}

export const TradeInCalculatorModal: React.FC<TradeInCalculatorModalProps> = ({
  isOpen,
  onClose,
  user,
  onRequireAuth,
  onTradeInSubmitted,
}) => {
  if (!isOpen) return null;

  const [model, setModel] = useState<string>(IPHONE_MODELS[0]);
  const [storage, setStorage] = useState<string>('256GB');
  const [batteryHealth, setBatteryHealth] = useState<number>(90);
  const [screenCondition, setScreenCondition] = useState<string>('Flawless (No scratches)');
  const [bodyCondition, setBodyCondition] = useState<string>('Like New (No dents or marks)');
  const [functionalIssues, setFunctionalIssues] = useState<string>('None (Everything 100% works)');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Live valuation estimation
  const estimate = useMemo(() => {
    return calculateTradeInEstimate(model, storage, batteryHealth, `${screenCondition} ${bodyCondition}`);
  }, [model, storage, batteryHealth, screenCondition, bodyCondition]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      onRequireAuth();
      return;
    }

    try {
      setSubmitting(true);

      // 1. Submit trade-in record
      const tradeIn = await submitTradeIn({
        user_id: user.id,
        user_name: user.full_name,
        user_email: user.email,
        model,
        storage,
        battery_health: batteryHealth,
        cosmetic_condition: bodyCondition,
        screen_condition: screenCondition,
        functional_issues: functionalIssues,
        estimated_offer_min: estimate.min,
        estimated_offer_max: estimate.max,
        photos: [],
        status: 'pending',
      });

      // 2. Open / create conversation for this trade-in
      const conv = await getOrCreateConversation(
        user,
        undefined,
        `Sell Inquiry: ${model} (${storage})`
      );

      // 3. Post structured trade-in message into conversation
      await sendMessage({
        conversation_id: conv.id,
        sender_id: user.id,
        sender_name: user.full_name,
        sender_avatar: user.avatar_url,
        message_text: `📱 TRADE-IN INQUIRY SUBMITTED:
• Model: ${model}
• Storage: ${storage}
• Battery Health: ${batteryHealth}%
• Screen: ${screenCondition}
• Body: ${bodyCondition}
• Issues: ${functionalIssues}
• Estimated Quote: ₱${estimate.min.toLocaleString()} - ₱${estimate.max.toLocaleString()}
${notes ? `• Notes: ${notes}` : ''}`,
        is_staff: false,
      });

      // Celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}

      onTradeInSubmitted(tradeIn, conv.id);
      onClose();
    } catch (err: any) {
      console.error(err);
      alert('Could not submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-100 p-6 sm:p-8 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Sell Your iPhone to Us
            </h2>
            <p className="text-xs text-gray-500">
              Get an instant cash valuation estimate, then chat with our staff to finalize the deal.
            </p>
          </div>
        </div>

        {/* Live Estimated Offer Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 text-white shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-emerald-100 font-semibold block">
              Estimated Instant Cash Value
            </span>
            <div className="text-3xl font-extrabold tracking-tight mt-0.5">
              ₱{estimate.min.toLocaleString()} – ₱{estimate.max.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-100">
              *Final amount confirmed after staff physical inspection or diagnostic.
            </span>
          </div>

          <div className="hidden sm:block text-right">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Highest Local Payout
            </span>
          </div>
        </div>

        {/* Inquiry Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Model Selection */}
            <div>
              <label className="block font-bold text-gray-700 mb-1.5">
                iPhone Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {IPHONE_MODELS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Storage Selection */}
            <div>
              <label className="block font-bold text-gray-700 mb-1.5">
                Storage Capacity
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {STORAGE_OPTIONS.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setStorage(s)}
                    className={`py-2 text-[11px] font-bold rounded-lg border transition ${
                      storage === s
                        ? 'bg-black text-white border-black'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Battery Health Slider */}
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-gray-800">
                Battery Health Maximum Capacity: <span className="text-blue-600 font-extrabold text-sm">{batteryHealth}%</span>
              </label>
              <span className="text-[11px] text-gray-500">
                Found in Settings → Battery → Battery Health
              </span>
            </div>
            <input
              type="range"
              min="70"
              max="100"
              value={batteryHealth}
              onChange={(e) => setBatteryHealth(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>70% (Service needed)</span>
              <span>85% (Average)</span>
              <span>100% (Brand New / Pristine)</span>
            </div>
          </div>

          {/* Condition Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1.5">
                Display / Screen Condition
              </label>
              <select
                value={screenCondition}
                onChange={(e) => setScreenCondition(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Flawless (No scratches)">Flawless (No scratches)</option>
                <option value="Light micro-scratches">Light micro-scratches</option>
                <option value="Deep visible scratch">Deep visible scratch</option>
                <option value="Cracked Glass">Cracked / Broken Glass</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5">
                Body / Frame Condition
              </label>
              <select
                value={bodyCondition}
                onChange={(e) => setBodyCondition(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Like New (No dents or marks)">Like New (No dents or marks)</option>
                <option value="Minor case scuffs on edge">Minor case scuffs on edge</option>
                <option value="Small dent / chipped corner">Small dent / chipped corner</option>
                <option value="Cracked back glass">Cracked back glass</option>
              </select>
            </div>
          </div>

          {/* Functional Issues */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Any Hardware Issues?
            </label>
            <select
              value={functionalIssues}
              onChange={(e) => setFunctionalIssues(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="None (Everything 100% works)">None (Everything 100% works)</option>
              <option value="Face ID not working">Face ID not working</option>
              <option value="Camera blurry / broken lens">Camera blurry / broken lens</option>
              <option value="Charging port loose">Charging port loose</option>
            </select>
          </div>

          {/* Optional notes */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Extra Notes / Original Box Included? (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Includes original box and 20W charger"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
            <div className="text-gray-500 text-[11px]">
              {user ? (
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Logged in as {user.full_name}
                </span>
              ) : (
                <span className="text-amber-700 font-semibold">
                  *Login with Google required on submit
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Chat with Staff to Finalize Offer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
