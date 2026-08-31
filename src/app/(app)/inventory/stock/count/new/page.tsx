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

interface StockCountResult {
  systemQuantity: number;
  countedQuantity: number;
  variance: number;
  movement: unknown | null;
}

export default function NewStockCountPage() {
  const router = useRouter();
  const { products, warehouses } = useInventoryLookups();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StockCountResult | null>(null);

  const [form, setForm] = useState({
    productId: "",
    warehouseId: "",
    countedQuantity: "",
    notes: "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      // POST /inventory/stock/count — reconciles a physical count against
      // the system quantity. The difference posts as a STOCK_COUNT
      // movement automatically; no movement is created if they match.
      const res = await api.post<StockCountResult>("/inventory/stock/count", {
        productId: Number(form.productId),
        warehouseId: Number(form.warehouseId),
        countedQuantity: Number(form.countedQuantity),
        notes: form.notes || undefined,
      });
      setResult(res);
    } catch (err) {
      setError(describeApiError(err, "Couldn't record this count. Check the fields and try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topbar title="Stock count" description="Reconcile a physical count against the system quantity." />
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

          <Field label="Counted quantity" required hint="What you physically counted on hand.">
            <input
              required
              type="number"
              min="0"
              step="any"
              value={form.countedQuantity}
              onChange={(e) => update("countedQuantity", e.target.value)}
              className={`${inputClass} font-mono`}
            />
          </Field>

          <Field label="Notes" hint="Optional — defaults to a variance note if left blank.">
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

          {result && (
            <div className="rounded-lg border border-base-600 bg-base-700/30 px-3 py-2.5 text-sm space-y-1">
              <p className="text-ink-300">
                System had <span className="font-mono text-ink-100">{result.systemQuantity}</span>, you
                counted <span className="font-mono text-ink-100">{result.countedQuantity}</span>.
              </p>
              <p className={result.variance === 0 ? "text-signal-green" : "text-signal-amber"}>
                Variance: {result.variance > 0 ? "+" : ""}
                {result.variance}
                {result.variance === 0 ? " — no movement needed." : " — a STOCK_COUNT movement was recorded."}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Recording…" : "Record count"}
            </Button>
            <Link
              href="/inventory/stock"
              className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-base-700 text-ink-100 border border-base-600 hover:bg-base-700/70 transition-colors"
            >
              Back to stock
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
