"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { InventoryTabs } from "@/components/inventory/InventoryTabs";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useInventoryLookups } from "@/lib/inventoryLookups";
import type { StockMovement, StockMovementReason } from "@/lib/types";

const REASONS: StockMovementReason[] = [
  "RECEIVE",
  "SALE",
  "ADJUSTMENT",
  "TRANSFER_IN",
  "TRANSFER_OUT",
  "STOCK_COUNT",
];

export default function NewStockMovementPage() {
  const router = useRouter();
  const { products, warehouses } = useInventoryLookups();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    productId: "",
    warehouseId: "",
    reason: "RECEIVE" as StockMovementReason,
    quantityDelta: "",
    unitCost: "",
    notes: "",
  });

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
      await api.post<StockMovement>("/inventory/stock/adjust", {
        productId: Number(form.productId),
        warehouseId: Number(form.warehouseId),
        reason: form.reason,
        quantityDelta: Number(form.quantityDelta),
        unitCost: Number(form.unitCost) || null,
        notes: form.notes || null,
      });
      router.push("/inventory/stock/movements");
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Couldn't record this movement. Check the fields and try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topbar
        title="Record movement"
        description="Adjust a product's quantity in a warehouse."
      />
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

          <Field label="Warehouse" required>
            <select
              required
              value={form.warehouseId}
              onChange={(e) => update("warehouseId", e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Select a warehouse…
              </option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Reason" required>
            <select
              required
              value={form.reason}
              onChange={(e) =>
                update("reason", e.target.value as StockMovementReason)
              }
              className={inputClass}
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field
              label="Quantity change"
              required
              hint="Positive to add stock, negative to remove it."
            >
              <input
                required
                inputMode="decimal"
                value={form.quantityDelta}
                type="number"
                onChange={(e) => update("quantityDelta", e.target.value)}
                placeholder="e.g. 20 or -6"
                className={`${inputClass} font-mono`}
              />
            </Field>
            <Field
              label="Unit cost"
              hint="Optional — used for RECEIVE movements."
            >
              <input
                inputMode="decimal"
                value={form.unitCost}
                type="number"
                onChange={(e) => update("unitCost", e.target.value)}
                placeholder="42.00"
                className={`${inputClass} font-mono`}
              />
            </Field>
          </div>

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
              {submitting ? "Recording…" : "Record movement"}
            </Button>
            <Link
              href="/inventory/stock/movements"
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
