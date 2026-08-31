"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { api, describeApiError } from "@/lib/api";
import { useInventoryLookups } from "@/lib/inventoryLookups";
import type { Contact, SalesOrder } from "@/lib/types";

interface ItemRow {
  productId: string;
  quantity: string;
  unitPrice: string;
}

const EMPTY_ROW: ItemRow = { productId: "", quantity: "1", unitPrice: "" };

export default function NewSalesOrderPage() {
  const router = useRouter();
  const { products, warehouses } = useInventoryLookups();
  const [customers, setCustomers] = useState<Contact[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemRow[]>([{ ...EMPTY_ROW }]);

  useEffect(() => {
    // Only CUSTOMER/BOTH contacts are valid order recipients server-side.
    api
      .get<Contact[]>("/contacts?type=CUSTOMER")
      .then(setCustomers)
      .catch(() => setCustomers([]));
  }, []);

  function updateItem(index: number, patch: Partial<ItemRow>) {
    setItems((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addItem() {
    setItems((rows) => [...rows, { ...EMPTY_ROW }]);
  }

  function removeItem(index: number) {
    setItems((rows) => (rows.length > 1 ? rows.filter((_, i) => i !== index) : rows));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post<SalesOrder>("/sales/orders", {
        customerId: Number(customerId),
        warehouseId: Number(warehouseId),
        orderNumber: orderNumber || undefined,
        notes: notes || undefined,
        items: items.map((row) => ({
          productId: Number(row.productId),
          quantity: Number(row.quantity),
          unitPrice: row.unitPrice ? Number(row.unitPrice) : undefined,
        })),
      });
      router.push("/sales");
    } catch (err) {
      setError(describeApiError(err, "Couldn't create this order. Check the fields and try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topbar title="New sales order" description="Orders start as DRAFT — confirm to reserve stock." />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form onSubmit={onSubmit} className="max-w-2xl panel p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Customer" required>
              <select
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>
                  Select a customer…
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Warehouse" required hint="Stock is reserved from here on confirm.">
              <select
                required
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
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
          </div>

          <Field label="Order number" hint="Optional — auto-generated if left blank.">
            <input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="SO-1001"
              className={`${inputClass} font-mono`}
            />
          </Field>

          <div>
            <p className="text-xs font-medium text-ink-300 mb-2">
              Items <span className="text-signal-red">*</span>
            </p>
            <div className="space-y-3">
              {items.map((row, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-2 sm:items-end">
                  <div className="flex-1">
                    <select
                      required
                      value={row.productId}
                      onChange={(e) => updateItem(i, { productId: e.target.value })}
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
                  </div>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="any"
                    value={row.quantity}
                    onChange={(e) => updateItem(i, { quantity: e.target.value })}
                    placeholder="Qty"
                    className={`${inputClass} font-mono w-full sm:w-24`}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.unitPrice}
                    onChange={(e) => updateItem(i, { unitPrice: e.target.value })}
                    placeholder="Unit price"
                    className={`${inputClass} font-mono w-full sm:w-32`}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    disabled={items.length === 1}
                    className="shrink-0 rounded-lg border border-base-600 bg-base-800 p-2.5 text-ink-500 hover:text-signal-red disabled:opacity-40 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addItem}
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-signal-cyan hover:text-signal-cyan/80"
            >
              <Plus size={14} />
              Add item
            </button>
          </div>

          <Field label="Notes">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} />
          </Field>

          {error && (
            <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create order"}
            </Button>
            <Link
              href="/sales"
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
