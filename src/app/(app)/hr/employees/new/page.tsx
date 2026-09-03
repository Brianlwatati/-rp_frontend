"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { HrTabs } from "@/components/hr/HrTabs";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { api, describeApiError } from "@/lib/api";
import { useDepartmentLookups, useJobTitleLookups } from "@/lib/hrLookups";
import type { Employee } from "@/lib/types";

export default function NewEmployeePage() {
  const router = useRouter();
  const departments = useDepartmentLookups();
  const jobTitles = useJobTitleLookups();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    employeeNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    jobTitle: "",
    hireDate: "",
    salary: "0",
  });

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post<Employee>("/hr/employees", {
        employeeNumber: form.employeeNumber,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email || undefined,
        phone: form.phone || undefined,
        departmentId: form.department
          ? departments.find((d) => d.name === form.department)?.id
          : undefined,
        jobTitleId: form.jobTitle
          ? jobTitles.find((j) => j.name === form.jobTitle)?.id
          : undefined,
        departmentName: form.department || undefined,
        jobTitleName: form.jobTitle || undefined,
        hireDate: form.hireDate || undefined,
        salary: Number(form.salary),
      });
      router.push("/hr/employees");
    } catch (err) {
      setError(
        describeApiError(
          err,
          "Couldn't add this employee. Check the fields and try again.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topbar title="New employee" description="Add someone to payroll." />
      <HrTabs />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form onSubmit={onSubmit} className="max-w-2xl panel p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field label="Employee number" required>
              <input
                required
                value={form.employeeNumber}
                onChange={(e) => update("employeeNumber", e.target.value)}
                placeholder="EMP-001"
                className={`${inputClass} font-mono`}
              />
            </Field>
            <Field label="First name" required>
              <input
                required
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Last name" required>
              <input
                required
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Phone">
              <input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Department">
              <select
                value={form.department}
                onChange={(e) => update("department", e.target.value)}
                className={inputClass}
              >
                <option value="">Select department…</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.name}>
                    {department.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Job title">
              <select
                value={form.jobTitle}
                onChange={(e) => update("jobTitle", e.target.value)}
                className={inputClass}
              >
                <option value="">Select job title…</option>
                {jobTitles.map((jobTitle) => (
                  <option key={jobTitle.id} value={jobTitle.name}>
                    {jobTitle.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Hire date">
              <input
                type="date"
                value={form.hireDate}
                onChange={(e) => update("hireDate", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Salary" hint="Monthly gross, used by payroll runs.">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.salary}
                onChange={(e) => update("salary", e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </Field>
          </div>

          {error && (
            <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding…" : "Add employee"}
            </Button>
            <Link
              href="/hr/employees"
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
