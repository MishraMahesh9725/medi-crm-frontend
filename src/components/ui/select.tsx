import { cn } from "@/lib/utils";
import React from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-[#1F2D2B]">
            {label}
            {props.required && <span className="text-[#D94F4F] ml-1">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "w-full min-h-[44px] px-3 py-2.5 rounded-[10px] border text-base text-[#1F2D2B] bg-white",
            "focus:outline-none focus:ring-2 focus:ring-[#2F8F83] focus:border-transparent",
            "disabled:bg-[#F3F7F6] disabled:cursor-not-allowed",
            "appearance-none",
            error ? "border-[#D94F4F]" : "border-[#E2EEEC]",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-[#D94F4F]">{error}</p>}
        {hint && !error && <p className="text-sm text-[#5A7370]">{hint}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
