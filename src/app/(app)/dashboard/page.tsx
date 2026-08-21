"use client";

import { useEffect, useState } from "react";
import { Boxes, ClipboardList, Contact, ShieldCheck } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { Order } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

const FALLBACK_ORDERS: Order[] = [
  { id: "1", reference: "ORD-1042", customerName: "Harbor Logistics", status: "fulfilled", total: 4820, createdAt: "2026-08-14" },
  { id: "2", reference: "ORD-1041", customerName: "Northwind HR", status: "pending", total: 1290, createdAt: "2026-08-13" },
  { id: "3", reference: "ORD-1040", customerName: "Acme Retail", status: "draft", total: 640, createdAt: "2026-08-12" },
  { id: "4", reference: "ORD-1039", customerName: "Delta Freight", status: "cancelled", total: 2100, createdAt: "2026-08-10" },
];

const STATUS_TONE = {
  fulfilled: "green",
  pending: "amber",
  draft: "neutral",
  cancelled: "red",
} as const;

export default function DashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>(FALLBACK_ORDERS);

  useEffect(() => {
    api
      .get<Order[]>("/api/orders?limit=5")
      .then(setOrders)
      .catch(() => setOrders(FALLBACK_ORDERS));
  }, []);

  const columns: Column<Order>[] = [
    { header: "Reference", accessor: (o) => <span className="font-mono text-ink-100">{o.reference}</span> },
    { header: "Customer", accessor: (o) => o.customerName },
    { header: "Status", accessor: (o) => <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge> },
    { header: "Total", accessor: (o) => `$${o.total.toLocaleString()}`, align: "right" },
    { header: "Created", accessor: (o) => o.createdAt },
  ];

  return (
    <>
      <Topbar
        title={`Welcome back${user?.firstName ? `, ${user.firstName}` : ""}`}
        description="Here's what's moving across the workspace today."
      />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Open orders" value="18" delta="+3 this week" trend="up" icon={ClipboardList} />
          <StatCard label="Low stock items" value="6" delta="2 below reorder" trend="down" icon={Boxes} />
          <StatCard label="Active customers" value="142" delta="+5 this month" trend="up" icon={Contact} />
          <StatCard label="Pending access requests" value="2" delta="awaiting review" trend="flat" icon={ShieldCheck} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base font-semibold text-ink-100">Recent orders</h2>
            <a href="/orders" className="text-sm text-signal-cyan hover:text-signal-cyan/80">
              View all
            </a>
          </div>
          <DataTable columns={columns} rows={orders} rowKey={(o) => o.id} />
        </div>
      </div>
    </>
  );
}
