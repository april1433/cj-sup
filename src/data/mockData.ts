import { IPhone } from '../types';

export const INITIAL_IPHONES: IPhone[] = [
  {
    id: 'iph-18-pm-obsidian',
    model: 'iPhone 18 Pro Max',
    storage: '512GB',
    color: 'Obsidian Titanium',
    condition: 'Brand New (Sealed)',
    battery_health: 100,
    price: 92990,
    original_price: 99990,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1695048065057-de65796a56e0?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Next-gen flagship with A20 Pro silicon, integrated under-display Face ID and variable aperture camera system. Factory sealed.',
    carrier_status: 'Factory Unlocked (All Philippine SIMs & eSIM)',
    includes: ['Sealed Box', 'Braided High-Speed USB-C Cable', '1-Year Official Apple Warranty'],
    featured: true,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'iph-18-pro-silver',
    model: 'iPhone 18 Pro',
    storage: '256GB',
    color: 'Silver Titanium',
    condition: 'Brand New (Sealed)',
    battery_health: 100,
    price: 79990,
    original_price: 85990,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1695048065057-de65796a56e0?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Brand new sealed unit. Compact pro powerhouse, ultra-bright 3000-nit ProMotion display.',
    carrier_status: 'Factory Unlocked (Smart/Globe/DITO)',
    includes: ['Original Factory Box', 'Braided Cable', 'Full Warranty'],
    featured: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'iph-17-pm-cosmic',
    model: 'iPhone 17 Pro Max',
    storage: '256GB',
    color: 'Cosmic Blue',
    condition: 'Like New',
    battery_health: 100,
    price: 71990,
    original_price: 81990,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1695048132960-47b1c3e3e0ff?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1695048065057-de65796a56e0?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Pristine unit, 100% battery capacity. Triple 48MP fusion optics, tetraprism 5x telephoto.',
    carrier_status: 'Factory Unlocked',
    includes: ['Original Box', 'Fast Charging Cable', 'Screen Protector Installed'],
    featured: true,
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'iph-17-air-silver',
    model: 'iPhone 17 Air',
    storage: '256GB',
    color: 'Titanium Frost',
    condition: 'Like New',
    battery_health: 99,
    price: 56990,
    original_price: 64990,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Ultra-thin lightweight form factor. Sleekest iPhone ever made with OLED 120Hz display.',
    carrier_status: 'Factory Unlocked',
    includes: ['Original Box', 'USB-C Cable', 'Slim Case'],
    featured: true,
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'iph-16-pm-desert',
    model: 'iPhone 16 Pro Max',
    storage: '256GB',
    color: 'Desert Titanium',
    condition: 'Brand New (Sealed)',
    battery_health: 100,
    price: 54990,
    original_price: 84990,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1695048065057-de65796a56e0?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Factory sealed in original retail box. NTC approved, full 1-year Apple limited warranty.',
    carrier_status: 'Factory Unlocked (Openline)',
    includes: ['Original Factory Box', 'Braided USB-C Cable', '1-Year Apple Warranty'],
    featured: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'iph-16-pro-natural',
    model: 'iPhone 16 Pro',
    storage: '128GB',
    color: 'Natural Titanium',
    condition: 'Like New',
    battery_health: 98,
    price: 46990,
    original_price: 69990,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1695048065057-de65796a56e0?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Zero micro-scratches on display or chassis. 98% battery capacity with 28 charge cycles.',
    carrier_status: 'Factory Unlocked (Openline)',
    includes: ['Original Box', 'Original Cable', 'Tempered Glass Installed'],
    featured: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'iph-15-pm-blue',
    model: 'iPhone 15 Pro Max',
    storage: '512GB',
    color: 'Blue Titanium',
    condition: 'Like New',
    battery_health: 95,
    price: 42990,
    original_price: 64990,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1695048132960-47b1c3e3e0ff?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Massive 512GB storage capacity. Titanium band in pristine shape. 95% battery health.',
    carrier_status: 'Factory Unlocked (Openline)',
    includes: ['Original Box', 'Fast 20W Charger', 'MagSafe Case'],
    featured: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'iph-14-pro-purple',
    model: 'iPhone 14 Pro',
    storage: '256GB',
    color: 'Deep Purple',
    condition: 'Good Condition',
    battery_health: 91,
    price: 31990,
    original_price: 58990,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Iconic Deep Purple color. Minor superficial marks on rim, screen is 100% scratch-free.',
    carrier_status: 'Factory Unlocked (Openline)',
    includes: ['Charging Cable', 'Clear Protective Case'],
    featured: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  }
];

export const IPHONE_MODELS = [
  'iPhone 18 Pro Max',
  'iPhone 18 Pro',
  'iPhone 18 Plus',
  'iPhone 18',
  'iPhone 17 Pro Max',
  'iPhone 17 Pro',
  'iPhone 17 Air',
  'iPhone 17',
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

export const STORAGE_OPTIONS = ['128GB', '256GB', '512GB', '1TB', '2TB'];

// Base valuation algorithm for trade-in estimations in Philippine Pesos (PHP / ₱)
export function calculateTradeInEstimate(
  model: string,
  storage: string,
  batteryHealth: number,
  condition: string
): { min: number; max: number } {
  let basePrice = 18000;
  
  if (model.includes('18 Pro Max')) basePrice = 65000;
  else if (model.includes('18 Pro')) basePrice = 58000;
  else if (model.includes('18')) basePrice = 46000;
  else if (model.includes('17 Pro Max')) basePrice = 54000;
  else if (model.includes('17 Pro')) basePrice = 48000;
  else if (model.includes('17 Air')) basePrice = 42000;
  else if (model.includes('17')) basePrice = 38000;
  else if (model.includes('16 Pro Max')) basePrice = 40000;
  else if (model.includes('16 Pro')) basePrice = 34000;
  else if (model.includes('16')) basePrice = 28000;
  else if (model.includes('15 Pro Max')) basePrice = 30000;
  else if (model.includes('15 Pro')) basePrice = 26000;
  else if (model.includes('15')) basePrice = 22000;
  else if (model.includes('14 Pro Max')) basePrice = 24000;
  else if (model.includes('14 Pro')) basePrice = 20000;
  else if (model.includes('14')) basePrice = 17000;
  else if (model.includes('13 Pro')) basePrice = 15500;
  else if (model.includes('13')) basePrice = 13000;
  else if (model.includes('12')) basePrice = 9500;
  else if (model.includes('11')) basePrice = 7000;

  // Storage multiplier
  if (storage === '256GB') basePrice += 2500;
  else if (storage === '512GB') basePrice += 5500;
  else if (storage === '1TB') basePrice += 9500;
  else if (storage === '2TB') basePrice += 14000;

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

  const finalEst = Math.round((basePrice * batteryFactor * conditionFactor) / 100) * 100;
  return {
    min: Math.max(3000, finalEst - 1500),
    max: finalEst + 1500,
  };
}
