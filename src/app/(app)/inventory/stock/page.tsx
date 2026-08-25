"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRightLeft, ArrowLeftRight, Plus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { InventoryTabs } from "@/components/inventory/InventoryTabs";
import { DataTable, Column } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { useInventoryLookups } from "@/lib/inventoryLookups";
import type { StockLevel, StockValuationRow } from "@/lib/types";

const FALLBACK_LEVELS: StockLevel[] = [
  {
    productId: 1,
    sku: "SKU-2201",
    productName: "Steel Shelving Unit",
    warehouseId: 1,
    warehouseName: "Main Warehouse",
    quantity: "84",
    reservedQuantity: "10",
    averageCost: "41.50",
    updatedAt: "2026-08-14T09:00:00.000Z",
  },
  {
    productId: 2,
    sku: "SKU-2202",
    productName: "Pallet Wrap (Roll)",
    warehouseId: 1,
    warehouseName: "Main Warehouse",
    quantity: "12",
    reservedQuantity: "0",
    averageCost: "5.50",
    updatedAt: "2026-08-11T00:00:00.000Z",
  },
];

const FALLBACK_VALUATION: StockValuationRow[] = [
  {
    productId: 1,
    sku: "SKU-2201",
    name: "Steel Shelving Unit",
    totalQuantity: "84",
    averageCost: "41.50",
    valuation: "3486.00",
  },
  {
    productId: 2,
    sku: "SKU-2202",
    name: "Pallet Wrap (Roll)",
    totalQuantity: "12",
    averageCost: "5.50",
    valuation: "66.00",
  },
  {
    productId: 3,
    sku: "SKU-2203",
    name: "Barcode Scanner",
    totalQuantity: "6",
    averageCost: "120.00",
    valuation: "720.00",
  },
];

export default function StockPage() {
  const [levels, setLevels] = useState<StockLevel[]>(FALLBACK_LEVELS);
  const [valuation, setValuation] =
    useState<StockValuationRow[]>(FALLBACK_VALUATION);

  useEffect(() => {
    api
      .get<StockLevel[]>("/inventory/stock")
      .then(setLevels)
      .catch(() => setLevels(FALLBACK_LEVELS));
    api
      .get<StockValuationRow[]>("/inventory/stock/valuation")
      .then(setValuation)
      .catch(() => setValuation(FALLBACK_VALUATION));
  }, []);

  const columns: Column<StockLevel>[] = [
    {
      header: "Product",
      accessor: (s) => <span className="text-ink-100">{s.productName}</span>,
    },
    { header: "Warehouse", accessor: (s) => s.warehouseName },
    { header: "Quantity", accessor: (s) => s.quantity, align: "right" },
    { header: "Reserved", accessor: (s) => s.reservedQuantity, align: "right" },
    {
      header: "Available",
      accessor: (s) =>
        (Number(s.quantity) - Number(s.reservedQuantity)).toString(),
      align: "right",
    },
    {
      header: "Avg cost",
      accessor: (s) => `$${Number(s.averageCost).toFixed(2)}`,
      align: "right",
    },
  ];

  const totalValuation = valuation.reduce(
    (sum, row) => sum + Number(row.valuation),
    0,
  );

  return (
    <>
      <Topbar
        title="Stock"
        description="Levels by warehouse, plus movements and transfers."
      />
      <InventoryTabs />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/inventory/stock/movements"
              className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-base-700 text-ink-100 border border-base-600 hover:bg-base-700/70 transition-colors"
            >
              <ArrowRightLeft size={15} />
              Movements
            </Link>
            <Link
              href="/inventory/stock/transfers"
              className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-base-700 text-ink-100 border border-base-600 hover:bg-base-700/70 transition-colors"
            >
              <ArrowLeftRight size={15} />
              Transfers
            </Link>
          </div>
          <Link
            href="/inventory/stock/movements/new"
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-signal-cyan text-base-950 hover:bg-signal-cyan/90 transition-colors"
          >
            <Plus size={15} />
            Record movement
          </Link>
        </div>

        <div>
          <p className="label-eyebrow mb-2">Levels by warehouse</p>
          <DataTable
            columns={columns}
            rows={levels}
            rowKey={(s) => `${s.productId}-${s.warehouseId}`}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="label-eyebrow">Valuation</p>
            <span className="text-sm font-mono text-ink-100">
              $
              {totalValuation.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="panel divide-y divide-base-600/40">
            {valuation.map((row) => (
              <div
                key={row.productId}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div>
                  <p className="text-ink-100">{row.name}</p>
                  <p className="text-xs text-ink-500 font-mono">{row.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-ink-100 font-mono">
                    ${Number(row.valuation).toFixed(2)}
                  </p>
                  <p className="text-xs text-ink-500">
                    {row.totalQuantity} × ${Number(row.averageCost).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
