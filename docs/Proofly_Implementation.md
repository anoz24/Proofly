# Proofly: Implementation Plan

> **For the coding agent:** build exactly what this file describes. Read `proofly-brand.md` first and use its tokens, fonts, logo and copy for every screen. Work phase by phase (section 9), and run the QA checklist (section 10) before calling anything done. Don't add features that aren't listed here.

## 1. What Proofly is
A small app for collecting and verifying payment proof for subscriptions I sell.

- **Public page `/`**: a form with phone, email and a payment screenshot upload.
- **Admin dashboard `/admin`**: Google login restricted to **anozeducate@gmail.com**. View every submission, view the screenshot, verify or reject the payment, and track whether the activation email has been sent.

Brand: **Proofly**, tagline "Payments, proven." Cool, minimal, blues. See `proofly-brand.md`.

## 2. Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | One project for both pages and the server logic. Deploys to Vercel with zero config. |
| UI | Tailwind CSS (v4) + shadcn/ui, themed with Proofly tokens | Fast, clean forms, tables and dialogs. |
| Fonts | Sora + Manrope via `next/font/google` | Brand typefaces. |
| Backend | **Supabase** (Postgres, Storage, Auth) | Database, private file storage and Google OAuth in one place. |
| Hosting | **Vercel** | Preview deploys, env vars, free tier is enough. |
| Validation | Zod | One schema for client and server. |
| Email (optional, phase 6) | Resend | Only if I later want activation emails sent from the app. |

Why Next.js and not a plain React SPA: the public form uploads to a **private** bucket without exposing credentials. A server route handler can hold the Supabase service-role key. A pure SPA cannot.

## 3. Architecture

```
Public user ──> POST /api/submit (Next route handler, service-role key)
                  ├─ validate (zod), honeypot, rate limit
                  ├─ upload to private bucket  `screenshots/{emailLocal}_{phone}.ext`
                  └─ insert row into `submissions`

Me ──> /admin ──> Supabase Google OAuth ──> middleware checks email == ADMIN_EMAIL
                  └─ reads rows via RLS (admin-only) + signed URLs for screenshots
```

## 4. Data model

**Table `submissions`**

| Column | Type | Notes |
|---|---|---|
| id | uuid PK, default `gen_random_uuid()` | |
| created_at | timestamptz, default `now()` | |
| email | text, not null | Lowercased, trimmed. |
| phone | text, not null | Normalized (digits, optional leading +). |
| screenshot_path | text, not null | Storage object path. |
| payment_status | enum `pending / verified / rejected`, default `pending` | |
| verified_at | timestamptz null | |
| rejection_reason | text null | |
| activation_sent | boolean, default false | |
| activation_sent_at | timestamptz null | |
| notes | text null | My private notes (plan, amount, etc.). |

Constraint: `check (activation_sent = false or payment_status = 'verified')`. Activation can't be marked sent unless the payment is verified.
Indexes: `created_at desc`, `email`, `phone`, `payment_status`.

**Storage bucket `screenshots`**: **private**. Only the admin can read, through signed URLs (60 s expiry).

## 5. Security

1. **Admin lock, three layers**
   - Supabase Auth with the Google provider.
   - `middleware.ts` on `/admin/*` (except `/admin/login`): no session, or `session.user.email !== process.env.ADMIN_EMAIL`, redirects to `/admin/login`. A non-matching user is signed out and sees "Not authorized".
   - **RLS** on `submissions` and `storage.objects`: SELECT and UPDATE allowed only when `auth.jwt() ->> 'email' = 'anozeducate@gmail.com'`. Anonymous users get **no** direct table or storage access. The public form writes only through the server route.
2. **Service-role key** lives only in Vercel env vars. Never in client code, never prefixed `NEXT_PUBLIC_`.
3. **Upload hardening** (server-side): only `image/png`, `image/jpeg`, `image/webp`; check magic bytes, not just the extension; max 5 MB; sanitize the filename.
4. **Spam protection**: hidden honeypot field plus a simple per-IP rate limit (Upstash Ratelimit, or a check of recent submissions by email and phone).
5. **Duplicates**: if the same email or phone already has a `pending` submission, still accept it but flag it in the dashboard.

## 6. Screenshot naming rule

Path = `{emailLocal}_{phone}.{ext}`

- `emailLocal` = part before `@`, lowercased, anything outside `[a-z0-9._-]` replaced with `-`.
- `phone` = digits only.
- Example: `ahmed.ali@gmail.com` + `01012345678` becomes `ahmed.ali_01012345678.png`.
- **Collision** (same person resubmits): never overwrite. Append `-2`, `-3`, and so on, so every proof is kept.

## 7. Pages

All visuals, copy, colors and components come from `proofly-brand.md`.

### 7.1 Public page `/`
- Centered white card (max width 480 px) on a Frost background, logo at the top.
- Heading **Send your payment proof**, subtitle and button copy as in the brand guide.
- Fields: **Phone**, **Email**, **Screenshot** (dropzone with image preview, "Replace" after selecting).
- Client validation (Zod): email format, phone format (Egyptian numbers: `01xxxxxxxxx` or `+20...`), file type and size.
- Loading state on submit, then a success screen (copy in brand guide). Clear error messages for each failure (too large, wrong type, network).
- Privacy line under the form.
- Mobile-first, 52 px controls, 16 px input text.

### 7.2 Admin login `/admin/login`
- Logo, one **Sign in with Google** button. Non-allowed accounts see "Not authorized".

