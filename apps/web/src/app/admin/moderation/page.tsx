"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, CheckCircle, XCircle, AlertTriangle, Trash2 } from "lucide-react";
import { AdminNav } from "@/components/layout/AdminNav";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function AdminModerationPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [flags, setFlags] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [isLoading, setIsLoading] = useState(true);

  const [selectedFlag, setSelectedFlag] = useState<any>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chosenAction, setChosenAction] = useState<"DISMISS" | "DELETE_CONTENT">("DISMISS");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFlags = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);

      const res = await api.get<any>(`/admin/flags?${params.toString()}`);
      setFlags(res.items || []);
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
    fetchFlags();
  }, [user, router, statusFilter]);

  const handleOpenAction = (flag: any, action: "DISMISS" | "DELETE_CONTENT") => {
    setSelectedFlag(flag);
    setChosenAction(action);
    setActionNotes("");
    setIsModalOpen(true);
  };

  const handleProcessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlag) return;

    setIsSubmitting(true);
    try {
      await api.post(`/admin/flags/${selectedFlag.id}/process`, {
        action: chosenAction,
        notes: actionNotes.trim(),
      });
      setIsModalOpen(false);
      fetchFlags();
    } catch {
      alert("Gagal memproses moderasi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900">
      <AdminNav />

      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-surface-900">Pusat Moderasi Konten</h1>
            <p className="text-xs text-surface-500">
              Tinjau laporan dugaan pelanggaran yang diadukan oleh warga
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-surface-300 rounded-md px-2.5 py-1.5 bg-white"
            >
              <option value="PENDING">Menunggu Tindakan (Pending)</option>
              <option value="RESOLVED">Selesai Dimoderasi</option>
              <option value="DISMISSED">Diabaikan (Dismissed)</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : flags.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<CheckCircle className="w-6 h-6 text-emerald-600" />}
                title="Tidak Ada Laporan Pelanggaran"
                description="Semua konten bersih dan aman sesuai pedoman komunitas."
              />
            </div>
          ) : (
            <div className="divide-y divide-surface-100">
              {flags.map((flag) => (
                <div key={flag.id} className="p-4 space-y-3 hover:bg-surface-50/60">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 uppercase">
                        {flag.reason}
                      </span>
                      <span className="text-xs text-surface-600">
                        Dilaporkan oleh @{flag.reporter?.username}
                      </span>
                    </div>
                    <span className="text-[11px] text-surface-400">
                      {formatDate(flag.createdAt)}
                    </span>
                  </div>

                  <div className="bg-surface-50 p-3 rounded border border-surface-200 text-xs space-y-1">
                    <span className="font-semibold text-surface-500 block">
                      Target Konten ({flag.reportId ? "Laporan" : "Komentar"}):
                    </span>
                    <p className="text-surface-900 font-medium">
                      {flag.report ? flag.report.title : flag.comment?.content}
                    </p>
                    {flag.description && (
                      <p className="text-surface-500 pt-1 border-t border-surface-200">
                        Catatan pelapor: "{flag.description}"
                      </p>
                    )}
                  </div>

                  {flag.status === "PENDING" && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenAction(flag, "DISMISS")}
                        className="text-xs h-7"
                      >
                        Abaikan (Bukan Pelanggaran)
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleOpenAction(flag, "DELETE_CONTENT")}
                        className="text-xs h-7"
                      >
                        Hapus Konten Melanggar
                      </Button>
                    </div>
                  )}

                  {flag.actionTaken && (
                    <p className="text-[11px] text-surface-500 italic">
                      Tindakan: {flag.actionTaken}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          chosenAction === "DELETE_CONTENT"
            ? "Konfirmasi Hapus Konten Pelanggaran"
            : "Abaikan Laporan Pelanggaran"
        }
      >
        <form onSubmit={handleProcessSubmit} className="space-y-4">
          <p className="text-xs text-surface-600">
            {chosenAction === "DELETE_CONTENT"
              ? "Konten ini akan dihapus secara permanen dari sistem dan riwayat tindakan akan dicatat di audit log."
              : "Laporan pelanggaran akan ditutup dengan status diabaikan (dismissed)."}
          </p>

          <Textarea
            label="Catatan Alasan Tindakan Admin"
            placeholder="Jelaskan alasan penetapan keputusan ini..."
            value={actionNotes}
            onChange={(e) => setActionNotes(e.target.value)}
            rows={3}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-100">
            <Button size="sm" variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button
              size="sm"
              variant={chosenAction === "DELETE_CONTENT" ? "danger" : "primary"}
              type="submit"
              isLoading={isSubmitting}
            >
              Terapkan Keputusan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
