import React, { useState } from 'react';
import { X, Check, Battery, ShieldCheck, Box, MessageCircle, AlertCircle, Sparkles } from 'lucide-react';
import { IPhone } from '../types';

interface IPhoneDetailsModalProps {
  phone: IPhone | null;
  onClose: () => void;
  onInquire: (phone: IPhone) => void;
}

export const IPhoneDetailsModal: React.FC<IPhoneDetailsModalProps> = ({
  phone,
  onClose,
  onInquire,
}) => {
  if (!phone) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div 
        className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-gray-100 transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Photo Gallery Column */}
          <div className="bg-[#fbfbfd] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-200">
            <div className="relative aspect-square flex items-center justify-center rounded-2xl bg-white border border-gray-100 p-4 overflow-hidden shadow-xs">
              <img
                src={phone.images[activeImageIndex] || phone.images[0]}
                alt={phone.model}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Thumbnail selector */}
            {phone.images.length > 1 && (
              <div className="flex items-center gap-2 mt-4 justify-center">
                {phone.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-xl border-2 overflow-hidden transition ${
                      activeImageIndex === idx ? 'border-blue-600 scale-105' : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Diagnostic badge */}
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-800">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">Passed Apple Hardware Diagnostic</span>
                <p className="text-[11px] text-emerald-700">Face ID, TrueTone, Microphones, and Cameras fully functional.</p>
              </div>
            </div>
          </div>

          {/* Details & Specs Column */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              {/* Status and Condition */}
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {phone.condition}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                  {phone.carrier_status}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-1">
                {phone.model}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Color: <strong className="text-gray-900 font-semibold">{phone.color}</strong> • Storage: <strong className="text-gray-900 font-semibold">{phone.storage}</strong>
              </p>

              {/* Price Banner */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 mb-6 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-gray-500 block">Verified Store Price</span>
                  <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    ₱{phone.price.toLocaleString()}
                  </span>
                </div>
                {phone.original_price && (
                  <div className="text-right">
                    <span className="text-xs text-gray-400 line-through block">
                      ₱{phone.original_price.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">
                      Save ₱{(phone.original_price - phone.price).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Device Summary</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {phone.description}
                </p>
              </div>

              {/* Specifications Matrix */}
              <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
                <div className="p-3 rounded-xl border border-gray-200 bg-white">
                  <span className="text-gray-400 block mb-1 flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-600" />
                    Battery Health
                  </span>
                  <span className="font-extrabold text-gray-900 text-sm">
                    {phone.battery_health}%
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-gray-200 bg-white">
                  <span className="text-gray-400 block mb-1 flex items-center gap-1">
                    <Box className="w-3.5 h-3.5 text-blue-600" />
                    Packaging
                  </span>
                  <span className="font-bold text-gray-900 text-sm truncate block">
                    {phone.includes[0] || 'Box Included'}
                  </span>
                </div>
              </div>

              {/* In the Box */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Package Inclusions</h4>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  {phone.includes.map((inc, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-600" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  onClose();
                  onInquire(phone);
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with Staff to Buy / Reserve</span>
              </button>
              <p className="text-[11px] text-gray-400 text-center mt-2">
                Requires quick Google or Facebook sign in to chat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
