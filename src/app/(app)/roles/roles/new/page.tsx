"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { api, describeApiError } from "@/lib/api";
import type { ErpRole } from "@/lib/types";

export default function NewRolePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", isDefault: false });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post<ErpRole>("/roles", {
        name: form.name,
        code: form.code,
        isDefault: form.isDefault,
      });
      router.push("/roles");
    } catch (err) {
      setError(describeApiError(err, "Couldn't create the role. Check the fields and try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topbar title="New role" description="Define a role scoped to this company." />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form onSubmit={onSubmit} className="max-w-xl panel p-6 space-y-5">
          <Field label="Name" required>
            <input
              required
              minLength={2}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Warehouse Operator"
              className={inputClass}
            />
          </Field>

          <Field label="Code" required hint="Uppercase letters, numbers, and underscores only.">
            <input
              required
              pattern="[A-Z0-9_]+"
              value={form.code}
              onChange={(e) => update("code", e.target.value.toUpperCase())}
              placeholder="WH_OPERATOR"
              className={`${inputClass} font-mono`}
            />
          </Field>

          <label className="flex items-center gap-2.5 text-sm text-ink-300">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => update("isDefault", e.target.checked)}
              className="h-4 w-4 rounded border-base-600 bg-base-800 accent-signal-cyan"
            />
            Assign this role to new users by default
          </label>

          {error && (
            <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create role"}
            </Button>
            <Link
              href="/roles"
              className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-base-700 text-ink-100 border border-base-600 hover:bg-base-700/70 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
