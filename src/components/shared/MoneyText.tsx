import { formatMoney } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MoneyTextProps {
  value: number | string | null | undefined;
  size?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
  /** When true, colours negative values red and positive values green */
  signed?: boolean;
}

const sizeClasses = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
};

export function MoneyText({ value, size = "base", className, signed }: MoneyTextProps) {
  const num = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  const formatted = formatMoney(num);

  let colorClass = "";
  if (signed) {
    if (num > 0) colorClass = "text-[#22A665]";
    else if (num < 0) colorClass = "text-[#D94F4F]";
  }

  return (
    <span
      className={cn(
        "font-semibold tabular-nums",
        sizeClasses[size],
        colorClass,
        className
      )}
    >
      {formatted}
    </span>
  );
}
