"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Warehouse as WarehouseIcon } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { InventoryTabs } from "@/components/inventory/InventoryTabs";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { Warehouse } from "@/lib/types";

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
  {
    id: 2,
    iasCompanyId: 2,
    code: "WH-MSA",
    name: "Mombasa Port",
    location: "Mombasa, KE",
    status: "ACTIVE",
    createdAt: "2026-02-14T00:00:00.000Z",
    updatedAt: "2026-02-14T00:00:00.000Z",
  },
  {
    id: 3,
    iasCompanyId: 2,
    code: "WH-OLD",
    name: "Legacy Depot",
    location: null,
    status: "INACTIVE",
    createdAt: "2024-03-01T00:00:00.000Z",
    updatedAt: "2025-09-01T00:00:00.000Z",
  },
];

export default function WarehousesPage() {
  const [warehouses, setWarehouses] =
    useState<Warehouse[]>(FALLBACK_WAREHOUSES);

  useEffect(() => {
    api
      .get<Warehouse[]>("/inventory/warehouses")
      .then(setWarehouses)
      .catch(() => setWarehouses(FALLBACK_WAREHOUSES));
  }, []);

  const columns: Column<Warehouse>[] = [
    {
      header: "Warehouse",
      accessor: (w) => (
        <span className="flex items-center gap-2 text-ink-100">
          <WarehouseIcon size={14} className="text-ink-500" />
          {w.name}
        </span>
      ),
    },
    {
      header: "Code",
      accessor: (w) => <span className="font-mono text-xs">{w.code}</span>,
    },
    { header: "Location", accessor: (w) => w.location ?? "—" },
    {
      header: "Status",
      accessor: (w) => (
        <Badge tone={w.status === "ACTIVE" ? "green" : "neutral"}>
          {w.status}
        </Badge>
      ),
    },
    {
      header: "",
      accessor: (w) => (
        <Link
          href={`/inventory/warehouses/${w.id}/edit`}
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
        title="Warehouses"
        description="Locations stock is received into and held at."
      />
      <InventoryTabs />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex justify-end">
          <Link
            href="/inventory/warehouses/new"
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-signal-cyan text-base-950 hover:bg-signal-cyan/90 transition-colors"
          >
            <Plus size={15} />
            New warehouse
          </Link>
        </div>
        <DataTable
          columns={columns}
          rows={warehouses}
          rowKey={(w) => String(w.id)}
        />
      </div>
    </>
  );
}
