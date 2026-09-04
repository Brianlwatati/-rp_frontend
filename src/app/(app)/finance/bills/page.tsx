"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Receipt } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { FinanceTabs } from "@/components/finance/FinanceTabs";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { InvoiceStatus, SupplierBill } from "@/lib/types";

const FALLBACK_BILLS: SupplierBill[] = [
  {
    id: 1,
    ias_company_id: 2,
    bill_number: "INV-1723800000000",
    supplier_id: 1,
    purchase_order_id: 1,
    status: "PARTIALLY_PAID",
    issue_date: "2026-08-14T00:00:00.000Z",
    due_date: null,
    currency: "USD",
    subtotal: "620.00",
    tax_amount: "0.00",
    total_amount: "620.00",
    paid_amount: "300.00",
    notes: null,
    supplierName: "Harbor Logistics",
    outstanding: "320.00",
  },
];

const STATUS_TONE: Record<
  InvoiceStatus,
  "neutral" | "amber" | "green" | "red"
> = {
  OPEN: "neutral",
  PARTIALLY_PAID: "amber",
  PAID: "green",
  VOID: "red",
};

export default function BillsPage() {
  const [status, setStatus] = useState<InvoiceStatus | "">("");
  const [bills, setBills] = useState<SupplierBill[]>(FALLBACK_BILLS);

  useEffect(() => {
    api
      .get<SupplierBill[]>(
        `/finance/supplier-bills${status ? `?status=${status}` : ""}`,
      )
      .then(setBills)
      .catch(() => setBills(FALLBACK_BILLS));
  }, [status]);

  const columns: Column<SupplierBill>[] = [
    {
      header: "Bill",
      accessor: (i) => (
        <Link
          href={`/finance/bills/${i.id}`}
          className="inline-flex items-center gap-1.5 font-mono text-ink-100 hover:text-signal-cyan"
        >
          <Receipt size={13} className="text-ink-500" />
          {i.bill_number}
        </Link>
      ),
    },
    {
      header: "Supplier",
      accessor: (i) => i.supplierName ?? `Contact #${i.supplier_id}`,
    },
    {
      header: "Status",
      accessor: (i) => <Badge tone={STATUS_TONE[i.status]}>{i.status}</Badge>,
    },
    {
      header: "Total",
      accessor: (i) => `${i.currency} ${Number(i.total_amount).toFixed(2)}`,
      align: "right",
    },
    {
      header: "Paid",
      accessor: (i) => `${i.currency} ${Number(i.paid_amount).toFixed(2)}`,
      align: "right",
    },
    {
      header: "Issued",
      accessor: (i) => new Date(i.issue_date).toLocaleDateString(),
    },
  ];

  return (
    <>
      <Topbar
        title="Bills"
        description="Generated from Purchase orders — the receipt sent to a supplier."
      />
      <FinanceTabs />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as InvoiceStatus | "")}
            className="rounded-lg bg-base-800 border border-base-600 px-3 py-2 text-sm text-ink-100 outline-none focus:border-signal-cyan"
          >
            <option value="">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="PARTIALLY_PAID">Partially paid</option>
            <option value="PAID">Paid</option>
          </select>
          <Link
            href="/finance/bills/new"
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-signal-cyan text-base-950 hover:bg-signal-cyan/90 transition-colors"
          >
            <Plus size={15} />
            New from order
          </Link>
        </div>
        <DataTable
          columns={columns}
          rows={bills}
          rowKey={(i) => String(i.id)}
        />
      </div>
    </>
  );
}
