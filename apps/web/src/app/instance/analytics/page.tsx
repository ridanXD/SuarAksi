"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, CheckCircle, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function InstanceAnalyticsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
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

    api.get<any>("/instance/analytics")
      .then(setAnalytics)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user, router]);

  return (
    <AppLayout showRightSidebar={false}>
      <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-surface-200">
          <Link href="/instance/dashboard">
            <Button variant="ghost" size="sm" className="p-1.5 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-base font-bold text-surface-900">
              Statistik & Kinerja Penanganan Instansi
            </h1>
            <p className="text-xs text-surface-500">
              Evaluasi kinerja keterbukaan respon dan akuntabilitas tindak lanjut laporan warga
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl border border-surface-200 bg-white space-y-1">
                <span className="text-xs text-surface-500 font-medium">Total Laporan Masuk</span>
                <span className="text-3xl font-black text-surface-900 block">
                  {analytics?.totalReports || 0}
                </span>
                <p className="text-[11px] text-surface-400">Di wilayah kewenangan instansi</p>
              </div>

              <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
                <span className="text-xs text-emerald-800 font-medium">Tingkat Penyelesaian</span>
                <span className="text-3xl font-black text-emerald-700 block">
                  {analytics?.resolutionRate || 0}%
                </span>
                <p className="text-[11px] text-emerald-600">
                  {analytics?.resolvedCount || 0} laporan selesai ditangani
                </p>
              </div>

              <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-1">
                <span className="text-xs text-blue-800 font-medium">Tanggapan Resmi Dirilis</span>
                <span className="text-3xl font-black text-blue-700 block">
                  {analytics?.officialResponsesCount || 0}
                </span>
                <p className="text-[11px] text-blue-600">Pernyataan terverifikasi publik</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-4">
              <h2 className="text-sm font-bold text-surface-900">Distribusi Status Laporan</h2>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-surface-700">Terkirim (Menunggu Tindak Awal)</span>
                    <span className="text-surface-900">{analytics?.submittedCount || 0}</span>
                  </div>
                  <div className="w-full bg-surface-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-surface-400 h-2.5 rounded-full"
                      style={{
                        width: `${analytics?.totalReports ? (analytics.submittedCount / analytics.totalReports) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-amber-800">Sedang Ditinjau / Evaluasi Lapangan</span>
                    <span className="text-amber-900">{analytics?.underReviewCount || 0}</span>
                  </div>
                  <div className="w-full bg-surface-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2.5 rounded-full"
                      style={{
                        width: `${analytics?.totalReports ? (analytics.underReviewCount / analytics.totalReports) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-orange-800">Sedang Ditangani / Pengerjaan Fisik</span>
                    <span className="text-orange-900">{analytics?.inProgressCount || 0}</span>
                  </div>
                  <div className="w-full bg-surface-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-orange-500 h-2.5 rounded-full"
                      style={{
                        width: `${analytics?.totalReports ? (analytics.inProgressCount / analytics.totalReports) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-emerald-800">Selesai Ditangani (Tuntas)</span>
                    <span className="text-emerald-900">{analytics?.resolvedCount || 0}</span>
                  </div>
                  <div className="w-full bg-surface-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2.5 rounded-full"
                      style={{
                        width: `${analytics?.totalReports ? (analytics.resolvedCount / analytics.totalReports) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-red-800">Ditolak / Di Luar Wilayah Tugas</span>
                    <span className="text-red-900">{analytics?.rejectedCount || 0}</span>
                  </div>
                  <div className="w-full bg-surface-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-red-500 h-2.5 rounded-full"
                      style={{
                        width: `${analytics?.totalReports ? (analytics.rejectedCount / analytics.totalReports) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
