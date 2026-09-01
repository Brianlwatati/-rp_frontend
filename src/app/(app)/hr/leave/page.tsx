"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, CheckCircle2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { HrTabs } from "@/components/hr/HrTabs";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { api, describeApiError } from "@/lib/api";
import type { LeaveRequest, LeaveStatus } from "@/lib/types";

const FALLBACK_LEAVE: LeaveRequest[] = [
  {
    id: 1,
    ias_company_id: 2,
    employee_id: 1,
    leave_type: "ANNUAL",
    starts_on: "2026-09-05",
    ends_on: "2026-09-09",
    reason: "Family trip",
    status: "PENDING",
    approved_by: null,
    created_at: "2026-08-20T00:00:00.000Z",
    employeeNumber: "EMP-001",
    firstName: "Sarah",
    lastName: "Bakery",
  },
];

const STATUS_TONE: Record<LeaveStatus, "amber" | "green" | "red"> = {
  PENDING: "amber",
  APPROVED: "green",
  REJECTED: "red",
};

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>(FALLBACK_LEAVE);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    api
      .get<LeaveRequest[]>("/hr/leave")
      .then(setRequests)
      .catch(() => setRequests(FALLBACK_LEAVE));
  }

  useEffect(load, []);

  async function approve(id: number) {
    setActionError(null);
    setBusyId(id);
    try {
      await api.post(`/hr/leave/${id}/approve`);
      load();
    } catch (err) {
      setActionError(describeApiError(err, "Couldn't approve this request."));
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<LeaveRequest>[] = [
    {
      header: "Employee",
      accessor: (l) =>
        l.firstName
          ? `${l.firstName} ${l.lastName} (${l.employeeNumber})`
          : `#${l.employee_id}`,
    },
    { header: "Type", accessor: (l) => l.leave_type },
    {
      header: "Dates",
      accessor: (l) =>
        `${new Date(l.starts_on).toLocaleDateString()} – ${new Date(l.ends_on).toLocaleDateString()}`,
    },
    { header: "Reason", accessor: (l) => l.reason ?? "—" },
    {
      header: "Status",
      accessor: (l) => <Badge tone={STATUS_TONE[l.status]}>{l.status}</Badge>,
    },
    {
      header: "",
      accessor: (l) =>
        l.status === "PENDING" ? (
          <button
            disabled={busyId === l.id}
            onClick={() => approve(l.id)}
            className="inline-flex items-center gap-1.5 text-signal-cyan hover:text-signal-cyan/80 text-xs disabled:opacity-50"
          >
            <CheckCircle2 size={13} />
            Approve
          </button>
        ) : null,
      align: "right",
      width: "100px",
    },
  ];

  return (
    <>
      <Topbar title="Leave" description="Time-off requests and approvals." />
      <HrTabs />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {actionError && (
          <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
            {actionError}
          </p>
        )}
        <div className="flex justify-end">
          <Link
            href="/hr/leave/new"
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-signal-cyan text-base-950 hover:bg-signal-cyan/90 transition-colors"
          >
            <Plus size={15} />
            Request leave
          </Link>
        </div>
        <DataTable
          columns={columns}
          rows={requests}
          rowKey={(l) => String(l.id)}
        />
      </div>
    </>
  );
}
