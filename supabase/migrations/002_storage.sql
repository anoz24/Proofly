-- ─── Proofly: Storage bucket setup ──────────────────────────────────
-- Run AFTER 001_initial.sql
-- OR do this in Supabase Dashboard → Storage → New bucket

-- The Supabase JS client / dashboard is the easiest way to create the bucket.
-- These SQL commands are for reference / scripting.

-- Create the private screenshots bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- RLS on storage.objects — allow admin to SELECT (read) their own bucket objects
CREATE POLICY "admin_read_screenshots" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'screenshots'
    AND auth.jwt() ->> 'email' = 'anozeducate@gmail.com'
  );

-- Service-role key bypasses RLS, so no INSERT policy is needed for the upload route.
