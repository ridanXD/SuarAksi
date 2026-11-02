"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const getInitials = (n: string) => {
    const parts = n.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "rounded-full bg-surface-200 text-surface-700 font-semibold flex items-center justify-center shrink-0 border border-surface-300 select-none",
          sizeClasses[size],
          className
        )}
      >
        {getInitials(name || "User")}
      </div>
    );
  }

  const dimensions = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden shrink-0 border border-surface-200 bg-surface-100",
        sizeClasses[size],
        className
      )}
    >
      <Image
        src={src}
        alt={name}
        width={dimensions[size]}
        height={dimensions[size]}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
