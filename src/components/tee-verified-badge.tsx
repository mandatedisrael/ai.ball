interface TeeVerifiedBadgeProps {
  size?: "sm" | "md";
  className?: string;
}

export function TeeVerifiedBadge({
  size = "sm",
  className = "",
}: TeeVerifiedBadgeProps) {
  const sizeClasses =
    size === "md"
      ? "gap-2 px-3.5 py-1.5 text-[0.68rem]"
      : "gap-1.5 px-3 py-1 text-[0.62rem]";

  return (
    <span
      className={`bg-accent-soft text-accent inline-flex items-center rounded-full font-bold tracking-widest uppercase ring-1 ring-accent/20 ${sizeClasses} ${className}`}
      title="Generated inside 0G's Trusted Execution Environment — verifiable and tamper-resistant."
    >
      <ShieldIcon className={size === "md" ? "h-3.5 w-3.5" : "h-3 w-3"} />
      TEE verified
    </span>
  );
}

export function TeeVerifiedCallout({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border border-accent/20 bg-accent-soft px-4 py-3.5 ${className}`}
    >
      <ShieldIcon className="text-accent mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="text-sm font-semibold">0G TEE verified response</p>
        <p className="text-muted mt-1 text-xs leading-5">
          Inference runs in an isolated, attestable environment — tamper-resistant
          by design.
        </p>
      </div>
    </div>
  );
}

function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 3 4 6.5V11c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6.5L12 3Z" />
      <path d="m9.5 12 2 2 4-4.5" />
    </svg>
  );
}