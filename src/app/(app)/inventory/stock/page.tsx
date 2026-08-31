"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRightLeft, ArrowLeftRight, ClipboardCheck, Plus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { InventoryTabs } from "@/components/inventory/InventoryTabs";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { StockLevelWithDetails, StockValuationRow, LowStockItem } from "@/lib/types";

const FALLBACK_LEVELS: StockLevelWithDetails[] = [
  { productId: 1, sku: "SKU-2201", productName: "Steel Shelving Unit", warehouseId: 1, warehouseCode: "WH-NBO", warehouseName: "Nairobi Central", quantity: "84", reservedQuantity: "10", availableQuantity: "74", averageCost: "41.50", updatedAt: "2026-08-14T09:00:00.000Z" },
  { productId: 2, sku: "SKU-2202", productName: "Pallet Wrap (Roll)", warehouseId: 1, warehouseCode: "WH-NBO", warehouseName: "Nairobi Central", quantity: "12", reservedQuantity: "0", availableQuantity: "12", averageCost: "5.50", updatedAt: "2026-08-11T00:00:00.000Z" },
];

const FALLBACK_VALUATION: StockValuationRow[] = [
  { productId: 1, sku: "SKU-2201", name: "Steel Shelving Unit", totalQuantity: "84", averageCost: "41.50", valuation: "3486.00" },
  { productId: 2, sku: "SKU-2202", name: "Pallet Wrap (Roll)", totalQuantity: "12", averageCost: "5.50", valuation: "66.00" },
];

const FALLBACK_LOW_STOCK: LowStockItem[] = [];

export default function StockPage() {
  const [levels, setLevels] = useState<StockLevelWithDetails[]>(FALLBACK_LEVELS);
  const [valuation, setValuation] = useState<StockValuationRow[]>(FALLBACK_VALUATION);
  const [lowStock, setLowStock] = useState<LowStockItem[]>(FALLBACK_LOW_STOCK);

  useEffect(() => {
    api
      .get<StockLevelWithDetails[]>("/inventory/stock")
      .then(setLevels)
      .catch(() => setLevels(FALLBACK_LEVELS));
    api
      .get<StockValuationRow[]>("/inventory/stock/valuation")
      .then(setValuation)
      .catch(() => setValuation(FALLBACK_VALUATION));
    api
      .get<LowStockItem[]>("/inventory/stock/low")
      .then(setLowStock)
      .catch(() => setLowStock(FALLBACK_LOW_STOCK));
  }, []);

  const columns: Column<StockLevelWithDetails>[] = [
    {
      header: "Product",
      accessor: (s) => (
        <div>
          <p className="text-ink-100">{s.productName}</p>
          <p className="text-xs text-ink-500 font-mono">{s.sku}</p>
        </div>
      ),
    },
    { header: "Warehouse", accessor: (s) => `${s.warehouseName} (${s.warehouseCode})` },
    { header: "Quantity", accessor: (s) => s.quantity, align: "right" },
    { header: "Reserved", accessor: (s) => s.reservedQuantity, align: "right" },
    { header: "Available", accessor: (s) => s.availableQuantity, align: "right" },
    { header: "Avg cost", accessor: (s) => `$${Number(s.averageCost).toFixed(2)}`, align: "right" },
  ];

  const totalValuation = valuation.reduce((sum, row) => sum + Number(row.valuation), 0);

  return (
    <>
      <Topbar title="Stock" description="Levels by warehouse, plus movements, transfers, and counts." />
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
            <Link
              href="/inventory/stock/count/new"
              className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-base-700 text-ink-100 border border-base-600 hover:bg-base-700/70 transition-colors"
            >
              <ClipboardCheck size={15} />
              Stock count
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

        {lowStock.length > 0 && (
          <div className="panel p-4 border-signal-red/30">
            <p className="label-eyebrow mb-2">Low stock ({lowStock.length})</p>
            <div className="flex flex-wrap gap-2">
              {lowStock.map((item) => (
                <Badge key={item.id} tone="red">
                  {item.sku} · {item.totalQuantity} on hand
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="label-eyebrow mb-2">Levels by warehouse</p>
          <DataTable columns={columns} rows={levels} rowKey={(s) => `${s.productId}-${s.warehouseId}`} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="label-eyebrow">Valuation</p>
            <span className="text-sm font-mono text-ink-100">
              ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="panel divide-y divide-base-600/40">
            {valuation.map((row) => (
              <div key={row.productId} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="text-ink-100">{row.name}</p>
                  <p className="text-xs text-ink-500 font-mono">{row.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-ink-100 font-mono">${Number(row.valuation).toFixed(2)}</p>
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
