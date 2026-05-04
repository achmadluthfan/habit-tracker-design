"use client";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginInner() {
  const sp = useSearchParams();
  const err = sp.get("error");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    const supabase = createClient();
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback` },
    });
    setLoading(false);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">Habitly</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Sign in with Google to sync habits, flashcards, and cats to your account.
        </p>
      </div>
      {err && (
        <p className="rounded-lg border border-accent/40 bg-accent-light px-3 py-2 text-sm text-accent">
          Sign-in did not complete. Try again or continue in demo mode from the home page.
        </p>
      )}
      <button
        type="button"
        onClick={signIn}
        disabled={loading || !isSupabaseConfigured()}
        className="rounded-xl bg-accent py-3 font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-40"
      >
        {loading ? "Redirecting…" : "Continue with Google"}
      </button>
      {!isSupabaseConfigured() && (
        <p className="text-xs text-ink-muted">
          Supabase environment variables are not set in this deployment. Use demo mode on the home page.
        </p>
      )}
      <Link href="/" className="text-center text-sm font-semibold text-blue hover:underline">
        ← Back to app
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-ink-muted">Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}
