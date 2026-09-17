import Link from "next/link";
import { Receipt } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { ReportDeliveryTabs } from "@/components/report-delivery/ReportDeliveryTabs";

export default function ReportsIndexPage() {
  const tiles = [
    {
      href: "/report-delivery/subscription",
      label: "Subscriptions",
      description: "Manage your report delivery subscriptions.",
      icon: Receipt,
    },
    {
      href: "/report-delivery/usage",
      label: "Usage",
      description: "View usage statistics for your report delivery.",
      icon: Receipt,
    },
  ];

  return (
    <>
      <Topbar
        title="Report Delivery"
        description="Manage and review your report delivery settings."
      />
      <ReportDeliveryTabs />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">
          {tiles.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="panel p-5 group hover:border-signal-cyan/60 transition-colors"
            >
              <div className="flex items-center justify-between">
                <Icon size={20} className="text-signal-cyan" />
                <span className="text-ink-500 group-hover:text-signal-cyan transition-colors">
                  →
                </span>
              </div>
              <h2 className="mt-8 font-display text-lg font-semibold text-ink-100">
                {label}
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-500">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
