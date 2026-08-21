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
import type { StockMovement, StockMovementReason } from "@/lib/types";

const FALLBACK_MOVEMENTS: StockMovement[] = [
  {
    id: 1,
    productId: 1,
    warehouseId: 1,
    quantityDelta: "20",
    unitCost: "42.00",
    reason: "RECEIVE",
    referenceType: null,
    referenceId: null,
    notes: "PO-1042",
    createdBy: 1,
    createdAt: "2026-08-14T09:00:00.000Z",
  },
  {
    id: 2,
    productId: 1,
    warehouseId: 1,
    quantityDelta: "-6",
    unitCost: null,
    reason: "SALE",
    referenceType: "order",
    referenceId: 1042,
    notes: null,
    createdBy: 1,
    createdAt: "2026-08-13T14:30:00.000Z",
  },
  {
    id: 3,
    productId: 2,
    warehouseId: 1,
    quantityDelta: "-2",
    unitCost: null,
    reason: "ADJUSTMENT",
    referenceType: null,
    referenceId: null,
    notes: "Damaged in transit",
    createdBy: 2,
    createdAt: "2026-08-10T11:00:00.000Z",
  },
];

const REASON_TONE: Record<
  StockMovementReason,
  "green" | "red" | "amber" | "cyan" | "neutral"
> = {
  RECEIVE: "green",
  SALE: "amber",
  ADJUSTMENT: "red",
  TRANSFER_IN: "cyan",
  TRANSFER_OUT: "cyan",
  STOCK_COUNT: "neutral",
};

export default function StockMovementsPage() {
  const { productLabel, warehouseLabel } = useInventoryLookups();
  const [movements, setMovements] =
    useState<StockMovement[]>(FALLBACK_MOVEMENTS);

  useEffect(() => {
    api
      .get<StockMovement[]>("/inventory/stock/valuation")
      .then(setMovements)
      .catch(() => setMovements(FALLBACK_MOVEMENTS));
  }, []);

  const columns: Column<StockMovement>[] = [
    {
      header: "Date",
      accessor: (m) =>
        new Date(m.createdAt).toLocaleDateString(undefined, {
          dateStyle: "medium",
        }),
    },
    { header: "Product", accessor: (m) => productLabel(m.productId) },
    { header: "Warehouse", accessor: (m) => warehouseLabel(m.warehouseId) },
    {
      header: "Reason",
      accessor: (m) => <Badge tone={REASON_TONE[m.reason]}>{m.reason}</Badge>,
    },
    {
      header: "Qty Δ",
      accessor: (m) => (
        <span
          className={
            Number(m.quantityDelta) >= 0
              ? "text-signal-green font-mono"
              : "text-signal-red font-mono"
          }
        >
          {Number(m.quantityDelta) >= 0 ? "+" : ""}
          {m.quantityDelta}
        </span>
      ),
      align: "right",
    },
    {
      header: "Unit cost",
      accessor: (m) => (m.unitCost ? `$${Number(m.unitCost).toFixed(2)}` : "—"),
      align: "right",
    },
    { header: "Notes", accessor: (m) => m.notes ?? "—" },
  ];

  return (
    <>
      <Topbar
        title="Stock movements"
        description="An immutable ledger of every quantity change."
      />
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
            href="/inventory/stock/movements/new"
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-signal-cyan text-base-950 hover:bg-signal-cyan/90 transition-colors"
          >
            <Plus size={15} />
            Record movement
          </Link>
        </div>
        <DataTable
          columns={columns}
          rows={movements}
          rowKey={(m) => String(m.id)}
        />
      </div>
    </>
  );
}
