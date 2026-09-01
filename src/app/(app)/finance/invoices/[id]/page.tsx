"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { ReceiptDocument, ReceiptLine } from "@/components/receipts/ReceiptDocument";
import { api, describeApiError } from "@/lib/api";
import type { InvoiceWithItems, InvoiceStatus } from "@/lib/types";

const STATUS_TONE: Record<InvoiceStatus, "neutral" | "amber" | "green" | "red"> = {
  OPEN: "neutral",
  PARTIALLY_PAID: "amber",
  PAID: "green",
  VOID: "red",
};

export default function InvoiceReceiptPage() {
  const params = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<InvoiceWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<InvoiceWithItems>(`/finance/invoices/${params.id}`)
      .then(setInvoice)
      .catch((err) => setError(describeApiError(err, "Couldn't load this invoice.")))
      .finally(() => setLoading(false));
  }, [params.id]);

  const balance = invoice ? Number(invoice.total_amount) - Number(invoice.paid_amount) : 0;

  return (
    <>
      <Topbar title={invoice ? invoice.invoice_number : "Invoice"} description="Receipt for this sale." />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 no-print">
          <Link
            href="/finance/invoices"
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-100 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to invoices
          </Link>
          {invoice && balance > 0 && (
            <Link href="/finance/payments/new">
              <Button variant="secondary">
                <CreditCard size={15} />
                Record payment
              </Button>
            </Link>
          )}
        </div>

        {loading && <p className="text-sm text-ink-500">Loading invoice…</p>}
        {error && !invoice && (
          <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2 max-w-2xl">
            {error}
          </p>
        )}

        {invoice && (
          <ReceiptDocument
            docType="Invoice"
            docNumber={invoice.invoice_number}
            date={invoice.issue_date}
            status={invoice.status}
            statusTone={STATUS_TONE[invoice.status]}
            partyLabel="Billed to"
            partyName={invoice.customerName ?? `Contact #${invoice.customer_id}`}
            currency={invoice.currency}
            lines={invoice.items.map<ReceiptLine>((item) => ({
              name: item.product_name,
              sku: item.product_sku,
              quantity: item.quantity,
              unitPrice: item.unit_price,
              lineTotal: item.line_total,
            }))}
            totals={{
              subtotal: invoice.subtotal,
              tax: invoice.tax_amount,
              total: invoice.total_amount,
              paid: invoice.paid_amount,
              balance: balance > 0 ? balance : undefined,
            }}
            notes={invoice.notes}
            footer={invoice.sales_order_id ? `Generated from sales order #${invoice.sales_order_id}` : undefined}
          />
        )}
      </div>
    </>
  );
}
