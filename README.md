# Proofly

> **Payments, proven.**  
> A clean, minimal, and secure payment proof verification platform.

Proofly streamlines manual payment workflows (bank transfers, Instapay, mobile wallets, etc.) by providing customers with a frictionless submission form and giving administrators an intuitive dashboard to verify transfers and manage service activations.

---

## ✨ Features

### Customer Experience
- **Frictionless Submission:** Mobile-optimized, single-step form for customer email, phone, and payment transfer details.
- **Drag-and-Drop Proof Upload:** Fast image upload with instant preview and client-side validation.
- **Privacy-First:** Customer screenshots are stored privately in encrypted cloud storage and are only accessible by authorized administrators.

### Admin Dashboard (`/admin`)
- **Restricted Access:** Hardened Google OAuth authentication restricted strictly to the designated `ADMIN_EMAIL`.
- **Real-Time Overview:** Metric cards for **Pending**, **Verified**, **Rejected**, and **Needs Activation**.
- **Interactive Review Drawer:** Slide-over detail drawer to inspect payment screenshots with zoom/full-size preview, update verification status, record rejection reasons, and toggle activation status.
- **One-Click Actions:** Copy customer emails, filter submissions by status, and quickly process high volumes of manual orders.

---

## 🛠 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Cache Components, Partial Prefetching)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Auth, Storage)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.18+ or 20+
- A [Supabase](https://supabase.com/) project

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/anoz24/Proofly.git
cd Proofly
npm install
```

### 3. Environment Variables

Create a local environment file by copying `.env.example`:

```bash
cp .env.example .env.local
```

Fill in the required values in `.env.local`:

```env
# Supabase API (Found in Supabase Dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase Service Role Key (SERVER-SIDE ONLY - never expose to the client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Admin Email (The only Google account allowed into /admin)
ADMIN_EMAIL=your-admin-email@example.com
```

### 4. Database Setup

Apply the SQL migrations located in `supabase/migrations/` in the Supabase SQL Editor:

1. **`supabase/migrations/001_initial.sql`**: Creates the `submissions` table, enums, indexes, and Row Level Security (RLS) policies.
2. **`supabase/migrations/002_storage.sql`**: Sets up the private `screenshots` storage bucket and access policies.

### 5. Google OAuth Configuration

In your Supabase Dashboard:
1. Navigate to **Authentication** → **Providers** → **Google**.
2. Enable Google provider and input your Google OAuth Client ID and Secret from the Google Cloud Console.
3. Add `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback` to your Google Cloud Console Authorized redirect URIs.
4. Add `http://localhost:3000/auth/callback` to Supabase **Redirect URLs**.

### 6. Run Development Server

```bash
npm run dev
```

Visit:
- **Customer Form:** [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 📁 Project Structure

```text
Proofly/
├── app/
│   ├── (dashboard)/            # Route group for authenticated admin dashboard
│   │   ├── layout.tsx          # Admin shell & authorization guard
│   │   ├── page.tsx            # Dashboard metrics & submissions list
│   │   └── sign-out-button.tsx # Admin logout button
│   ├── admin/
│   │   └── login/              # Admin login page (Google OAuth)
│   ├── api/
│   │   └── submit/             # Public payment submission endpoint
│   ├── auth/
│   │   └── callback/           # OAuth redirect handler
│   ├── layout.tsx              # Root HTML & font layout
│   └── page.tsx                # Customer payment proof upload page
├── components/                 # Reusable UI components (form, drawer, tiles, badges)
├── lib/
│   ├── supabase/               # Supabase browser, server, and service client factories
│   └── types.ts                # TypeScript domain models
├── proxy.ts                    # Edge middleware protecting /admin routes
└── supabase/
    └── migrations/             # SQL database schema and storage RLS
```

---

## 🔒 Security

- **Server-Side Verification:** Proof uploads run through a server-side route handler with the `SUPABASE_SERVICE_ROLE_KEY`, keeping storage permissions locked down from public browsers.
- **Row-Level Security (RLS):** Supabase database tables and storage buckets reject non-admin access.
- **Edge Route Protection:** `proxy.ts` guards the `/admin` path at the edge, silently redirecting unauthorized attempts to `/admin/login`.

---

## 📦 Production Build

To test and create a production build:

```bash
npm run build
npm run start
```
