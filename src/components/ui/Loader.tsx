interface LoaderProps {
  label?: string;
  className?: string;
}

export function Loader({ label = "Loading", className = "" }: LoaderProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`flex min-h-32 items-center justify-center gap-3 text-sm text-ink-500 ${className}`}
    >
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-base-600 border-t-signal-cyan" />
      <span>{label}</span>
    </div>
  );
}
