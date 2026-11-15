import { createClient } from '@supabase/supabase-js';
import { IPhone, Conversation, Message, TradeInInquiry, UserProfile } from '../types';
import { INITIAL_IPHONES } from '../data/mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || 'owner@example.com,staff@example.com')
  .toLowerCase()
  .split(',')
  .map((e: string) => e.trim());

export const isConfigured = 
  Boolean(supabaseUrl) && 
  Boolean(supabaseAnonKey) && 
  !supabaseUrl.includes('placeholder-project') &&
  supabaseUrl.startsWith('https://');

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// ==============================================================================
// LOCAL STORAGE STORAGE KEYS FOR DEMO / TEST MODE
// ==============================================================================
const STORAGE_USER = 'ivault_demo_user';
const STORAGE_IPHONES = 'ivault_demo_iphones';
const STORAGE_CONVERSATIONS = 'ivault_demo_conversations';
const STORAGE_MESSAGES = 'ivault_demo_messages';
const STORAGE_TRADE_INS = 'ivault_demo_trade_ins';

// Initialize local fallback state if empty
function initLocalStore() {
  if (!localStorage.getItem(STORAGE_IPHONES)) {
    localStorage.setItem(STORAGE_IPHONES, JSON.stringify(INITIAL_IPHONES));
  }
  if (!localStorage.getItem(STORAGE_CONVERSATIONS)) {
    localStorage.setItem(STORAGE_CONVERSATIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_MESSAGES)) {
    localStorage.setItem(STORAGE_MESSAGES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_TRADE_INS)) {
    localStorage.setItem(STORAGE_TRADE_INS, JSON.stringify([]));
  }
}

// ==============================================================================
// AUTHENTICATION APIs
// ==============================================================================

export async function signInWithGoogle() {
  if (isConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  } else {
    // Demo simulation fallback
    return signInDemo('google', 'customer');
  }
}

export async function signInWithFacebook() {
  if (isConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  } else {
    // Demo simulation fallback
    return signInDemo('facebook', 'customer');
  }
}

export function signInDemo(provider: 'google' | 'facebook', role: 'customer' | 'staff' = 'customer'): UserProfile {
  initLocalStore();
  const demoUser: UserProfile = role === 'staff' ? {
    id: 'staff-demo-id-001',
    email: 'staff@ivaultstore.com',
    full_name: 'Alex Rivera (Store Specialist)',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'staff',
  } : {
    id: `user-${provider}-${Date.now().toString().slice(-4)}`,
    email: provider === 'google' ? 'john.customer@gmail.com' : 'john.client@facebook.com',
    full_name: provider === 'google' ? 'John (Google Verified)' : 'John (FB Verified)',
    avatar_url: provider === 'google'
      ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
      : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    role: 'customer',
  };

  localStorage.setItem(STORAGE_USER, JSON.stringify(demoUser));
  return demoUser;
}

export async function signOut() {
  if (isConfigured && supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(STORAGE_USER);
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (isConfigured && supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const isStaff = adminEmails.includes(user.email?.toLowerCase() || '');
    return {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Member',
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
      role: isStaff ? 'staff' : 'customer',
    };
  }

  // Demo fallback check
  const saved = localStorage.getItem(STORAGE_USER);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
}

// ==============================================================================
// IPHONES INVENTORY APIs
// ==============================================================================

export async function fetchIPhones(): Promise<IPhone[]> {
  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('iphones')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.warn('Supabase fetch error, fallback to local', error);
      return INITIAL_IPHONES;
    }
    if (data && data.length > 0) return data as IPhone[];
  }

  // Local storage fallback
  initLocalStore();
  const raw = localStorage.getItem(STORAGE_IPHONES);
  return raw ? JSON.parse(raw) : INITIAL_IPHONES;
}

