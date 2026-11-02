"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  Flame,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  History,
} from "lucide-react";
import { AdminNav } from "@/components/layout/AdminNav";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "ADMIN") {
      router.push("/feed");
      return;
    }

    api.get<any>("/admin/dashboard")
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user, router]);

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900">
      <AdminNav />

      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
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
              <span className="text-xs text-surface-500 font-medium">Masyarakat Terdaftar</span>
              <span className="text-2xl font-black text-surface-900 block">{data?.totalUsers || 0}</span>
              <Link href="/admin/users" className="text-[11px] font-semibold text-purple-600 hover:underline">
                Kelola Pengguna →
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-surface-200 bg-white space-y-1">
              <span className="text-xs text-surface-500 font-medium">Instansi Pemerintah</span>
              <span className="text-2xl font-black text-blue-600 block">{data?.totalInstances || 0}</span>
              <Link href="/admin/instances" className="text-[11px] font-semibold text-blue-600 hover:underline">
                Kelola & Verifikasi →
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-surface-200 bg-white space-y-1">
              <span className="text-xs text-surface-500 font-medium">Total Laporan Warga</span>
              <span className="text-2xl font-black text-crimson-600 block">{data?.totalReports || 0}</span>
              <span className="text-[11px] text-surface-400">
                {data?.resolvedReports || 0} terselesaikan
              </span>
            </div>

            <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 space-y-1">
              <span className="text-xs text-red-700 font-medium">Laporan Pelanggaran</span>
              <span className="text-2xl font-black text-red-700 block">{data?.pendingFlags || 0}</span>
              <Link href="/admin/moderation" className="text-[11px] font-semibold text-red-600 hover:underline">
                Buka Moderasi Konten →
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-surface-200 bg-white flex items-center justify-between">
            <div>
              <span className="text-xs text-surface-500 block">Total Interaksi Warga</span>
              <span className="text-xl font-bold text-surface-900">
                {data?.totalEngagements || 0}
              </span>
              <span className="text-[11px] text-surface-400">Like, komentar, UP, share</span>
            </div>
            <TrendingUp className="w-8 h-8 text-surface-400" />
          </div>

          <div className="p-4 rounded-xl border border-crimson-200 bg-crimson-50/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-crimson-800 block">Isu Berlabel HOT</span>
              <span className="text-xl font-bold text-crimson-700">
                {data?.hotReports || 0}
              </span>
              <span className="text-[11px] text-crimson-600">Mencapai ambang viral</span>
            </div>
            <Flame className="w-8 h-8 text-crimson-600 fill-crimson-600" />
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-800 block">Laporan Dalam Penanganan</span>
              <span className="text-xl font-bold text-amber-700">
                {data?.inProgressReports || 0}
              </span>
              <span className="text-[11px] text-amber-600">Diproses di lapangan</span>
            </div>
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-100">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-surface-900">Audit Log Aktivitas Terkini</h2>
            </div>
            <Link href="/admin/audit-logs" className="text-xs font-semibold text-purple-600 hover:underline">
              Lihat Semua Log →
            </Link>
          </div>

          {isLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : (
            <div className="divide-y divide-surface-100 text-xs">
              {data?.recentAuditLogs?.map((log: any) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-surface-900 mr-2">
                      {log.actor?.name || "Sistem"}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-100 text-surface-700">
                      {log.action}
                    </span>
                    <span className="text-surface-500 ml-2">
                      pada {log.resource} ({log.targetId || "-"})
                    </span>
                  </div>
                  <span className="text-surface-400 shrink-0">{formatDate(log.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
