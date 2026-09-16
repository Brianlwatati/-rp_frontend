"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { FinanceTabs } from "@/components/finance/FinanceTabs";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { api, describeApiError } from "@/lib/api";
import type { Contact, Expense, ExpensePaymentMethod } from "@/lib/types";

export default function NewExpensePage() {
  const [suppliers, setSuppliers] = useState<Contact[]>([]);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseNumber, setExpenseNumber] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [currency, setCurrency] = useState("KES");
  const [paymentMethod, setPaymentMethod] =
    useState<ExpensePaymentMethod>("CASH");
  const [paymentAccountCode, setPaymentAccountCode] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Expense | null>(null);

  useEffect(() => {
    api
      .get<Contact[]>("/contacts?type=SUPPLIER")
      .then(setSuppliers)
      .catch(() => setSuppliers([]));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      const expense = await api.post<Expense>("/finance/expenses", {
        category,
        description,
        amount: Number(amount),
        expenseNumber: expenseNumber || undefined,
        expenseDate: expenseDate || undefined,
        currency: currency || undefined,
        paymentMethod: paymentMethod || undefined,
        paymentAccountCode: paymentAccountCode || undefined,
        supplierId: supplierId ? Number(supplierId) : undefined,
        reference: reference || undefined,
        notes: notes || undefined,
      });
      setResult(expense);
    } catch (err) {
      setError(describeApiError(err, "Could not create this expense."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topbar title="New expense" description="Record an operating expense." />
      <FinanceTabs />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form onSubmit={onSubmit} className="max-w-2xl panel p-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" required>
              <input
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Description" required>
              <input
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Amount" required>
              <input
                required
                min="0.01"
                step="0.01"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Currency">
              <input
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                className={inputClass}
              />
            </Field>
            <Field label="Expense number">
              <input
                value={expenseNumber}
                onChange={(e) => setExpenseNumber(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Expense date">
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Payment method">
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as ExpensePaymentMethod)
                }
                className={inputClass}
              >
                <option value="CASH">Cash</option>
                <option value="BANK">Bank</option>
                <option value="CREDIT">Credit</option>
              </select>
            </Field>
            <Field label="Supplier">
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className={inputClass}
              >
                <option value="">No supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Payment account code">
              <input
                value={paymentAccountCode}
                onChange={(e) => setPaymentAccountCode(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Reference">
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`${inputClass} min-h-24`}
            />
          </Field>

          {error && (
            <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {result && (
            <div className="flex items-center gap-2 text-sm text-signal-green bg-signal-green/10 border border-signal-green/30 rounded-lg px-3 py-2">
              <CheckCircle2 size={16} /> Expense{" "}
              {result.expenseNumber ?? `#${result.id}`} created.
            </div>
          )}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Create expense"}
            </Button>
            <Link
              href="/finance/expense"
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
