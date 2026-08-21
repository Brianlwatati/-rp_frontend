"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { InventoryTabs } from "@/components/inventory/InventoryTabs";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { Product, ProductStatus } from "@/lib/types";

const EMPTY_FORM = {
  sku: "",
  name: "",
  description: "",
  unit: "",
  category: "",
  costPrice: "",
  sellPrice: "",
  reorderLevel: "0",
  status: "ACTIVE" as ProductStatus,
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Product>(`/inventory/products/${params.id}`)
      .then((product) => {
        setForm({
          sku: product.sku,
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
      .catch(() =>
        setLoadError(
          "Couldn't load this product from the ERP backend — edit and save to retry.",
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
      await api.put<Product>(`/inventory/products/${params.id}`, {
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
          : "Couldn't save these changes. Check the fields and try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topbar title="Edit product" description={`Product #${params.id}`} />
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
              <Field label="SKU" required>
                <input
                  required
                  value={form.sku}
                  onChange={(e) => update("sku", e.target.value)}
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
                  inputMode="decimal"
                  value={form.costPrice}
                  onChange={(e) => update("costPrice", e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </Field>
              <Field label="Sell price" required>
                <input
                  required
                  inputMode="decimal"
                  value={form.sellPrice}
                  onChange={(e) => update("sellPrice", e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </Field>
              <Field label="Reorder level" required>
                <input
                  required
                  inputMode="numeric"
                  value={form.reorderLevel}
                  onChange={(e) => update("reorderLevel", e.target.value)}
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
