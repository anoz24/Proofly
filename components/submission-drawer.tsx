"use client";

import { useState, useEffect, useRef } from "react";
import type { Submission } from "@/lib/types";
import { StatusBadge, ActivationBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/client";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Mail,
  ZoomIn,
  AlertTriangle,
} from "lucide-react";

interface Props {
  submission: Submission;
  open: boolean;
  onClose: () => void;
  onUpdate: (updated: Submission) => void;
  allSubmissions: Submission[];
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };
  return { copied, copy };
}

export function SubmissionDrawer({
  submission,
  open,
  onClose,
  onUpdate,
  allSubmissions,
}: Props) {
  const [row, setRow] = useState<Submission>(submission);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [notes, setNotes] = useState(submission.notes ?? "");
  const [notesSaved, setNotesSaved] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { copied, copy } = useCopy();

  // Sync when drawer re-opens for different submission
  useEffect(() => {
    setRow(submission);
    setNotes(submission.notes ?? "");
    setRejectReason("");
    setShowRejectInput(false);
    setNotesSaved(false);
  }, [submission]);

  // Fetch signed URL for screenshot
  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    supabase.storage
      .from("screenshots")
      .createSignedUrl(row.screenshot_path, 60)
      .then(({ data }) => {
        setScreenshotUrl(data?.signedUrl ?? null);
      });
  }, [open, row.screenshot_path]);

  // Auto-save notes with debounce
  useEffect(() => {
    if (notes === (row.notes ?? "")) return;
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("submissions")
        .update({ notes })
        .eq("id", row.id)
        .select()
        .single();
      if (data) {
        const updated = data as Submission;
        setRow(updated);
        onUpdate(updated);
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 2000);
      }
    }, 800);
    return () => { if (notesTimer.current) clearTimeout(notesTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  const updateStatus = async (
    status: Submission["payment_status"],
    extra: Partial<Submission> = {}
  ) => {
    setLoading(status);
    const supabase = createClient();
    const update: Partial<Submission> = {
      payment_status: status,
      ...extra,
      ...(status === "verified" ? { verified_at: new Date().toISOString() } : {}),
      ...(status === "pending" ? { verified_at: null, rejection_reason: null } : {}),
    };
    const { data } = await supabase
      .from("submissions")
      .update(update)
      .eq("id", row.id)
      .select()
      .single();
    if (data) {
      const updated = data as Submission;
      setRow(updated);
      onUpdate(updated);
    }
    setLoading(null);
    setShowRejectInput(false);
    setRejectReason("");
  };

  const markActivationSent = async () => {
    if (row.payment_status !== "verified" || row.activation_sent) return;
    setLoading("activation");
    const supabase = createClient();
    const { data } = await supabase
      .from("submissions")
      .update({
        activation_sent: true,
        activation_sent_at: new Date().toISOString(),
      })
      .eq("id", row.id)
      .select()
      .single();
    if (data) {
      const updated = data as Submission;
      setRow(updated);
      onUpdate(updated);
    }
    setLoading(null);
  };

  const undoActivation = async () => {
    setLoading("undo_activation");
    const supabase = createClient();
    const { data } = await supabase
      .from("submissions")
      .update({ activation_sent: false, activation_sent_at: null })
      .eq("id", row.id)
      .select()
      .single();
    if (data) {
      const updated = data as Submission;
      setRow(updated);
      onUpdate(updated);
    }
    setLoading(null);
  };

  // Duplicate detection
  const dupEmail = allSubmissions.filter(
    (s) => s.email === row.email && s.id !== row.id
  );
  const dupPhone = allSubmissions.filter(
    (s) => s.phone === row.phone && s.id !== row.id
  );
  const hasDuplicates = dupEmail.length > 0 || dupPhone.length > 0;

  const waPhone = row.phone.replace(/^0/, "+20");
  const mailtoLink = `mailto:${row.email}?subject=Your%20Proofly%20activation%20link&body=Hi%2C%0A%0AYour%20payment%20has%20been%20verified.%20Here%20is%20your%20activation%20link%3A%0A%0A[PASTE%20LINK%20HERE]%0A%0AThanks`;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-midnight/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex flex-col w-full sm:w-[480px] max-w-full bg-white shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-mist sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <StatusBadge status={row.payment_status} />
            <ActivationBadge sent={row.activation_sent} />
          </div>
          <button
            onClick={onClose}
            id="close-drawer-btn"
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-muted hover:text-midnight hover:bg-frost transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-6">
          {/* Duplicate warning */}
          {hasDuplicates && (
            <div className="flex items-start gap-3 rounded-[14px] bg-[#FEF3C7] border border-[#8A4B08]/20 px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-[#8A4B08] mt-0.5 shrink-0" />
              <div className="text-[13px] text-[#8A4B08] leading-[1.4]">
                <strong>Duplicate detected.</strong>
                {dupEmail.length > 0 && (
                  <span> Same email appears {dupEmail.length} other time(s).</span>
                )}
                {dupPhone.length > 0 && (
                  <span> Same phone appears {dupPhone.length} other time(s).</span>
                )}
              </div>
            </div>
          )}

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <ContactRow
              label="Email"
              value={row.email}
              onCopy={() => copy(row.email, "email")}
              copied={copied === "email"}
            />
            <ContactRow
              label="Phone"
              value={row.phone}
              onCopy={() => copy(row.phone, "phone")}
              copied={copied === "phone"}
            />
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={`https://wa.me/${waPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              id="whatsapp-link"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[13px] font-semibold bg-[#DDF5E8] text-[#0B6B43] hover:bg-[#C6EDD8] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>
            <a
              href={mailtoLink}
              id="compose-email-link"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[13px] font-semibold bg-mist text-navy hover:bg-sky/30 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              Compose email
            </a>
          </div>

          {/* Screenshot */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-navy">Screenshot</span>
              {screenshotUrl && (
                <a
                  href={screenshotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="open-screenshot-link"
                  className="inline-flex items-center gap-1 text-[13px] text-proof hover:text-navy transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open full size
                </a>
              )}
            </div>

            {screenshotUrl ? (
              <div
                className={`relative rounded-[14px] overflow-hidden border border-mist bg-frost cursor-zoom-in transition-all ${zoomed ? "cursor-zoom-out" : ""}`}
                onClick={() => setZoomed((z) => !z)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={screenshotUrl}
                  alt="Payment screenshot"
                  className={`w-full object-contain transition-all ${zoomed ? "max-h-none" : "max-h-64"}`}
                />
                {!zoomed && (
                  <div className="absolute inset-0 flex items-end justify-end p-3 pointer-events-none">
                    <div className="bg-white/90 rounded-full p-1.5">
                      <ZoomIn className="w-4 h-4 text-ink-muted" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-32 rounded-[14px] border border-mist bg-frost flex items-center justify-center text-[13px] text-ink-muted">
                Loading screenshot…
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-semibold text-navy">Actions</span>
            <div className="flex flex-wrap gap-2">
              {row.payment_status !== "verified" && (
                <ActionBtn
                  id="verify-btn"
                  onClick={() => updateStatus("verified")}
                  loading={loading === "verified"}
                  color="green"
                >
                  Verify
                </ActionBtn>
              )}
              {row.payment_status !== "rejected" && !showRejectInput && (
                <ActionBtn
                  id="reject-btn"
                  onClick={() => setShowRejectInput(true)}
                  loading={false}
                  color="red"
                >
                  Reject
                </ActionBtn>
              )}
              {row.payment_status !== "pending" && (
                <ActionBtn
                  id="undo-btn"
                  onClick={() => updateStatus("pending")}
                  loading={loading === "pending"}
                  color="muted"
                >
                  Undo
                </ActionBtn>
              )}
            </div>

            {showRejectInput && (
              <div className="flex flex-col gap-2">
                <input
                  id="rejection-reason-input"
                  type="text"
                  placeholder="Rejection reason (optional)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="h-10 rounded-[12px] border border-line bg-white px-3 text-[14px] text-midnight outline-none focus:border-azure focus:shadow-[0_0_0_3px_#DCEBFF] transition-all"
                />
                <div className="flex gap-2">
                  <ActionBtn
                    id="confirm-reject-btn"
                    onClick={() =>
                      updateStatus("rejected", {
                        rejection_reason: rejectReason || null,
                      } as Partial<Submission>)
                    }
                    loading={loading === "rejected"}
                    color="red"
                  >
                    Confirm reject
                  </ActionBtn>
                  <ActionBtn
                    id="cancel-reject-btn"
                    onClick={() => { setShowRejectInput(false); setRejectReason(""); }}
                    loading={false}
                    color="muted"
                  >
                    Cancel
                  </ActionBtn>
                </div>
              </div>
            )}

            {row.rejection_reason && (
              <p className="text-[13px] text-[#A3231A] leading-[1.4]">
                Reason: {row.rejection_reason}
              </p>
            )}

            {/* Activation */}
            <div className="border-t border-mist pt-3">
              {!row.activation_sent ? (
                <ActionBtn
                  id="mark-activation-sent-btn"
                  onClick={markActivationSent}
                  loading={loading === "activation"}
                  color="blue"
                  disabled={row.payment_status !== "verified"}
                  title={
                    row.payment_status !== "verified"
                      ? "Verify payment first"
                      : undefined
                  }
                >
                  Mark activation sent
                </ActionBtn>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-[13px] text-[#0B6B43] font-semibold flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    Activation sent
                    {row.activation_sent_at &&
                      ` · ${new Date(row.activation_sent_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`}
                  </span>
                  <button
                    id="undo-activation-btn"
                    onClick={undoActivation}
                    disabled={loading === "undo_activation"}
                    className="text-[12px] text-ink-muted hover:text-midnight transition-colors underline underline-offset-2"
                  >
                    Undo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-navy">Notes</span>
              {notesSaved && (
                <span className="text-[12px] text-[#0B6B43] flex items-center gap-1">
                  <Check className="w-3 h-3" /> Saved
                </span>
              )}
            </div>
            <textarea
              id="notes-textarea"
              placeholder="Plan, amount, anything useful…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="rounded-[14px] border border-line bg-white px-4 py-3 text-[14px] text-midnight placeholder:text-ink-muted/50 outline-none focus:border-azure focus:shadow-[0_0_0_3px_#DCEBFF] transition-all resize-none"
            />
          </div>

          {/* Meta */}
          <div className="flex flex-col gap-1 text-[12px] text-ink-muted border-t border-mist pt-4">
            <span>Submitted: {new Date(row.created_at).toLocaleString("en-GB")}</span>
            {row.verified_at && (
              <span>Verified: {new Date(row.verified_at).toLocaleString("en-GB")}</span>
            )}
            <span className="truncate">File: {row.screenshot_path}</span>
          </div>
        </div>
      </div>
    </>
  );
}

function ContactRow({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-semibold text-navy w-10 shrink-0">{label}</span>
      <span className="text-[14px] text-midnight font-medium flex-1 truncate">{value}</span>
      <button
        onClick={onCopy}
        title={`Copy ${label}`}
        className="text-ink-muted hover:text-proof transition-colors"
      >
        {copied ? (
          <Check className="w-4 h-4 text-[#0B6B43]" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

function ActionBtn({
  id,
  children,
  onClick,
  loading,
  color,
  disabled,
  title,
}: {
  id: string;
  children: React.ReactNode;
  onClick: () => void;
  loading: boolean;
  color: "green" | "red" | "blue" | "muted";
  disabled?: boolean;
  title?: string;
}) {
  const styles = {
    green: "bg-[#DDF5E8] text-[#0B6B43] hover:bg-[#C6EDD8]",
    red: "bg-[#FDE7E5] text-[#A3231A] hover:bg-[#F9D0CD]",
    blue: "bg-proof text-white hover:bg-[#1A44C4]",
    muted: "bg-frost text-ink-muted hover:bg-mist border border-line",
  };

  return (
    <button
      id={id}
      onClick={onClick}
      disabled={loading || disabled}
      title={title}
      className={`h-9 px-4 rounded-[12px] text-[13px] font-semibold transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5
        ${styles[color]}`}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
