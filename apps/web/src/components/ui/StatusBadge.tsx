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
      bg: "bg-surface-100",
      text: "text-surface-800",
      dot: "bg-surface-500",
      border: "border-surface-300",
    },
    UNDER_REVIEW: {
      label: "Sedang Ditinjau",
      bg: "bg-amber-50",
      text: "text-amber-800",
      dot: "bg-amber-500",
      border: "border-amber-200",
    },
    VERIFIED: {
      label: "Terverifikasi",
      bg: "bg-blue-50",
      text: "text-blue-800",
      dot: "bg-blue-500",
      border: "border-blue-200",
    },
    IN_PROGRESS: {
      label: "Sedang Ditangani",
      bg: "bg-orange-50",
      text: "text-orange-800",
      dot: "bg-orange-500",
      border: "border-orange-200",
    },
    RESOLVED: {
      label: "Selesai Ditangani",
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      dot: "bg-emerald-600",
      border: "border-emerald-200",
    },
    REJECTED: {
      label: "Ditolak",
      bg: "bg-red-50",
      text: "text-red-800",
      dot: "bg-red-500",
      border: "border-red-200",
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
