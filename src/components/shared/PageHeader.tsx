import { cn } from "@/lib/utils";
import React from "react";

interface PageHeaderProps {
  title: string;
  help?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, help, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-6", className)}>
      <div>
        <h1 className="text-2xl font-semibold text-[#1F2D2B] leading-tight">{title}</h1>
        {help && <p className="text-[#5A7370] text-base mt-1">{help}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
