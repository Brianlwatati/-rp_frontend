"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, PackageCheck } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { ReceiptDocument, ReceiptLine } from "@/components/receipts/ReceiptDocument";
import { api, describeApiError } from "@/lib/api";
import type { PurchaseOrderWithItems, PurchaseOrderStatus } from "@/lib/types";

const STATUS_TONE: Record<PurchaseOrderStatus, "neutral" | "amber" | "cyan" | "green"> = {
  DRAFT: "neutral",
  APPROVED: "amber",
  PARTIALLY_RECEIVED: "cyan",
  RECEIVED: "green",
};

export default function PurchaseOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<PurchaseOrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    api
      .get<PurchaseOrderWithItems>(`/purchasing/orders/${params.id}`)
      .then((o) => {
        setOrder(o);
        setError(null);
      })
      .catch((err) => setError(describeApiError(err, "Couldn't load this purchase order.")))
      .finally(() => setLoading(false));
  }

  useEffect(load, [params.id]);

  async function approve() {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/purchasing/orders/${params.id}/approve`);
      load();
    } catch (err) {
      setError(describeApiError(err, "Couldn't approve this order."));
    } finally {
      setBusy(false);
    }
  }

  async function receive() {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/purchasing/orders/${params.id}/receive`, {});
      load();
    } catch (err) {
      setError(describeApiError(err, "Couldn't receive this order."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Topbar title={order ? order.po_number : "Purchase order"} description="Order detail and document." />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 no-print">
          <button
            onClick={() => router.push("/purchasing")}
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-100 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to purchasing
          </button>
          {order && (
            <div className="flex flex-wrap gap-2">
              {order.status === "DRAFT" && (
                <Button variant="secondary" disabled={busy} onClick={approve}>
                  <CheckCircle2 size={15} />
                  Approve
                </Button>
              )}
              {(order.status === "APPROVED" || order.status === "PARTIALLY_RECEIVED") && (
                <Button disabled={busy} onClick={receive}>
                  <PackageCheck size={15} />
                  Receive remaining stock
                </Button>
              )}
            </div>
          )}
        </div>

        {loading && <p className="text-sm text-ink-500">Loading order…</p>}
        {error && !order && (
          <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2 no-print max-w-2xl">
            {error}
          </p>
        )}
        {error && order && (
          <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2 no-print max-w-2xl">
            {error}
          </p>
        )}

        {order && (
          <ReceiptDocument
            docType="Purchase Order"
            docNumber={order.po_number}
            date={order.order_date}
            status={order.status}
            statusTone={STATUS_TONE[order.status]}
            partyLabel="Supplier"
            partyName={order.supplierName ?? `Contact #${order.supplier_id}`}
            currency={order.currency}
            lines={order.items.map<ReceiptLine>((item) => ({
              name: `${item.product_name} (${item.received_quantity}/${item.quantity} received)`,
              sku: item.product_sku,
              quantity: item.quantity,
              unitPrice: item.unit_cost,
              lineTotal: item.line_total,
            }))}
            totals={{
              subtotal: order.subtotal,
              tax: order.tax_amount,
              total: order.total_amount,
            }}
            notes={order.notes}
            footer={`Delivering to ${order.warehouseName ?? `warehouse #${order.warehouse_id}`}`}
          />
        )}
      </div>
    </>
  );
}
