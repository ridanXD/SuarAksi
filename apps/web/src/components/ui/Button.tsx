"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-600 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none rounded-md";

    const variants = {
      primary: "bg-crimson-600 text-white hover:bg-crimson-700 shadow-sm",
      secondary: "bg-surface-100 text-surface-900 hover:bg-surface-200 border border-surface-200",
      outline: "border border-surface-300 bg-transparent hover:bg-surface-50 text-surface-800",
      ghost: "hover:bg-surface-100 text-surface-700 hover:text-surface-900",
      danger: "bg-red-700 text-white hover:bg-red-800",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-11 px-6 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
