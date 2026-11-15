# iVault — Certified Apple iPhone Buy, Sell & Real-Time Chat Marketplace

A high-performance, Apple-aesthetic marketplace application built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Supabase (PostgreSQL + Realtime + OAuth)**. 

Designed following the **Linux Foundation `agent-spec`** design engineering standards (Apple fluid motion guidelines and anti-slop visual architecture), optimized for instant zero-config deployment to **Netlify** and **Hostinger**.

---

## 📱 User Workflow & Architecture

```
[ Public Visitors (No Login Required) ]
  ├── Freely browse in-stock iPhones (Actual photos, genuine battery health %, storage, pricing)
  ├── Filter by Series (iPhone 16, 15, 14, 13), Condition (Brand New, Like New), or Search keywords
  ├── Test instant cash trade-in values via the Interactive Sell Calculator
  └── Inspect 30-Point hardware diagnostic reports

[ User Action: "Message to Buy" OR "Sell My iPhone" ]
  │
  ├── 🔒 Gated Action: Must sign in with Google or Facebook
  │
  ▼
[ Social Authentication (OAuth 2.0 via Supabase) ]
  ├── 1-Click Google (Gmail) Login
  └── 1-Click Facebook (Meta) Login

[ Direct 1-on-1 Real-Time Chat ]
  ├── Customer talks directly to Store Owner / Staff
  ├── Inquiring about a phone automatically attaches the device card to the chat
  ├── Submitting a trade-in automatically attaches battery health, condition notes & quote
  └── Real-time message synchronization with instant feedback
```

---

## 🛠️ Project Structure

```
advance-project-capstone/
├── agent-spec/             # Linux Foundation Agentic AI standard & design specifications
├── dist/                   # Production build ready for Netlify / Hostinger
├── public/
│   └── .htaccess           # Apache / LiteSpeed SPA rewrite rules for Hostinger
├── src/
│   ├── components/
│   │   ├── AuthModal.tsx             # Google & Facebook OAuth login modal
│   │   ├── ChatDrawer.tsx            # Live 1-on-1 customer-staff messaging window
│   │   ├── EnvGuideModal.tsx         # In-app interactive Supabase & hosting guide
│   │   ├── Footer.tsx                # Brand guarantees & legal disclaimers
│   │   ├── Hero.tsx                  # Premium Apple-inspired hero section
│   │   ├── IPhoneCard.tsx            # Inventory card with battery % & specs
│   │   ├── IPhoneDetailsModal.tsx    # Full hardware diagnostic & photo gallery
│   │   ├── Navbar.tsx                # Apple glass navigation with live indicators
│   │   ├── StaffDashboardModal.tsx   # Staff Portal: Inventory CRUD & Chat Inbox
│   │   └── TradeInCalculatorModal.tsx# Interactive instant trade-in cash estimator
│   ├── data/
│   │   └── mockData.ts               # Certified inventory seed & trade-in algorithm
│   ├── lib/
│   │   └── supabase.ts               # Supabase client, OAuth, Realtime & Demo fallback
│   ├── types/
│   │   └── index.ts                  # TypeScript interfaces for iPhones, Chats, Trades
│   ├── App.tsx                       # Main application shell
│   ├── index.css                     # Tailwind CSS v4 & Apple glassmorphism
│   └── main.tsx                      # Application bootstrap
├── .env.example            # Template for Supabase URL, Anon Key & Admin emails
├── netlify.toml            # Automated build & clean SPA redirect rules for Netlify
├── package.json            # Dependencies & build scripts
├── SUPABASE_SETUP.sql      # Single-click PostgreSQL schema, RLS policies & demo seed
└── vite.config.ts          # Vite bundler configuration with @tailwindcss/vite
```

---

## ⚡ Quick Start (Local Development)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

> **Note on Demo Mode:** The application includes a smart **Local Fallback Mode**. You can browse phones, test the Google / Facebook login modal, run trade-in calculations, and test live chat simulation immediately even before plugging in your live Supabase keys!

---

## 🗄️ Supabase Database & Social Auth Setup

### Step 1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. Go to **Project Settings → API** and copy your:
   - **Project URL**
   - **anon public API key**

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_ADMIN_EMAILS=your-email@gmail.com
```
*(Emails listed in `VITE_ADMIN_EMAILS` automatically receive Staff/Owner management permissions).*

### Step 3: Run Database Schema
1. In your Supabase dashboard, open the **SQL Editor**.
2. Click **New query**, paste the full contents of [`SUPABASE_SETUP.sql`](./SUPABASE_SETUP.sql), and click **Run**.
3. This creates:
   - `profiles` table with automatic signup triggers
   - `iphones` table with Row Level Security (RLS)
   - `conversations` & `messages` tables with **Realtime WebSockets** enabled
   - `trade_in_inquiries` table
   - Pre-seeded iPhone inventory stock (iPhone 16 Pro Max, 16 Pro, 15 Pro Max, 15, 14 Pro, 13)

### Step 4: Enable Google & Facebook Providers
In Supabase dashboard, go to **Authentication → Providers**:
- **Google**: Enable the toggle and provide your **Client ID** & **Client Secret** from the [Google Cloud Console](https://console.cloud.google.com). Set the redirect URL provided by Supabase.
- **Facebook**: Enable the toggle and provide your **App ID** & **App Secret** from [Meta for Developers](https://developers.facebook.com).

---

## 🚀 Deployment Guide: Netlify + Hostinger

### Option 1: Deploy to Netlify
1. Push your repository to GitHub / GitLab.
2. In Netlify, click **Add new site → Import an existing project**.
3. Select your repository. Netlify will automatically detect [`netlify.toml`](./netlify.toml):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Under **Site configuration → Environment variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_EMAILS`
5. Click **Deploy**. Netlify provides an instant SSL-secured URL.

### Option 2: Deploy to Hostinger Web Hosting
1. Build the production bundle locally:
   ```bash
   npm run build
   ```
2. Open your Hostinger **hPanel** → **File Manager** (or connect via FTP).
3. Navigate to the `public_html/` folder of your domain.
4. Upload all files from your local `dist/` directory into `public_html/`.
5. The included [`public/.htaccess`](./public/.htaccess) handles all URL rewrites for Single Page Application (SPA) routing on Hostinger's Apache/LiteSpeed web servers.

### Option 3: Hostinger Domain with Netlify
If you bought your custom domain on Hostinger (e.g., `myiphonestore.com`) and want to host on Netlify:
1. In Hostinger DNS zone, add a **CNAME record** pointing `www` to your Netlify site domain (e.g., `your-site.netlify.app`).
2. Add an **A record** pointing `@` to Netlify's load balancer IP (`75.2.60.5`).
