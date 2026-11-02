"use client";

import React from "react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface HotBadgeProps {
  className?: string;
  score?: number;
}

export function HotBadge({ className, score }: HotBadgeProps) {
  return (
    <span
      title={score ? `Hot Score: ${Math.round(score)}` : "Mendapat atensi tinggi dari publik"}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-crimson-100 text-crimson-800 border border-crimson-200 shrink-0",
        className
      )}
    >
      <Flame className="w-3.5 h-3.5 fill-crimson-600 text-crimson-600" />
      <span>HOT</span>
    </span>
  );
}
