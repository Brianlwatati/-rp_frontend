"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/inventory", label: "Overview" },
  { href: "/inventory/products", label: "Products" },
  { href: "/inventory/stock", label: "Stock" },
  { href: "/inventory/warehouses", label: "Warehouses" },
];

export function InventoryTabs() {
  const pathname = usePathname();

  return (
    <>
      <div className="hidden lg:flex items-center gap-1 border-b border-base-600/60 px-4 sm:px-6 overflow-x-auto">
        {TABS.map((tab) => {
          const active =
            tab.href === "/inventory"
              ? pathname === "/inventory"
              : pathname.startsWith(tab.href);
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

      <div className="flex lg:hidden flex-wrap items-center justify-between gap-3 px-4 sm:px-6 border-b border-base-600/60 pt-3 pb-2">
        <Link
          href="/inventory"
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-100 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to inventory
        </Link>
      </div>
    </>
  );
}
