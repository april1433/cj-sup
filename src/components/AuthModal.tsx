import React, { useState } from 'react';
import { X, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { IPhone, UserProfile } from '../types';
import { signInWithGoogle, signInWithFacebook, signInDemo, isConfigured } from '../lib/supabase';

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
  onLoginSuccess,
  phoneContext,
  tradeInContext,
}) => {
  if (!isOpen) return null;

  const [loadingProvider, setLoadingProvider] = useState<'google' | 'facebook' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoadingProvider('google');
      setErrorMsg(null);
      if (isConfigured) {
        await signInWithGoogle();
      } else {
        // Instant simulated demo login
        const user = signInDemo('google', 'customer');
        onLoginSuccess(user);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to authenticate with Google.');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setLoadingProvider('facebook');
      setErrorMsg(null);
      if (isConfigured) {
        await signInWithFacebook();
      } else {
        // Instant simulated demo login
        const user = signInDemo('facebook', 'customer');
        onLoginSuccess(user);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to authenticate with Facebook.');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleStaffDemoLogin = () => {
    const staffUser = signInDemo('google', 'staff');
    onLoginSuccess(staffUser);
    onClose();
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
            Sign In to Start Chatting
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            Log in with your Google or Facebook account to message our store specialists directly.
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
                ${phoneContext.price.toLocaleString()} • {phoneContext.condition}
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
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs text-center border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* OAuth Action Buttons */}
        <div className="space-y-3">
          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loadingProvider !== null}
            className="w-full py-3.5 px-4 rounded-2xl border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold text-sm transition flex items-center justify-center gap-3 shadow-xs active:scale-95 disabled:opacity-50"
          >
            {loadingProvider === 'google' ? (
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
            <span>Continue with Google (Gmail)</span>
          </button>

          {/* Facebook Login */}
          <button
            onClick={handleFacebookLogin}
            disabled={loadingProvider !== null}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-sm transition flex items-center justify-center gap-3 shadow-xs active:scale-95 disabled:opacity-50"
          >
            {loadingProvider === 'facebook' ? (
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            )}
            <span>Continue with Facebook</span>
          </button>
        </div>

        {/* Development & Testing Helper */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 mb-2 font-medium">
            Demo & Staff Testing Shortcuts:
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => {
                const user = signInDemo('google', 'customer');
                onLoginSuccess(user);
                onClose();
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
            >
              Test Customer
            </button>
            <button
              onClick={handleStaffDemoLogin}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-semibold transition flex items-center gap-1"
            >
              <UserCheck className="w-3 h-3" />
              Test Staff Admin
            </button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Strict Privacy: No spam, official OAuth 2.0 security.</span>
        </div>
      </div>
    </div>
  );
};
