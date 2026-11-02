"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Search, SlidersHorizontal, ArrowLeft, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function InstanceReportsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [reports, setReports] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async (currentPage = 1, currentStatus = statusFilter) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "15",
      });
      if (currentStatus) params.append("status", currentStatus);

      const res = await api.get<any>(`/instance/reports?${params.toString()}`);
      setReports(res.items || []);
      setTotalPages(res.totalPages || 1);
      setPage(currentPage);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "INSTANCE" && user.role !== "ADMIN") {
      router.push("/feed");
      return;
    }
    fetchReports(1, statusFilter);
  }, [user, router, statusFilter]);

  return (
    <AppLayout showRightSidebar={false}>
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-surface-200">
          <Link href="/instance/dashboard">
            <Button variant="ghost" size="sm" className="p-1.5 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-base font-bold text-surface-900">
              Daftar Laporan Masuk Instansi
            </h1>
            <p className="text-xs text-surface-500">
              Semua laporan warga yang berada dalam lingkup tugas dan kewenangan Anda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-surface-500 font-medium shrink-0">Filter Status:</span>
          {["", "SUBMITTED", "UNDER_REVIEW", "VERIFIED", "IN_PROGRESS", "RESOLVED", "REJECTED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md font-semibold shrink-0 transition-colors ${
                statusFilter === st
                  ? "bg-blue-600 text-white"
                  : "bg-surface-100 text-surface-700 hover:bg-surface-200"
              }`}
            >
              {st === "" ? "Semua Status" : st.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8">
              <EmptyState title="Tidak Ada Laporan Ditemukan" />
            </div>
          ) : (
            <div className="divide-y divide-surface-100">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 hover:bg-surface-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={report.status} />
                      <span className="text-xs font-semibold text-surface-500">
                        {report.category?.name}
                      </span>
                      <span className="text-[11px] text-surface-400">
                        · Dilaporkan oleh @{report.author?.username}
                      </span>
                    </div>

                    <Link
                      href={`/instance/reports/${report.id}`}
                      className="text-sm font-bold text-surface-900 hover:underline block leading-snug line-clamp-2"
                    >
                      {report.title}
                    </Link>

                    <p className="text-xs text-surface-500 line-clamp-1">
                      {report.address}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/instance/reports/${report.id}`}>
                      <Button size="sm" className="text-xs">
                        Tindak Lanjut
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="p-4 border-t border-surface-100 flex items-center justify-between text-xs">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => fetchReports(page - 1)}
              >
                Sebelumnya
              </Button>
              <span className="text-surface-500">
                Halaman {page} dari {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => fetchReports(page + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
