"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
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
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-200">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h1 className="text-lg font-black text-surface-900 tracking-tight">
                Dashboard Manajemen Laporan Instansi
              </h1>
            </div>
            <p className="text-xs text-surface-500 mt-0.5">
              Instansi:{" "}
              <span className="font-bold text-surface-800">
                {user?.instanceProfile?.instanceName || user?.name}
              </span>{" "}
              — Wilayah: {user?.instanceProfile?.jurisdiction || "Nasional"}
            </p>
          </div>

          <div className="flex gap-2">
            <Link href="/instance/reports">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Inbox className="w-4 h-4" />
                <span>Semua Laporan Masuk</span>
              </Button>
            </Link>
            <Link href="/instance/analytics">
              <Button size="sm" className="gap-1.5 text-xs">
                <TrendingUp className="w-4 h-4" />
                <span>Statistik Lengkap</span>
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-surface-200 bg-white space-y-1">
              <span className="text-xs text-surface-500 font-medium">Total Laporan</span>
              <span className="text-2xl font-black text-surface-900 block">
                {analytics?.totalReports || 0}
              </span>
              <span className="text-[11px] text-surface-400">Masuk ke instansi Anda</span>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-1">
              <span className="text-xs text-amber-700 font-medium">Perlu Ditinjau</span>
              <span className="text-2xl font-black text-amber-900 block">
                {(analytics?.submittedCount || 0) + (analytics?.underReviewCount || 0)}
              </span>
              <span className="text-[11px] text-amber-600">Menunggu verifikasi</span>
            </div>

            <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/40 space-y-1">
              <span className="text-xs text-orange-700 font-medium">Sedang Ditangani</span>
              <span className="text-2xl font-black text-orange-900 block">
                {analytics?.inProgressCount || 0}
              </span>
              <span className="text-[11px] text-orange-600">Proses pengerjaan fisik</span>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1">
              <span className="text-xs text-emerald-700 font-medium">Terselesaikan</span>
              <span className="text-2xl font-black text-emerald-900 block">
                {analytics?.resolvedCount || 0}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">
                {analytics?.resolutionRate || 0}% Tingkat Selesai
              </span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-surface-100">
            <div>
              <h2 className="text-sm font-bold text-surface-900">
                Laporan Terbaru yang Perlu Ditindaklanjuti
              </h2>
              <p className="text-xs text-surface-500">
                Laporan dari masyarakat yang memerlukan verifikasi dan status resmi
              </p>
            </div>
            <Link
              href="/instance/reports"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Kelola Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
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
            <div className="divide-y divide-surface-100">
              {incomingReports.map((report) => (
                <div
                  key={report.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-50/60 p-2 rounded-lg transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={report.status} />
                      <span className="text-xs font-semibold text-surface-500">
                        {report.category?.name}
                      </span>
                      <span className="text-[11px] text-surface-400">
                        · {timeAgo(report.createdAt)}
                      </span>
                    </div>
                    <Link
                      href={`/instance/reports/${report.id}`}
                      className="font-bold text-sm text-surface-900 hover:underline block line-clamp-1"
                    >
                      {report.title}
                    </Link>
                    <p className="text-xs text-surface-500 line-clamp-1">
                      Lokasi: {report.address}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/instance/reports/${report.id}`}>
                      <Button size="sm" variant="outline" className="text-xs h-8">
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
