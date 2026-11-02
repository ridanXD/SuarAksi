"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { History, Shield } from "lucide-react";
import { AdminNav } from "@/components/layout/AdminNav";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async (currentPage = 1) => {
    setIsLoading(true);
    try {
      const res = await api.get<any>(`/admin/audit-logs?page=${currentPage}&limit=20`);
      setLogs(res.items || []);
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
    if (user.role !== "ADMIN") {
      router.push("/feed");
      return;
    }
    fetchLogs(1);
  }, [user, router]);

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900">
      <AdminNav />

      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        <div>
          <h1 className="text-base font-bold text-surface-900 flex items-center gap-2">
            <History className="w-5 h-5 text-purple-600" />
            <span>Audit Log Sistem & Integritas Data</span>
          </h1>
          <p className="text-xs text-surface-500">
            Catatan permanen dan tidak dapat diubah atas setiap tindakan administratif dan perubahan status laporan
          </p>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Waktu</th>
                    <th className="p-3.5">Pelaksana (Actor)</th>
                    <th className="p-3.5">Tindakan (Action)</th>
                    <th className="p-3.5">Entitas</th>
                    <th className="p-3.5">Rincian Perubahan</th>
                    <th className="p-3.5">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-50/60 font-mono text-[11px]">
                      <td className="p-3.5 text-surface-500 whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="p-3.5 font-sans font-bold text-surface-900">
                        {log.actor?.name || "System"} ({log.actor?.role || "-"})
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 text-surface-700">
                        {log.resource} ({log.targetId ? log.targetId.substring(0, 8) + "..." : "-"})
                      </td>
                      <td className="p-3.5 max-w-xs truncate text-surface-600">
                        {log.details ? JSON.stringify(log.details) : "-"}
                      </td>
                      <td className="p-3.5 text-surface-500">{log.ipAddress || "127.0.0.1"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="p-4 border-t border-surface-100 flex items-center justify-between text-xs">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => fetchLogs(page - 1)}
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
                onClick={() => fetchLogs(page + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
