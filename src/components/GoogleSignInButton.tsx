"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { authErrorMessage } from "@/lib/auth-errors";

export default function GoogleSignInButton({ label }: { label: string }) {
  const { logInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onClick() {
    setError("");
    setLoading(true);
    try {
      await logInWithGoogle();
    } catch (err: unknown) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-60"
      >
        <span className="text-base">G</span>
        {loading ? "Connecting…" : label}
      </button>
      {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
