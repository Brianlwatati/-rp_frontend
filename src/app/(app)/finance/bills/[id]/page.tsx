"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import {
  ReceiptDocument,
  ReceiptLine,
} from "@/components/receipts/ReceiptDocument";
import { api, describeApiError } from "@/lib/api";
import type { SupplierBillStatus, SupplierBillWithItems } from "@/lib/types";

const STATUS_TONE: Record<
  SupplierBillStatus,
  "neutral" | "amber" | "green" | "red"
> = {
  OPEN: "neutral",
  PARTIALLY_PAID: "amber",
  PAID: "green",
  VOID: "red",
};

export default function SupplierBillReceiptPage() {
  const params = useParams<{ id: string }>();
  const [bill, setBill] = useState<SupplierBillWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<SupplierBillWithItems>(`/finance/supplier-bills/${params.id}`)
      .then(setBill)
      .catch((err) =>
        setError(describeApiError(err, "Couldn't load this supplier bill.")),
      )
      .finally(() => setLoading(false));
  }, [params.id]);

  const balance = bill
    ? Number(bill.total_amount) - Number(bill.paid_amount)
    : 0;

  return (
    <>
      <Topbar
        title={bill ? bill.bill_number : "Supplier Bill"}
        description="Receipt for this purchase."
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 no-print">
          <Link
            href="/finance/bills"
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-100 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Bills
          </Link>
          {bill && balance > 0 && (
            <Link href="/finance/supplier-payments/new">
              <Button variant="secondary">
                <CreditCard size={15} />
                Pay supplier
              </Button>
            </Link>
          )}
        </div>

        {loading && (
          <p className="text-sm text-ink-500">Loading supplier bill…</p>
        )}
        {error && !bill && (
          <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2 max-w-2xl">
            {error}
          </p>
        )}

        {bill && (
          <ReceiptDocument
            docType="Supplier Bill"
            docNumber={bill.bill_number}
            date={bill.issue_date}
            status={bill.status}
            statusTone={STATUS_TONE[bill.status]}
            partyLabel="Billed from"
            partyName={bill.supplierName ?? `Contact #${bill.supplier_id}`}
            currency={bill.currency}
            lines={bill.items.map<ReceiptLine>((item) => ({
              name: item.product_name,
              sku: item.product_sku,
              quantity: item.quantity,
              unitPrice: item.unit_cost,
              lineTotal: item.line_total,
            }))}
            totals={{
              subtotal: bill.subtotal,
              tax: bill.tax_amount,
              total: bill.total_amount,
              paid: bill.paid_amount,
              balance: balance > 0 ? balance : undefined,
            }}
            notes={bill.notes}
            footer={
              bill.purchase_order_id
                ? `Generated from purchase order #${bill.purchase_order_id}`
                : undefined
            }
          />
        )}
      </div>
    </>
  );
}
