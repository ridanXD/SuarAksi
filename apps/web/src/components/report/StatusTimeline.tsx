"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2, Clock, AlertCircle, ShieldAlert, ArrowRight } from "lucide-react";
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
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "REJECTED":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-surface-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-surface-200 p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-surface-100">
        <div>
          <h3 className="text-sm font-bold text-surface-900">
            Riwayat & Transparansi Tindak Lanjut
          </h3>
          <p className="text-xs text-surface-500">
            Perkembangan penanganan laporan secara terbuka dan dapat dipantau publik
          </p>
        </div>
        <StatusBadge status={currentStatus} />
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-200">
        {history.map((item, index) => (
          <div key={item.id} className="relative space-y-2">
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border border-surface-300 flex items-center justify-center">
              {getStatusIcon(item.status)}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-1">
              <div className="flex items-center gap-2">
                <StatusBadge status={item.status} />
                <span className="text-xs text-surface-700 font-medium flex items-center gap-1">
                  oleh {item.changedBy.instanceProfile?.instanceName || item.changedBy.name}
                  {item.changedBy.isVerified && <VerifiedBadge size={14} />}
                </span>
              </div>
              <span className="text-xs text-surface-400">
                {formatDate(item.createdAt)}
              </span>
            </div>

            <p className="text-xs text-surface-700 bg-surface-50 p-2.5 rounded-md border border-surface-200 whitespace-pre-line leading-relaxed">
              {item.notes}
            </p>

            {item.evidenceUrls && item.evidenceUrls.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider">
                  Foto Bukti Tindak Lanjut:
                </span>
                <div className="flex gap-2 flex-wrap">
                  {item.evidenceUrls.map((url, imgIdx) => (
                    <div
                      key={imgIdx}
                      className="relative w-24 h-24 rounded-lg overflow-hidden border border-surface-200 bg-surface-100"
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
