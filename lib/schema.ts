import { z } from "zod";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const submissionSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address.")
    .transform((v) => v.toLowerCase().trim()),
  phone: z
    .string()
    .min(1, "Phone is required.")
    .regex(
      /^(\+20|0020|0)1[0-2,5]\d{8}$/,
      "Enter a valid Egyptian phone number (e.g. 01012345678)."
    )
    .transform((v) => v.replace(/^\+20|^0020/, "0")), // normalise to 01x…
  honeypot: z.string().max(0, "Bot detected.").optional(),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;

export function validateFileType(type: string): boolean {
  return ALLOWED_TYPES.includes(type);
}

export function validateFileSize(size: number): boolean {
  return size <= MAX_SIZE_BYTES;
}
