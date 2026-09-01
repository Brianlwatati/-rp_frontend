"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { FinanceTabs } from "@/components/finance/FinanceTabs";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { api, describeApiError } from "@/lib/api";
import type { SalesOrder, Invoice } from "@/lib/types";

export default function NewInvoicePage() {
  const router = useRouter();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [orderId, setOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<SalesOrder[]>("/sales/orders").then(setOrders).catch(() => setOrders([]));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const invoice = await api.post<Invoice>(`/finance/invoices/from-order/${orderId}`);
      router.push(`/finance/invoices/${invoice.id}`);
    } catch (err) {
      setError(describeApiError(err, "Couldn't generate an invoice for this order."));
    } finally {
      setSubmitting(false);
    }
  }

  const eligible = orders.filter((o) => o.status !== "DRAFT" && o.status !== "CANCELLED");

  return (
    <>
      <Topbar title="New invoice" description="Generate the receipt for a confirmed sales order." />
      <FinanceTabs />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form onSubmit={onSubmit} className="max-w-xl panel p-6 space-y-5">
          <Field
            label="Sales order"
            required
            hint="Only CONFIRMED or SHIPPED orders without an invoice yet will succeed."
          >
            <select required value={orderId} onChange={(e) => setOrderId(e.target.value)} className={inputClass}>
              <option value="" disabled>
                Select an order…
              </option>
              {eligible.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.order_number} · {o.customerName ?? `Contact #${o.customer_id}`} · {o.currency}{" "}
                  {Number(o.total_amount).toFixed(2)}
                </option>
              ))}
            </select>
          </Field>

          {error && (
            <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Generating…" : "Generate invoice"}
            </Button>
            <Link
              href="/finance/invoices"
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
