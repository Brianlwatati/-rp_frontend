"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { InventoryTabs } from "@/components/inventory/InventoryTabs";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { Warehouse, WarehouseStatus } from "@/lib/types";

const EMPTY_FORM = {
  code: "",
  name: "",
  location: "",
  status: "ACTIVE" as WarehouseStatus,
};

export default function EditWarehousePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Warehouse>(`/inventory/warehouses/${params.id}`)
      .then((warehouse) => {
        setForm({
          code: warehouse.code,
          name: warehouse.name,
          location: warehouse.location ?? "",
          status: warehouse.status,
        });
      })
      .catch(() =>
        setLoadError(
          "Couldn't load this warehouse from the ERP backend — edit and save to retry.",
        ),
      )
      .finally(() => setLoading(false));
  }, [params.id]);

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.put<Warehouse>(`/inventory/warehouses/${params.id}`, {
        code: form.code,
        name: form.name,
        location: form.location || null,
        status: form.status,
      });
      router.push("/inventory/warehouses");
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Couldn't save these changes. Check the fields and try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topbar title="Edit warehouse" description={`Warehouse #${params.id}`} />
      <InventoryTabs />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading ? (
          <p className="text-sm text-ink-500">Loading warehouse…</p>
        ) : (
          <form onSubmit={onSubmit} className="max-w-xl panel p-6 space-y-5">
            {loadError && (
              <p className="text-sm text-signal-amber bg-signal-amber/10 border border-signal-amber/30 rounded-lg px-3 py-2">
                {loadError}
              </p>
            )}

            <Field label="Code" required>
              <input
                required
                value={form.code}
                onChange={(e) => update("code", e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </Field>

            <Field label="Name" required>
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Location">
              <input
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) =>
                  update("status", e.target.value as WarehouseStatus)
                }
                className={inputClass}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </Field>

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
                href="/inventory/warehouses"
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
