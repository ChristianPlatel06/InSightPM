"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { useAuth } from "@/components/AuthProvider";
import { authErrorMessage } from "@/lib/auth-errors";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nextPath = searchParams.get("next") || "/";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await logIn(email, password);
      router.replace(nextPath.startsWith("/") ? nextPath : "/");
      router.refresh();
    } catch (err: unknown) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="text-3xl font-bold text-white">Welcome back</h1>
      <p className="mt-2 text-slate-400">Log in to monitor your projects.</p>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-300">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-300">Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500"
          />
        </label>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-sky-500 px-4 py-2.5 font-medium text-white hover:bg-sky-400 disabled:opacity-60"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
        <GoogleSignInButton label="Continue with Google" />
      </form>

      <p className="mt-4 text-sm text-slate-400">
        No account?{" "}
        <Link href="/signup" className="text-sky-300 hover:text-sky-200">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-slate-400">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
