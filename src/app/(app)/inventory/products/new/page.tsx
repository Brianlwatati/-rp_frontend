"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { InventoryTabs } from "@/components/inventory/InventoryTabs";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { api, describeApiError } from "@/lib/api";
import type { Product } from "@/lib/types";

export default function NewProductPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    sku: "",
    name: "",
    description: "",
    unit: "pcs",
    category: "",
    costPrice: "0",
    sellPrice: "0",
    reorderLevel: "0",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // POST /inventory/products — prices/levels are numbers on the wire,
      // even though they come back as strings (NUMERIC → string via pg).
      // No status field: new products always start ACTIVE server-side.
      await api.post<Product>("/inventory/products", {
        sku: form.sku,
        name: form.name,
        description: form.description || undefined,
        unit: form.unit,
        category: form.category || undefined,
        costPrice: Number(form.costPrice),
        sellPrice: Number(form.sellPrice),
        reorderLevel: Number(form.reorderLevel),
      });
      router.push("/inventory/products");
    } catch (err) {
      setError(describeApiError(err, "Couldn't create the product. Check the fields and try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topbar title="New product" description="Add a SKU to your catalog." />
      <InventoryTabs />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form onSubmit={onSubmit} className="max-w-2xl panel p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="SKU" required hint="Letters, numbers, - and _ only.">
              <input
                required
                pattern="[A-Za-z0-9_-]+"
                value={form.sku}
                onChange={(e) => update("sku", e.target.value)}
                placeholder="SKU-2201"
                className={`${inputClass} font-mono`}
              />
            </Field>
            <Field label="Name" required>
              <input
                required
                minLength={2}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Steel Shelving Unit"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Description" hint="Optional — shown on the product detail view.">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Unit" required hint="e.g. pcs, roll, kg">
              <input
                required
                value={form.unit}
                onChange={(e) => update("unit", e.target.value)}
                placeholder="pcs"
                className={inputClass}
              />
            </Field>
            <Field label="Category">
              <input
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                placeholder="Warehouse"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field label="Cost price" required>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.costPrice}
                onChange={(e) => update("costPrice", e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </Field>
            <Field label="Sell price" required>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.sellPrice}
                onChange={(e) => update("sellPrice", e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </Field>
            <Field label="Reorder level" required>
              <input
                required
                type="number"
                min="0"
                step="1"
                value={form.reorderLevel}
                onChange={(e) => update("reorderLevel", e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </Field>
          </div>

          {error && (
            <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create product"}
            </Button>
            <Link
              href="/inventory/products"
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
