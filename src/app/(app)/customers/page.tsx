"use client";

import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { Customer } from "@/lib/types";

const FALLBACK_CUSTOMERS: Customer[] = [
  { id: "1", name: "Harbor Logistics", email: "ap@harborlogistics.com", status: "active", balance: 4820 },
  { id: "2", name: "Northwind HR", email: "billing@northwindhr.com", status: "active", balance: 0 },
  { id: "3", name: "Delta Freight", email: "finance@deltafreight.com", status: "inactive", balance: 2100 },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(FALLBACK_CUSTOMERS);

  useEffect(() => {
    api
      .get<Customer[]>("/api/customers")
      .then(setCustomers)
      .catch(() => setCustomers(FALLBACK_CUSTOMERS));
  }, []);

  const columns: Column<Customer>[] = [
    { header: "Customer", accessor: (c) => <span className="text-ink-100">{c.name}</span> },
    { header: "Email", accessor: (c) => <span className="font-mono text-xs">{c.email}</span> },
    {
      header: "Status",
      accessor: (c) => <Badge tone={c.status === "active" ? "green" : "neutral"}>{c.status}</Badge>,
    },
    { header: "Balance", accessor: (c) => `$${c.balance.toLocaleString()}`, align: "right" },
  ];

  return (
    <>
      <Topbar title="Customers" description="Accounts placing orders against this tenant." />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex justify-end">
          <Button>
            <UserPlus size={15} />
            Add customer
          </Button>
        </div>
        <DataTable columns={columns} rows={customers} rowKey={(c) => c.id} />
      </div>
    </>
  );
}
