import React from 'react';
import { Battery, Shield, MessageCircle, Eye, CheckCircle, Clock } from 'lucide-react';
import { IPhone } from '../types';

interface IPhoneCardProps {
  phone: IPhone;
  onSelectDetails: (phone: IPhone) => void;
  onInquire: (phone: IPhone) => void;
}

export const IPhoneCard: React.FC<IPhoneCardProps> = ({
  phone,
  onSelectDetails,
  onInquire,
}) => {
  const isAvailable = phone.status === 'available';
  const isReserved = phone.status === 'reserved';
  const isSold = phone.status === 'sold';

  // Battery health color logic
  const getBatteryColor = (level: number) => {
    if (level >= 95) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (level >= 85) return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/80 hover:border-gray-300 shadow-sm hover:shadow-elevated transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image container */}
      <div className="relative aspect-[4/3] bg-gradient-to-b from-gray-50 to-gray-100/60 p-4 flex items-center justify-center overflow-hidden">
        {/* Status Badge */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {isAvailable && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500 text-white shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Available
            </span>
          )}
          {isReserved && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500 text-white shadow-sm">
              <Clock className="w-3 h-3" />
              Reserved
            </span>
          )}
          {isSold && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-600 text-white shadow-sm">
              Sold
            </span>
          )}

          {phone.featured && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Staff Pick
            </span>
          )}
        </div>

        {/* Condition Badge top-right */}
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/90 backdrop-blur-md text-gray-800 border border-gray-200 shadow-xs">
            {phone.condition}
          </span>
        </div>

        {/* Product Image */}
        <img
          src={phone.images[0] || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80'}
          alt={`${phone.model} ${phone.color}`}
          className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Quick View overlay button */}
        <button
          onClick={() => onSelectDetails(phone)}
          className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-xs font-medium backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 shadow-sm"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Quick View</span>
        </button>
      </div>

      {/* Product Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Model Title & Storage */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition">
              {phone.model}
            </h3>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 shrink-0">
              {phone.storage}
            </span>
          </div>

          {/* Color & Carrier */}
          <p className="text-xs text-gray-500 mb-3">
            {phone.color} • <span className="text-gray-700 font-medium">{phone.carrier_status}</span>
          </p>

          {/* Health & Diagnostic Badges */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBatteryColor(phone.battery_health)}`}>
              <Battery className="w-3.5 h-3.5" />
              <span>{phone.battery_health}% Health</span>
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] text-gray-600 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
              <Shield className="w-3 h-3 text-emerald-600" />
              <span>30-pt Tested</span>
            </span>
          </div>
        </div>

        {/* Pricing and Action CTA */}
        <div className="pt-3 border-t border-gray-100 mt-2">
          <div className="flex items-baseline justify-between mb-3.5">
            <div>
              <span className="text-2xl font-black text-gray-900 tracking-tight">
                ${phone.price.toLocaleString()}
              </span>
              {phone.original_price && phone.original_price > phone.price && (
                <span className="ml-2 text-xs text-gray-400 line-through">
                  ${phone.original_price.toLocaleString()}
                </span>
              )}
            </div>

            {phone.original_price && phone.original_price > phone.price && (
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Save ${(phone.original_price - phone.price).toLocaleString()}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelectDetails(phone)}
              className="w-full py-2 px-3 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-semibold transition active:scale-95 text-center"
            >
              Specs & Photos
            </button>

            <button
              onClick={() => onInquire(phone)}
              disabled={isSold}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 shadow-sm ${
                isSold 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{isReserved ? 'Inquire Waitlist' : 'Message to Buy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
