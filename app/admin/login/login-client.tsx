"use client";

import { use } from "react";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";
import { Globe } from "lucide-react";

export default function LoginClient({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = use(searchParams);
  const error = params?.error;

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <main className="min-h-screen bg-frost flex flex-col items-center justify-center px-4">
      <div
        className="bg-white rounded-[24px] border border-mist p-10 w-full max-w-[400px] flex flex-col items-center gap-7"
        style={{ boxShadow: "0 2px 16px 0 rgba(31,79,224,0.06)" }}
      >
        <Logo size={40} />

        <div className="text-center">
          <h1 className="font-display font-semibold text-[22px] text-midnight tracking-[-0.02em]">
            Admin access
          </h1>
          <p className="text-[14px] text-ink-muted mt-1 leading-[1.4]">
            Sign in with your Google account to continue.
          </p>
        </div>

        {error === "not_authorized" && (
          <div className="w-full rounded-[12px] bg-[#FDE7E5] border border-[#A3231A]/20 px-4 py-3 text-[13px] text-[#A3231A] text-center leading-[1.4]">
            That account is not authorised to access the admin panel.
          </div>
        )}

        {error === "auth_failed" && (
          <div className="w-full rounded-[12px] bg-[#FDE7E5] border border-[#A3231A]/20 px-4 py-3 text-[13px] text-[#A3231A] text-center leading-[1.4]">
            Authentication failed. Please try again.
          </div>
        )}

        <button
          id="google-signin-btn"
          onClick={handleGoogleSignIn}
          className="w-full h-[52px] rounded-[14px] bg-proof text-white font-sans font-bold text-[16px]
            hover:bg-[#1A44C4] transition-colors flex items-center justify-center gap-3"
        >
          <Globe className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
