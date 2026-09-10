"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { FinanceTabs } from "@/components/finance/FinanceTabs";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { Receivable, InvoiceStatus } from "@/lib/types";

const STATUS_TONE: Record<
  InvoiceStatus,
  "neutral" | "amber" | "green" | "red"
> = {
  OPEN: "neutral",
  PARTIALLY_PAID: "amber",
  PAID: "green",
  VOID: "red",
};

export default function ReceivablesPage() {
  const [rows, setRows] = useState<Receivable[]>([]);

  useEffect(() => {
    api
      .get<Receivable[]>("/finance/receivables")
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  const totalOutstanding = rows.reduce(
    (sum, r) => sum + Number(r.outstanding),
    0,
  );

  const columns: Column<Receivable>[] = [
    {
      header: "Invoice",
      accessor: (r) => (
        <Link
          href={`/finance/invoices/${r.id}`}
          className="font-mono text-ink-100 hover:text-signal-cyan"
        >
          {r.invoice_number}
        </Link>
      ),
    },
    {
      header: "Customer",
      accessor: (r) => r.customerName ?? `Contact #${r.customer_id}`,
    },
    {
      header: "Status",
      accessor: (r) => <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>,
    },
    {
      header: "Due date",
      accessor: (r) =>
        r.due_date ? new Date(r.due_date).toLocaleDateString() : "—",
    },
    {
      header: "Outstanding",
      accessor: (r) => `KES. ${Number(r.outstanding).toFixed(2)}`,
      align: "right",
    },
  ];

  return (
    <>
      <Topbar
        title="Receivables"
        description="Open and partially-paid invoices."
      />
      <FinanceTabs />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-500">
            Total outstanding{" "}
            <span className="text-ink-100 font-mono">
              KES.{totalOutstanding.toFixed(2)}
            </span>
          </p>
          <Link
            href="/finance/payments/new"
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-signal-cyan text-base-950 hover:bg-signal-cyan/90 transition-colors"
          >
            <CreditCard size={15} />
            Record payment
          </Link>
        </div>
        <DataTable columns={columns} rows={rows} rowKey={(r) => String(r.id)} />
      </div>
    </>
  );
}
