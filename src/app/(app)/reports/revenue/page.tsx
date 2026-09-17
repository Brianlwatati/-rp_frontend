"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Receipt } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { DataTable, Column } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import type { Expense } from "@/lib/types";
import { ReportsTab } from "@/components/reports/ReportsTab";

export default function RevenuePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    api
      .get<Expense[]>("/reports/revenue")
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
        title="Revenue"
        description="Track and analyze your company's revenue streams."
      />
      <ReportsTab />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <DataTable
          columns={columns}
          rows={expenses}
          rowKey={(expense) => String(expense.id)}
        />
      </div>
    </>
  );
}
