"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Receipt } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { FinanceTabs } from "@/components/finance/FinanceTabs";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { Invoice, InvoiceStatus } from "@/lib/types";

const FALLBACK_INVOICES: Invoice[] = [
  { id: 1, ias_company_id: 2, invoice_number: "INV-1723800000000", customer_id: 1, sales_order_id: 1, status: "PARTIALLY_PAID", issue_date: "2026-08-14T00:00:00.000Z", due_date: null, currency: "USD", subtotal: "620.00", tax_amount: "0.00", total_amount: "620.00", paid_amount: "300.00", notes: null, created_by: 1, created_at: "2026-08-14T09:00:00.000Z", customerName: "Harbor Logistics" },
];

const STATUS_TONE: Record<InvoiceStatus, "neutral" | "amber" | "green" | "red"> = {
  OPEN: "neutral",
  PARTIALLY_PAID: "amber",
  PAID: "green",
  VOID: "red",
};

export default function InvoicesPage() {
  const [status, setStatus] = useState<InvoiceStatus | "">("");
  const [invoices, setInvoices] = useState<Invoice[]>(FALLBACK_INVOICES);

  useEffect(() => {
    api
      .get<Invoice[]>(`/finance/invoices${status ? `?status=${status}` : ""}`)
      .then(setInvoices)
      .catch(() => setInvoices(FALLBACK_INVOICES));
  }, [status]);

  const columns: Column<Invoice>[] = [
    {
      header: "Invoice",
      accessor: (i) => (
        <Link href={`/finance/invoices/${i.id}`} className="inline-flex items-center gap-1.5 font-mono text-ink-100 hover:text-signal-cyan">
          <Receipt size={13} className="text-ink-500" />
          {i.invoice_number}
        </Link>
      ),
    },
    { header: "Customer", accessor: (i) => i.customerName ?? `Contact #${i.customer_id}` },
    { header: "Status", accessor: (i) => <Badge tone={STATUS_TONE[i.status]}>{i.status}</Badge> },
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
    { header: "Issued", accessor: (i) => new Date(i.issue_date).toLocaleDateString() },
  ];

  return (
    <>
      <Topbar title="Invoices" description="Generated from sales orders — the receipt sent to a customer." />
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
            href="/finance/invoices/new"
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-signal-cyan text-base-950 hover:bg-signal-cyan/90 transition-colors"
          >
            <Plus size={15} />
            New from order
          </Link>
        </div>
        <DataTable columns={columns} rows={invoices} rowKey={(i) => String(i.id)} />
      </div>
    </>
  );
}
