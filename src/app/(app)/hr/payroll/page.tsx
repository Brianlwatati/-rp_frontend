"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Play } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { HrTabs } from "@/components/hr/HrTabs";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { api, describeApiError } from "@/lib/api";
import type { PayrollRun } from "@/lib/types";

export default function PayrollPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PayrollRun | null>(null);

  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [deductionRate, setDeductionRate] = useState("0");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      // Calculates gross/deductions/net for every ACTIVE employee in one
      // shot. There's no list endpoint for past runs — this is a
      // fire-and-see-the-result action, not a history view.
      const run = await api.post<PayrollRun>("/hr/payroll/runs", {
        periodStart,
        periodEnd,
        deductionRate: deductionRate ? Number(deductionRate) : undefined,
      });
      setResult(run);
    } catch (err) {
      setError(describeApiError(err, "Couldn't calculate this payroll run."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topbar title="Payroll" description="Calculate a payroll run for every active employee." />
      <HrTabs />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form onSubmit={onSubmit} className="max-w-xl panel p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Period start" required>
              <input
                required
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Period end" required>
              <input
                required
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Deduction rate" hint="Percent of gross salary withheld, e.g. tax/statutory deductions.">
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={deductionRate}
                onChange={(e) => setDeductionRate(e.target.value)}
                className={`${inputClass} font-mono pr-8`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500 text-sm">%</span>
            </div>
          </Field>

          {error && (
            <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {result && (
            <div className="rounded-lg border border-signal-green/30 bg-signal-green/10 px-4 py-3 text-sm space-y-2">
              <p className="flex items-center gap-2 text-signal-green font-medium">
                <CheckCircle2 size={15} />
                Payroll run calculated
              </p>
              <div className="grid grid-cols-3 gap-3 text-ink-100 font-mono">
                <div>
                  <p className="text-ink-500 text-xs font-sans">Gross</p>${Number(result.total_gross).toFixed(2)}
                </div>
                <div>
                  <p className="text-ink-500 text-xs font-sans">Deductions</p>$
                  {Number(result.total_deductions).toFixed(2)}
                </div>
                <div>
                  <p className="text-ink-500 text-xs font-sans">Net</p>${Number(result.total_net).toFixed(2)}
                </div>
              </div>
            </div>
          )}

          <Button type="submit" disabled={submitting}>
            <Play size={15} />
            {submitting ? "Calculating…" : "Run payroll"}
          </Button>
        </form>
      </div>
    </>
  );
}
