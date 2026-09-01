"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { HrTabs } from "@/components/hr/HrTabs";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { Employee } from "@/lib/types";

const FALLBACK_EMPLOYEES: Employee[] = [
  {
    id: 1,
    ias_company_id: 2,
    employee_number: "EMP-001",
    first_name: "Sarah",
    last_name: "Bakery",
    email: "sarahbakery@gmail.com",
    phone: null,
    department: "Operations",
    job_title: "HR Admin",
    hire_date: "2026-01-15",
    salary: "80000.00",
    status: "ACTIVE",
    created_at: "2026-01-15T00:00:00.000Z",
    updated_at: "2026-01-15T00:00:00.000Z",
  },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(FALLBACK_EMPLOYEES);

  useEffect(() => {
    api
      .get<Employee[]>("/hr/employees")
      .then(setEmployees)
      .catch(() => setEmployees(FALLBACK_EMPLOYEES));
  }, []);

  const columns: Column<Employee>[] = [
    {
      header: "Employee",
      accessor: (e) => (
        <div>
          <p className="text-ink-100">
            {e.first_name} {e.last_name}
          </p>
          <p className="text-xs text-ink-500 font-mono">{e.employee_number}</p>
        </div>
      ),
    },
    { header: "Department", accessor: (e) => e.department ?? "—" },
    { header: "Title", accessor: (e) => e.job_title ?? "—" },
    {
      header: "Salary",
      accessor: (e) => `$${Number(e.salary).toFixed(2)}`,
      align: "right",
    },
    {
      header: "Status",
      accessor: (e) => (
        <Badge tone={e.status === "ACTIVE" ? "green" : "neutral"}>
          {e.status}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <Topbar
        title="Employees"
        description="Everyone on payroll at this company."
      />
      <HrTabs />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex justify-end">
          <Link
            href="/hr/employees/new"
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-signal-cyan text-base-950 hover:bg-signal-cyan/90 transition-colors"
          >
            <UserPlus size={15} />
            New employee
          </Link>
        </div>
        <DataTable
          columns={columns}
          rows={employees}
          rowKey={(e) => String(e.id)}
        />
      </div>
    </>
  );
}
