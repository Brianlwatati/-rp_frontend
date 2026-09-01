"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { ErpBranch } from "@/lib/types";

const FALLBACK_BRANCHES: ErpBranch[] = [
  { id: 1, iasCompanyId: 2, name: "Head Office", code: "HQ", status: "ACTIVE" },
  {
    id: 2,
    iasCompanyId: 2,
    name: "Mombasa Branch",
    code: "MSA",
    status: "ACTIVE",
  },
];

export default function BranchesPage() {
  const [branches, setBranches] = useState<ErpBranch[]>(FALLBACK_BRANCHES);

  useEffect(() => {
    api
      .get<ErpBranch[]>("/branches")
      .then(setBranches)
      .catch(() => setBranches(FALLBACK_BRANCHES));
  }, []);

  const columns: Column<ErpBranch>[] = [
    {
      header: "Branch",
      accessor: (b) => (
        <span className="flex items-center gap-2 text-ink-100">
          <Building2 size={14} className="text-ink-500" />
          {b.name}
        </span>
      ),
    },
    {
      header: "Code",
      accessor: (b) => <span className="font-mono text-xs">{b.code}</span>,
    },
    {
      header: "Status",
      accessor: (b) => (
        <Badge tone={b.status === "ACTIVE" ? "green" : "neutral"}>
          {b.status}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <Topbar
        title="Branches"
        description="Physical locations within this company."
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-ink-500">
            Branches can be created here, but aren&apos;t editable after
            creation.
          </p>
          <Link
            href="/branches/new"
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-signal-cyan text-base-950 hover:bg-signal-cyan/90 transition-colors shrink-0"
          >
            <Plus size={15} />
            New branch
          </Link>
        </div>
        <DataTable
          columns={columns}
          rows={branches}
          rowKey={(b) => String(b.id)}
        />
      </div>
    </>
  );
}
