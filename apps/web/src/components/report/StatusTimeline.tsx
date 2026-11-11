"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { StatusHistoryItem, ReportStatus } from "@suaraksi/shared";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "../ui/StatusBadge";
import { VerifiedBadge } from "../ui/VerifiedBadge";

interface StatusTimelineProps {
  history: StatusHistoryItem[];
  currentStatus: ReportStatus;
}

export function StatusTimeline({ history, currentStatus }: StatusTimelineProps) {
  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case "RESOLVED":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "REJECTED":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-surface-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-black rounded-2xl border border-surface-200 dark:border-surface-800 p-5 space-y-4 transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-800">
        <div>
          <h3 className="text-sm font-bold text-surface-900 dark:text-white">
            Riwayat & Transparansi Tindak Lanjut
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Perkembangan penanganan laporan secara terbuka dan dapat dipantau publik
          </p>
        </div>
        <StatusBadge status={currentStatus} />
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-200 dark:before:bg-surface-800">
        {history.map((item) => (
          <div key={item.id} className="relative space-y-2">
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white dark:bg-surface-900 border border-surface-300 dark:border-surface-700 flex items-center justify-center">
              {getStatusIcon(item.status)}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-1">
              <div className="flex items-center gap-2">
                <StatusBadge status={item.status} />
                <span className="text-xs text-surface-700 dark:text-surface-300 font-medium flex items-center gap-1">
                  oleh {item.changedBy.instanceProfile?.instanceName || item.changedBy.name}
                  {item.changedBy.isVerified && <VerifiedBadge size={14} />}
                </span>
              </div>
              <span className="text-xs text-surface-400 dark:text-surface-500">
                {formatDate(item.createdAt)}
              </span>
            </div>

            <p className="text-xs text-surface-700 dark:text-surface-300 bg-surface-50 dark:bg-surface-900/60 p-3 rounded-xl border border-surface-200 dark:border-surface-800 whitespace-pre-line leading-relaxed">
              {item.notes}
            </p>

            {item.evidenceUrls && item.evidenceUrls.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Foto Bukti Tindak Lanjut:
                </span>
                <div className="flex gap-2 flex-wrap">
                  {item.evidenceUrls.map((url, imgIdx) => (
                    <div
                      key={imgIdx}
                      className="relative w-24 h-24 rounded-xl overflow-hidden border border-surface-200 dark:border-surface-800 bg-surface-100 dark:bg-surface-900"
                    >
                      <Image
                        src={url}
                        alt={`Bukti ${imgIdx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
