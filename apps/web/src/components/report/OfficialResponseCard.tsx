"use client";

import React from "react";
import Image from "next/image";
import { OfficialResponseItem } from "@suaraksi/shared";
import { formatDate } from "@/lib/utils";
import { Avatar } from "../ui/Avatar";
import { VerifiedBadge } from "../ui/VerifiedBadge";

interface OfficialResponseCardProps {
  response: OfficialResponseItem;
}

export function OfficialResponseCard({ response }: OfficialResponseCardProps) {
  const instanceName =
    response.instance.instanceProfile?.instanceName || response.instance.name;

  return (
    <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 p-5 space-y-3 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar
            src={response.instance.avatarUrl}
            name={instanceName}
            size="md"
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-surface-900 dark:text-white">
                {instanceName}
              </span>
              <VerifiedBadge size={16} />
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 uppercase tracking-wide">
                Tanggapan Resmi
              </span>
            </div>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              {formatDate(response.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm text-surface-800 dark:text-surface-200 whitespace-pre-line leading-relaxed">
        {response.content}
      </p>

      {response.attachmentUrls && response.attachmentUrls.length > 0 && (
        <div className="space-y-1.5 pt-2">
          <span className="text-[11px] font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
            Dokumentasi Penyelesaian:
          </span>
          <div className="flex gap-2 flex-wrap">
            {response.attachmentUrls.map((url, idx) => (
              <div
                key={idx}
                className="relative w-28 h-28 rounded-xl overflow-hidden border border-blue-200 dark:border-blue-900 bg-white dark:bg-surface-800"
              >
                <Image
                  src={url}
                  alt={`Dokumentasi ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
