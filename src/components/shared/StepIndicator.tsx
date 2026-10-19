import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  current: number; // 0-indexed
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center gap-0">
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={i} className="flex items-center flex-1">
              {/* Circle */}
              <div className="flex flex-col items-center">
                <div
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 shrink-0 transition-all",
                    done
                      ? "bg-[#2F8F83] border-[#2F8F83] text-white"
                      : active
                      ? "bg-white border-[#2F8F83] text-[#2F8F83]"
                      : "bg-white border-[#E2EEEC] text-[#5A7370]"
                  )}
                >
                  {done ? <Check className="w-4 h-4" /> : <span>{i + 1}</span>}
                </div>
                <span
                  className={cn(
                    "mt-1.5 text-xs text-center leading-tight max-w-[72px]",
                    active ? "font-semibold text-[#1F2D2B]" : "text-[#5A7370]"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {/* Connector */}
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-1 mb-6",
                    done ? "bg-[#2F8F83]" : "bg-[#E2EEEC]"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
