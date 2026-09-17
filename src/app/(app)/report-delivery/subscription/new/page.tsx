"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Field, inputClass } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { api, describeApiError } from "@/lib/api";
import type {
  ReportSubscription,
  SubscriptionChannel,
  SubscriptionFrequency,
} from "@/lib/types";

const EMPTY_FORM = {
  channel: "EMAIL" as SubscriptionChannel,
  frequency: "DAILY" as SubscriptionFrequency,
  timeOfDay: "08:00",
  recipient: "",
  enabled: true,
  dayOfWeek: "1",
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function NewReportDeliveryPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      channel: form.channel,
      frequency: form.frequency,
      timeOfDay: form.timeOfDay,
      recipient: form.recipient.trim(),
      enabled: form.enabled,
      ...(form.frequency === "WEEKLY"
        ? { dayOfWeek: Number(form.dayOfWeek) }
        : {}),
    };

    try {
      await api.post<ReportSubscription>(
        "/report-delivery/subscriptions",
        payload,
      );
      router.push("/report-delivery");
    } catch (err) {
      setError(describeApiError(err, "Could not create this subscription."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topbar
        title="New subscription"
        description="Choose when and where reports should be delivered."
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form onSubmit={onSubmit} className="max-w-xl panel p-6 space-y-5">
          {error && (
            <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Channel" required>
              <select
                value={form.channel}
                onChange={(event) =>
                  update("channel", event.target.value as SubscriptionChannel)
                }
                className={inputClass}
              >
                <option value="EMAIL">Email</option>
                <option value="WHATSAPP">WhatsApp</option>
              </select>
            </Field>

            <Field label="Frequency" required>
              <select
                value={form.frequency}
                onChange={(event) =>
                  update(
                    "frequency",
                    event.target.value as SubscriptionFrequency,
                  )
                }
                className={inputClass}
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Time of day" required>
              <input
                required
                type="time"
                value={form.timeOfDay}
                onChange={(event) => update("timeOfDay", event.target.value)}
                className={inputClass}
              />
            </Field>

            {form.frequency === "WEEKLY" && (
              <Field label="Day of week" required>
                <select
                  required
                  value={form.dayOfWeek}
                  onChange={(event) => update("dayOfWeek", event.target.value)}
                  className={inputClass}
                >
                  {DAY_NAMES.map((day, index) => (
                    <option key={day} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </div>

          <Field
            label={
              form.channel === "EMAIL" ? "Email address" : "WhatsApp number"
            }
            required
          >
            <input
              required
              type={form.channel === "EMAIL" ? "email" : "tel"}
              value={form.recipient}
              onChange={(event) => update("recipient", event.target.value)}
              placeholder={
                form.channel === "EMAIL"
                  ? "reports@company.com"
                  : "+1 555 010 1234"
              }
              className={inputClass}
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-ink-300">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(event) => update("enabled", event.target.checked)}
              className="h-4 w-4 accent-signal-cyan"
            />
            Enable this subscription immediately
          </label>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/report-delivery")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create subscription"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
