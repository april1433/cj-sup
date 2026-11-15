import React, { useState } from 'react';
import { X, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { IPhone, UserProfile } from '../types';
import { signInWithGoogle } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  phoneContext?: IPhone | null;
  tradeInContext?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  phoneContext,
  tradeInContext,
}) => {
  if (!isOpen) return null;

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await signInWithGoogle();
      // Browser redirects to Google OAuth
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      if (err.message?.includes('provider is not enabled') || err.message?.includes('Unsupported provider')) {
        setErrorMsg('Google login is not enabled in your Supabase Dashboard yet. In Supabase, go to Authentication → Providers → Google and toggle it ON.');
      } else {
        setErrorMsg(err.message || 'Could not connect to Google login. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 p-6 sm:p-8 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Icon */}
        <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mx-auto mb-4 shadow-md">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-1 .04-2.22.67-2.93 1.5-.63.72-1.18 1.83-1.03 2.89 1.12.09 2.28-.62 3.02-1.46z" />
          </svg>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">
            Sign In with Google
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            Sign in with your Google account to chat with us, inquire about phones, or submit trade-ins.
          </p>
        </div>

        {/* Context Card (if user clicked a specific phone or sell inquiry) */}
        {phoneContext && (
          <div className="mb-6 p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center gap-3">
            <img
              src={phoneContext.images[0]}
              alt={phoneContext.model}
              className="w-12 h-12 object-contain bg-white rounded-xl p-1 border border-blue-200"
            />
            <div className="text-left text-xs">
              <span className="font-bold text-gray-900 block truncate">
                {phoneContext.model} ({phoneContext.storage})
              </span>
              <span className="text-blue-700 font-semibold block">
                ₱{phoneContext.price.toLocaleString()} • {phoneContext.condition}
              </span>
              <span className="text-[10px] text-gray-500">
                Staff will see this phone attached in your chat
              </span>
            </div>
          </div>
        )}

        {tradeInContext && (
          <div className="mb-6 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-left text-xs text-emerald-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Trade-In Valuation Ready</span>
              <p className="text-[11px] text-emerald-700">Login to submit your phone specs and receive our official cash quote.</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs text-left border border-red-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block mb-0.5">Authentication Note:</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Google OAuth Action Button */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold text-sm transition flex items-center justify-center gap-3 shadow-xs active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>{loading ? 'Redirecting to Google...' : 'Continue with Google (Gmail)'}</span>
          </button>
        </div>

        {/* Privacy Note */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Strict Privacy: Official OAuth 2.0 Security.</span>
        </div>
      </div>
    </div>
  );
};