export async function saveIPhone(phone: Omit<IPhone, 'id'>, id?: string): Promise<IPhone> {
  if (isConfigured && supabase) {
    if (id) {
      const { data, error } = await supabase
        .from('iphones')
        .update(phone)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as IPhone;
    } else {
      const { data, error } = await supabase
        .from('iphones')
        .insert([phone])
        .select()
        .single();
      if (error) throw error;
      return data as IPhone;
    }
  }

  // Local Storage fallback
  initLocalStore();
  const current: IPhone[] = JSON.parse(localStorage.getItem(STORAGE_IPHONES) || '[]');
  if (id) {
    const updated = current.map(item => item.id === id ? { ...phone, id } : item);
    localStorage.setItem(STORAGE_IPHONES, JSON.stringify(updated));
    return { ...phone, id };
  } else {
    const newPhone: IPhone = {
      ...phone,
      id: `iph-custom-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newPhone, ...current];
    localStorage.setItem(STORAGE_IPHONES, JSON.stringify(updated));
    return newPhone;
  }
}

export async function deleteIPhone(id: string): Promise<void> {
  if (isConfigured && supabase) {
    await supabase.from('iphones').delete().eq('id', id);
    return;
  }
  initLocalStore();
  const current: IPhone[] = JSON.parse(localStorage.getItem(STORAGE_IPHONES) || '[]');
  const filtered = current.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_IPHONES, JSON.stringify(filtered));
}

// ==============================================================================
// CONVERSATIONS & CHAT APIs
// ==============================================================================

export async function fetchConversations(user: UserProfile): Promise<Conversation[]> {
  if (isConfigured && supabase) {
    let query = supabase.from('conversations').select('*').order('last_message_at', { ascending: false });
    if (user.role === 'customer') {
      query = query.eq('customer_id', user.id);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Conversation[];
  }

  initLocalStore();
  const all: Conversation[] = JSON.parse(localStorage.getItem(STORAGE_CONVERSATIONS) || '[]');
  if (user.role === 'staff' || user.role === 'admin') {
    return all;
  }
  return all.filter(c => c.customer_id === user.id);
}

export async function getOrCreateConversation(
  user: UserProfile, 
  iphone?: IPhone,
  initialSubject?: string
): Promise<Conversation> {
  const subject = initialSubject || (iphone ? `Inquiry about ${iphone.model} (${iphone.storage})` : 'General Question');

  if (isConfigured && supabase) {
    // Check if an existing open conversation with this phone or subject already exists
    let query = supabase
      .from('conversations')
      .select('*')
      .eq('customer_id', user.id)
      .eq('status', 'open');
    
    if (iphone) {
      query = query.eq('iphone_id', iphone.id);
    }

    const { data: existing } = await query.limit(1);
    if (existing && existing.length > 0) {
      return existing[0] as Conversation;
    }

    // Otherwise create one
    const newConv = {
      customer_id: user.id,
      customer_name: user.full_name,
      customer_avatar: user.avatar_url || '',
      customer_email: user.email,
      subject,
      iphone_id: iphone?.id || null,
      iphone_preview: iphone ? {
        model: iphone.model,
        storage: iphone.storage,
        color: iphone.color,
        price: iphone.price,
        image: iphone.images[0] || '',
      } : null,
      status: 'open',
      last_message_text: iphone ? `Hi, I am interested in this ${iphone.model}!` : 'Started conversation',
      last_message_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('conversations').insert([newConv]).select().single();
    if (error) throw error;

    // Send initial greeting system/customer message
    await sendMessage({
      conversation_id: data.id,
      sender_id: user.id,
      sender_name: user.full_name,
      sender_avatar: user.avatar_url,
      message_text: iphone 
        ? `Hello! I'm interested in purchasing the ${iphone.model} - ${iphone.storage} (${iphone.color}) listed for ₱${iphone.price.toLocaleString()}. Is this currently available?` 
        : `Hello! I would like to inquire about buying/selling an iPhone.`,
      is_staff: false,
    });

    return data as Conversation;
  }

  // Local storage demo mode
  initLocalStore();
  const all: Conversation[] = JSON.parse(localStorage.getItem(STORAGE_CONVERSATIONS) || '[]');
  const existing = all.find(c => c.customer_id === user.id && (!iphone || c.iphone_id === iphone.id));
  if (existing) return existing;

  const newId = `conv-${Date.now()}`;
  const newConv: Conversation = {
    id: newId,
    customer_id: user.id,
    customer_name: user.full_name,
    customer_avatar: user.avatar_url,
    customer_email: user.email,
    subject,
    iphone_id: iphone?.id,
    iphone_preview: iphone ? {
      model: iphone.model,
      storage: iphone.storage,
      color: iphone.color,
      price: iphone.price,
      image: iphone.images[0] || '',
    } : undefined,
    status: 'open',
    last_message_text: iphone ? `Hi, I'm interested in ${iphone.model}!` : 'Started conversation',
    last_message_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_CONVERSATIONS, JSON.stringify([newConv, ...all]));

  // Add initial message
  await sendMessage({
    conversation_id: newId,
    sender_id: user.id,
    sender_name: user.full_name,
    sender_avatar: user.avatar_url,
    message_text: iphone 
      ? `Hello! I'm interested in purchasing the ${iphone.model} - ${iphone.storage} (${iphone.color}) listed for ₱${iphone.price.toLocaleString()}. Is this currently available?` 
      : `Hello! I would like to inquire about buying or selling an iPhone.`,
    is_staff: false,
  });

  return newConv;
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []) as Message[];
  }

  initLocalStore();
  const all: Message[] = JSON.parse(localStorage.getItem(STORAGE_MESSAGES) || '[]');
  return all.filter(m => m.conversation_id === conversationId);
}

