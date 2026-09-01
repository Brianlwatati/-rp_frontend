"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DollarSign, Receipt, Boxes, ClipboardList, Truck } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { SalesOrder, SalesOrderStatus, DashboardSummary } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

const FALLBACK_SUMMARY: DashboardSummary = {
  salesValue: "6110.00",
  outstandingInvoices: "320.00",
  stockValue: "4272.00",
  openOrders: "2",
  openPurchaseOrders: "1",
};

const FALLBACK_ORDERS: SalesOrder[] = [
  { id: 1, ias_company_id: 2, order_number: "SO-1042", customer_id: 1, warehouse_id: 1, status: "SHIPPED", currency: "USD", subtotal: "4820.00", discount_amount: "0.00", tax_amount: "0.00", total_amount: "4820.00", notes: null, created_by: 1, created_at: "2026-08-14T00:00:00.000Z", updated_at: "2026-08-14T00:00:00.000Z", customerName: "Harbor Logistics", warehouseName: "Nairobi Central" },
  { id: 2, ias_company_id: 2, order_number: "SO-1041", customer_id: 2, warehouse_id: 1, status: "CONFIRMED", currency: "USD", subtotal: "1290.00", discount_amount: "0.00", tax_amount: "0.00", total_amount: "1290.00", notes: null, created_by: 1, created_at: "2026-08-13T00:00:00.000Z", updated_at: "2026-08-13T00:00:00.000Z", customerName: "Northwind Contacts", warehouseName: "Nairobi Central" },
];

const STATUS_TONE: Record<SalesOrderStatus, "neutral" | "amber" | "green" | "red"> = {
  DRAFT: "neutral",
  CONFIRMED: "amber",
  SHIPPED: "green",
  CANCELLED: "red",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary>(FALLBACK_SUMMARY);
  const [orders, setOrders] = useState<SalesOrder[]>(FALLBACK_ORDERS);

  useEffect(() => {
    api
      .get<DashboardSummary>("/reporting/dashboard")
      .then(setSummary)
      .catch(() => setSummary(FALLBACK_SUMMARY));
    api
      .get<SalesOrder[]>("/sales/orders")
      .then((rows) => setOrders(rows.slice(0, 5)))
      .catch(() => setOrders(FALLBACK_ORDERS));
  }, []);

  const columns: Column<SalesOrder>[] = [
    { header: "Order", accessor: (o) => <span className="font-mono text-ink-100">{o.order_number}</span> },
    { header: "Customer", accessor: (o) => o.customerName ?? `Contact #${o.customer_id}` },
    { header: "Status", accessor: (o) => <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge> },
    {
      header: "Total",
      accessor: (o) => `${o.currency} ${Number(o.total_amount).toFixed(2)}`,
      align: "right",
    },
    { header: "Created", accessor: (o) => new Date(o.created_at).toLocaleDateString() },
  ];

  return (
    <>
      <Topbar
        title={`Welcome back${user?.firstName ? `, ${user.firstName}` : ""}`}
        description="Here's what's moving across the workspace today."
      />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Sales value" value={`$${Number(summary.salesValue).toLocaleString()}`} icon={DollarSign} />
          <StatCard
            label="Outstanding"
            value={`$${Number(summary.outstandingInvoices).toLocaleString()}`}
            icon={Receipt}
            trend={Number(summary.outstandingInvoices) > 0 ? "down" : "flat"}
          />
          <StatCard label="Stock value" value={`$${Number(summary.stockValue).toLocaleString()}`} icon={Boxes} />
          <StatCard label="Open orders" value={summary.openOrders} icon={ClipboardList} />
          <StatCard label="Open POs" value={summary.openPurchaseOrders} icon={Truck} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base font-semibold text-ink-100">Recent orders</h2>
            <Link href="/sales" className="text-sm text-signal-cyan hover:text-signal-cyan/80">
              View all
            </Link>
          </div>
          <DataTable columns={columns} rows={orders} rowKey={(o) => String(o.id)} />
        </div>
      </div>
    </>
  );
}
