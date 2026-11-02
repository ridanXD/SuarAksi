"use client";

import React, { useState, useEffect } from "react";
import { Flame, ArrowBigUp, MessageSquare, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ReportCard } from "@/components/report/ReportCard";
import { ReportCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";

export default function TrendingPage() {
  const [subTab, setSubTab] = useState<"hot" | "most-supported" | "most-discussed">("hot");
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

  return (
    <AppLayout>
      <div className="border-b border-surface-200 bg-white sticky top-0 z-20">
        <div className="p-4 space-y-1">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 fill-crimson-600 text-crimson-600" />
            <h1 className="text-base font-black text-surface-900 tracking-tight">
              Pusat Trending & Atensi Publik
            </h1>
          </div>
          <p className="text-xs text-surface-500">
            Algoritma pembobotan otomatis berbasis UP, tanggapan, repost, dan kecepatan atensi publik.
          </p>
        </div>

        <div className="flex border-b border-surface-200">
          <button
            type="button"
            onClick={() => setSubTab("hot")}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              subTab === "hot"
                ? "border-crimson-600 text-surface-900"
                : "border-transparent text-surface-500 hover:text-surface-700"
            }`}
          >
            <Flame className="w-4 h-4 text-crimson-600" />
            <span>Laporan HOT</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("most-supported")}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              subTab === "most-supported"
                ? "border-crimson-600 text-surface-900"
                : "border-transparent text-surface-500 hover:text-surface-700"
            }`}
          >
            <ArrowBigUp className="w-4 h-4 text-emerald-600" />
            <span>Paling Banyak UP</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("most-discussed")}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              subTab === "most-discussed"
                ? "border-crimson-600 text-surface-900"
                : "border-transparent text-surface-500 hover:text-surface-700"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>Paling Ramai Dibahas</span>
          </button>
        </div>
      </div>

      <div>
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
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
