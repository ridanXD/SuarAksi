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
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-crimson-100 dark:bg-crimson-950/50 text-crimson-700 dark:text-crimson-400 border border-crimson-200 dark:border-crimson-800 shrink-0",
        className
      )}
    >
      <Flame className="w-3.5 h-3.5 fill-crimson-600 text-crimson-600 dark:fill-crimson-400 dark:text-crimson-400" />
      <span>HOT</span>
    </span>
  );
}
