"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { InventoryTabs } from "@/components/inventory/InventoryTabs";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { Product, ProductStatus } from "@/lib/types";

export default function NewProductPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    sku: "",
    name: "",
    description: "",
    unit: "",
    category: "",
    costPrice: "",
    sellPrice: "",
    reorderLevel: "0",
    status: "ACTIVE" as ProductStatus,
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
      await api.post<Product>("/inventory/products", {
        sku: form.sku,
        name: form.name,
        description: form.description || null,
        unit: form.unit,
        category: form.category || null,
        costPrice: Number(form.costPrice),
        sellPrice: Number(form.sellPrice),
        reorderLevel: Number(form.reorderLevel),
        status: form.status,
      });
      router.push("/inventory/products");
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Couldn't create the product. Check the fields and try again.";
      setError(message);
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
            <Field label="SKU" required>
              <input
                required
                value={form.sku}
                onChange={(e) => update("sku", e.target.value)}
                placeholder="SKU-2201"
                className={`${inputClass} font-mono`}
              />
            </Field>
            <Field label="Name" required>
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Steel Shelving Unit"
                className={inputClass}
              />
            </Field>
          </div>

          <Field
            label="Description"
            hint="Optional — shown on the product detail view."
          >
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Unit" required hint="e.g. unit, roll, kg">
              <input
                required
                value={form.unit}
                onChange={(e) => update("unit", e.target.value)}
                placeholder="unit"
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
                inputMode="decimal"
                type="number"
                value={form.costPrice}
                onChange={(e) => update("costPrice", e.target.value)}
                placeholder="42.00"
                className={`${inputClass} font-mono`}
              />
            </Field>
            <Field label="Sell price" required>
              <input
                required
                inputMode="decimal"
                type="number"
                value={form.sellPrice}
                onChange={(e) => update("sellPrice", e.target.value)}
                placeholder="62.00"
                className={`${inputClass} font-mono`}
              />
            </Field>
            <Field label="Reorder level" required>
              <input
                required
                inputMode="numeric"
                type="number"
                value={form.reorderLevel}
                onChange={(e) => update("reorderLevel", e.target.value)}
                placeholder="20"
                className={`${inputClass} font-mono`}
              />
            </Field>
          </div>

          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) =>
                update("status", e.target.value as ProductStatus)
              }
              className={inputClass}
            >
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </Field>

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
