"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BellPlus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { api, describeApiError } from "@/lib/api";
import type { ReportSubscription } from "@/lib/types";

const CHANNEL_TONE = {
  EMAIL: "cyan",
  WHATSAPP: "green",
} as const;

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatSchedule(subscription: ReportSubscription) {
  const time = subscription.timeOfDay.slice(0, 5);
  if (subscription.frequency === "DAILY") return `Daily at ${time}`;
  const day = DAY_NAMES[subscription.dayOfWeek ?? -1] ?? "Selected day";
  return `${day} at ${time}`;
}

export default function ReportDeliveryPage() {
  const [subscriptions, setSubscriptions] = useState<ReportSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<ReportSubscription[]>("/report-delivery/subscriptions")
      .then(setSubscriptions)
      .catch((err) => {
        setError(describeApiError(err, "Could not load report subscriptions."));
      })
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<ReportSubscription>[] = [
    {
      header: "Channel",
      accessor: (subscription) => (
        <Badge tone={CHANNEL_TONE[subscription.channel]}>
          {subscription.channel}
        </Badge>
      ),
    },
    {
      header: "Recipient",
      accessor: (subscription) => (
        <span className="text-ink-100">{subscription.recipient}</span>
      ),
    },
    {
      header: "Schedule",
      accessor: (subscription) => formatSchedule(subscription),
    },
    {
      header: "Status",
      accessor: (subscription) => (
        <Badge tone={subscription.enabled ? "green" : "neutral"}>
          {subscription.enabled ? "Enabled" : "Disabled"}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <Topbar
        title="Report delivery"
        description="Schedule reports to arrive by email or WhatsApp."
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex justify-end">
          <Link
            href="/report-delivery/new"
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium bg-signal-cyan text-base-950 hover:bg-signal-cyan/90 transition-colors"
          >
            <BellPlus size={15} />
            New subscription
          </Link>
        </div>

        {error && (
          <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <DataTable
          columns={columns}
          rows={subscriptions}
          rowKey={(subscription) => String(subscription.id)}
          emptyLabel="No report subscriptions yet."
          loading={loading}
        />
      </div>
    </>
  );
}
