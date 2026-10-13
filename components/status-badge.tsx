import type { PaymentStatus } from "@/lib/types";

const statusConfig: Record<
  PaymentStatus,
  { label: string; fg: string; bg: string }
> = {
  pending: { label: "Pending", fg: "#8A4B08", bg: "#FEF3C7" },
  verified: { label: "Verified", fg: "#0B6B43", bg: "#DDF5E8" },
  rejected: { label: "Rejected", fg: "#A3231A", bg: "#FDE7E5" },
};

export function StatusBadge({ status }: { status: PaymentStatus }) {
  const { label, fg, bg } = statusConfig[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-[13px] font-bold leading-none"
      style={{ color: fg, backgroundColor: bg }}
    >
      {label}
    </span>
  );
}

export function ActivationBadge({ sent }: { sent: boolean }) {
  if (sent) {
    return (
      <span
        className="inline-flex items-center rounded-full px-3 py-1 text-[13px] font-bold leading-none"
        style={{ color: "#14307A", backgroundColor: "#DCEBFF" }}
      >
        Sent
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-[13px] font-bold leading-none border"
      style={{
        color: "#3C4A6B",
        backgroundColor: "#F4F8FF",
        borderColor: "#C9DDF8",
        borderWidth: "1.5px",
      }}
    >
      Not sent
    </span>
  );
}
