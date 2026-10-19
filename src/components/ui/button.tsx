import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium rounded-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F83] disabled:pointer-events-none disabled:opacity-50 min-h-[44px] px-4 text-base",
  {
    variants: {
      variant: {
        primary: "bg-[#2F8F83] text-white hover:bg-[#236F65]",
        secondary: "bg-[#E4F3F1] text-[#2F8F83] hover:bg-[#C8E8E4]",
        outline: "border border-[#E2EEEC] text-[#1F2D2B] bg-white hover:bg-[#F3F7F6]",
        ghost: "text-[#1F2D2B] hover:bg-[#F3F7F6]",
        danger: "bg-[#D94F4F] text-white hover:bg-[#C44040]",
        dangerOutline: "border border-[#D94F4F] text-[#D94F4F] bg-white hover:bg-[#FDECEA]",
        success: "bg-[#22A665] text-white hover:bg-[#1A8550]",
      },
      size: {
        sm: "px-3 min-h-[36px] text-sm",
        md: "px-4 min-h-[44px] text-base",
        lg: "px-6 min-h-[52px] text-base font-semibold",
        xl: "px-8 min-h-[60px] text-lg font-semibold",
        icon: "min-h-[44px] w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);
Button.displayName = "Button";
