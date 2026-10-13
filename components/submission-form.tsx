"use client";

import { useRef, useState, useCallback } from "react";
import { z } from "zod";
import { CheckCircle, Upload, X, ImageIcon } from "lucide-react";

// ─── Client-side validation schema ──────────────────────────────────
const clientSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Please enter a valid email address."),
  phone: z
    .string()
    .min(1, "Phone is required.")
    .regex(
      /^(\+20|0020|0)1[0-2,5]\d{8}$/,
      "Enter a valid Egyptian phone number (e.g. 01012345678)."
    ),
});

type FieldErrors = Partial<Record<"email" | "phone" | "screenshot" | "form", string>>;

export function SubmissionForm() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    const ALLOWED = ["image/png", "image/jpeg", "image/webp"];
    if (!ALLOWED.includes(f.type)) {
      setErrors((e) => ({ ...e, screenshot: "Please upload a PNG, JPG or WebP image." }));
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setErrors((e) => ({ ...e, screenshot: "That file is over 5 MB. Try a smaller screenshot." }));
      return;
    }
    setErrors((e) => ({ ...e, screenshot: undefined }));
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client validation
    const result = clientSchema.safeParse({ email, phone });
    const newErrors: FieldErrors = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        newErrors[key] = issue.message;
      }
    }
    if (!file) {
      newErrors.screenshot = "Please attach your payment screenshot.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("screenshot", file!);
    formData.append("website", ""); // honeypot

    try {
      const res = await fetch("/api/submit", { method: "POST", body: formData });
      const body = await res.json();

      if (!res.ok) {
        if (body.errors) {
          setErrors(body.errors);
        } else {
          setErrors({ form: body.error ?? "Something went wrong. Please try again." });
        }
        return;
      }
      setSuccess(true);
    } catch {
      setErrors({ form: "Network error. Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-5 py-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#DDF5E8] flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-[#0B6B43]" />
        </div>
        <div>
          <p className="font-display font-semibold text-[20px] text-midnight leading-snug">
            Received.
          </p>
          <p className="text-[15px] text-ink-muted mt-1 leading-[1.55]">
            We&apos;ll verify your payment and email your activation link soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Honeypot — hidden from humans */}
      <input
        type="text"
        name="website"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {/* Phone */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="phone"
          className="text-[14px] font-semibold text-navy leading-[1.4]"
        >
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="01012345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={`h-[52px] rounded-[14px] border bg-white px-4 text-[16px] text-midnight placeholder:text-line outline-none transition-all
            ${errors.phone
              ? "border-[#A3231A] focus:ring-0"
              : "border-line focus:border-azure focus:shadow-[0_0_0_4px_#DCEBFF]"
            }`}
        />
        {errors.phone && (
          <p className="text-[13px] text-[#A3231A] leading-[1.4]">{errors.phone}</p>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-[14px] font-semibold text-navy leading-[1.4]"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`h-[52px] rounded-[14px] border bg-white px-4 text-[16px] text-midnight placeholder:text-line outline-none transition-all
            ${errors.email
              ? "border-[#A3231A] focus:ring-0"
              : "border-line focus:border-azure focus:shadow-[0_0_0_4px_#DCEBFF]"
            }`}
        />
        {errors.email && (
          <p className="text-[13px] text-[#A3231A] leading-[1.4]">{errors.email}</p>
        )}
      </div>

      {/* Screenshot dropzone */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[14px] font-semibold text-navy leading-[1.4]">
          Screenshot
        </label>

        {preview && file ? (
          <div className="relative rounded-[18px] overflow-hidden border border-mist bg-frost">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Payment screenshot preview"
              className="w-full max-h-48 object-contain"
            />
            <div className="flex items-center justify-between px-4 py-2 bg-white border-t border-mist">
              <span className="text-[13px] text-ink-muted truncate max-w-[200px]">
                {file.name}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[13px] font-semibold text-proof hover:text-navy transition-colors"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="text-ink-muted hover:text-midnight transition-colors"
                  aria-label="Remove screenshot"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            id="screenshot-dropzone"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`h-32 rounded-[18px] border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all cursor-pointer
              ${dragging ? "border-proof bg-mist" : "border-sky bg-frost hover:border-proof hover:bg-mist"}
              ${errors.screenshot ? "border-[#A3231A]" : ""}`}
          >
            {dragging ? (
              <Upload className="w-6 h-6 text-proof" />
            ) : (
              <ImageIcon className="w-6 h-6 text-proof" />
            )}
            <span className="text-[14px] font-bold text-proof">
              Tap to upload screenshot
            </span>
            <span className="text-[13px] text-ink-muted">
              PNG, JPG or WebP · up to 5 MB
            </span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />

        {errors.screenshot && (
          <p className="text-[13px] text-[#A3231A] leading-[1.4]">{errors.screenshot}</p>
        )}
      </div>

      {/* Global form error */}
      {errors.form && (
        <p className="text-[13px] text-[#A3231A] leading-[1.4] -mt-1">{errors.form}</p>
      )}

      <button
        id="submit-proof-btn"
        type="submit"
        disabled={loading}
        className="mt-1 h-[52px] rounded-[14px] bg-proof text-white font-sans font-bold text-[16px]
          hover:bg-[#1A44C4] disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit proof"
        )}
      </button>
    </form>
  );
}
