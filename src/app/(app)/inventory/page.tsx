"use client";

import { useEffect, useState } from "react";
import {
  Boxes,
  Warehouse as WarehouseIcon,
  ArrowRightLeft,
  ArrowRight,
} from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { InventoryTabs } from "@/components/inventory/InventoryTabs";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api";
import type { ProductWithStock, Warehouse, StockMovement } from "@/lib/types";

const FALLBACK_PRODUCTS: ProductWithStock[] = [
  {
    id: 1,
    iasCompanyId: 2,
    sku: "SKU-2201",
    name: "Steel Shelving Unit",
    description: null,
    unit: "unit",
    category: "Warehouse",
    costPrice: "42.00",
    sellPrice: "62.00",
    reorderLevel: "20",
    status: "ACTIVE",
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-08-10T00:00:00.000Z",
    stockByWarehouse: [
      {
        warehouseId: 1,
        quantity: "84",
        reservedQuantity: "10",
        availableQuantity: "74",
      },
    ],
    totalQuantity: "84",
    totalAvailable: "74",
  },
  {
    id: 2,
    iasCompanyId: 2,
    sku: "SKU-2202",
    name: "Pallet Wrap (Roll)",
    description: null,
    unit: "roll",
    category: "Packaging",
    costPrice: "5.50",
    sellPrice: "8.00",
    reorderLevel: "25",
    status: "ACTIVE",
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-08-11T00:00:00.000Z",
    stockByWarehouse: [
      {
        warehouseId: 1,
        quantity: "12",
        reservedQuantity: "0",
        availableQuantity: "12",
      },
    ],
    totalQuantity: "12",
    totalAvailable: "12",
  },
];

const FALLBACK_WAREHOUSES: Warehouse[] = [
  {
    id: 1,
    iasCompanyId: 2,
    code: "WH-NBO",
    name: "Nairobi Central",
    location: "Nairobi, KE",
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const FALLBACK_MOVEMENTS: StockMovement[] = [
  {
    id: 1,
    productId: 1,
    productName: "Steel Shelving Unit",
    warehouseId: 1,
    warehouseName: "Nairobi Central",
    quantityDelta: "20",
    unitCost: "42.00",
    reason: "RECEIVE",
    referenceType: null,
    referenceId: null,
    notes: null,
    createdBy: 1,
    createdAt: "2026-08-14T09:00:00.000Z",
  },
];

export default function InventoryOverviewPage() {
  const [products, setProducts] =
    useState<ProductWithStock[]>(FALLBACK_PRODUCTS);
  const [warehouses, setWarehouses] =
    useState<Warehouse[]>(FALLBACK_WAREHOUSES);
  const [movements, setMovements] =
    useState<StockMovement[]>(FALLBACK_MOVEMENTS);

  useEffect(() => {
    api
      .get<ProductWithStock[]>("/inventory/products")
      .then(setProducts)
      .catch(() => setProducts(FALLBACK_PRODUCTS));
    api
      .get<Warehouse[]>("/inventory/warehouses")
      .then(setWarehouses)
      .catch(() => setWarehouses(FALLBACK_WAREHOUSES));
    api
      .get<StockMovement[]>("/inventory/stock/movements?limit=5")
      .then(setMovements)
      .catch(() => setMovements(FALLBACK_MOVEMENTS));
  }, []);

  const lowStockCount = products.filter(
    (p) => Number(p.totalAvailable) <= Number(p.reorderLevel),
  ).length;
  const activeWarehouses = warehouses.filter(
    (w) => w.status === "ACTIVE",
  ).length;

  return (
    <>
      <Topbar
        title="Inventory"
        description="Products, stock levels, and warehouses in one place."
      />
      <InventoryTabs />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Products"
            value={String(products.length)}
            icon={Boxes}
          />
          <StatCard
            label="Low stock"
            value={String(lowStockCount)}
            delta={lowStockCount > 0 ? "below reorder level" : "all healthy"}
            trend={lowStockCount > 0 ? "down" : "flat"}
            icon={ArrowRightLeft}
          />
          <StatCard
            label="Active warehouses"
            value={String(activeWarehouses)}
            icon={WarehouseIcon}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <a
            href="/inventory/products"
            className="panel p-5 hover:border-signal-cyan/40 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <Boxes size={18} className="text-signal-cyan" />
              <ArrowRight
                size={15}
                className="text-ink-500 group-hover:text-signal-cyan transition-colors"
              />
            </div>
            <p className="mt-3 font-display text-sm font-semibold text-ink-100">
              Products
            </p>
            <p className="mt-1 text-xs text-ink-500">
              SKUs, pricing, and reorder levels.
            </p>
          </a>

          <a
            href="/inventory/stock"
            className="panel p-5 hover:border-signal-cyan/40 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <ArrowRightLeft size={18} className="text-signal-cyan" />
              <ArrowRight
                size={15}
                className="text-ink-500 group-hover:text-signal-cyan transition-colors"
              />
            </div>
            <p className="mt-3 font-display text-sm font-semibold text-ink-100">
              Stock
            </p>
            <p className="mt-1 text-xs text-ink-500">
              Levels by warehouse, movements, transfers.
            </p>
          </a>

          <a
            href="/inventory/warehouses"
            className="panel p-5 hover:border-signal-cyan/40 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <WarehouseIcon size={18} className="text-signal-cyan" />
              <ArrowRight
                size={15}
                className="text-ink-500 group-hover:text-signal-cyan transition-colors"
              />
            </div>
            <p className="mt-3 font-display text-sm font-semibold text-ink-100">
              Warehouses
            </p>
            <p className="mt-1 text-xs text-ink-500">
              Locations stock is held across.
            </p>
          </a>
        </div>

        <div>
          <p className="label-eyebrow mb-2">Recent stock movements</p>
          <div className="panel divide-y divide-base-600/40">
            {movements.length === 0 && (
              <p className="p-4 text-sm text-ink-500">
                No movements recorded yet.
              </p>
            )}
            {movements.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div>
                  <p className="text-ink-100 font-mono text-xs">
                    {m.productName} · {m.warehouseName}
                  </p>
                  <p className="text-ink-500 text-xs mt-0.5">{m.reason}</p>
                </div>
                <span
                  className={`font-mono text-sm ${
                    Number(m.quantityDelta) >= 0
                      ? "text-signal-green"
                      : "text-signal-red"
                  }`}
                >
                  {Number(m.quantityDelta) >= 0 ? "+" : ""}
                  {m.quantityDelta}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
