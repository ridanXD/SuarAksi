"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Inbox,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/utils";

export default function InstanceDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [incomingReports, setIncomingReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "INSTANCE" && user.role !== "ADMIN") {
      router.push("/feed");
      return;
    }

    Promise.all([
      api.get<any>("/instance/analytics"),
      api.get<any>("/instance/reports?limit=5"),
    ])
      .then(([analyticsData, reportsData]) => {
        setAnalytics(analyticsData);
        setIncomingReports(reportsData.items || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user, router]);

  return (
    <AppLayout showRightSidebar={false}>
      <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-200 dark:border-surface-800">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h1 className="text-lg font-black text-surface-900 dark:text-white tracking-tight">
                Dashboard Manajemen Laporan Instansi
              </h1>
            </div>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
              Instansi:{" "}
              <span className="font-bold text-surface-800 dark:text-surface-200">
                {user?.instanceProfile?.instanceName || user?.name}
              </span>{" "}
              — Wilayah: {user?.instanceProfile?.jurisdiction || "Nasional"}
            </p>
          </div>

          <div className="flex gap-2">
            <Link href="/instance/reports">
              <Button size="sm" variant="outline" className="rounded-full gap-1.5 text-xs font-semibold">
                <Inbox className="w-4 h-4" />
                <span>Semua Laporan Masuk</span>
              </Button>
            </Link>
            <Link href="/instance/analytics">
              <Button size="sm" className="rounded-full gap-1.5 text-xs font-semibold">
                <TrendingUp className="w-4 h-4" />
                <span>Statistik Lengkap</span>
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 space-y-1">
              <span className="text-xs text-surface-500 dark:text-surface-400 font-medium">Total Laporan</span>
              <span className="text-2xl font-black text-surface-900 dark:text-white block">
                {analytics?.totalReports || 0}
              </span>
              <span className="text-[11px] text-surface-400">Masuk ke instansi Anda</span>
            </div>

            <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 space-y-1">
              <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Perlu Ditinjau</span>
              <span className="text-2xl font-black text-amber-900 dark:text-amber-300 block">
                {(analytics?.submittedCount || 0) + (analytics?.underReviewCount || 0)}
              </span>
              <span className="text-[11px] text-amber-600 dark:text-amber-400">Menunggu verifikasi</span>
            </div>

            <div className="p-4 rounded-2xl border border-orange-200 dark:border-orange-900/50 bg-orange-50/40 dark:bg-orange-950/20 space-y-1">
              <span className="text-xs text-orange-700 dark:text-orange-400 font-medium">Sedang Ditangani</span>
              <span className="text-2xl font-black text-orange-900 dark:text-orange-300 block">
                {analytics?.inProgressCount || 0}
              </span>
              <span className="text-[11px] text-orange-600 dark:text-orange-400">Proses pengerjaan fisik</span>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-1">
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Terselesaikan</span>
              <span className="text-2xl font-black text-emerald-900 dark:text-emerald-300 block">
                {analytics?.resolvedCount || 0}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {analytics?.resolutionRate || 0}% Tingkat Selesai
              </span>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-black rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden space-y-4 p-5 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-800">
            <div>
              <h2 className="text-sm font-bold text-surface-900 dark:text-white">
                Laporan Terbaru yang Perlu Ditindaklanjuti
              </h2>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                Laporan dari masyarakat yang memerlukan verifikasi dan status resmi
              </p>
            </div>
            <Link
              href="/instance/reports"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Kelola Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : incomingReports.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                title="Tidak Ada Laporan Menunggu"
                description="Semua laporan warga telah ditindaklanjuti dengan baik oleh instansi Anda."
              />
            </div>
          ) : (
            <div className="divide-y divide-surface-100 dark:divide-surface-800">
              {incomingReports.map((report) => (
                <div
                  key={report.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-50/60 dark:hover:bg-surface-900/40 p-2.5 rounded-xl transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={report.status} />
                      <span className="text-xs font-semibold text-surface-500 dark:text-surface-400">
                        {report.category?.name}
                      </span>
                      <span className="text-[11px] text-surface-400 dark:text-surface-500">
                        · {timeAgo(report.createdAt)}
                      </span>
                    </div>
                    <Link
                      href={`/instance/reports/${report.id}`}
                      className="font-bold text-sm text-surface-900 dark:text-white hover:underline block line-clamp-1"
                    >
                      {report.title}
                    </Link>
                    <p className="text-xs text-surface-500 dark:text-surface-400 line-clamp-1">
                      Lokasi: {report.address}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/instance/reports/${report.id}`}>
                      <Button size="sm" variant="outline" className="rounded-full text-xs h-8 font-semibold">
                        Tindak Lanjut & Status
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
