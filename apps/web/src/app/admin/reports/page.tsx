"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Trash2, Eye, MapPin, Building2 } from "lucide-react";
import { AdminNav } from "@/components/layout/AdminNav";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { HotBadge } from "@/components/ui/HotBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function AdminReportsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [reports, setReports] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);

      const res = await api.get<any>(`/reports?${params.toString()}`);
      setReports(res.items || []);
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
    if (user.role !== "ADMIN") {
      router.push("/feed");
      return;
    }
    fetchReports();
  }, [user, router, statusFilter]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus laporan "${title}" secara permanen?`)) return;

    try {
      await api.delete(`/reports/${id}`);
      fetchReports();
    } catch {
      alert("Gagal menghapus laporan");
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900">
      <AdminNav />

      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-surface-900">Manajemen Laporan Publik</h1>
            <p className="text-xs text-surface-500">Pantau dan kelola seluruh konten laporan masyarakat</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari judul / wilayah..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchReports()}
                className="text-xs pl-8 pr-3 py-1.5 rounded-md border border-surface-300 bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-surface-300 rounded-md px-2.5 py-1.5 bg-white"
            >
              <option value="">Semua Status</option>
              <option value="SUBMITTED">Terkirim</option>
              <option value="UNDER_REVIEW">Sedang Ditinjau</option>
              <option value="VERIFIED">Terverifikasi</option>
              <option value="IN_PROGRESS">Sedang Ditangani</option>
              <option value="RESOLVED">Selesai</option>
              <option value="REJECTED">Ditolak</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Judul Laporan</th>
                    <th className="p-3.5">Pelapor</th>
                    <th className="p-3.5">Kategori</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Engagement</th>
                    <th className="p-3.5">Waktu</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-surface-50/60">
                      <td className="p-3.5 max-w-xs">
                        <div className="space-y-1">
                          <Link
                            href={`/reports/${report.id}`}
                            className="font-bold text-surface-900 hover:underline line-clamp-1 block"
                          >
                            {report.title}
                          </Link>
                          <span className="text-surface-400 flex items-center gap-1 truncate text-[11px]">
                            <MapPin className="w-3 h-3 text-crimson-600" />
                            <span>{report.address}</span>
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-surface-800 block">
                          {report.author?.name}
                        </span>
                        <span className="text-surface-400">@{report.author?.username}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-100 text-surface-700">
                          {report.category?.name}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1">
                          <StatusBadge status={report.status} />
                          {report.isHot && <HotBadge />}
                        </div>
                      </td>
                      <td className="p-3.5 text-surface-600">
                        <span>{report.upsCount} UP</span> · <span>{report.likesCount} Like</span> ·{" "}
                        <span>{report.commentsCount} Komentar</span>
                      </td>
                      <td className="p-3.5 text-surface-500 whitespace-nowrap">
                        {formatDate(report.createdAt)}
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <Link href={`/reports/${report.id}`}>
                          <button
                            type="button"
                            className="p-1 rounded text-surface-500 hover:text-blue-600 hover:bg-blue-50"
                            title="Lihat Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(report.id, report.title)}
                          className="p-1 rounded text-surface-500 hover:text-red-600 hover:bg-red-50"
                          title="Hapus Laporan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
