export type PaymentStatus = "pending" | "verified" | "rejected";

export interface Submission {
  id: string;
  created_at: string;
  email: string;
  phone: string;
  screenshot_path: string;
  payment_status: PaymentStatus;
  verified_at: string | null;
  rejection_reason: string | null;
  activation_sent: boolean;
  activation_sent_at: string | null;
  notes: string | null;
}
