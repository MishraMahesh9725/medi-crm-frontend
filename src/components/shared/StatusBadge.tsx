import { cn } from "@/lib/utils";

type Variant = "success" | "warning" | "danger" | "info" | "neutral" | "primary";

interface StatusBadgeProps {
  label: string;
  variant: Variant;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  success: "bg-[#E8F8F1] text-[#155740]",
  warning: "bg-[#FEF3E2] text-[#7C4D0D]",
  danger: "bg-[#FDECEA] text-[#7A1F1F]",
  info: "bg-[#EBF3FC] text-[#1D4C7A]",
  neutral: "bg-[#F3F7F6] text-[#5A7370]",
  primary: "bg-[#E4F3F1] text-[#236F65]",
};

export function StatusBadge({ label, variant, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium",
        variantStyles[variant],
        className
      )}
    >
      {label}
    </span>
  );
}

/** Maps sale status to a badge. */
export function SaleStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: Variant }> = {
    COMPLETED: { label: "Completed", variant: "success" },
    CANCELLED: { label: "Cancelled", variant: "danger" },
    RETURNED: { label: "Returned", variant: "warning" },
  };
  const s = map[status] ?? { label: status, variant: "neutral" };
  return <StatusBadge label={s.label} variant={s.variant} />;
}

/** Maps drug schedule to a badge. */
export function ScheduleBadge({ schedule }: { schedule: string }) {
  if (!schedule || schedule === "NONE") return null;
  const map: Record<string, { label: string; variant: Variant }> = {
    H: { label: "Schedule H", variant: "warning" },
    H1: { label: "Schedule H1", variant: "danger" },
    X: { label: "Schedule X", variant: "danger" },
    NARCOTIC: { label: "Narcotic", variant: "danger" },
  };
  const s = map[schedule] ?? { label: schedule, variant: "neutral" };
  return <StatusBadge label={s.label} variant={s.variant} />;
}

/** Maps payment mode to a badge. */
export function PaymentModeBadge({ mode }: { mode: string }) {
  const map: Record<string, { label: string; variant: Variant }> = {
    CASH: { label: "Cash", variant: "success" },
    UPI: { label: "UPI", variant: "info" },
    CARD: { label: "Card", variant: "primary" },
    CREDIT: { label: "Credit", variant: "warning" },
    MIXED: { label: "Mixed", variant: "neutral" },
  };
  const s = map[mode] ?? { label: mode, variant: "neutral" };
  return <StatusBadge label={s.label} variant={s.variant} />;
}
