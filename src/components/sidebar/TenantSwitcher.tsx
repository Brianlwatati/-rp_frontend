"use client";

import { useState } from "react";
import { ChevronsUpDown, Check } from "lucide-react";

const TENANTS = [
  { id: "acme-erp", name: "Acme ERP", plan: "Growth" },
  { id: "harbor-logistics", name: "Harbor Logistics", plan: "Scale" },
  { id: "northwind-hr", name: "Northwind HR", plan: "Starter" },
];

export function TenantSwitcher() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(TENANTS[0]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-lg border border-base-600 bg-base-800 px-3 py-2.5 text-left hover:border-base-600/80 transition-colors"
      >
        <div className="h-7 w-7 shrink-0 rounded-md bg-signal-cyan/15 border border-signal-cyan/30 flex items-center justify-center">
          <span className="font-display text-xs font-semibold text-signal-cyan">
            {active.name.charAt(0)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink-100">{active.name}</p>
          <p className="text-[11px] text-ink-500 font-mono">{active.plan} plan</p>
        </div>
        <ChevronsUpDown size={14} className="text-ink-500" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 panel p-1.5">
          {TENANTS.map((tenant) => (
            <button
              key={tenant.id}
              onClick={() => {
                setActive(tenant);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink-300 hover:bg-base-700 hover:text-ink-100 transition-colors"
            >
              <span className="flex-1 text-left truncate">{tenant.name}</span>
              {tenant.id === active.id && <Check size={14} className="text-signal-cyan" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
