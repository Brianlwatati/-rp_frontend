"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Receipt, Boxes, ClipboardList, Truck, HandCoins } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type {
  SalesOrder,
  SalesOrderStatus,
  DashboardSummary,
} from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

const STATUS_TONE: Record<
  SalesOrderStatus,
  "neutral" | "amber" | "green" | "red"
> = {
  DRAFT: "neutral",
  CONFIRMED: "amber",
  SHIPPED: "green",
  CANCELLED: "red",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<DashboardSummary>("/reporting/dashboard")
      .then(setSummary)
      .catch(() => setSummary(null));
    api
      .get<SalesOrder[]>("/sales/orders")
      .then((rows) => setOrders(rows.slice(0, 5)))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<SalesOrder>[] = [
    {
      header: "Order",
      accessor: (o) => (
        <span className="font-mono text-ink-100">{o.order_number}</span>
      ),
    },
    {
      header: "Customer",
      accessor: (o) => o.customerName ?? `Contact #${o.customer_id}`,
    },
    {
      header: "Status",
      accessor: (o) => <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge>,
    },
    {
      header: "Total",
      accessor: (o) => `${o.currency} ${Number(o.total_amount).toFixed(2)}`,
      align: "right",
    },
    {
      header: "Created",
      accessor: (o) => new Date(o.created_at).toLocaleDateString(),
    },
  ];

  return (
    <>
      <Topbar
        title={`Welcome back${user?.firstName ? `, ${user.firstName}` : ""}`}
        description="Here's what's moving across the workspace today."
      />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Sales value"
            value={
              summary
                ? `KES. ${Number(summary.salesValue).toLocaleString()}`
                : "—"
            }
            icon={HandCoins}
          />
          <StatCard
            label="Outstanding"
            value={
              summary
                ? `KES. ${Number(summary.outstandingInvoices).toLocaleString()}`
                : "—"
            }
            icon={Receipt}
            trend={
              summary && Number(summary.outstandingInvoices) > 0
                ? "down"
                : "flat"
            }
          />
          <StatCard
            label="Stock value"
            value={
              summary
                ? `KES. ${Number(summary.stockValue).toLocaleString()}`
                : "—"
            }
            icon={Boxes}
          />
          <StatCard
            label="Open orders"
            value={summary?.openOrders ?? "—"}
            icon={ClipboardList}
          />
          <StatCard
            label="Open POs"
            value={summary?.openPurchaseOrders ?? "—"}
            icon={Truck}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base font-semibold text-ink-100">
              Recent orders
            </h2>
            <Link
              href="/sales"
              className="text-sm text-signal-cyan hover:text-signal-cyan/80"
            >
              View all
            </Link>
          </div>
          <DataTable
            columns={columns}
            rows={orders}
            rowKey={(o) => String(o.id)}
            loading={loading}
          />
        </div>
      </div>
    </>
  );
}
