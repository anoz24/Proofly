import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/logo";
import Link from "next/link";
import type { ReactNode } from "react";
import SignOutButton from "./sign-out-button";

export const instant = false;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-frost">
      {/* Top nav */}
      <header className="bg-white border-b border-mist sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/admin" className="flex items-center">
            <Logo size={28} />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-ink-muted hidden sm:block">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
