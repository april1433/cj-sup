import { createClient } from '@supabase/supabase-js';
import { IPhone, Conversation, Message, TradeInInquiry, UserProfile } from '../types';
import { INITIAL_IPHONES } from '../data/mockData';

// Fallback directly to user's live Supabase project so all builds connect to the same central database
const DEFAULT_SUPABASE_URL = 'https://pezoektebuvmkxkvszxw.supabase.co';
const DEFAULT_ANON_KEY = 'sb_publishable_5A9Y2GJYFtzY0arZL1HkBA_ZGmMbGIV';

export const OWNER_EMAIL = 'dcjayshop@gmail.com';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

export const isConfigured = Boolean(supabaseUrl) && Boolean(supabaseAnonKey);

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    }) 
  : null;

export function isOwnerOrStaff(email?: string | null): boolean {
  if (!email) return false;
  return email.toLowerCase().trim() === OWNER_EMAIL.toLowerCase();
}

// ==============================================================================
// AUTHENTICATION APIs (REAL GOOGLE & FACEBOOK OAUTH VIA SUPABASE)
// ==============================================================================

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase client is not initialized.');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithFacebook() {
  if (!supabase) throw new Error('Supabase client is not initialized.');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
  }
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (!supabase) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) return null;

    const user = session.user;
    const isOwner = isOwnerOrStaff(user.email);

    return {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
      role: isOwner ? 'staff' : 'customer',
    };
  } catch (err) {
    console.error('Error fetching current user:', err);
    return null;
  }
}

// ==============================================================================
// REALTIME INVENTORY APIs
// ==============================================================================

export async function fetchIPhones(): Promise<IPhone[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('iphones')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data && data.length > 0) {
        return data as IPhone[];
      }
    } catch (err) {
      console.warn('Error fetching iphones from Supabase, loading fallback', err);
    }
  }
  return INITIAL_IPHONES;
}

export async function saveIPhone(phone: Omit<IPhone, 'id'>, id?: string): Promise<IPhone> {
  if (!supabase) throw new Error('Supabase is not configured');

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

export async function deleteIPhone(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('iphones').delete().eq('id', id);
  if (error) throw error;
}

// Realtime stock change listener
export function subscribeToIPhones(callback: () => void) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('realtime_iphones_global')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'iphones' }, () => {
      callback();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ==============================================================================
// REALTIME CHAT & CONVERSATIONS APIs
// ==============================================================================

export async function fetchConversations(user: UserProfile): Promise<Conversation[]> {
  if (!supabase) return [];
  try {
    let query = supabase.from('conversations').select('*').order('last_message_at', { ascending: false });
    // If not store owner, only fetch customer's own conversations
    if (user.role !== 'staff' && user.role !== 'admin') {
      query = query.eq('customer_id', user.id);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Conversation[];
  } catch (err) {
    console.warn('Error fetching conversations:', err);
    return [];
  }
}

export async function getOrCreateConversation(
  user: UserProfile, 
  iphone?: IPhone,
  initialSubject?: string
): Promise<Conversation> {
  if (!supabase) throw new Error('Supabase is not configured');

  const subject = initialSubject || (iphone ? `Inquiry about ${iphone.model} (${iphone.storage})` : 'General Question');

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

  // Send initial message
  await sendMessage({
    conversation_id: data.id,
    sender_id: user.id,
    sender_name: user.full_name,
    sender_avatar: user.avatar_url,
    message_text: iphone 
      ? `Hello! I'm interested in purchasing the ${iphone.model} - ${iphone.storage} (${iphone.color}) listed for ₱${iphone.price.toLocaleString()}. Is this currently available?` 
      : `Hello! I would like to inquire about buying or selling an iPhone.`,
    is_staff: isOwnerOrStaff(user.email),
  });

  return data as Conversation;
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []) as Message[];
  } catch (err) {
    console.warn('Supabase fetch messages error:', err);
    return [];
  }
}

export async function sendMessage(
  msg: Omit<Message, 'id' | 'created_at'>
): Promise<Message> {
  if (!supabase) throw new Error('Supabase not configured');
  const timestamp = new Date().toISOString();

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

export function subscribeToMessages(conversationId: string, callback: (msg: Message) => void) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`messages_room_${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as Message);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ==============================================================================
// TRADE-IN INQUIRIES APIs
// ==============================================================================

export async function submitTradeIn(inquiry: Omit<TradeInInquiry, 'id' | 'created_at'>): Promise<TradeInInquiry> {
  if (!supabase) throw new Error('Supabase not configured');
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from('trade_in_inquiries')
    .insert([{ ...inquiry, created_at: timestamp }])
    .select()
    .single();

  if (error) throw error;
  return data as TradeInInquiry;
}

export async function fetchTradeIns(): Promise<TradeInInquiry[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('trade_in_inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as TradeInInquiry[];
  } catch (err) {
    console.warn('Supabase fetch trade ins error:', err);
    return [];
  }
}
