"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, CheckCircle2, Truck } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { api, describeApiError } from "@/lib/api";
import type { SalesOrder, SalesOrderStatus } from "@/lib/types";

const FALLBACK_ORDERS: SalesOrder[] = [
  { id: 1, ias_company_id: 2, order_number: "SO-1001", customer_id: 1, warehouse_id: 1, status: "DRAFT", currency: "USD", subtotal: "620.00", discount_amount: "0.00", tax_amount: "0.00", total_amount: "620.00", notes: null, created_by: 1, created_at: "2026-08-14T09:00:00.000Z", updated_at: "2026-08-14T09:00:00.000Z", customerName: "Harbor Logistics", warehouseName: "Nairobi Central" },
];

const STATUS_TONE: Record<SalesOrderStatus, "neutral" | "amber" | "green" | "red"> = {
  DRAFT: "neutral",
  CONFIRMED: "amber",
  SHIPPED: "green",
  CANCELLED: "red",
};

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>(FALLBACK_ORDERS);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    api
      .get<SalesOrder[]>("/sales/orders")
      .then(setOrders)
      .catch(() => setOrders(FALLBACK_ORDERS));
  }

  useEffect(load, []);

  async function confirm(id: number) {
    setActionError(null);
    setBusyId(id);
    try {
      await api.post(`/sales/orders/${id}/confirm`);
      load();
    } catch (err) {
      setActionError(describeApiError(err, "Couldn't confirm this order."));
    } finally {
      setBusyId(null);
    }
  }

  async function ship(id: number) {
    setActionError(null);
    setBusyId(id);
    try {
      await api.post(`/sales/orders/${id}/ship`);
      load();
    } catch (err) {
      setActionError(describeApiError(err, "Couldn't ship this order."));
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<SalesOrder>[] = [
    { header: "Order", accessor: (o) => <span className="font-mono text-ink-100">{o.order_number}</span> },
    { header: "Customer", accessor: (o) => o.customerName ?? `Contact #${o.customer_id}` },
    { header: "Warehouse", accessor: (o) => o.warehouseName ?? `Warehouse #${o.warehouse_id}` },
    { header: "Status", accessor: (o) => <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge> },
    {
      header: "Total",
      accessor: (o) => `${o.currency} ${Number(o.total_amount).toFixed(2)}`,
      align: "right",
    },
    {
      header: "",
      accessor: (o) => (
        <div className="flex items-center justify-end gap-3">
          {o.status === "DRAFT" && (
            <button
              disabled={busyId === o.id}
              onClick={() => confirm(o.id)}
              className="inline-flex items-center gap-1.5 text-signal-cyan hover:text-signal-cyan/80 text-xs disabled:opacity-50"
            >
              <CheckCircle2 size={13} />
              Confirm
            </button>
          )}
          {o.status === "CONFIRMED" && (
            <button
              disabled={busyId === o.id}
              onClick={() => ship(o.id)}
              className="inline-flex items-center gap-1.5 text-signal-green hover:text-signal-green/80 text-xs disabled:opacity-50"
            >
              <Truck size={13} />
              Ship
            </button>
          )}
        </div>
      ),
      align: "right",
      width: "120px",
    },
  ];

  return (
    <>
      <Topbar title="Sales orders" description="Draft → confirmed → shipped, backed by reserved stock." />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {actionError && (
          <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
            {actionError}
          </p>
        )}
        <div className="flex justify-end">
          <Link
            href="/sales/new"
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-signal-cyan text-base-950 hover:bg-signal-cyan/90 transition-colors"
          >
            <Plus size={15} />
            New order
          </Link>
        </div>
        <DataTable columns={columns} rows={orders} rowKey={(o) => String(o.id)} />
      </div>
    </>
  );
}
