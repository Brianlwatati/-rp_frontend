"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { FinanceTabs } from "@/components/finance/FinanceTabs";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { SupplierBill, SupplierBillStatus } from "@/lib/types";

const STATUS_TONE: Record<
  SupplierBillStatus,
  "neutral" | "amber" | "green" | "red"
> = {
  OPEN: "neutral",
  PARTIALLY_PAID: "amber",
  PAID: "green",
  VOID: "red",
};

export default function PayablesPage() {
  const [rows, setRows] = useState<SupplierBill[]>([]);

  useEffect(() => {
    api
      .get<SupplierBill[]>("/finance/payables")
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  const outstanding = rows.reduce(
    (sum, row) => sum + Number(row.outstanding),
    0,
  );
  const columns: Column<SupplierBill>[] = [
    {
      header: "Bill",
      accessor: (row) => (
        <span className="font-mono text-ink-100">{row.bill_number}</span>
      ),
    },
    {
      header: "Supplier",
      accessor: (row) => row.supplierName ?? `Contact #${row.supplier_id}`,
    },
    {
      header: "Status",
      accessor: (row) => (
        <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>
      ),
    },
    {
      header: "Due date",
      accessor: (row) =>
        row.due_date ? new Date(row.due_date).toLocaleDateString() : "-",
    },
    {
      header: "Outstanding",
      accessor: (row) =>
        `${row.currency} ${Number(row.outstanding).toFixed(2)}`,
      align: "right",
    },
  ];

  return (
    <>
      <Topbar title="Payables" description="Supplier bills and amounts owed." />
      <FinanceTabs />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-500">
            Total outstanding{" "}
            <span className="font-mono text-ink-100">
              KES {outstanding.toFixed(2)}
            </span>
          </p>
          <Link
            href="/finance/supplier-payments/new"
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-signal-cyan text-base-950 hover:bg-signal-cyan/90 transition-colors"
          >
            <CreditCard size={15} /> Pay supplier
          </Link>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => String(row.id)}
        />
      </div>
    </>
  );
}
