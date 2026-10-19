import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, message, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-[#E4F3F1] flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-[#2F8F83]" />
        </div>
      )}
      {title && <p className="text-lg font-semibold text-[#1F2D2B] mb-1">{title}</p>}
      <p className="text-[#5A7370] text-base max-w-xs">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
