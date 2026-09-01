"use client";

import { FormEvent, useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { HrTabs } from "@/components/hr/HrTabs";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { api, describeApiError } from "@/lib/api";
import { useEmployeeLookups } from "@/lib/hrLookups";
import type { Attendance } from "@/lib/types";

const FALLBACK_ATTENDANCE: Attendance[] = [
  { id: 1, ias_company_id: 2, employee_id: 1, attendance_date: "2026-08-31", clock_in: "09:02", clock_out: "17:15", notes: null, employeeNumber: "EMP-001", firstName: "Sarah", lastName: "Bakery" },
];

export default function AttendancePage() {
  const { employees } = useEmployeeLookups();
  const [records, setRecords] = useState<Attendance[]>(FALLBACK_ATTENDANCE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState("");
  const [clockIn, setClockIn] = useState("");
  const [clockOut, setClockOut] = useState("");

  function load() {
    api
      .get<Attendance[]>("/hr/attendance")
      .then(setRecords)
      .catch(() => setRecords(FALLBACK_ATTENDANCE));
  }

  useEffect(load, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // Upserts by (employee, date) — call once for clock-in, again later
      // for clock-out; whichever fields you send are merged in.
      await api.post(`/hr/attendance/${employeeId}`, {
        date: date || undefined,
        clockIn: clockIn || undefined,
        clockOut: clockOut || undefined,
      });
      setClockIn("");
      setClockOut("");
      load();
    } catch (err) {
      setError(describeApiError(err, "Couldn't record attendance."));
    } finally {
      setSubmitting(false);
    }
  }

  const columns: Column<Attendance>[] = [
    { header: "Date", accessor: (a) => new Date(a.attendance_date).toLocaleDateString() },
    {
      header: "Employee",
      accessor: (a) => (a.firstName ? `${a.firstName} ${a.lastName} (${a.employeeNumber})` : `#${a.employee_id}`),
    },
    { header: "Clock in", accessor: (a) => a.clock_in ?? "—" },
    { header: "Clock out", accessor: (a) => a.clock_out ?? "—" },
    { header: "Notes", accessor: (a) => a.notes ?? "—" },
  ];

  return (
    <>
      <Topbar title="Attendance" description="Clock employees in and out." />
      <HrTabs />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <form onSubmit={onSubmit} className="panel p-5 space-y-4">
          <p className="label-eyebrow">Record attendance</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
            <Field label="Date" hint="Defaults to today.">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Clock in">
              <input type="time" value={clockIn} onChange={(e) => setClockIn(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Clock out">
              <input type="time" value={clockOut} onChange={(e) => setClockOut(e.target.value)} className={inputClass} />
            </Field>
          </div>
          {error && (
            <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <Button type="submit" disabled={submitting}>
            <Clock size={15} />
            {submitting ? "Saving…" : "Save"}
          </Button>
        </form>

        <DataTable columns={columns} rows={records} rowKey={(a) => String(a.id)} />
      </div>
    </>
  );
}
