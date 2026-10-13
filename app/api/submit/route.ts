import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { submissionSchema } from "@/lib/schema";
import {
  buildFilename,
  checkMagicBytes,
  extFromMime,
} from "@/lib/filename";

const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

// Simple in-memory rate limit: max 5 submissions per IP in 10 minutes
const ipHits = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW = 10 * 60 * 1000;
const RATE_MAX = 5;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_MAX) return false;
  entry.count++;
  return true;
}

export async function POST(request: Request) {
  // Rate limit
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  // Honeypot
  const honeypot = formData.get("website") as string | null;
  if (honeypot && honeypot.length > 0) {
    // Silently succeed to confuse bots
    return NextResponse.json({ success: true });
  }

  // Parse + validate text fields
  const parsed = submissionSchema.safeParse({
    email: formData.get("email"),
    phone: formData.get("phone"),
    honeypot: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string;
      errors[key] = issue.message;
    }
    return NextResponse.json({ errors }, { status: 422 });
  }

  const { email, phone } = parsed.data;

  // File validation
  const file = formData.get("screenshot") as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json(
      { errors: { screenshot: "Please attach your payment screenshot." } },
      { status: 422 }
    );
  }

  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json(
      { errors: { screenshot: "Please upload a PNG, JPG or WebP image." } },
      { status: 422 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { errors: { screenshot: "That file is over 5 MB. Try a smaller screenshot." } },
      { status: 422 }
    );
  }

  // Magic-byte check
  const buffer = new Uint8Array(await file.arrayBuffer());
  const ext = extFromMime(file.type);
  if (!ext || !checkMagicBytes(buffer, ext)) {
    return NextResponse.json(
      { errors: { screenshot: "Please upload a PNG, JPG or WebP image." } },
      { status: 422 }
    );
  }

  const supabase = createAdminClient();

  // Check for existing files to avoid collision
  const { data: existingList } = await supabase.storage
    .from("screenshots")
    .list("", { search: `${email.split("@")[0]}` });

  const existingPaths = (existingList ?? []).map((f) => f.name);
  const filename = buildFilename(email, phone, ext, existingPaths);

  // Upload to private bucket
  const { error: uploadError } = await supabase.storage
    .from("screenshots")
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }

  // Insert DB row — roll back upload on failure
  const { error: insertError } = await supabase
    .from("submissions")
    .insert({
      email,
      phone,
      screenshot_path: filename,
    });

  if (insertError) {
    console.error("DB insert error:", insertError);
    // Roll back upload
    await supabase.storage.from("screenshots").remove([filename]);
    return NextResponse.json(
      { error: "Could not save your submission. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
