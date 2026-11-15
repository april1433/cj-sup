-- ==============================================================================
-- IPHONE STORE & TRADE-IN MARKETPLACE: SUPABASE DATABASE INITIALIZATION SCRIPT
-- ==============================================================================
-- Copy and paste this script directly into your Supabase Dashboard:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create User Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create iPhones Inventory Table
CREATE TABLE IF NOT EXISTS public.iphones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model TEXT NOT NULL,                  -- e.g. "iPhone 15 Pro Max"
    storage TEXT NOT NULL,                -- e.g. "256GB"
    color TEXT NOT NULL,                  -- e.g. "Natural Titanium"
    condition TEXT NOT NULL,              -- e.g. "Brand New", "Like New", "Good Condition"
    battery_health INTEGER DEFAULT 100,  -- e.g. 98 (%)
    price NUMERIC(10, 2) NOT NULL,        -- e.g. 899.00
    original_price NUMERIC(10, 2),        -- e.g. 1199.00
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    description TEXT,
    carrier_status TEXT DEFAULT 'Factory Unlocked',
    includes TEXT[] DEFAULT ARRAY['Original Box', 'USB-C Cable']::TEXT[],
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Conversations Table (1-on-1 between customer and store staff)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_name TEXT,
    customer_avatar TEXT,
    customer_email TEXT,
    subject TEXT DEFAULT 'General Inquiry',
    iphone_id UUID REFERENCES public.iphones(id) ON DELETE SET NULL, -- iPhone context if clicked "Inquire about this iPhone"
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
    last_message_text TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sender_name TEXT NOT NULL,
    sender_avatar TEXT,
    message_text TEXT NOT NULL,
    media_url TEXT,
    is_staff BOOLEAN DEFAULT false,
    read_by_recipient BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Sell / Trade-in Submissions Table
CREATE TABLE IF NOT EXISTS public.trade_in_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT,
    user_email TEXT,
    model TEXT NOT NULL,
    storage TEXT NOT NULL,
    battery_health INTEGER,
    cosmetic_condition TEXT NOT NULL,
    screen_condition TEXT NOT NULL,
    functional_issues TEXT DEFAULT 'None',
    estimated_offer_min NUMERIC(10, 2),
    estimated_offer_max NUMERIC(10, 2),
    photos TEXT[] DEFAULT ARRAY[]::TEXT[],
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'offer_sent', 'accepted', 'declined')),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iphones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_in_inquiries ENABLE ROW LEVEL SECURITY;

-- iPhones Policies (Anyone can view available phones, authenticated or not!)
CREATE POLICY "Public can view iphones"
    ON public.iphones FOR SELECT
    USING (true);

CREATE POLICY "Staff can manage iphones"
    ON public.iphones FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND (profiles.role = 'staff' OR profiles.role = 'admin')
    ));

-- Profiles Policies
CREATE POLICY "Users can view any profile basic info"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Conversations Policies
CREATE POLICY "Users can view their own conversations"
    ON public.conversations FOR SELECT
    TO authenticated
    USING (
        auth.uid() = customer_id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('staff', 'admin'))
    );

CREATE POLICY "Customers can create conversations"
    ON public.conversations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Staff or participant can update conversation"
    ON public.conversations FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = customer_id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('staff', 'admin'))
    );

-- Messages Policies
CREATE POLICY "Users can view messages in their conversations"
    ON public.messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = messages.conversation_id
            AND (
                conversations.customer_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('staff', 'admin'))
            )
        )
    );

CREATE POLICY "Users can insert messages to their conversations"
    ON public.messages FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = messages.conversation_id
            AND (
                conversations.customer_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('staff', 'admin'))
            )
        )
    );

-- Trade-In Policies
CREATE POLICY "Users can view their own trade-ins"
    ON public.trade_in_inquiries FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id OR
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('staff', 'admin'))
    );

CREATE POLICY "Users can submit trade-ins"
    ON public.trade_in_inquiries FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
        'customer'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        updated_at = NOW();
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ENABLE SUPABASE REALTIME FOR LIVE CHAT
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.iphones;