### 7.3 Dashboard `/admin`
- **Stats row**: Pending, Verified, Rejected, Needs activation (highlighted tile).
- **Table** (newest first): date, email, phone, payment badge, activation badge, thumbnail.
- **Filters and search**: tabs All / Pending / Verified / Rejected / Needs activation; search by email or phone; date range.
- **Row detail drawer**:
  - Full-size screenshot via signed URL, with zoom and open in new tab.
  - Buttons: **Verify**, **Reject** (optional reason), **Mark activation sent** (enabled only when verified), **Undo**.
  - Copy buttons for email and phone, plus **Open WhatsApp** (`https://wa.me/{phone}`).
  - **Compose email** button: opens a `mailto:` with a prefilled subject and body where I paste the activation link.
  - Notes field (autosaves).
  - Duplicate warning when the same email or phone appears elsewhere.
- **Bulk actions**: select several rows and mark activation sent.
- **CSV export** of the current filtered view.
- **Realtime** updates (Supabase Realtime) so new submissions appear without a refresh.
- Works on mobile.

## 8. Project structure

```
app/
  layout.tsx                # fonts, metadata
  globals.css               # Tailwind + Proofly tokens
  icon.svg                  # Proofly mark (favicon)
  page.tsx                  # public form
  api/submit/route.ts       # validate, upload, insert (service role)
  admin/
    layout.tsx              # guard + shell
    page.tsx                # dashboard
    login/page.tsx
  auth/callback/route.ts    # OAuth code exchange
components/
  logo.tsx                  # LogoMark + Logo (from brand guide)
  submission-form.tsx
  submissions-table.tsx
  submission-drawer.tsx
  status-badge.tsx
  stat-tile.tsx
lib/
  supabase/{client,server,admin}.ts
  schema.ts                 # zod
  filename.ts               # sanitize + collision logic
middleware.ts               # admin guard
supabase/migrations/        # SQL: table, enum, RLS, bucket policies
```

## 9. Build phases

**Phase 0: Setup (about 30 min)**
1. Create the Supabase project. Create a GitHub repo named `proofly` and a Vercel project from it.
2. `npx create-next-app@latest proofly` (TypeScript, Tailwind, App Router). Add `@supabase/ssr`, `@supabase/supabase-js`, `zod`, shadcn/ui.
3. Apply the Proofly theme: tokens in `globals.css`, fonts in `layout.tsx`, `components/logo.tsx`, `app/icon.svg` (all in `proofly-brand.md` section 7).
4. Env vars (local `.env.local` and Vercel): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL=anozeducate@gmail.com`.

**Phase 1: Database and storage (about 30 min)**
1. Migration: enum, `submissions` table, check constraint, indexes.
2. Enable RLS. Admin-only SELECT and UPDATE policies (JWT email match).
3. Create the private `screenshots` bucket with an admin-only read policy.

**Phase 2: Public form (about 1.5 h)**
1. Build the form UI per brand guide and the Zod schema.
2. Build `/api/submit`: validate, check magic bytes, build filename, upload, insert. Roll back the upload if the insert fails.
3. Add honeypot and rate limiting. Test on mobile.

**Phase 3: Admin auth (about 1 h)**
1. Google Cloud Console: create a Web OAuth client. Redirect URI = `https://<project>.supabase.co/auth/v1/callback`.
2. Supabase Auth, Providers: enable Google with the client ID and secret. Add the Vercel domain and `http://localhost:3000` to the redirect allowlist.
3. Login page, `/auth/callback`, and `middleware.ts` with the email check. Test with a second Google account and confirm it is rejected.

**Phase 4: Dashboard (about 3 h)**
1. Table with server-side fetch, filters, search and stats.
2. Drawer with signed-URL screenshot and the verify, reject and activation actions.
3. Notes, duplicate flags, WhatsApp and mailto helpers.
4. Realtime, bulk actions and CSV export.

**Phase 5: Deploy and harden (about 1 h)**
1. Push to GitHub, import into Vercel, set env vars.
2. Update the Supabase Auth site URL and redirects to the production domain.
3. Run the QA checklist. Optionally add a custom domain.

**Phase 6 (optional, later): automated activation email**
- Add Resend. A "Send activation email" button runs a server action that emails the link and sets `activation_sent = true` and `activation_sent_at`.
- Store a per-submission `activation_link` column, or use a template with a placeholder.

## 10. QA checklist
- [ ] Valid submit creates a row and a file named `{local}_{phone}.ext`.
- [ ] Invalid email or phone, wrong file type, or a file over 5 MB is rejected with the brand-guide error copy.
- [ ] A non-image file renamed to `.png` is rejected (magic-byte check).
- [ ] Same person resubmitting produces `-2` and does not overwrite the first file.
- [ ] Anonymous access to `submissions` or the bucket with the Supabase anon key fails.
- [ ] A different Google account cannot open `/admin` and cannot read data via the API.
- [ ] Verify, reject and undo update status correctly. "Activation sent" is blocked unless verified.
- [ ] Signed URLs expire. The screenshot is not reachable by a plain public URL.
- [ ] Public form and dashboard both work at 390 px width.
- [ ] Contrast rules from the brand guide hold (no white text on Azure).

## 11. Optional: admin on a subdomain

`admin.<project>.vercel.app` isn't possible on the free `vercel.app` domain. Keep `/admin` for now. If I buy a domain later:
1. Add both `yourdomain.com` and `admin.yourdomain.com` to the same Vercel project.
2. In `middleware.ts`, rewrite requests whose host starts with `admin.` to `/admin/*`, and block `/admin` on the root host.
3. Add `https://admin.yourdomain.com/auth/callback` to the Supabase redirect allowlist and the Google OAuth client.

## 12. Notes
- The admin email is **anozeducate@gmail.com** (an earlier message had a `gmaill` typo). It's one env var plus the RLS policy, so it's easy to change.
- Payment verification is manual: I check the screenshot against my bank or wallet app. Optionally add `amount` and `payment_method` fields to the form later.
- The form stores phone numbers and emails, so keep the privacy line on the form.