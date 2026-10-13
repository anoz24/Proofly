-- ─── Proofly: full database migration ───────────────────────────────
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)

-- 1. Payment status enum
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'rejected');

-- 2. Submissions table
CREATE TABLE submissions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at         timestamptz NOT NULL DEFAULT now(),
  email              text NOT NULL,
  phone              text NOT NULL,
  screenshot_path    text NOT NULL,
  payment_status     payment_status NOT NULL DEFAULT 'pending',
  verified_at        timestamptz,
  rejection_reason   text,
  activation_sent    boolean NOT NULL DEFAULT false,
  activation_sent_at timestamptz,
  notes              text,

  -- Activation can only be marked sent when payment is verified
  CONSTRAINT activation_requires_verified
    CHECK (activation_sent = false OR payment_status = 'verified')
);

-- 3. Indexes
CREATE INDEX idx_submissions_created_at    ON submissions (created_at DESC);
CREATE INDEX idx_submissions_email         ON submissions (email);
CREATE INDEX idx_submissions_phone         ON submissions (phone);
CREATE INDEX idx_submissions_payment_status ON submissions (payment_status);

-- 4. Enable Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies — admin only (email match from JWT)
--    Replace 'anozeducate@gmail.com' if ADMIN_EMAIL ever changes.

CREATE POLICY "admin_select" ON submissions
  FOR SELECT
  USING (auth.jwt() ->> 'email' = 'anozeducate@gmail.com');

CREATE POLICY "admin_update" ON submissions
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'anozeducate@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'anozeducate@gmail.com');

-- No INSERT policy on this table — public inserts go via service-role key in the API route.
-- No DELETE policy — keep all records.
