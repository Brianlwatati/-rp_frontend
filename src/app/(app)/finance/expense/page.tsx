"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Receipt } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { FinanceTabs } from "@/components/finance/FinanceTabs";
import { DataTable, Column } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import type { Expense } from "@/lib/types";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    api
      .get<Expense[]>("/finance/expenses")
      .then(setExpenses)
      .catch(() => setExpenses([]));
  }, []);

  const columns: Column<Expense>[] = [
    {
      header: "Expense",
      accessor: (expense) => (
        <span className="inline-flex items-center gap-1.5 font-mono text-ink-100">
          <Receipt size={13} className="text-ink-500" />
          {expense.expenseNumber ?? `#${expense.id}`}
        </span>
      ),
    },
    { header: "Category", accessor: (expense) => expense.category },
    { header: "Description", accessor: (expense) => expense.description },
    {
      header: "Amount",
      accessor: (expense) =>
        `${expense.currency ?? "KES"} ${Number(expense.amount).toFixed(2)}`,
      align: "right",
    },
    {
      header: "Payment",
      accessor: (expense) => expense.paymentMethod ?? "-",
    },
    {
      header: "Date",
      accessor: (expense) =>
        expense.expenseDate
          ? new Date(expense.expenseDate).toLocaleDateString()
          : "-",
    },
  ];

  return (
    <>
      <Topbar
        title="Expenses"
        description="Record and review operating expenses."
      />
      <FinanceTabs />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex justify-end">
          <Link
            href="/finance/expense/new"
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-signal-cyan text-base-950 hover:bg-signal-cyan/90 transition-colors"
          >
            <Plus size={15} />
            New expense
          </Link>
        </div>
        <DataTable
          columns={columns}
          rows={expenses}
          rowKey={(expense) => String(expense.id)}
        />
      </div>
    </>
  );
}
