import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  icon: LucideIcon;
}

const TREND_COLOR: Record<NonNullable<StatCardProps["trend"]>, string> = {
  up: "text-signal-green",
  down: "text-signal-red",
  flat: "text-ink-500",
};

export function StatCard({ label, value, delta, trend = "flat", icon: Icon }: StatCardProps) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <p className="label-eyebrow">{label}</p>
        <Icon size={16} className="text-ink-500" />
      </div>
      <p className="mt-3 font-display text-2xl font-semibold text-ink-100">{value}</p>
      {delta && <p className={`mt-1 text-xs font-mono ${TREND_COLOR[trend]}`}>{delta}</p>}
    </div>
  );
}
