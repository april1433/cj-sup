-- ==============================================================================
-- IPHONE STORE & TRADE-IN MARKETPLACE: SUPABASE DATABASE INITIALIZATION SCRIPT
-- ==============================================================================
-- Copy and paste this script directly into your Supabase Dashboard:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- (This script is 100% IDEMPOTENT: you can re-run it anytime without errors!)
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
    model TEXT NOT NULL,                  -- e.g. "iPhone 18 Pro Max"
    storage TEXT NOT NULL,                -- e.g. "512GB"
    color TEXT NOT NULL,                  -- e.g. "Obsidian Titanium"
    condition TEXT NOT NULL,              -- e.g. "Brand New (Sealed)", "Like New", "Good Condition"
    battery_health INTEGER DEFAULT 100,  -- e.g. 100 (%)
    price NUMERIC(10, 2) NOT NULL,        -- e.g. 92990.00
    original_price NUMERIC(10, 2),        -- e.g. 99990.00
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    description TEXT,
    carrier_status TEXT DEFAULT 'Factory Unlocked (Openline)',
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
    iphone_id UUID REFERENCES public.iphones(id) ON DELETE SET NULL,
    iphone_preview JSONB,
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
-- ROW LEVEL SECURITY (RLS) POLICIES & PERMISSIONS
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iphones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_in_inquiries ENABLE ROW LEVEL SECURITY;

-- Grant permissions to public anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 1. iPhones Policies
DROP POLICY IF EXISTS "Allow public read iphones" ON public.iphones;
CREATE POLICY "Allow public read iphones"
    ON public.iphones FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow write iphones" ON public.iphones;
CREATE POLICY "Allow write iphones"
    ON public.iphones FOR ALL
    USING (true)
    WITH CHECK (true);

-- 2. Profiles Policies
DROP POLICY IF EXISTS "Allow public profiles read" ON public.profiles;
CREATE POLICY "Allow public profiles read"
    ON public.profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow profiles manage" ON public.profiles;
CREATE POLICY "Allow profiles manage"
    ON public.profiles FOR ALL
    USING (true)
    WITH CHECK (true);

-- 3. Conversations Policies
DROP POLICY IF EXISTS "Allow conversations read" ON public.conversations;
CREATE POLICY "Allow conversations read"
    ON public.conversations FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow conversations write" ON public.conversations;
CREATE POLICY "Allow conversations write"
    ON public.conversations FOR ALL
    USING (true)
    WITH CHECK (true);

-- 4. Messages Policies
DROP POLICY IF EXISTS "Allow messages read" ON public.messages;
CREATE POLICY "Allow messages read"
    ON public.messages FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow messages write" ON public.messages;
CREATE POLICY "Allow messages write"
    ON public.messages FOR ALL
    USING (true)
    WITH CHECK (true);

-- 5. Trade-In Inquiries Policies
DROP POLICY IF EXISTS "Allow trade-ins read" ON public.trade_in_inquiries;
CREATE POLICY "Allow trade-ins read"
    ON public.trade_in_inquiries FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow trade-ins write" ON public.trade_in_inquiries;
CREATE POLICY "Allow trade-ins write"
    ON public.trade_in_inquiries FOR ALL
    USING (true)
    WITH CHECK (true);

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
-- SAFE REALTIME REGISTRATION (NEVER THROWS ERROR 42710)
-- ==============================================================================
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.iphones;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;

-- ==============================================================================
-- SAMPLE INITIAL INVENTORY (REALISTIC IPHONE STOCKS IN PHILIPPINE PESOS - PHP)
-- ==============================================================================
-- Clean up existing demo records so re-running never produces duplicates
DELETE FROM public.iphones WHERE model IN (
    'iPhone 18 Pro Max', 'iPhone 18 Pro', 'iPhone 17 Pro Max', 'iPhone 17 Air',
    'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 15 Pro Max', 'iPhone 15',
    'iPhone 14 Pro', 'iPhone 13'
);

INSERT INTO public.iphones (model, storage, color, condition, battery_health, price, original_price, status, images, description, includes, featured)
VALUES
(
    'iPhone 18 Pro Max',
    '512GB',
    'Obsidian Titanium',
    'Brand New (Sealed)',
    100,
    92990.00,
    99990.00,
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
    79990.00,
    85990.00,
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
    71990.00,
    81990.00,
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
    56990.00,
    64990.00,
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
    54990.00,
    84990.00,
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
    46990.00,
    69990.00,
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
    42990.00,
    64990.00,
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
    34990.00,
    49990.00,
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
    31990.00,
    58990.00,
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
    21990.00,
    36990.00,
    'available',
    ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=1000&q=80'],
    'Reliable workhorse. 88% battery health, tested and passed 30-point hardware check.',
    ARRAY['Original Box', 'Cable'],
    false
);
