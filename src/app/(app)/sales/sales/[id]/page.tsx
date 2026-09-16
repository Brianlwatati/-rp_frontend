"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Truck,
  Receipt as ReceiptIcon,
} from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import {
  ReceiptDocument,
  ReceiptLine,
} from "@/components/receipts/ReceiptDocument";
import { api, describeApiError } from "@/lib/api";
import type { SalesOrderWithItems, SalesOrderStatus } from "@/lib/types";

const STATUS_TONE: Record<
  SalesOrderStatus,
  "neutral" | "amber" | "green" | "red"
> = {
  DRAFT: "neutral",
  CONFIRMED: "amber",
  SHIPPED: "green",
  CANCELLED: "red",
};

export default function SalesOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<SalesOrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    api
      .get<SalesOrderWithItems>(`/sales/orders/${params.id}`)
      .then((o) => {
        setOrder(o);
        setLoadError(null);
      })
      .catch((err) =>
        setLoadError(describeApiError(err, "Couldn't load this order.")),
      )
      .finally(() => setLoading(false));
  }

  useEffect(load, [params.id]);

  async function confirm() {
    if (!order) return;
    setActionError(null);
    setBusy(true);
    try {
      await api.post(`/sales/orders/${order.id}/confirm`);
      await api.post(`/finance/invoices/from-order/${order.id}`);
      load();
    } catch (err) {
      setActionError(
        describeApiError(
          err,
          "Couldn't confirm this order and generate its invoice.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  async function ship() {
    if (!order) return;
    setActionError(null);
    setBusy(true);
    try {
      await api.post(`/sales/orders/${order.id}/ship`);
      load();
    } catch (err) {
      setActionError(describeApiError(err, "Couldn't ship this order."));
    } finally {
      setBusy(false);
    }
  }

  async function createInvoice() {
    if (!order) return;
    setActionError(null);
    setBusy(true);
    try {
      const invoice = await api.post<{ id: number }>(
        `/finance/invoices/from-order/${order.id}`,
      );
      router.push(`/finance/invoices/${invoice.id}`);
    } catch (err) {
      setActionError(
        describeApiError(err, "Couldn't create an invoice for this order."),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Topbar
        title={order ? order.order_number : "Sales order"}
        description="Order detail and receipt."
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 no-print">
          <Link
            href="/sales"
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-100 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to sales
          </Link>
          {order && (
            <div className="flex flex-wrap gap-2">
              {order.status === "DRAFT" && (
                <Button variant="secondary" disabled={busy} onClick={confirm}>
                  <CheckCircle2 size={15} />
                  Confirm
                </Button>
              )}
              {order.status === "CONFIRMED" && (
                <Button variant="secondary" disabled={busy} onClick={ship}>
                  <Truck size={15} />
                  Ship
                </Button>
              )}
              {order.status === "SHIPPED" && (
                <Button disabled={busy} onClick={createInvoice}>
                  <ReceiptIcon size={15} />
                  Create invoice
                </Button>
              )}
            </div>
          )}
        </div>

        {actionError && (
          <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2 no-print">
            {actionError}
          </p>
        )}

        {loading && <p className="text-sm text-ink-500">Loading order…</p>}
        {loadError && !order && (
          <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
            {loadError}
          </p>
        )}

        {order && (
          <ReceiptDocument
            docType="Sales Order"
            docNumber={order.order_number}
            date={order.created_at}
            status={order.status}
            statusTone={STATUS_TONE[order.status]}
            partyLabel="Bill to"
            partyName={order.customerName ?? `Contact #${order.customer_id}`}
            currency={order.currency}
            lines={order.items.map<ReceiptLine>((i) => ({
              name: i.product_name,
              sku: i.product_sku,
              quantity: i.quantity,
              unitPrice: i.unit_price,
              lineTotal: i.line_total,
            }))}
            totals={{
              subtotal: order.subtotal,
              discount: order.discount_amount,
              tax: order.tax_amount,
              total: order.total_amount,
            }}
            notes={order.notes}
            footer={`Fulfilled from ${order.warehouseName ?? `warehouse #${order.warehouse_id}`}`}
          />
        )}
      </div>
    </>
  );
}
