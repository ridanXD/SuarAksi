"use client";

import React from "react";
import { ReportStatus } from "@suaraksi/shared";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const configs: Record<ReportStatus, { label: string; bg: string; text: string; dot: string; border: string }> = {
    SUBMITTED: {
      label: "Terkirim",
      bg: "bg-surface-100 dark:bg-surface-800",
      text: "text-surface-800 dark:text-surface-200",
      dot: "bg-surface-500",
      border: "border-surface-200 dark:border-surface-700",
    },
    UNDER_REVIEW: {
      label: "Sedang Ditinjau",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-700 dark:text-amber-400",
      dot: "bg-amber-500",
      border: "border-amber-200 dark:border-amber-800",
    },
    VERIFIED: {
      label: "Terverifikasi",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      text: "text-blue-700 dark:text-blue-400",
      dot: "bg-blue-500",
      border: "border-blue-200 dark:border-blue-800",
    },
    IN_PROGRESS: {
      label: "Sedang Ditangani",
      bg: "bg-orange-50 dark:bg-orange-950/40",
      text: "text-orange-700 dark:text-orange-400",
      dot: "bg-orange-500",
      border: "border-orange-200 dark:border-orange-800",
    },
    RESOLVED: {
      label: "Selesai Ditangani",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-700 dark:text-emerald-400",
      dot: "bg-emerald-500",
      border: "border-emerald-200 dark:border-emerald-800",
    },
    REJECTED: {
      label: "Ditolak",
      bg: "bg-red-50 dark:bg-red-950/40",
      text: "text-red-700 dark:text-red-400",
      dot: "bg-red-500",
      border: "border-red-200 dark:border-red-800",
    },
  };

  const config = configs[status] || configs.SUBMITTED;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
