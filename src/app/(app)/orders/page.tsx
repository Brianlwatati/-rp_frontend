"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { Order } from "@/lib/types";

const FALLBACK_ORDERS: Order[] = [
  { id: "1", reference: "ORD-1042", customerName: "Harbor Logistics", status: "fulfilled", total: 4820, createdAt: "2026-08-14" },
  { id: "2", reference: "ORD-1041", customerName: "Northwind HR", status: "pending", total: 1290, createdAt: "2026-08-13" },
  { id: "3", reference: "ORD-1040", customerName: "Acme Retail", status: "draft", total: 640, createdAt: "2026-08-12" },
  { id: "4", reference: "ORD-1039", customerName: "Delta Freight", status: "cancelled", total: 2100, createdAt: "2026-08-10" },
  { id: "5", reference: "ORD-1038", customerName: "Acme Retail", status: "fulfilled", total: 980, createdAt: "2026-08-09" },
];

const STATUS_TONE = {
  fulfilled: "green",
  pending: "amber",
  draft: "neutral",
  cancelled: "red",
} as const;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(FALLBACK_ORDERS);

  useEffect(() => {
    api
      .get<Order[]>("/api/orders")
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
      <Topbar title="Orders" description="Every order placed across the workspace." />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex justify-end">
          <Button>
            <Plus size={15} />
            New order
          </Button>
        </div>
        <DataTable columns={columns} rows={orders} rowKey={(o) => o.id} />
      </div>
    </>
  );
}
