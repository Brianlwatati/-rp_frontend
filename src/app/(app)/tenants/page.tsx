"use client";

import { useEffect, useState } from "react";
import { Building2, Plus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { Tenant } from "@/lib/types";

const FALLBACK_TENANTS: Tenant[] = [
  { id: "1", name: "Acme ERP", slug: "acme-erp", plan: "Growth" },
  { id: "2", name: "Harbor Logistics", slug: "harbor-logistics", plan: "Scale" },
  { id: "3", name: "Northwind HR", slug: "northwind-hr", plan: "Starter" },
];

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>(FALLBACK_TENANTS);

  useEffect(() => {
    api
      .get<Tenant[]>("/api/tenants")
      .then(setTenants)
      .catch(() => setTenants(FALLBACK_TENANTS));
  }, []);

  const columns: Column<Tenant>[] = [
    {
      header: "Tenant",
      accessor: (t) => (
        <span className="flex items-center gap-2 text-ink-100">
          <Building2 size={14} className="text-ink-500" />
          {t.name}
        </span>
      ),
    },
    { header: "Slug", accessor: (t) => <span className="font-mono text-xs">{t.slug}</span> },
    { header: "Plan", accessor: (t) => <Badge tone="amber">{t.plan}</Badge> },
  ];

  return (
    <>
      <Topbar title="Tenants" description="Organizations issued their own isolated workspace." />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex justify-end">
          <Button>
            <Plus size={15} />
            New tenant
          </Button>
        </div>
        <DataTable columns={columns} rows={tenants} rowKey={(t) => t.id} />
      </div>
    </>
  );
}
