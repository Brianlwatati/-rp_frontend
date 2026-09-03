"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { DataTable, Column } from "@/components/ui/DataTable";
import { api, describeApiError } from "@/lib/api";
import type { ErpPermission } from "@/lib/types";
import { RolesTabs } from "@/components/roles/RolesTabs";

const FALLBACK_ROLES: ErpPermission[] = [
  {
    id: 1,
    module: "Admin",
    code: "ADMIN",
    action: "false",
  },
];

export default function RolesPage() {
  const [erpermissions, setErpPermissions] =
    useState<ErpPermission[]>(FALLBACK_ROLES);
  const [actionError, setActionError] = useState<string | null>(null);

  function load() {
    api
      .get<ErpPermission[]>("/permissions")
      .then(setErpPermissions)
      .catch(() => setErpPermissions(FALLBACK_ROLES));
  }

  useEffect(load, []);

  const columns: Column<ErpPermission>[] = [
    {
      header: "Module",
      accessor: (r) => <span className="text-ink-100">{r.module}</span>,
    },
    {
      header: "Code",
      accessor: (r) => <span className="font-mono text-xs">{r.code}</span>,
    },
    {
      header: "Action",
      accessor: (r) => <span className="font-mono text-xs">{r.action}</span>,
    },
  ];

  return (
    <>
      <Topbar
        title="Roles"
        description="ERP-side roles — what a user can do within a module they can reach."
      />

      <RolesTabs />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {actionError && (
          <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
            {actionError}
          </p>
        )}

        <DataTable
          columns={columns}
          rows={erpermissions}
          rowKey={(r) => String(r.id)}
        />
      </div>
    </>
  );
}
