"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ReportCard } from "@/components/report/ReportCard";
import { ReportCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function BookmarksPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    api.get<any>("/interactions/bookmarks")
      .then((data) => setReports(data.items || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user, router]);

  const handleDeleted = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <AppLayout>
      <div className="border-b border-surface-200 dark:border-surface-800 bg-white/85 dark:bg-black/85 backdrop-blur-md sticky top-[53px] z-20 p-4 space-y-1 select-none transition-colors">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-blue-600 fill-blue-600" />
          <h1 className="text-base font-black text-surface-900 dark:text-white tracking-tight">
            Laporan Tersimpan
          </h1>
        </div>
        <p className="text-xs text-surface-500 dark:text-surface-400">
          Koleksi laporan yang Anda simpan untuk dipantau perkembangannya
        </p>
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
              icon={<Bookmark className="w-6 h-6" />}
              title="Belum Ada Laporan Tersimpan"
              description="Klik ikon bookmark pada laporan mana saja untuk menyimpannya ke daftar ini."
            />
          </div>
        ) : (
          <div>
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
