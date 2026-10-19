import { cn } from "@/lib/utils";
import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#1F2D2B]">
            {label}
            {props.required && <span className="text-[#D94F4F] ml-1">*</span>}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          rows={3}
          className={cn(
            "w-full px-3 py-2.5 rounded-[10px] border text-base text-[#1F2D2B] bg-white",
            "placeholder:text-[#5A7370] resize-y",
            "focus:outline-none focus:ring-2 focus:ring-[#2F8F83] focus:border-transparent",
            "disabled:bg-[#F3F7F6] disabled:cursor-not-allowed",
            error ? "border-[#D94F4F]" : "border-[#E2EEEC]",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-[#D94F4F]">{error}</p>}
        {hint && !error && <p className="text-sm text-[#5A7370]">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
