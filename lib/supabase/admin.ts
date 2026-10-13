import { createClient } from "@supabase/supabase-js";

/**
 * Admin/service-role client.
 * ⚠️  Only import this in server-only code (route handlers, server actions).
 *      NEVER use in client components or anywhere prefixed NEXT_PUBLIC_.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
