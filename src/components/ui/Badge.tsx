type Tone = "cyan" | "amber" | "green" | "red" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  cyan: "bg-signal-cyan/10 text-signal-cyan border-signal-cyan/30",
  amber: "bg-signal-amber/10 text-signal-amber border-signal-amber/30",
  green: "bg-signal-green/10 text-signal-green border-signal-green/30",
  red: "bg-signal-red/10 text-signal-red border-signal-red/30",
  neutral: "bg-base-700 text-ink-300 border-base-600",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-wide ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
