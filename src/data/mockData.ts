import { IPhone } from '../types';

export const INITIAL_IPHONES: IPhone[] = [
  {
    id: 'iph-16-pm-desert',
    model: 'iPhone 16 Pro Max',
    storage: '256GB',
    color: 'Desert Titanium',
    condition: 'Brand New (Sealed)',
    battery_health: 100,
    price: 1199,
    original_price: 1299,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1695048065057-de65796a56e0?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Factory sealed in original retail box. Includes full 1-year Apple limited warranty. Ready for immediate pickup or shipping.',
    carrier_status: 'Factory Unlocked (All SIMs)',
    includes: ['Original Factory Box', 'Braided USB-C Cable', 'Warranty Documentation'],
    featured: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'iph-16-pro-natural',
    model: 'iPhone 16 Pro',
    storage: '128GB',
    color: 'Natural Titanium',
    condition: 'Like New',
    battery_health: 100,
    price: 949,
    original_price: 1049,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1695048065057-de65796a56e0?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Used for only 2 weeks in a protective case. Zero micro-scratches on display or chassis. 100% battery capacity with 14 cycles.',
    carrier_status: 'Factory Unlocked (All SIMs)',
    includes: ['Original Box', 'Original Cable', 'Tempered Glass Installed'],
    featured: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'iph-15-pm-blue',
    model: 'iPhone 15 Pro Max',
    storage: '512GB',
    color: 'Blue Titanium',
    condition: 'Like New',
    battery_health: 97,
    price: 899,
    original_price: 1199,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1695048132960-47b1c3e3e0ff?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1695048065057-de65796a56e0?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Generous 512GB storage capacity. Titanium band in pristine shape. Cameras and sensors 100% tested and verified.',
    carrier_status: 'Factory Unlocked (Dual eSIM)',
    includes: ['Original Box', 'Fast 20W Charger', 'MagSafe Case'],
    featured: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'iph-15-pink',
    model: 'iPhone 15',
    storage: '128GB',
    color: 'Pastel Pink',
    condition: 'Like New',
    battery_health: 99,
    price: 649,
    original_price: 799,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Color-infused back glass with smooth matte finish. Dynamic Island, 48MP main sensor. 99% Battery Health.',
    carrier_status: 'Factory Unlocked',
    includes: ['Original Box', 'USB-C Cable'],
    featured: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'iph-14-pro-purple',
    model: 'iPhone 14 Pro',
    storage: '256GB',
    color: 'Deep Purple',
    condition: 'Good Condition',
    battery_health: 91,
    price: 619,
    original_price: 999,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Iconic Deep Purple color. Minor superficial marks on stainless steel rim, screen is 100% scratch-free.',
    carrier_status: 'Factory Unlocked',
    includes: ['Charging Cable', 'Clear Protective Case'],
    featured: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: 'iph-13-midnight',
    model: 'iPhone 13',
    storage: '128GB',
    color: 'Midnight',
    condition: 'Good Condition',
    battery_health: 88,
    price: 419,
    original_price: 629,
    status: 'reserved',
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Superb everyday iPhone. Cinematic video mode, A15 Bionic chip. Currently reserved for a customer meeting.',
    carrier_status: 'Factory Unlocked',
    includes: ['Original Box', 'Cable'],
    featured: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  }
];

export const IPHONE_MODELS = [
  'iPhone 16 Pro Max',
  'iPhone 16 Pro',
  'iPhone 16 Plus',
  'iPhone 16',
  'iPhone 15 Pro Max',
  'iPhone 15 Pro',
  'iPhone 15 Plus',
  'iPhone 15',
  'iPhone 14 Pro Max',
  'iPhone 14 Pro',
  'iPhone 14',
  'iPhone 13 Pro Max',
  'iPhone 13 Pro',
  'iPhone 13',
  'iPhone 12 Pro Max',
  'iPhone 12',
  'iPhone 11'
];

export const STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB'];

// Base valuation algorithm for trade-in estimations
export function calculateTradeInEstimate(
  model: string,
  storage: string,
  batteryHealth: number,
  condition: string
): { min: number; max: number } {
  let basePrice = 300;
  if (model.includes('16 Pro Max')) basePrice = 850;
  else if (model.includes('16 Pro')) basePrice = 750;
  else if (model.includes('16')) basePrice = 550;
  else if (model.includes('15 Pro Max')) basePrice = 650;
  else if (model.includes('15 Pro')) basePrice = 580;
  else if (model.includes('15')) basePrice = 420;
  else if (model.includes('14 Pro Max')) basePrice = 490;
  else if (model.includes('14 Pro')) basePrice = 430;
  else if (model.includes('14')) basePrice = 330;
  else if (model.includes('13 Pro')) basePrice = 360;
  else if (model.includes('13')) basePrice = 280;
  else if (model.includes('12')) basePrice = 200;
  else if (model.includes('11')) basePrice = 140;

  // Storage multiplier
  if (storage === '256GB') basePrice += 40;
  else if (storage === '512GB') basePrice += 80;
  else if (storage === '1TB') basePrice += 130;

  // Battery multiplier
  let batteryFactor = 1.0;
  if (batteryHealth < 80) batteryFactor = 0.82;
  else if (batteryHealth < 85) batteryFactor = 0.90;
  else if (batteryHealth < 95) batteryFactor = 0.96;

  // Condition multiplier
  let conditionFactor = 1.0;
  if (condition.includes('Flawless') || condition.includes('Like New')) conditionFactor = 1.05;
  else if (condition.includes('Good') || condition.includes('Minor')) conditionFactor = 0.92;
  else if (condition.includes('Cracked') || condition.includes('Damaged')) conditionFactor = 0.65;

  const finalEst = Math.round(basePrice * batteryFactor * conditionFactor);
  return {
    min: Math.max(50, finalEst - 30),
    max: finalEst + 30,
  };
}
