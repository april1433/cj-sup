import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, Terminal, Globe, Shield, Database } from 'lucide-react';
import { isConfigured } from '../lib/supabase';

interface EnvGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnvGuideModal: React.FC<EnvGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-hidden border border-gray-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                Supabase & Hosting Deployment Guide
              </h2>
              <p className="text-xs text-gray-500">
                Setup your real Supabase keys & deploy to Netlify / Hostinger.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-700 leading-relaxed">
          {/* Current Status */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isConfigured 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div>
              <span className="font-extrabold text-sm block">
                {isConfigured ? '🟢 Live Supabase Connected' : '🟡 Running in Local Demo / Fallback Mode'}
              </span>
              <p className="text-[11px] mt-0.5 opacity-90">
                {isConfigured 
                  ? 'Your real Supabase project is active and handling live chat and authentication.' 
                  : 'The site is currently working safely in interactive Demo Mode. Add your Supabase keys when ready to launch live!'}
              </p>
            </div>
          </div>

          {/* Step 1: Supabase Setup */}
          <div>
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
              Connect Your Supabase Project
            </h3>
            <ol className="space-y-1.5 list-decimal list-inside text-gray-600 pl-1">
              <li>Create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">supabase.com</a>.</li>
              <li>Go to <strong>Project Settings → API</strong>.</li>
              <li>Copy your <strong>Project URL</strong> and <strong>anon public API key</strong>.</li>
              <li>Open the file <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">.env</code> in your project and paste them:</li>
            </ol>

            <div className="mt-2.5 p-3 rounded-xl bg-gray-900 text-gray-200 font-mono text-[11px] relative">
              <button
                onClick={() => copyToClipboard(`VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key`, 'env')}
                className="absolute top-2.5 right-2.5 px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-[10px] text-gray-300 flex items-center gap-1 transition"
              >
                {copied === 'env' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied === 'env' ? 'Copied' : 'Copy'}</span>
              </button>
              <pre className="overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_ADMIN_EMAILS=your-email@gmail.com`}
              </pre>
            </div>
          </div>

          {/* Step 2: Run SQL Schema */}
          <div>
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">2</span>
              Initialize Database Tables
            </h3>
            <p className="text-gray-600 mb-2">
              We generated the complete script for you in <code className="bg-gray-100 px-1 py-0.5 rounded font-bold">SUPABASE_SETUP.sql</code>:
            </p>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-[11px] text-blue-900">
              In your Supabase Dashboard, click <strong>SQL Editor → New query</strong>, paste the contents of <strong>SUPABASE_SETUP.sql</strong>, and click <strong>Run</strong>. This creates all tables, RLS security policies, real-time messaging, and initial iPhone stock!
            </div>
          </div>

          {/* Step 3: Google & Facebook OAuth */}
          <div>
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">3</span>
              Enable Google & Facebook Login
            </h3>
            <p className="text-gray-600 mb-2">
              In Supabase, go to <strong>Authentication → Providers</strong>:
            </p>
            <ul className="space-y-1 list-disc list-inside text-gray-600 pl-1">
              <li><strong>Google:</strong> Toggle ON, enter Client ID & Secret from Google Cloud Console.</li>
              <li><strong>Facebook:</strong> Toggle ON, enter App ID & App Secret from Meta for Developers.</li>
            </ul>
          </div>

          {/* Step 4: Netlify + Hostinger Deployment */}
          <div>
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">4</span>
              Deploying to Netlify & Hostinger
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50">
                <span className="font-bold text-gray-900 block mb-1">Option A: Netlify (Instant)</span>
                <p className="text-gray-600 text-[11px] mb-2">
                  Connect your GitHub repo to Netlify. The included <code className="font-mono">netlify.toml</code> automatically configures SPA routing and build settings.
                </p>
                <div className="text-[10px] text-gray-500 font-mono">
                  Build: npm run build<br />
                  Publish: dist
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50">
                <span className="font-bold text-gray-900 block mb-1">Option B: Hostinger</span>
                <p className="text-gray-600 text-[11px] mb-2">
                  Run <code className="font-mono">npm run build</code> locally, then upload the contents of the <code className="font-mono">dist/</code> folder to your Hostinger <code className="font-mono">public_html/</code> directory.
                </p>
                <p className="text-[10px] text-emerald-700 font-medium">
                  *The included <code className="font-mono">public/.htaccess</code> automatically handles clean URL routing on Hostinger!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
