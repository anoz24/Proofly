import type { Metadata } from "next";
import { Suspense } from "react";
import LoginClient from "./login-client";

export const metadata: Metadata = {
  title: "Sign in — Proofly Admin",
  description: "Admin login for Proofly.",
};

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <LoginClient searchParams={searchParams} />
    </Suspense>
  );
}

