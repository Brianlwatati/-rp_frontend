"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { InventoryTabs } from "@/components/inventory/InventoryTabs";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { ProductWithStock } from "@/lib/types";

const FALLBACK_PRODUCTS: ProductWithStock[] = [
  {
    id: 1,
    iasCompanyId: 2,
    sku: "SKU-2201",
    name: "Steel Shelving Unit",
    description: "Heavy-duty 5-tier shelving.",
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
  {
    id: 3,
    iasCompanyId: 2,
    sku: "SKU-2203",
    name: "Barcode Scanner",
    description: null,
    unit: "unit",
    category: "Equipment",
    costPrice: "120.00",
    sellPrice: "145.00",
    reorderLevel: "10",
    status: "ARCHIVED",
    createdAt: "2025-11-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    stockByWarehouse: [
      {
        warehouseId: 1,
        quantity: "6",
        reservedQuantity: "0",
        availableQuantity: "6",
      },
    ],
    totalQuantity: "6",
    totalAvailable: "6",
  },
];

export default function ProductsPage() {
  const [products, setProducts] =
    useState<ProductWithStock[]>(FALLBACK_PRODUCTS);

  useEffect(() => {
    api
      .get<ProductWithStock[]>("/inventory/products")
      .then(setProducts)
      .catch(() => setProducts(FALLBACK_PRODUCTS));
  }, []);

  const columns: Column<ProductWithStock>[] = [
    {
      header: "SKU",
      accessor: (p) => <span className="font-mono text-xs">{p.sku}</span>,
    },
    {
      header: "Product",
      accessor: (p) => (
        <div>
          <p className="text-ink-100">{p.name}</p>
          {p.category && <p className="text-xs text-ink-500">{p.category}</p>}
        </div>
      ),
    },
    { header: "Unit", accessor: (p) => p.unit },
    {
      header: "Cost",
      accessor: (p) => `$${Number(p.costPrice).toFixed(2)}`,
      align: "right",
    },
    {
      header: "Sell",
      accessor: (p) => `$${Number(p.sellPrice).toFixed(2)}`,
      align: "right",
    },
    {
      header: "Available",
      accessor: (p) => (
        <span className="flex items-center justify-end gap-2">
          {p.totalAvailable}
          {Number(p.totalAvailable) <= Number(p.reorderLevel) && (
            <Badge tone="red">Reorder</Badge>
          )}
        </span>
      ),
      align: "right",
    },
    {
      header: "Status",
      accessor: (p) => (
        <Badge tone={p.status === "ACTIVE" ? "green" : "neutral"}>
          {p.status}
        </Badge>
      ),
    },
    {
      header: "",
      accessor: (p) => (
        <Link
          href={`/inventory/products/${p.id}/edit`}
          className="inline-flex items-center gap-1.5 text-signal-cyan hover:text-signal-cyan/80 text-xs"
        >
          <Pencil size={13} />
          Edit
        </Link>
      ),
      align: "right",
      width: "80px",
    },
  ];

  return (
    <>
      <Topbar
        title="Products"
        description="Every SKU tracked across your warehouses."
      />
      <InventoryTabs />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex justify-end">
          <Link
            href="/inventory/products/new"
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-signal-cyan text-base-950 hover:bg-signal-cyan/90 transition-colors"
          >
            <Plus size={15} />
            New product
          </Link>
        </div>
        <DataTable
          columns={columns}
          rows={products}
          rowKey={(p) => String(p.id) + p.totalAvailable}
        />
      </div>
    </>
  );
}
