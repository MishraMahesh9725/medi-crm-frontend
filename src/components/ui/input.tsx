import { cn } from "@/lib/utils";
import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftAddon, rightAddon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#1F2D2B]"
          >
            {label}
            {props.required && <span className="text-[#D94F4F] ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftAddon && (
            <div className="absolute left-3 text-[#5A7370] pointer-events-none">
              {leftAddon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full min-h-[44px] px-3 py-2.5 rounded-[10px] border text-base text-[#1F2D2B]",
              "bg-white placeholder:text-[#5A7370]",
              "focus:outline-none focus:ring-2 focus:ring-[#2F8F83] focus:border-transparent",
              "disabled:bg-[#F3F7F6] disabled:cursor-not-allowed disabled:text-[#5A7370]",
              error
                ? "border-[#D94F4F] focus:ring-[#D94F4F]"
                : "border-[#E2EEEC]",
              leftAddon && "pl-10",
              rightAddon && "pr-10",
              className
            )}
            {...props}
          />
          {rightAddon && (
            <div className="absolute right-3 text-[#5A7370]">
              {rightAddon}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-[#D94F4F]">{error}</p>}
        {hint && !error && <p className="text-sm text-[#5A7370]">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
