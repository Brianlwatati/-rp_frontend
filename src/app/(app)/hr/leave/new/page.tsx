"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { HrTabs } from "@/components/hr/HrTabs";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { api, describeApiError } from "@/lib/api";
import { useEmployeeLookups } from "@/lib/hrLookups";
import type { LeaveRequest } from "@/lib/types";

const LEAVE_TYPES = ["ANNUAL", "SICK", "UNPAID", "MATERNITY", "PATERNITY"];

export default function NewLeavePage() {
  const router = useRouter();
  const { employees } = useEmployeeLookups();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [employeeId, setEmployeeId] = useState("");
  const [leaveType, setLeaveType] = useState("ANNUAL");
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [reason, setReason] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post<LeaveRequest>(`/hr/employees/${employeeId}/leave`, {
        leaveType,
        startsOn,
        endsOn,
        reason: reason || undefined,
      });
      router.push("/hr/leave");
    } catch (err) {
      setError(describeApiError(err, "Couldn't submit this leave request."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topbar title="Request leave" description="Submit time off for approval." />
      <HrTabs />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form onSubmit={onSubmit} className="max-w-xl panel p-6 space-y-5">
          <Field label="Employee" required>
            <select required value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className={inputClass}>
              <option value="" disabled>
                Select…
              </option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Type" required>
            <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className={inputClass}>
              {LEAVE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="From" required>
              <input required type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} className={inputClass} />
            </Field>
            <Field label="To" required>
              <input required type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} className={inputClass} />
            </Field>
          </div>

          <Field label="Reason">
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className={inputClass} />
          </Field>

          {error && (
            <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit request"}
            </Button>
            <Link
              href="/hr/leave"
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
