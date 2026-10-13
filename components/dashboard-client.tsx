"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Submission, PaymentStatus } from "@/lib/types";
import { StatusBadge, ActivationBadge } from "@/components/status-badge";
import { SubmissionDrawer } from "@/components/submission-drawer";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  Download,
  CheckSquare,
  Square,
  ChevronRight,
} from "lucide-react";

type Tab = "all" | PaymentStatus | "needs_activation";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "verified", label: "Verified" },
  { id: "rejected", label: "Rejected" },
  { id: "needs_activation", label: "Needs activation" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DashboardClient({
  initialSubmissions,
}: {
  initialSubmissions: Submission[];
}) {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Realtime
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("submissions-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions" },
        (payload) => {
          const eventType = payload.eventType;
          setSubmissions((prev) => {
            if (eventType === "INSERT") {
              return [payload.new as Submission, ...prev];
            }
            if (eventType === "UPDATE") {
              return prev.map((r) =>
                r.id === (payload.new as Submission).id
                  ? (payload.new as Submission)
                  : r
              );
            }
            if (eventType === "DELETE") {
              return prev.filter((r) => r.id !== (payload.old as Submission).id);
            }
            return prev;
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => {
    let rows = submissions;

    if (activeTab === "needs_activation") {
      rows = rows.filter((r) => r.payment_status === "verified" && !r.activation_sent);
    } else if (activeTab !== "all") {
      rows = rows.filter((r) => r.payment_status === activeTab);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (r) => r.email.toLowerCase().includes(q) || r.phone.includes(q)
      );
    }

    return rows;
  }, [submissions, activeTab, search]);

  const openDrawer = useCallback((id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  }, []);

  const selectedRow = useMemo(
    () => submissions.find((r) => r.id === selectedId) ?? null,
    [submissions, selectedId]
  );

  const updateRow = useCallback((updated: Submission) => {
    setSubmissions((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
  }, []);

  // Bulk select helpers
  const allSelected =
    filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((r) => r.id)));
    }
  };
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const bulkMarkActivationSent = async () => {
    const supabase = createClient();
    const ids = [...selected].filter((id) => {
      const r = submissions.find((s) => s.id === id);
      return r?.payment_status === "verified" && !r.activation_sent;
    });
    if (ids.length === 0) return;

    const now = new Date().toISOString();
    const { data } = await supabase
      .from("submissions")
      .update({ activation_sent: true, activation_sent_at: now })
      .in("id", ids)
      .select();

    if (data) {
      setSubmissions((prev) =>
        prev.map((r) => {
          const updated = (data as Submission[]).find((d) => d.id === r.id);
          return updated ?? r;
        })
      );
    }
    setSelected(new Set());
  };

  // CSV export
  const exportCsv = () => {
    const headers = [
      "ID", "Date", "Email", "Phone", "Status", "Activation sent", "Verified at", "Notes",
    ];
    const rows = filtered.map((r) => [
      r.id,
      r.created_at,
      r.email,
      r.phone,
      r.payment_status,
      r.activation_sent ? "Yes" : "No",
      r.verified_at ?? "",
      r.notes ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proofly-submissions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const duplicateEmails = useMemo(() => {
    const counts = new Map<string, number>();
    const phones = new Map<string, number>();
    submissions.forEach((r) => {
      counts.set(r.email, (counts.get(r.email) ?? 0) + 1);
      phones.set(r.phone, (phones.get(r.phone) ?? 0) + 1);
    });
    return { emails: counts, phones };
  }, [submissions]);

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors
                ${activeTab === tab.id
                  ? "bg-proof text-white"
                  : "text-ink-muted hover:text-midnight hover:bg-mist"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
            <input
              id="submissions-search"
              type="search"
              placeholder="Search email or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 pr-3 rounded-[12px] border border-line bg-white text-[14px] text-midnight placeholder:text-ink-muted/50 outline-none focus:border-azure focus:shadow-[0_0_0_3px_#DCEBFF] transition-all w-56"
            />
          </div>
          <button
            id="export-csv-btn"
            onClick={exportCsv}
            title="Export CSV"
            className="h-9 w-9 rounded-[12px] border border-line bg-white flex items-center justify-center text-ink-muted hover:text-proof hover:border-proof transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-mist border border-sky rounded-[14px] px-4 py-2.5">
          <span className="text-[13px] font-semibold text-navy">
            {selected.size} selected
          </span>
          <button
            id="bulk-mark-sent-btn"
            onClick={bulkMarkActivationSent}
            className="text-[13px] font-semibold text-proof hover:text-navy transition-colors"
          >
            Mark activation sent
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-[13px] text-ink-muted hover:text-midnight transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-[20px] border border-mist overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <p className="text-[15px] font-semibold text-midnight">
              {search || activeTab !== "all"
                ? "No submissions match your filter."
                : "No submissions yet."}
            </p>
            <p className="text-[13px] text-ink-muted mt-1">
              {!search && activeTab === "all"
                ? "They'll show up here as soon as someone sends proof."
                : "Try a different filter or search term."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-mist">
                  <th className="w-10 px-4 py-3">
                    <button onClick={toggleAll} aria-label="Select all" id="select-all-btn">
                      {allSelected ? (
                        <CheckSquare className="w-4 h-4 text-proof" />
                      ) : (
                        <Square className="w-4 h-4 text-ink-muted" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wider text-ink-muted">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wider text-ink-muted">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wider text-ink-muted">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wider text-ink-muted">
                    Activation
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => {
                  const isDupEmail = (duplicateEmails.emails.get(row.email) ?? 0) > 1;
                  const isDupPhone = (duplicateEmails.phones.get(row.phone) ?? 0) > 1;
                  const isDup = isDupEmail || isDupPhone;

                  return (
                    <tr
                      key={row.id}
                      className={`border-t border-mist hover:bg-frost transition-colors cursor-pointer group
                        ${i === 0 ? "border-t-0" : ""}`}
                      onClick={() => openDrawer(row.id)}
                    >
                      <td className="w-10 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          aria-label={`Select row for ${row.email}`}
                          onClick={() => toggleOne(row.id)}
                        >
                          {selected.has(row.id) ? (
                            <CheckSquare className="w-4 h-4 text-proof" />
                          ) : (
                            <Square className="w-4 h-4 text-ink-muted" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-ink-muted whitespace-nowrap">
                        {formatDate(row.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="text-[15px] font-semibold text-midnight leading-snug">
                              {row.email}
                            </div>
                            <div className="text-[13px] text-ink-muted">{row.phone}</div>
                          </div>
                          {isDup && (
                            <span
                              title="Duplicate email or phone"
                              className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold bg-[#FEF3C7] text-[#8A4B08]"
                            >
                              DUP
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.payment_status} />
                      </td>
                      <td className="px-4 py-3">
                        <ActivationBadge sent={row.activation_sent} />
                      </td>
                      <td className="w-10 px-4 py-3 text-ink-muted group-hover:text-proof transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer */}
      {selectedRow && (
        <SubmissionDrawer
          submission={selectedRow}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onUpdate={updateRow}
          allSubmissions={submissions}
        />
      )}
    </>
  );
}