-- ==============================================================================
-- SAMPLE INITIAL INVENTORY (REALISTIC IPHONE STOCKS)
-- ==============================================================================
INSERT INTO public.iphones (model, storage, color, condition, battery_health, price, original_price, status, images, description, includes, featured)
VALUES
(
    'iPhone 18 Pro Max',
    '512GB',
    'Obsidian Titanium',
    'Brand New (Sealed)',
    100,
    1399.00,
    1499.00,
    'available',
    ARRAY['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80'],
    'Next-gen flagship with A20 Pro silicon, integrated under-display Face ID and variable aperture camera system. Factory sealed.',
    ARRAY['Sealed Box', 'Braided High-Speed USB-C Cable', '1-Year Apple Care Eligibility'],
    true
),
(
    'iPhone 18 Pro',
    '256GB',
    'Silver Titanium',
    'Brand New (Sealed)',
    100,
    1149.00,
    1249.00,
    'available',
    ARRAY['https://images.unsplash.com/photo-1695048065057-de65796a56e0?auto=format&fit=crop&w=1000&q=80'],
    'Brand new sealed unit. Compact pro powerhouse, ultra-bright 3000-nit ProMotion display.',
    ARRAY['Original Factory Box', 'Braided Cable', 'Full Warranty'],
    true
),
(
    'iPhone 17 Pro Max',
    '256GB',
    'Cosmic Blue',
    'Like New',
    100,
    1049.00,
    1199.00,
    'available',
    ARRAY['https://images.unsplash.com/photo-1695048132960-47b1c3e3e0ff?auto=format&fit=crop&w=1000&q=80'],
    'Pristine unit, 100% battery capacity. Triple 48MP fusion optics, tetraprism 5x telephoto.',
    ARRAY['Original Box', 'Fast Charging Cable', 'Screen Protector Installed'],
    true
),
(
    'iPhone 17 Air',
    '256GB',
    'Titanium Frost',
    'Like New',
    99,
    899.00,
    999.00,
    'available',
    ARRAY['https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=1000&q=80'],
    'Ultra-thin lightweight form factor. Sleekest iPhone ever made with OLED 120Hz display.',
    ARRAY['Original Box', 'USB-C Cable', 'Slim Case'],
    true
),
(
    'iPhone 16 Pro Max',
    '256GB',
    'Desert Titanium',
    'Brand New (Sealed)',
    100,
    899.00,
    1199.00,
    'available',
    ARRAY['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80'],
    'Brand new in box. Apple warranty valid for 1 year. Grade A+ pristine condition.',
    ARRAY['Sealed Box', 'USB-C Braided Cable', '1-Year Apple Care Eligibility'],
    false
),
(
    'iPhone 16 Pro',
    '128GB',
    'Natural Titanium',
    'Like New',
    100,
    949.00,
    1049.00,
    'available',
    ARRAY['https://images.unsplash.com/photo-1695048065057-de65796a56e0?auto=format&fit=crop&w=1000&q=80'],
    'Flawless condition, zero scratches. 100% battery health with only 12 charge cycles.',
    ARRAY['Original Box', 'USB-C Cable', 'Free Screen Protector Installed'],
    true
),
(
    'iPhone 15 Pro Max',
    '512GB',
    'Blue Titanium',
    'Like New',
    97,
    899.00,
    1199.00,
    'available',
    ARRAY['https://images.unsplash.com/photo-1695048132960-47b1c3e3e0ff?auto=format&fit=crop&w=1000&q=80'],
    'Massive 512GB storage. Includes original receipt, pristine camera lens, 97% battery health.',
    ARRAY['Original Box', 'Fast Charger Adapter', 'Magsafe Case'],
    true
),
(
    'iPhone 15',
    '128GB',
    'Pink',
    'Like New',
    99,
    649.00,
    799.00,
    'available',
    ARRAY['https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=1000&q=80'],
    'Beautiful pastel pink finish. Dynamic Island, 48MP main camera, 99% battery health.',
    ARRAY['Original Box', 'Charging Cable'],
    false
),
(
    'iPhone 14 Pro',
    '256GB',
    'Deep Purple',
    'Good Condition',
    91,
    619.00,
    999.00,
    'available',
    ARRAY['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1000&q=80'],
    'Signature Deep Purple. Minor wear on the stainless steel edges, flawless display glass. 91% battery health.',
    ARRAY['Charging Cable', 'Screen Protector'],
    false
),
(
    'iPhone 13',
    '128GB',
    'Midnight',
    'Good Condition',
    88,
    419.00,
    629.00,
    'available',
    ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=1000&q=80'],
    'Reliable workhorse. 88% battery health, tested and passed 30-point hardware check.',
    ARRAY['Original Box', 'Cable'],
    false
);
