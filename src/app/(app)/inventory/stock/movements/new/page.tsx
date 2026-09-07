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
import type { StockMovement } from "@/lib/types";

// POST /inventory/stock/adjust only accepts these three reasons — TRANSFER_IN/
// TRANSFER_OUT and STOCK_COUNT are generated automatically by the transfer
// and stock-count endpoints instead, so they aren't offered here.
const REASONS = ["RECEIVE", "SALE", "ADJUSTMENT"] as const;
type AdjustReason = (typeof REASONS)[number];

export default function NewStockMovementPage() {
  const router = useRouter();
  const { products, warehouses } = useInventoryLookups();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    productId: "",
    warehouseId: "",
    reason: "RECEIVE" as AdjustReason,
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

    const quantityDelta = Number(form.quantityDelta);
    if (quantityDelta === 0) {
      setError("Quantity change can't be 0.");
      return;
    }
    if (form.reason === "RECEIVE" && !form.unitCost) {
      setError(
        "Unit cost is required for RECEIVE — it drives the weighted-average cost.",
      );
      return;
    }

    setSubmitting(true);
    try {
      await api.post<StockMovement>("/inventory/stock/adjust", {
        productId: Number(form.productId),
        warehouseId: Number(form.warehouseId),
        reason: form.reason,
        quantityDelta,
        unitCost: form.unitCost ? Number(form.unitCost) : undefined,
        notes: form.notes || undefined,
      });
      router.push("/inventory/stock/movements");
    } catch (err) {
      setError(
        describeApiError(
          err,
          "Couldn't record this movement. Check the fields and try again.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topbar
        title="Record movement"
        description="Receive stock, record a sale, or make an adjustment."
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
              onChange={(e) => update("reason", e.target.value as AdjustReason)}
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
              hint="Positive to add stock, negative to remove it. Can't be 0."
            >
              <input
                required
                type="number"
                step="any"
                value={form.quantityDelta}
                onChange={(e) => update("quantityDelta", e.target.value)}
                placeholder="e.g. 20 or -6"
                className={`${inputClass} font-mono`}
              />
            </Field>
            <Field
              label="Unit cost"
              required={form.reason === "RECEIVE"}
              hint={
                form.reason === "RECEIVE"
                  ? "Required — drives the weighted-average cost."
                  : "Ignored for SALE/ADJUSTMENT."
              }
            >
              <input
                type="number"
                min="0"
                step="0.01"
                disabled={form.reason !== "RECEIVE"}
                value={form.unitCost}
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
