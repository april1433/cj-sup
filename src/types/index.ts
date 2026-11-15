export type IPhoneCondition = 
  | 'Brand New (Sealed)'
  | 'Like New'
  | 'Good Condition'
  | 'Fair / Minor Wear';

export type IPhoneStatus = 'available' | 'reserved' | 'sold';

export interface IPhone {
  id: string;
  model: string;                 // e.g. "iPhone 16 Pro Max"
  storage: string;               // e.g. "256GB"
  color: string;                 // e.g. "Desert Titanium"
  condition: IPhoneCondition;
  battery_health: number;        // e.g. 100
  price: number;                 // e.g. 1199.00
  original_price?: number;       // e.g. 1299.00
  status: IPhoneStatus;
  images: string[];
  description: string;
  carrier_status: string;        // e.g. "Factory Unlocked"
  includes: string[];            // e.g. ["Original Box", "USB-C Cable"]
  featured?: boolean;
  created_at?: string;
}

export type UserRole = 'customer' | 'staff' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  message_text: string;
  media_url?: string;
  is_staff: boolean;
  read_by_recipient?: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_avatar?: string;
  customer_email: string;
  subject: string;
  iphone_id?: string;
  iphone_preview?: {
    model: string;
    storage: string;
    color: string;
    price: number;
    image: string;
  };
  status: 'open' | 'resolved' | 'closed';
  last_message_text?: string;
  last_message_at: string;
  created_at: string;
}

export interface TradeInInquiry {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  model: string;
  storage: string;
  battery_health: number;
  cosmetic_condition: string;
  screen_condition: string;
  functional_issues: string;
  estimated_offer_min: number;
  estimated_offer_max: number;
  photos: string[];
  status: 'pending' | 'reviewed' | 'offer_sent' | 'accepted' | 'declined';
  conversation_id?: string;
  created_at: string;
}
