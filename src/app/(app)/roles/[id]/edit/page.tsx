"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { api, describeApiError } from "@/lib/api";
import type { ErpRole } from "@/lib/types";

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [code, setCode] = useState("");
  const [form, setForm] = useState({ name: "", status: "ACTIVE" as "ACTIVE" | "INACTIVE", isDefault: false });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<ErpRole>(`/roles/${params.id}`)
      .then((role) => {
        setCode(role.code);
        setForm({ name: role.name, status: role.status, isDefault: role.isDefault });
      })
      .catch((err) => setLoadError(describeApiError(err, "Couldn't load this role.")))
      .finally(() => setLoading(false));
  }, [params.id]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // PATCH /roles/:id — code is immutable, so it's not sent.
      await api.patch<ErpRole>(`/roles/${params.id}`, {
        name: form.name,
        status: form.status,
        isDefault: form.isDefault,
      });
      router.push("/roles");
    } catch (err) {
      setError(describeApiError(err, "Couldn't save these changes."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topbar title="Edit role" description={code ? `Code ${code}` : `Role #${params.id}`} />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading ? (
          <p className="text-sm text-ink-500">Loading role…</p>
        ) : (
          <form onSubmit={onSubmit} className="max-w-xl panel p-6 space-y-5">
            {loadError && (
              <p className="text-sm text-signal-amber bg-signal-amber/10 border border-signal-amber/30 rounded-lg px-3 py-2">
                {loadError}
              </p>
            )}

            <Field label="Code" hint="Codes can't be changed after creation.">
              <input disabled value={code} className={`${inputClass} font-mono`} />
            </Field>

            <Field label="Name" required>
              <input
                required
                minLength={2}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value as "ACTIVE" | "INACTIVE")}
                className={inputClass}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
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
                {submitting ? "Saving…" : "Save changes"}
              </Button>
              <Link
                href="/roles"
                className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-base-700 text-ink-100 border border-base-600 hover:bg-base-700/70 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
