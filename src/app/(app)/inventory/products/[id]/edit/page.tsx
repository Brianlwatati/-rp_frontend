"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { InventoryTabs } from "@/components/inventory/InventoryTabs";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { api, describeApiError } from "@/lib/api";
import type { ProductWithStock, ProductStatus } from "@/lib/types";

const EMPTY_FORM = {
  name: "",
  description: "",
  unit: "",
  category: "",
  costPrice: "",
  sellPrice: "",
  reorderLevel: "",
  status: "ACTIVE" as ProductStatus,
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [sku, setSku] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<ProductWithStock>(`/inventory/products/${params.id}`)
      .then((product) => {
        setSku(product.sku);
        setForm({
          name: product.name,
          description: product.description ?? "",
          unit: product.unit,
          category: product.category ?? "",
          costPrice: product.costPrice,
          sellPrice: product.sellPrice,
          reorderLevel: product.reorderLevel,
          status: product.status,
        });
      })
      .catch((err) =>
        setLoadError(describeApiError(err, "Couldn't load this product from the ERP backend."))
      )
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
      // PATCH /inventory/products/:id — sku is immutable, so it's not sent.
      await api.patch<ProductWithStock>(`/inventory/products/${params.id}`, {
        name: form.name,
        description: form.description || undefined,
        unit: form.unit,
        category: form.category || undefined,
        costPrice: Number(form.costPrice),
        sellPrice: Number(form.sellPrice),
        reorderLevel: Number(form.reorderLevel),
        status: form.status,
      });
      router.push("/inventory/products");
    } catch (err) {
      setError(describeApiError(err, "Couldn't save these changes. Check the fields and try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topbar title="Edit product" description={sku ? `SKU ${sku}` : `Product #${params.id}`} />
      <InventoryTabs />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading ? (
          <p className="text-sm text-ink-500">Loading product…</p>
        ) : (
          <form onSubmit={onSubmit} className="max-w-2xl panel p-6 space-y-5">
            {loadError && (
              <p className="text-sm text-signal-amber bg-signal-amber/10 border border-signal-amber/30 rounded-lg px-3 py-2">
                {loadError}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="SKU" hint="SKUs can't be changed after creation.">
                <input disabled value={sku} className={`${inputClass} font-mono`} />
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
            </div>

            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Unit" required>
                <input
                  required
                  value={form.unit}
                  onChange={(e) => update("unit", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Category">
                <input
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
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

            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value as ProductStatus)}
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
                {submitting ? "Saving…" : "Save changes"}
              </Button>
              <Link
                href="/inventory/products"
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
