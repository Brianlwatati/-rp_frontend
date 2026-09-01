"use client";

import { Printer } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";

export interface ReceiptLine {
  name: string;
  sku?: string | null;
  quantity: string | number;
  unitPrice: string | number;
  lineTotal: string | number;
}

export interface ReceiptTotals {
  subtotal: string | number;
  discount?: string | number;
  tax?: string | number;
  total: string | number;
  paid?: string | number;
  balance?: string | number;
}

interface ReceiptDocumentProps {
  docType: string; // "Sales Order", "Invoice", "Purchase Order", "Payment Receipt"
  docNumber: string;
  date: string;
  status?: string;
  statusTone?: "green" | "amber" | "red" | "cyan" | "neutral";
  partyLabel: string; // "Bill to", "Supplier", "Received from"
  partyName: string;
  currency?: string;
  lines?: ReceiptLine[];
  totals?: ReceiptTotals;
  notes?: string | null;
  footer?: string;
}

const money = (v: string | number | undefined, currency = "") => {
  if (v === undefined || v === null) return "—";
  const n = Number(v);
  return `${currency ? currency + " " : ""}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// A print-friendly document reused for sales orders, invoices, purchase
// orders, and payment confirmations. Always renders in the light palette
// (data-theme="light" scopes just this subtree) so it looks right on paper
// regardless of the app's current theme — same trick the login branding
// rail uses to stay dark on purpose.
export function ReceiptDocument({
  docType,
  docNumber,
  date,
  status,
  statusTone = "neutral",
  partyLabel,
  partyName,
  currency = "",
  lines,
  totals,
  notes,
  footer,
}: ReceiptDocumentProps) {
  const { user } = useAuth();
  const company = user?.company;

  return (
    <div>
      <div className="no-print flex justify-end mb-3">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-signal-cyan text-base-950 hover:bg-signal-cyan/90 transition-colors"
        >
          <Printer size={15} />
          Print
        </button>
      </div>

      <div
        data-theme="light"
        className="receipt-printable max-w-2xl mx-auto bg-base-800 border border-base-600 rounded-xl p-8 text-ink-100"
      >
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-base-600">
          <div>
            <p className="font-display text-lg font-semibold">{company?.name ?? "Your Company"}</p>
            {company?.code && <p className="text-xs text-ink-500 font-mono">{company.code}</p>}
            {company?.email && <p className="text-xs text-ink-500">{company.email}</p>}
            {company?.phone && <p className="text-xs text-ink-500">{company.phone}</p>}
          </div>
          <div className="text-right">
            <p className="label-eyebrow">{docType}</p>
            <p className="font-mono text-base text-ink-100 mt-1">{docNumber}</p>
            <p className="text-xs text-ink-500 mt-1">{new Date(date).toLocaleDateString(undefined, { dateStyle: "medium" })}</p>
            {status && (
              <div className="mt-2">
                <Badge tone={statusTone}>{status}</Badge>
              </div>
            )}
          </div>
        </div>

        <div className="py-5 border-b border-base-600">
          <p className="label-eyebrow mb-1">{partyLabel}</p>
          <p className="text-sm text-ink-100">{partyName}</p>
        </div>

        {lines && lines.length > 0 && (
          <table className="w-full text-sm mt-5">
            <thead>
              <tr className="border-b border-base-600 text-left">
                <th className="label-eyebrow font-normal py-2">Item</th>
                <th className="label-eyebrow font-normal py-2 text-right">Qty</th>
                <th className="label-eyebrow font-normal py-2 text-right">Unit price</th>
                <th className="label-eyebrow font-normal py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="border-b border-base-600/40">
                  <td className="py-2.5">
                    <p className="text-ink-100">{line.name}</p>
                    {line.sku && <p className="text-xs text-ink-500 font-mono">{line.sku}</p>}
                  </td>
                  <td className="py-2.5 text-right text-ink-300">{line.quantity}</td>
                  <td className="py-2.5 text-right text-ink-300 font-mono">{money(line.unitPrice, currency)}</td>
                  <td className="py-2.5 text-right text-ink-100 font-mono">{money(line.lineTotal, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totals && (
          <div className="mt-5 ml-auto max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between text-ink-300">
              <span>Subtotal</span>
              <span className="font-mono">{money(totals.subtotal, currency)}</span>
            </div>
            {totals.discount !== undefined && Number(totals.discount) > 0 && (
              <div className="flex justify-between text-ink-300">
                <span>Discount</span>
                <span className="font-mono">-{money(totals.discount, currency)}</span>
              </div>
            )}
            {totals.tax !== undefined && (
              <div className="flex justify-between text-ink-300">
                <span>Tax</span>
                <span className="font-mono">{money(totals.tax, currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink-100 font-medium pt-1.5 border-t border-base-600">
              <span>Total</span>
              <span className="font-mono">{money(totals.total, currency)}</span>
            </div>
            {totals.paid !== undefined && (
              <div className="flex justify-between text-signal-green">
                <span>Paid</span>
                <span className="font-mono">{money(totals.paid, currency)}</span>
              </div>
            )}
            {totals.balance !== undefined && (
              <div className="flex justify-between text-ink-100 font-medium">
                <span>Balance due</span>
                <span className="font-mono">{money(totals.balance, currency)}</span>
              </div>
            )}
          </div>
        )}

        {notes && (
          <div className="mt-6 pt-4 border-t border-base-600">
            <p className="label-eyebrow mb-1">Notes</p>
            <p className="text-sm text-ink-300">{notes}</p>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-ink-500">
          {footer ?? "Generated by IAS Console"}
        </p>
      </div>
    </div>
  );
}
