"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/hr/employees", label: "Employees" },
  { href: "/hr/attendance", label: "Attendance" },
  { href: "/hr/leave", label: "Leave" },
  { href: "/hr/payroll", label: "Payroll" },
];

export function HrTabs() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 border-b border-base-600/60 px-4 sm:px-6 overflow-x-auto">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
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
  );
}
