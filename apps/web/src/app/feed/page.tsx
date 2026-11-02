"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, SlidersHorizontal, RefreshCw, Sparkles, Flame, Clock, Users } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ReportCard } from "@/components/report/ReportCard";
import { ReportCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { ReportSummary, ReportStatus } from "@suaraksi/shared";

export default function FeedPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"for-you" | "following" | "latest" | "trending">("for-you");
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReports = async (currentPage = 1, currentTab = tab, cat = selectedCategory, stat = selectedStatus) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        tab: currentTab,
        page: currentPage.toString(),
        limit: "15",
      });
      if (cat) params.append("categoryId", cat);
      if (stat) params.append("status", stat);

      const res = await api.get<any>(`/reports?${params.toString()}`);
      if (currentPage === 1) {
        setReports(res.items || []);
      } else {
        setReports((prev) => [...prev, ...(res.items || [])]);
      }
      setTotalPages(res.totalPages || 1);
      setPage(currentPage);
    } catch {
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

  return (
    <AppLayout>
      <div className="border-b border-surface-200 bg-white sticky top-0 z-20">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-base font-black text-surface-900 tracking-tight">
            Beranda Laporan Warga
          </h1>
          <button
            type="button"
            onClick={() => fetchReports(1, tab, selectedCategory, selectedStatus)}
            title="Muat ulang laporan"
            className="p-1.5 rounded-full text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-surface-200">
          <button
            type="button"
            onClick={() => setTab("for-you")}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              tab === "for-you"
                ? "border-crimson-600 text-surface-900"
                : "border-transparent text-surface-500 hover:text-surface-700"
            }`}
          >
            <Sparkles className="w-4 h-4 text-crimson-600" />
            <span>Untuk Anda</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("following")}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              tab === "following"
                ? "border-crimson-600 text-surface-900"
                : "border-transparent text-surface-500 hover:text-surface-700"
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>Mengikuti</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("trending")}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              tab === "trending"
                ? "border-crimson-600 text-surface-900"
                : "border-transparent text-surface-500 hover:text-surface-700"
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Trending</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("latest")}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              tab === "latest"
                ? "border-crimson-600 text-surface-900"
                : "border-transparent text-surface-500 hover:text-surface-700"
            }`}
          >
            <Clock className="w-4 h-4 text-surface-500" />
            <span>Terbaru</span>
          </button>
        </div>

        <div className="p-2.5 bg-surface-50/70 border-b border-surface-200 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-surface-500 font-medium flex items-center gap-1 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-white border border-surface-300 rounded px-2.5 py-1 text-surface-700 focus:outline-none focus:border-crimson-600"
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
            className="text-xs bg-white border border-surface-300 rounded px-2.5 py-1 text-surface-700 focus:outline-none focus:border-crimson-600"
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
              className="text-[11px] font-semibold text-crimson-600 hover:underline shrink-0 ml-auto"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      <div className="p-4 bg-white border-b border-surface-200">
        <Link href="/reports/create" className="flex items-center gap-3">
          <Avatar
            src={user?.avatarUrl}
            name={user?.name || "Warga"}
            size="md"
          />
          <div className="flex-1 bg-surface-100 hover:bg-surface-200/80 rounded-full px-4 py-2.5 text-xs text-surface-500 transition-colors cursor-pointer">
            Ada fasilitas rusak atau keluhan di lingkungan Anda? Suarakan sekarang...
          </div>
          <Button size="sm" className="shrink-0 gap-1.5">
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Lapor</span>
          </Button>
        </Link>
      </div>

      <div>
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
                  <Button size="sm">Buat Laporan Pertama</Button>
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
              <div className="p-4 text-center border-t border-surface-200">
                <Button
                  variant="outline"
                  size="sm"
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
