"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/purchasing", label: "Purchase orders" },
  { href: "/purchasing/bills", label: "Bills" },
  { href: "/purchasing/payables", label: "Payables" },
  { href: "/purchasing/supplier-payments/new", label: "Pay supplier" },
];

export function PurchasingTabs() {
  const pathname = usePathname();
  const isOverviewPage = pathname === "/purchasing";

  return (
    <>
      <div className="hidden lg:flex items-center gap-1 border-b border-base-600/60 px-4 sm:px-6 overflow-x-auto">
        {TABS.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`shrink-0 px-3 py-2.5 text-sm border-b-2 -mb-px transition-colors ${
                active
                  ? "border-signal-cyan text-ink-100"
                  : "border-transparent text-ink-500 hover:text-ink-100"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {!isOverviewPage && (
        <div className="flex lg:hidden flex-wrap items-center justify-between gap-3 px-4 sm:px-6 border-b border-base-600/60 pt-3 pb-2">
          <Link
            href="/purchasing"
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-100 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to purchasing
          </Link>
        </div>
      )}
    </>
  );
}
