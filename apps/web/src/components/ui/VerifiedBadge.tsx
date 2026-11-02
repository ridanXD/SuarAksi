"use client";

import React from "react";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  className?: string;
  size?: number;
  label?: string;
}

export function VerifiedBadge({ className, size = 16, label = "Instansi Resmi Terverifikasi" }: VerifiedBadgeProps) {
  return (
    <span
      title={label}
      className={cn("inline-flex items-center text-blue-600 shrink-0", className)}
    >
      <BadgeCheck size={size} className="fill-blue-600 text-white" />
    </span>
  );
}