export async function sendMessage(
  msg: Omit<Message, 'id' | 'created_at'>
): Promise<Message> {
  const timestamp = new Date().toISOString();

  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ ...msg, created_at: timestamp }])
      .select()
      .single();
    if (error) throw error;

    // Update conversation last_message
    await supabase
      .from('conversations')
      .update({
        last_message_text: msg.message_text,
        last_message_at: timestamp,
      })
      .eq('id', msg.conversation_id);

    return data as Message;
  }

  initLocalStore();
  const allMsgs: Message[] = JSON.parse(localStorage.getItem(STORAGE_MESSAGES) || '[]');
  const newMsg: Message = {
    ...msg,
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    created_at: timestamp,
  };
  localStorage.setItem(STORAGE_MESSAGES, JSON.stringify([...allMsgs, newMsg]));

  // Update conversation last_message in local storage
  const allConvs: Conversation[] = JSON.parse(localStorage.getItem(STORAGE_CONVERSATIONS) || '[]');
  const updatedConvs = allConvs.map(c => 
    c.id === msg.conversation_id 
      ? { ...c, last_message_text: msg.message_text, last_message_at: timestamp } 
      : c
  );
  localStorage.setItem(STORAGE_CONVERSATIONS, JSON.stringify(updatedConvs));

  // If customer sent it in demo mode, schedule an automated friendly staff response!
  if (!msg.is_staff) {
    setTimeout(() => {
      const staffReply: Message = {
        id: `msg-staff-${Date.now()}`,
        conversation_id: msg.conversation_id,
        sender_id: 'staff-auto',
        sender_name: 'Alex (iVault Specialist)',
        sender_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        message_text: `Thanks for messaging us, ${msg.sender_name.split(' ')[0]}! This phone is in stock and certified. Would you like to reserve it or do you have any specific questions about warranty or condition?`,
        is_staff: true,
        created_at: new Date().toISOString(),
      };
      const refreshed: Message[] = JSON.parse(localStorage.getItem(STORAGE_MESSAGES) || '[]');
      localStorage.setItem(STORAGE_MESSAGES, JSON.stringify([...refreshed, staffReply]));
      window.dispatchEvent(new CustomEvent('ivault_message_received', { detail: staffReply }));
    }, 1800);
  }

  return newMsg;
}

// ==============================================================================
// TRADE-IN INQUIRIES APIs
// ==============================================================================

export async function submitTradeIn(inquiry: Omit<TradeInInquiry, 'id' | 'created_at'>): Promise<TradeInInquiry> {
  const timestamp = new Date().toISOString();
  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('trade_in_inquiries')
      .insert([{ ...inquiry, created_at: timestamp }])
      .select()
      .single();
    if (error) throw error;
    return data as TradeInInquiry;
  }

  initLocalStore();
  const all: TradeInInquiry[] = JSON.parse(localStorage.getItem(STORAGE_TRADE_INS) || '[]');
  const newInquiry: TradeInInquiry = {
    ...inquiry,
    id: `trade-${Date.now()}`,
    created_at: timestamp,
  };
  localStorage.setItem(STORAGE_TRADE_INS, JSON.stringify([newInquiry, ...all]));
  return newInquiry;
}

export async function fetchTradeIns(): Promise<TradeInInquiry[]> {
  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('trade_in_inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as TradeInInquiry[];
  }

  initLocalStore();
  const all: TradeInInquiry[] = JSON.parse(localStorage.getItem(STORAGE_TRADE_INS) || '[]');
  return all;
}
