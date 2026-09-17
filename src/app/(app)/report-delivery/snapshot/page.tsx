"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { ReportDeliveryTabs } from "@/components/report-delivery/ReportDeliveryTabs";
import { Badge } from "@/components/ui/Badge";
import { Column, DataTable } from "@/components/ui/DataTable";
import { api, describeApiError } from "@/lib/api";
import type { ErpReportSnapshot } from "@/lib/types";

const PERIOD_TONE = {
  DAILY: "cyan",
  WEEKLY: "amber",
} as const;

const numberFormat = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function formatNumber(value: number) {
  return numberFormat.format(Number(value));
}

export default function ReportSnapshotsPage() {
  const [snapshots, setSnapshots] = useState<ErpReportSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<ErpReportSnapshot | ErpReportSnapshot[]>(
        "/report-delivery/snapshots",
      )
      .then((response) => {
        setSnapshots(Array.isArray(response) ? response : [response]);
      })
      .catch((err) => {
        setError(describeApiError(err, "Could not load report snapshots."));
      })
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<ErpReportSnapshot>[] = [
    {
      header: "Period",
      accessor: (snapshot) => (
        <div>
          <Badge tone={PERIOD_TONE[snapshot.periodType]}>
            {snapshot.periodType}
          </Badge>
          <p className="mt-1 text-xs text-ink-500">
            {formatDate(snapshot.periodStart)} -{" "}
            {formatDate(snapshot.periodEnd)}
          </p>
        </div>
      ),
    },
    {
      header: "Generated",
      accessor: (snapshot) => formatDateTime(snapshot.generatedAt),
    },
    {
      header: "Sales value",
      accessor: (snapshot) => formatNumber(snapshot.data.salesValue),
      align: "right",
    },
    {
      header: "Orders",
      accessor: (snapshot) => formatNumber(snapshot.data.ordersCount),
      align: "right",
    },
    {
      header: "Outstanding invoices",
      accessor: (snapshot) => formatNumber(snapshot.data.outstandingInvoices),
      align: "right",
    },
    {
      header: "Stock value",
      accessor: (snapshot) => formatNumber(snapshot.data.stockValue),
      align: "right",
    },
    {
      header: "Low stock",
      accessor: (snapshot) => formatNumber(snapshot.data.lowStockCount),
      align: "right",
    },
  ];

  return (
    <>
      <Topbar
        title="Report snapshots"
        description="Historical summaries of sales, orders, invoices, and stock."
      />
      <ReportDeliveryTabs />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {error && (
          <p className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <DataTable
          columns={columns}
          rows={snapshots}
          rowKey={(snapshot) => String(snapshot.id)}
          emptyLabel="No report snapshots yet."
          loading={loading}
        />
      </div>
    </>
  );
}
