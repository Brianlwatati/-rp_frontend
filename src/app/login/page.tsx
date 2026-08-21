"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AccessBadge } from "@/components/login/AccessBadge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

function LoginForm() {
  const { login } = useAuth();
  const params = useSearchParams();
  const next = params.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Couldn't sign you in. Check your credentials and try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-base-950">
      {/* Left: brand / issued-credential panel. Pinned to the dark palette
          on purpose (data-theme="dark" scopes the CSS variables to this
          subtree) so the brand rail stays consistent no matter which theme
          the rest of the console is using. */}
      <div
        data-theme="dark"
        className="relative hidden lg:flex flex-col justify-between p-14 bg-base-900 overflow-hidden"
      >
        <div className="absolute inset-0 bg-grain-token opacity-40 pointer-events-none" />
        <div className="relative flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-signal-cyan/15 border border-signal-cyan/40 flex items-center justify-center">
            <span className="font-display font-bold text-signal-cyan text-sm">IA</span>
          </div>
          <span className="font-display font-semibold tracking-tight">IAS Console</span>
        </div>

        <div className="relative flex flex-col gap-8 max-w-md">
          <div>
            <p className="label-eyebrow mb-3">Identity &amp; Access Service</p>
            <h1 className="font-display text-3xl font-semibold leading-tight text-ink-100">
              One credential, every module downstream.
            </h1>
            <p className="mt-4 text-ink-300 text-sm leading-relaxed">
              Signing in issues a scoped session token. Every module in this
              console — inventory, orders, HR, access — reads the same
              credential, so permissions stay consistent across the ERP.
            </p>
          </div>
          <AccessBadge />
        </div>

        <p className="relative text-xs text-ink-500 font-mono">
          multi-tenant · role-scoped · audited
        </p>
      </div>

      {/* Right: sign-in form */}
      <div className="relative flex items-center justify-center px-5 sm:px-6 py-12 sm:py-16">
        <ThemeToggle className="absolute top-6 right-6" />
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-signal-cyan/15 border border-signal-cyan/40 flex items-center justify-center">
              <span className="font-display font-bold text-signal-cyan text-sm">IA</span>
            </div>
            <span className="font-display font-semibold tracking-tight">IAS Console</span>
          </div>

          <p className="label-eyebrow mb-2">Sign in</p>
          <h2 className="font-display text-2xl font-semibold text-ink-100 mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-ink-500 mb-8">
            Use the credentials issued for your tenant.
          </p>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-ink-300">Work email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="rounded-lg bg-base-800 border border-base-600 px-3.5 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 focus:border-signal-cyan outline-none transition-colors"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-300">Password</span>
                <a href="#" className="text-xs text-signal-cyan hover:text-signal-cyan/80">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-lg bg-base-800 border border-base-600 px-3.5 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 focus:border-signal-cyan outline-none transition-colors"
              />
            </label>

            {error && (
              <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 rounded-lg bg-signal-cyan text-base-950 font-medium text-sm py-2.5 hover:bg-signal-cyan/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Verifying…" : "Sign in"}
            </button>

            {next && (
              <p className="text-xs text-ink-500 text-center">
                You&apos;ll return to <span className="font-mono">{next}</span> after signing in.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
