"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      id="sign-out-btn"
      onClick={handleSignOut}
      className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted hover:text-midnight transition-colors"
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:block">Sign out</span>
    </button>
  );
}
