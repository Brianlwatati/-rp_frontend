"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { FinanceTabs } from "@/components/finance/FinanceTabs";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { api, describeApiError } from "@/lib/api";
import type { Contact, Receivable, Payment } from "@/lib/types";

interface AllocationRow {
  invoiceId: string;
  amount: string;
}

const EMPTY_ROW: AllocationRow = { invoiceId: "", amount: "" };

export default function NewPaymentPage() {
  const [customers, setCustomers] = useState<Contact[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Payment | null>(null);

  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [method, setMethod] = useState("CASH");
  const [notes, setNotes] = useState("");
  const [allocations, setAllocations] = useState<AllocationRow[]>([
    { ...EMPTY_ROW },
  ]);

  useEffect(() => {
    api
      .get<Contact[]>("/contacts?type=CUSTOMER")
      .then(setCustomers)
      .catch(() => setCustomers([]));
    api
      .get<Receivable[]>("/finance/receivables")
      .then(setReceivables)
      .catch(() => setReceivables([]));
  }, []);

  function updateRow(i: number, patch: Partial<AllocationRow>) {
    setAllocations((rows) =>
      rows.map((row, idx) => (idx === i ? { ...row, ...patch } : row)),
    );
  }
  function addRow() {
    setAllocations((rows) => [...rows, { ...EMPTY_ROW }]);
  }
  function removeRow(i: number) {
    setAllocations((rows) =>
      rows.length > 1 ? rows.filter((_, idx) => idx !== i) : rows,
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      const res = await api.post<Payment>("/finance/payments", {
        customerId: customerId ? Number(customerId) : undefined,
        amount: Number(amount),
        paymentDate: paymentDate || undefined,
        paymentReference: paymentReference || undefined,
        method: method || undefined,
        notes: notes || undefined,
        allocations: allocations
          .filter((a) => a.invoiceId)
          .map((a) => ({
            invoiceId: Number(a.invoiceId),
            amount: Number(a.amount),
          })),
      });
      setResult(res);
    } catch (err) {
      setError(
        describeApiError(
          err,
          "Couldn't record this payment. Check the fields and try again.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topbar
        title="Record payment"
        description="Applies against one or more open invoices."
      />
      <FinanceTabs />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form onSubmit={onSubmit} className="max-w-2xl panel p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Customer" hint="Optional — for your own records.">
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className={inputClass}
              >
                <option value="">Not specified</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Amount received" required>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field
              label="Reference"
              hint="Optional — auto-generated if left blank."
            >
              <input
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="PAY-1001"
                className={`${inputClass} font-mono`}
              />
            </Field>
            <Field label="Method">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className={inputClass}
              >
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank transfer</option>
                <option value="MOBILE_MONEY">Mobile money</option>
                <option value="CARD">Card</option>
              </select>
            </Field>
          </div>

          <div>
            <p className="text-xs font-medium text-ink-300 mb-2">
              Apply to invoices <span className="text-signal-red">*</span>
            </p>
            <div className="space-y-3">
              {allocations.map((row, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row gap-2 sm:items-end"
                >
                  <div className="flex-1">
                    <select
                      required
                      value={row.invoiceId}
                      onChange={(e) =>
                        updateRow(i, { invoiceId: e.target.value })
                      }
                      className={inputClass}
                    >
                      <option value="" disabled>
                        Select an invoice…
                      </option>
                      {receivables.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.invoice_number} ·{" "}
                          {r.customerName ?? `#${r.customer_id}`} · $
                          {Number(r.outstanding).toFixed(2)} due
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={row.amount}
                    onChange={(e) => updateRow(i, { amount: e.target.value })}
                    placeholder="Amount"
                    className={`${inputClass} font-mono w-full sm:w-32`}
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    disabled={allocations.length === 1}
                    className="shrink-0 rounded-lg border border-base-600 bg-base-800 p-2.5 text-ink-500 hover:text-signal-red disabled:opacity-40 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addRow}
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-signal-cyan hover:text-signal-cyan/80"
            >
              <Plus size={14} />
              Add invoice
            </button>
          </div>

          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className={inputClass}
            />
          </Field>

          {error && (
            <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {result && (
            <div className="rounded-lg border border-signal-green/30 bg-signal-green/10 px-4 py-3 text-sm space-y-1">
              <p className="flex items-center gap-2 text-signal-green font-medium">
                <CheckCircle2 size={15} />
                Payment recorded
              </p>
              <p className="text-ink-300">
                Reference{" "}
                <span className="font-mono text-ink-100">
                  {result.payment_reference}
                </span>{" "}
                ·{" "}
                <span className="font-mono text-ink-100">
                  ${Number(result.amount).toFixed(2)}
                </span>
              </p>
              <Link
                href="/finance/receivables"
                className="text-signal-cyan hover:text-signal-cyan/80 text-xs"
              >
                View updated receivables →
              </Link>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Recording…" : "Record payment"}
            </Button>
            <Link
              href="/finance/receivables"
              className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-base-700 text-ink-100 border border-base-600 hover:bg-base-700/70 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
