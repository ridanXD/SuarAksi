"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, SlidersHorizontal, Sparkles, Flame, Clock, Users, RefreshCw } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ReportCard } from "@/components/report/ReportCard";
import { ReportCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { ReportSummary } from "@suaraksi/shared";
import { cn } from "@/lib/utils";

type FeedTab = "for-you" | "following" | "trending" | "latest";

export default function FeedPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<FeedTab>("for-you");
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const fetchReports = async (
    targetPage = 1,
    currentTab = tab,
    cat = selectedCategory,
    status = selectedStatus
  ) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", targetPage.toString());
      params.set("limit", "15");
      params.set("tab", currentTab);
      if (cat) params.set("categoryId", cat);
      if (status) params.set("status", status);

      const res = await api.get<{
        items: ReportSummary[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/reports?${params.toString()}`);

      if (targetPage === 1) {
        setReports(res.items);
      } else {
        setReports((prev) => [...prev, ...res.items]);
      }
      setTotalPages(res.totalPages);
      setPage(targetPage);
    } catch {
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    api.get<any[]>("/admin/categories")
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
    fetchReports(1, tab, selectedCategory, selectedStatus);
  }, [tab, selectedCategory, selectedStatus]);

  const handleDeleted = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const tabs: { key: FeedTab; label: string; icon: React.ElementType }[] = [
    { key: "for-you", label: "Untuk Anda", icon: Sparkles },
    { key: "following", label: "Mengikuti", icon: Users },
    { key: "trending", label: "Trending", icon: Flame },
    { key: "latest", label: "Terbaru", icon: Clock },
  ];

  return (
    <AppLayout>
      <div className="border-b border-surface-200 dark:border-surface-800 bg-white/85 dark:bg-black/85 backdrop-blur-md sticky top-[53px] z-20 select-none transition-colors">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-base font-black text-surface-900 dark:text-white tracking-tight">
            Beranda Laporan Warga
          </h1>
          <button
            type="button"
            onClick={() => fetchReports(1, tab, selectedCategory, selectedStatus)}
            title="Muat ulang laporan"
            className="p-2 rounded-full text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors cursor-pointer"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin text-crimson-600")} />
          </button>
        </div>

        <div className="flex border-b border-surface-200 dark:border-surface-800">
          {tabs.map((t) => {
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex-1 py-3.5 text-xs sm:text-sm text-center transition-colors relative flex items-center justify-center gap-1.5 cursor-pointer",
                  isActive
                    ? "text-surface-900 dark:text-white font-bold"
                    : "text-surface-500 dark:text-surface-400 font-medium hover:bg-surface-50 dark:hover:bg-surface-900/50"
                )}
              >
                <span>{t.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 h-1 w-12 sm:w-16 bg-crimson-600 rounded-full inset-x-0 mx-auto" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-2.5 bg-surface-50/70 dark:bg-surface-900/40 border-b border-surface-200 dark:border-surface-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-surface-500 dark:text-surface-400 font-medium flex items-center gap-1 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-full px-3 py-1 text-surface-700 dark:text-surface-200 focus:outline-none focus:border-crimson-600"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-full px-3 py-1 text-surface-700 dark:text-surface-200 focus:outline-none focus:border-crimson-600"
          >
            <option value="">Semua Status</option>
            <option value="SUBMITTED">Terkirim</option>
            <option value="UNDER_REVIEW">Sedang Ditinjau</option>
            <option value="VERIFIED">Terverifikasi</option>
            <option value="IN_PROGRESS">Sedang Ditangani</option>
            <option value="RESOLVED">Selesai Ditangani</option>
          </select>

          {(selectedCategory || selectedStatus) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("");
                setSelectedStatus("");
              }}
              className="text-[11px] font-bold text-crimson-600 dark:text-crimson-400 hover:underline shrink-0 ml-auto"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-black border-b border-surface-200 dark:border-surface-800 transition-colors">
        <Link href="/reports/create" className="flex items-center gap-3">
          <Avatar
            src={user?.avatarUrl}
            name={user?.name || "Warga"}
            size="md"
          />
          <div className="flex-1 bg-surface-100 dark:bg-surface-900 hover:bg-surface-200/70 dark:hover:bg-surface-800 rounded-full px-4 py-2.5 text-xs text-surface-500 dark:text-surface-400 transition-colors cursor-pointer">
            Ada fasilitas rusak atau keluhan di lingkungan Anda? Suarakan sekarang...
          </div>
          <Button size="sm" className="rounded-full shrink-0 gap-1.5 font-bold px-4">
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Lapor</span>
          </Button>
        </Link>
      </div>

      <div className="divide-y divide-surface-200 dark:divide-surface-800 bg-white dark:bg-black transition-colors">
        {isLoading && reports.length === 0 ? (
          <div>
            <ReportCardSkeleton />
            <ReportCardSkeleton />
            <ReportCardSkeleton />
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Belum Ada Laporan"
              description="Belum ada laporan yang sesuai dengan tab atau filter yang Anda pilih saat ini."
              action={
                <Link href="/reports/create">
                  <Button size="sm" className="rounded-full">Buat Laporan Pertama</Button>
                </Link>
              }
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

            {page < totalPages && (
              <div className="p-6 text-center border-t border-surface-200 dark:border-surface-800">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full font-bold px-6"
                  isLoading={isLoading}
                  onClick={() => fetchReports(page + 1, tab, selectedCategory, selectedStatus)}
                >
                  Muat Lebih Banyak Laporan
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
