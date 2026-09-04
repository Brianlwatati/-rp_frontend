"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { FinanceTabs } from "@/components/finance/FinanceTabs";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { api, describeApiError } from "@/lib/api";
import type { Contact, SupplierBill, SupplierPayment } from "@/lib/types";

interface AllocationRow {
  billId: string;
  amount: string;
}
const EMPTY_ROW: AllocationRow = { billId: "", amount: "" };

export default function NewSupplierPaymentPage() {
  const [suppliers, setSuppliers] = useState<Contact[]>([]);
  const [bills, setBills] = useState<SupplierBill[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [reference, setReference] = useState("");
  const [method, setMethod] = useState("CASH");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<AllocationRow[]>([{ ...EMPTY_ROW }]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SupplierPayment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get<Contact[]>("/contacts?type=SUPPLIER")
      .then(setSuppliers)
      .catch(() => setSuppliers([]));
    api
      .get<SupplierBill[]>("/finance/payables")
      .then(setBills)
      .catch(() => setBills([]));
  }, []);

  function updateRow(index: number, patch: Partial<AllocationRow>) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      const payment = await api.post<SupplierPayment>(
        "/finance/supplier-payments",
        {
          supplierId: supplierId ? Number(supplierId) : undefined,
          amount: Number(amount),
          paymentDate: paymentDate || undefined,
          paymentReference: reference || undefined,
          method,
          notes: notes || undefined,
          allocations: rows
            .filter((row) => row.billId)
            .map((row) => ({
              billId: Number(row.billId),
              amount: Number(row.amount),
            })),
        },
      );
      setResult(payment);
    } catch (err) {
      setError(
        describeApiError(err, "Could not record this supplier payment."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topbar
        title="Pay supplier"
        description="Apply a payment against one or more supplier bills."
      />
      <FinanceTabs />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form onSubmit={onSubmit} className="max-w-2xl panel p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field
              label="Supplier"
              hint="Optional when the selected bills identify one supplier."
            >
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className={inputClass}
              >
                <option value="">Not specified</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Amount paid" required>
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
            <Field label="Payment date">
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Reference">
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="SPAY-1001"
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
              Apply to bills <span className="text-signal-red">*</span>
            </p>
            <div className="space-y-3">
              {rows.map((row, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-2 sm:items-end"
                >
                  <select
                    required
                    value={row.billId}
                    onChange={(e) =>
                      updateRow(index, { billId: e.target.value })
                    }
                    className={`${inputClass} flex-1`}
                  >
                    <option value="" disabled>
                      Select a bill...
                    </option>
                    {bills.map((bill) => (
                      <option key={bill.id} value={bill.id}>
                        {bill.bill_number} -{" "}
                        {bill.supplierName ?? `#${bill.supplier_id}`} -{" "}
                        {bill.currency} {Number(bill.outstanding).toFixed(2)}{" "}
                        due
                      </option>
                    ))}
                  </select>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={row.amount}
                    onChange={(e) =>
                      updateRow(index, { amount: e.target.value })
                    }
                    placeholder="Amount"
                    className={`${inputClass} font-mono w-full sm:w-32`}
                  />
                  <button
                    type="button"
                    disabled={rows.length === 1}
                    onClick={() =>
                      setRows((current) =>
                        current.filter((_, i) => i !== index),
                      )
                    }
                    className="shrink-0 rounded-lg border border-base-600 bg-base-800 p-2.5 text-ink-500 hover:text-signal-red disabled:opacity-40"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setRows((current) => [...current, { ...EMPTY_ROW }])
              }
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-signal-cyan"
            >
              <Plus size={14} /> Add bill
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
            <div className="rounded-lg border border-signal-green/30 bg-signal-green/10 px-4 py-3 text-sm">
              <p className="flex items-center gap-2 text-signal-green font-medium">
                <CheckCircle2 size={15} /> Payment recorded
              </p>
              <p className="text-ink-300">
                Reference{" "}
                <span className="font-mono text-ink-100">
                  {result.payment_reference}
                </span>
              </p>
              <Link
                href="/finance/payables"
                className="text-signal-cyan text-xs"
              >
                View updated payables
              </Link>
            </div>
          )}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Recording..." : "Record supplier payment"}
            </Button>
            <Link
              href="/finance/payables"
              className="inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-medium bg-base-700 text-ink-100 border border-base-600"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
