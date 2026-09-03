"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { HrTabs } from "@/components/hr/HrTabs";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { api, describeApiError } from "@/lib/api";
import type { HrLookup } from "@/lib/types";

interface HrDirectoryPageProps {
  kind: "departments" | "job-titles";
  title: string;
  description: string;
  singular: string;
}

export function HrDirectoryPage({
  kind,
  title,
  description,
  singular,
}: HrDirectoryPageProps) {
  const [rows, setRows] = useState<HrLookup[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [descriptionValue, setDescriptionValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api
      .get<HrLookup[]>(`/hr/${kind}`)
      .then(setRows)
      .catch(() => setRows([]));
  }

  useEffect(load, [kind]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post<HrLookup>(`/hr/${kind}`, {
        name,
        code,
        description: descriptionValue,
      });
      setName("");
      load();
    } catch (err) {
      setError(describeApiError(err, `Couldn't create this ${singular}.`));
    } finally {
      setSubmitting(false);
    }
  }

  const columns: Column<HrLookup>[] = [
    {
      header: singular,
      accessor: (row) => <span className="text-ink-100">{row.name}</span>,
    },
    { header: "Status", accessor: (row) => row.status ?? "ACTIVE" },
  ];

  return (
    <>
      <Topbar title={title} description={description} />
      <HrTabs />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <form onSubmit={onSubmit} className="panel p-5 space-y-4 max-w-2xl">
          <p className="label-eyebrow">Create {singular}</p>
          <div className="space-y-4">
            <Field label="Name" required>
              <input
                required
                minLength={2}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={`Enter ${singular} name`}
                className={inputClass}
              />
            </Field>
            <Field label="Code" required>
              <input
                required
                minLength={2}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder={`COD-${singular.toUpperCase()}`}
                className={inputClass}
              />
            </Field>
            <Field label="Description">
              <textarea
                value={descriptionValue}
                onChange={(event) => setDescriptionValue(event.target.value)}
                placeholder={`Enter ${singular} description`}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <Button type="submit" disabled={submitting} className="shrink-0">
              <Plus size={15} />
              {submitting ? "Creating…" : `Create ${singular}`}
            </Button>
          </div>
          {error && (
            <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </form>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => String(row.id)}
        />
        <Link href="/hr" className="text-sm text-ink-500 hover:text-ink-100">
          Back to HR overview
        </Link>
      </div>
    </>
  );
}
