"use client";

import React, { useState, useEffect } from "react";
import { Flame, ArrowBigUp, MessageSquare } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ReportCard } from "@/components/report/ReportCard";
import { ReportCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type TrendingTab = "hot" | "most-supported" | "most-discussed";

export default function TrendingPage() {
  const [subTab, setSubTab] = useState<TrendingTab>("hot");
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    let endpoint = "/trending/hot";
    if (subTab === "most-supported") endpoint = "/trending/most-supported";
    if (subTab === "most-discussed") endpoint = "/trending/most-discussed";

    api.get<any[]>(endpoint)
      .then(setReports)
      .catch(() => setReports([]))
      .finally(() => setIsLoading(false));
  }, [subTab]);

  const tabs: { key: TrendingTab; label: string; icon: React.ElementType }[] = [
    { key: "hot", label: "Laporan HOT", icon: Flame },
    { key: "most-supported", label: "Paling Banyak UP", icon: ArrowBigUp },
    { key: "most-discussed", label: "Paling Ramai", icon: MessageSquare },
  ];

  return (
    <AppLayout>
      <div className="border-b border-surface-200 dark:border-surface-800 bg-white/85 dark:bg-black/85 backdrop-blur-md sticky top-[53px] z-20 select-none transition-colors">
        <div className="p-4 space-y-1">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 fill-crimson-600 text-crimson-600 dark:fill-crimson-500 dark:text-crimson-500" />
            <h1 className="text-base font-black text-surface-900 dark:text-white tracking-tight">
              Pusat Trending & Atensi Publik
            </h1>
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Algoritma pembobotan otomatis berbasis UP, tanggapan, repost, dan kecepatan atensi publik.
          </p>
        </div>

        <div className="flex border-b border-surface-200 dark:border-surface-800">
          {tabs.map((t) => {
            const isActive = subTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setSubTab(t.key)}
                className={cn(
                  "flex-1 py-3.5 text-xs sm:text-sm text-center transition-colors relative flex items-center justify-center gap-1.5 cursor-pointer",
                  isActive
                    ? "text-surface-900 dark:text-white font-bold"
                    : "text-surface-500 dark:text-surface-400 font-medium hover:bg-surface-50 dark:hover:bg-surface-900/50"
                )}
              >
                <span>{t.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 h-1 w-14 bg-crimson-600 rounded-full inset-x-0 mx-auto" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="divide-y divide-surface-200 dark:divide-surface-800 bg-white dark:bg-black transition-colors">
        {isLoading ? (
          <div>
            <ReportCardSkeleton />
            <ReportCardSkeleton />
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Belum Ada Laporan di Kategori Ini"
              description="Ayo berikan dukungan UP dan diskusikan laporan warga untuk mendorongnya masuk ke jajaran trending!"
            />
          </div>
        ) : (
          <div>
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
