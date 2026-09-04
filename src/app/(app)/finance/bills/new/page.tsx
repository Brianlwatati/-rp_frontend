"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { FinanceTabs } from "@/components/finance/FinanceTabs";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { api, describeApiError } from "@/lib/api";
import type { PurchaseOrder, SupplierBill } from "@/lib/types";

export default function NewSupplierBillPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [orderId, setOrderId] = useState(searchParams.get("orderId") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SupplierBill | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get<PurchaseOrder[]>("/purchasing/orders")
      .then((items) =>
        setOrders(items.filter((item) => item.status === "RECEIVED")),
      )
      .catch(() => setOrders([]));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      const bill = await api.post<SupplierBill>(
        `/finance/supplier-bills/from-order/${orderId}`,
      );
      router.push(`/finance/bills/${bill.id}`);
    } catch (err) {
      setError(describeApiError(err, "Could not create this supplier bill."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topbar
        title="Create supplier bill"
        description="Generate a supplier bill from a received purchase order."
      />
      <FinanceTabs />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form onSubmit={onSubmit} className="max-w-2xl panel p-6 space-y-5">
          <Field label="Received purchase order" required>
            <select
              required
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Select a purchase order...
              </option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.po_number} -{" "}
                  {order.supplierName ?? `#${order.supplier_id}`}{" "}
                  {order.total_amount}
                </option>
              ))}
            </select>
          </Field>

          {error && (
            <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {result && (
            <div className="rounded-lg border border-signal-green/30 bg-signal-green/10 px-4 py-3 text-sm">
              <p className="flex items-center gap-2 text-signal-green font-medium">
                <CheckCircle2 size={15} /> Supplier bill created
              </p>
              <p className="text-ink-300">
                Reference{" "}
                <span className="font-mono text-ink-100">
                  {result.bill_number}
                </span>
              </p>
              <Link
                href="/finance/payables"
                className="text-signal-cyan text-xs"
              >
                View updated payables
              </Link>
            </div>
          )}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Generate supplier bill"}
            </Button>
            <Link
              href="/finance/payables"
              className="inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-medium bg-base-700 text-ink-100 border border-base-600"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
