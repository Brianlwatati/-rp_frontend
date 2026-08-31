"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { InventoryTabs } from "@/components/inventory/InventoryTabs";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { useInventoryLookups } from "@/lib/inventoryLookups";
import type { StockTransfer } from "@/lib/types";

const FALLBACK_TRANSFERS: StockTransfer[] = [
  { id: 1, iasCompanyId: 2, productId: 1, fromWarehouseId: 1, toWarehouseId: 2, quantity: "10", status: "COMPLETED", createdBy: 1, createdAt: "2026-08-09T10:00:00.000Z", productSku: "SKU-2201", productName: "Steel Shelving Unit", fromWarehouseName: "Nairobi Central", toWarehouseName: "Mombasa Port" },
];

export default function StockTransfersPage() {
  const { productLabel, warehouseLabel } = useInventoryLookups();
  const [transfers, setTransfers] = useState<StockTransfer[]>(FALLBACK_TRANSFERS);

  useEffect(() => {
    api
      .get<StockTransfer[]>("/inventory/stock/transfers")
      .then(setTransfers)
      .catch(() => setTransfers(FALLBACK_TRANSFERS));
  }, []);

  const columns: Column<StockTransfer>[] = [
    {
      header: "Date",
      accessor: (t) => new Date(t.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" }),
    },
    {
      header: "Product",
      accessor: (t) => (t.productSku ? `${t.productSku} · ${t.productName}` : productLabel(t.productId)),
    },
    { header: "From", accessor: (t) => t.fromWarehouseName ?? warehouseLabel(t.fromWarehouseId) },
    { header: "To", accessor: (t) => t.toWarehouseName ?? warehouseLabel(t.toWarehouseId) },
    { header: "Quantity", accessor: (t) => t.quantity, align: "right" },
    {
      header: "Status",
      accessor: (t) => <Badge tone={t.status === "COMPLETED" ? "green" : "amber"}>{t.status}</Badge>,
    },
  ];

  return (
    <>
      <Topbar title="Stock transfers" description="Moving quantity from one warehouse to another." />
      <InventoryTabs />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/inventory/stock"
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-100 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to stock
          </Link>
          <Link
            href="/inventory/stock/transfers/new"
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-signal-cyan text-base-950 hover:bg-signal-cyan/90 transition-colors"
          >
            <Plus size={15} />
            New transfer
          </Link>
        </div>
        <DataTable columns={columns} rows={transfers} rowKey={(t) => String(t.id)} />
      </div>
    </>
  );
}
