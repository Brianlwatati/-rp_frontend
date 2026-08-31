"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { InventoryTabs } from "@/components/inventory/InventoryTabs";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { api, describeApiError } from "@/lib/api";
import { useInventoryLookups } from "@/lib/inventoryLookups";
import type { StockTransfer } from "@/lib/types";

export default function NewStockTransferPage() {
  const router = useRouter();
  const { products, warehouses } = useInventoryLookups();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    productId: "",
    fromWarehouseId: "",
    toWarehouseId: "",
    quantity: "",
    notes: "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.fromWarehouseId && form.fromWarehouseId === form.toWarehouseId) {
      setError("The source and destination warehouse can't be the same.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post<StockTransfer>("/inventory/stock/transfers", {
        productId: Number(form.productId),
        fromWarehouseId: Number(form.fromWarehouseId),
        toWarehouseId: Number(form.toWarehouseId),
        quantity: Number(form.quantity),
        notes: form.notes || undefined,
      });
      router.push("/inventory/stock/transfers");
    } catch (err) {
      setError(describeApiError(err, "Couldn't create this transfer. Check the fields and try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topbar title="New transfer" description="Move quantity from one warehouse to another." />
      <InventoryTabs />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form onSubmit={onSubmit} className="max-w-xl panel p-6 space-y-5">
          <Field label="Product" required>
            <select
              required
              value={form.productId}
              onChange={(e) => update("productId", e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Select a product…
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="From warehouse" required>
              <select
                required
                value={form.fromWarehouseId}
                onChange={(e) => update("fromWarehouseId", e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>
                  Select…
                </option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="To warehouse" required>
              <select
                required
                value={form.toWarehouseId}
                onChange={(e) => update("toWarehouseId", e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>
                  Select…
                </option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Quantity" required>
            <input
              required
              type="number"
              min="0.01"
              step="any"
              value={form.quantity}
              onChange={(e) => update("quantity", e.target.value)}
              placeholder="10"
              className={`${inputClass} font-mono`}
            />
          </Field>

          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={2}
              className={inputClass}
            />
          </Field>

          {error && (
            <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create transfer"}
            </Button>
            <Link
              href="/inventory/stock/transfers"
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
