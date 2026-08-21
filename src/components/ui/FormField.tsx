export const inputClass =
  "w-full rounded-lg bg-base-800 border border-base-600 px-3.5 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 focus:border-signal-cyan outline-none transition-colors disabled:opacity-60";

interface FieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function Field({ label, hint, required, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-ink-300">
        {label}
        {required && <span className="text-signal-red"> *</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-ink-500">{hint}</span>}
    </label>
  );
}
