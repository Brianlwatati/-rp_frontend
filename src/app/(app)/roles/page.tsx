"use client";

import { useEffect, useState } from "react";
import { ShieldPlus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { Role } from "@/lib/types";

const FALLBACK_ROLES: Role[] = [
  { id: "1", name: "admin", scope: "tenant", permissions: ["*:*"] },
  { id: "2", name: "operator", scope: "tenant", permissions: ["inventory:*", "orders:rw"] },
  { id: "3", name: "viewer", scope: "tenant", permissions: ["orders:read", "customers:read"] },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(FALLBACK_ROLES);

  useEffect(() => {
    api
      .get<Role[]>("/api/roles")
      .then(setRoles)
      .catch(() => setRoles(FALLBACK_ROLES));
  }, []);

  const columns: Column<Role>[] = [
    { header: "Role", accessor: (r) => <span className="font-mono text-ink-100">{r.name}</span> },
    { header: "Scope", accessor: (r) => <Badge tone="neutral">{r.scope}</Badge> },
    {
      header: "Permissions",
      accessor: (r) => (
        <div className="flex flex-wrap gap-1.5">
          {r.permissions.map((p) => (
            <Badge key={p} tone="cyan">
              {p}
            </Badge>
          ))}
        </div>
      ),
    },
  ];

  return (
    <>
      <Topbar title="Roles" description="Permission bundles that get attached to a user's session." />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex justify-end">
          <Button>
            <ShieldPlus size={15} />
            New role
          </Button>
        </div>
        <DataTable columns={columns} rows={roles} rowKey={(r) => r.id} />
      </div>
    </>
  );
}
