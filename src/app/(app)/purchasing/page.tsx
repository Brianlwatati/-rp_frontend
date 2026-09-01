"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, CheckCircle2, PackageCheck } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { api, describeApiError } from "@/lib/api";
import type { PurchaseOrder, PurchaseOrderStatus } from "@/lib/types";

const FALLBACK_ORDERS: PurchaseOrder[] = [
  { id: 1, ias_company_id: 2, po_number: "PO-1001", supplier_id: 2, warehouse_id: 1, status: "DRAFT", order_date: "2026-08-10T00:00:00.000Z", expected_date: null, currency: "KES", subtotal: "12000.00", tax_amount: "0.00", total_amount: "12000.00", notes: null, created_by: 1, created_at: "2026-08-10T00:00:00.000Z", updated_at: "2026-08-10T00:00:00.000Z", supplierName: "Nairobi Steel Co.", warehouseName: "Nairobi Central" },
];

const STATUS_TONE: Record<PurchaseOrderStatus, "neutral" | "amber" | "cyan" | "green"> = {
  DRAFT: "neutral",
  APPROVED: "amber",
  PARTIALLY_RECEIVED: "cyan",
  RECEIVED: "green",
};

export default function PurchasingPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(FALLBACK_ORDERS);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    api
      .get<PurchaseOrder[]>("/purchasing/orders")
      .then(setOrders)
      .catch(() => setOrders(FALLBACK_ORDERS));
  }

  useEffect(load, []);

  async function approve(id: number) {
    setActionError(null);
    setBusyId(id);
    try {
      await api.post(`/purchasing/orders/${id}/approve`);
      load();
    } catch (err) {
      setActionError(describeApiError(err, "Couldn't approve this order."));
    } finally {
      setBusyId(null);
    }
  }

  async function receive(id: number) {
    setActionError(null);
    setBusyId(id);
    try {
      // No items in the body = receive everything still outstanding.
      await api.post(`/purchasing/orders/${id}/receive`, {});
      load();
    } catch (err) {
      setActionError(describeApiError(err, "Couldn't receive this order."));
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<PurchaseOrder>[] = [
    {
      header: "PO",
      accessor: (o) => (
        <Link href={`/purchasing/${o.id}`} className="font-mono text-ink-100 hover:text-signal-cyan">
          {o.po_number}
        </Link>
      ),
    },
    { header: "Supplier", accessor: (o) => o.supplierName ?? `Contact #${o.supplier_id}` },
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
              onClick={() => approve(o.id)}
              className="inline-flex items-center gap-1.5 text-signal-cyan hover:text-signal-cyan/80 text-xs disabled:opacity-50"
            >
              <CheckCircle2 size={13} />
              Approve
            </button>
          )}
          {(o.status === "APPROVED" || o.status === "PARTIALLY_RECEIVED") && (
            <button
              disabled={busyId === o.id}
              onClick={() => receive(o.id)}
              className="inline-flex items-center gap-1.5 text-signal-green hover:text-signal-green/80 text-xs disabled:opacity-50"
            >
              <PackageCheck size={13} />
              Receive
            </button>
          )}
        </div>
      ),
      align: "right",
      width: "160px",
    },
  ];

  return (
    <>
      <Topbar title="Purchasing" description="Draft → approved → received, restocking your warehouses." />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {actionError && (
          <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
            {actionError}
          </p>
        )}
        <div className="flex justify-end">
          <Link
            href="/purchasing/new"
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-signal-cyan text-base-950 hover:bg-signal-cyan/90 transition-colors"
          >
            <Plus size={15} />
            New purchase order
          </Link>
        </div>
        <DataTable columns={columns} rows={orders} rowKey={(o) => String(o.id)} />
      </div>
    </>
  );
}
