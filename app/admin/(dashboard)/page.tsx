import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import type { Submission } from "@/lib/types";
import { StatTile } from "@/components/stat-tile";
import { DashboardClient } from "@/components/dashboard-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Proofly Admin",
};

export const instant = false;

export default async function AdminDashboardPage() {
  await connection();
  const supabase = await createClient();

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (submissions ?? []) as Submission[];

  const stats = {
    total: rows.length,
    pending: rows.filter((r) => r.payment_status === "pending").length,
    verified: rows.filter((r) => r.payment_status === "verified").length,
    rejected: rows.filter((r) => r.payment_status === "rejected").length,
    needsActivation: rows.filter(
      (r) => r.payment_status === "verified" && !r.activation_sent
    ).length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-semibold text-[28px] text-midnight tracking-[-0.02em] leading-[1.2]">
          Submissions
        </h1>
        <p className="text-[14px] text-ink-muted mt-1">
          {stats.total} total · newest first
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="Pending" value={stats.pending} />
        <StatTile label="Verified" value={stats.verified} />
        <StatTile label="Rejected" value={stats.rejected} />
        <StatTile
          label="Needs activation"
          value={stats.needsActivation}
          highlighted
        />
      </div>

      {/* Interactive dashboard */}
      <DashboardClient initialSubmissions={rows} />
    </div>
  );
}
