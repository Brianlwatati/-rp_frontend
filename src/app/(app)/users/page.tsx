"use client";

import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { AuthUser } from "@/lib/types";

const FALLBACK_USERS: AuthUser[] = [
  {
    id: "1",
    email: "b.otieno@acme-erp.com",
    firstName: "Brian",
    lastName: "Otieno",
    roleName: "Admin",
    roleCode: "ADMIN",
    companyId: "1",
    isActive: true,
  },
  {
    id: "2",
    email: "sarahbakery@gmail.com",
    firstName: "Sarah",
    lastName: "Bakery",
    roleName: "HR Admin",
    roleCode: "HR_ADMIN",
    companyId: "2",
    isActive: true,
  },
  {
    id: "3",
    email: "s.kim@acme-erp.com",
    firstName: "Sam",
    lastName: "Kim",
    roleName: "Viewer",
    roleCode: "VIEWER",
    companyId: "1",
    isActive: false,
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<AuthUser[]>(FALLBACK_USERS);

  useEffect(() => {
    api
      .get<AuthUser[]>("/api/users")
      .then(setUsers)
      .catch(() => setUsers(FALLBACK_USERS));
  }, []);

  const columns: Column<AuthUser>[] = [
    {
      header: "Name",
      accessor: (u) => (
        <span className="text-ink-100">
          {u.firstName ?? "—"} {u.lastName ?? ""}
        </span>
      ),
    },
    { header: "Email", accessor: (u) => <span className="font-mono text-xs">{u.email}</span> },
    {
      header: "Role",
      accessor: (u) => (u.roleName ? <Badge tone="cyan">{u.roleName}</Badge> : "—"),
    },
    {
      header: "Status",
      accessor: (u) => (
        <Badge tone={u.isActive === false ? "neutral" : "green"}>
          {u.isActive === false ? "inactive" : "active"}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <Topbar title="Users" description="Everyone with a credential issued for this company." />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex justify-end">
          <Button>
            <UserPlus size={15} />
            Invite user
          </Button>
        </div>
        <DataTable columns={columns} rows={users} rowKey={(u) => u.id} />
      </div>
    </>
  );
}
