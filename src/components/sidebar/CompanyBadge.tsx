"use client";

import { useAuth } from "@/context/AuthContext";

// The ERP backend scopes every request to one company via the JWT's
// iasCompanyId — there's no multi-company switching to do here, so this
// just displays who you're signed in as instead of pretending to be a
// picker.
export function CompanyBadge() {
  const { user } = useAuth();
  const name = user?.company?.name ?? "Your company";
  const code = user?.company?.code;

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-base-600 bg-base-800 px-3 py-2.5">
      <div className="h-7 w-7 shrink-0 rounded-md bg-signal-cyan/15 border border-signal-cyan/30 flex items-center justify-center">
        <span className="font-display text-xs font-semibold text-signal-cyan">{name.charAt(0)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-100">{name}</p>
        {code && <p className="text-[11px] text-ink-500 font-mono">{code}</p>}
      </div>
    </div>
  );
}
