import { Logo } from "@/components/logo";
import { SubmissionForm } from "@/components/submission-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Send your payment proof — Proofly",
  description:
    "Upload a screenshot of your transfer. We'll verify it and email your activation link.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-frost flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[480px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size={40} />
        </div>

        {/* Card */}
        <div
          className="bg-white rounded-[24px] border border-mist p-8"
          style={{ boxShadow: "0 2px 16px 0 rgba(31,79,224,0.06)" }}
        >
          <h1 className="font-display font-semibold text-[28px] leading-[1.2] tracking-[-0.02em] text-midnight mb-2">
            Send your payment proof
          </h1>
          <p className="text-[16px] text-ink-muted leading-[1.55] mb-8">
            Upload a screenshot of your transfer. We&apos;ll verify it and email
            your activation link.
          </p>

          <SubmissionForm />
        </div>

        {/* Privacy line */}
        <p className="text-center text-[13px] text-ink-muted mt-5 leading-[1.4]">
          Your screenshot is only used to verify your payment.
        </p>
      </div>
    </main>
  );
}
