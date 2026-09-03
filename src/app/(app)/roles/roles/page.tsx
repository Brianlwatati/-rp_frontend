"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldPlus, Pencil, Trash2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { api, describeApiError } from "@/lib/api";
import type { ErpRole } from "@/lib/types";
import { RolesTabs } from "@/components/roles/RolesTabs";

const FALLBACK_ROLES: ErpRole[] = [
  {
    id: 1,
    iasCompanyId: 2,
    name: "Admin",
    code: "ADMIN",
    isDefault: false,
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    iasCompanyId: 2,
    name: "Warehouse Operator",
    code: "WH_OPERATOR",
    isDefault: true,
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<ErpRole[]>(FALLBACK_ROLES);
  const [actionError, setActionError] = useState<string | null>(null);

  function load() {
    api
      .get<ErpRole[]>("/roles")
      .then(setRoles)
      .catch(() => setRoles(FALLBACK_ROLES));
  }

  useEffect(load, []);

  async function remove(id: number) {
    if (!confirm("Delete this role? This can't be undone.")) return;
    setActionError(null);
    try {
      await api.delete(`/roles/${id}`);
      load();
    } catch (err) {
      setActionError(describeApiError(err, "Couldn't delete this role."));
    }
  }

  const columns: Column<ErpRole>[] = [
    {
      header: "Role",
      accessor: (r) => <span className="text-ink-100">{r.name}</span>,
    },
    {
      header: "Code",
      accessor: (r) => <span className="font-mono text-xs">{r.code}</span>,
    },
    {
      header: "Default",
      accessor: (r) => (r.isDefault ? <Badge tone="cyan">Default</Badge> : "—"),
    },
    {
      header: "Status",
      accessor: (r) => (
        <Badge tone={r.status === "ACTIVE" ? "green" : "neutral"}>
          {r.status}
        </Badge>
      ),
    },
    {
      header: "",
      accessor: (r) => (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => remove(r.id)}
            className="inline-flex items-center gap-1.5 text-ink-500 hover:text-signal-red text-xs transition-colors"
          >
            <Trash2 size={13} />
            Delete
          </button>
          <Link
            href={`/roles/roles/${r.id}/edit`}
            className="inline-flex items-center gap-1.5 text-signal-cyan hover:text-signal-cyan/80 text-xs"
          >
            <Pencil size={13} />
            Edit
          </Link>
        </div>
      ),
      align: "right",
      width: "140px",
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
        <div className="flex justify-end">
          <Link
            href="/roles/roles/new"
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-signal-cyan text-base-950 hover:bg-signal-cyan/90 transition-colors"
          >
            <ShieldPlus size={15} />
            New role
          </Link>
        </div>
        <DataTable
          columns={columns}
          rows={roles}
          rowKey={(r) => String(r.id)}
        />
      </div>
    </>
  );
}
