"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  UploadCloud,
  X,
  MessageSquare,
  ShieldCheck,
  Building2,
  AlertCircle,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatusTimeline } from "@/components/report/StatusTimeline";
import { OfficialResponseCard } from "@/components/report/OfficialResponseCard";
import { ReportMap } from "@/components/report/ReportMap";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { ReportStatus } from "@suaraksi/shared";

export default function InstanceReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  const { user } = useAuth();

  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [newStatus, setNewStatus] = useState<ReportStatus>(ReportStatus.UNDER_REVIEW);
  const [statusNotes, setStatusNotes] = useState("");
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [officialContent, setOfficialContent] = useState("");
  const [officialAttachments, setOfficialAttachments] = useState<string[]>([]);
  const [isPublishingResponse, setIsPublishingResponse] = useState(false);

  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const [statusSuccess, setStatusSuccess] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    try {
      const data = await api.get(`/reports/${reportId}`);
      setReport(data);
      setNewStatus(data.status);
    } catch (err: any) {
      setError(err.message || "Gagal memuat detail laporan");
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
    fetchReport();
  }, [reportId, user, router]);

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingEvidence(true);
    try {
      const url = await api.upload(file);
      setEvidenceUrls((prev) => [...prev, url]);
    } catch {
      alert("Gagal mengunggah foto bukti");
    } finally {
      setUploadingEvidence(false);
    }
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAttachment(true);
    try {
      const url = await api.upload(file);
      setOfficialAttachments((prev) => [...prev, url]);
    } catch {
      alert("Gagal mengunggah foto lampiran");
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusNotes.trim()) {
      alert("Catatan tindak lanjut wajib diisi untuk transparansi publik.");
      return;
    }

    setIsUpdatingStatus(true);
    setError("");
    try {
      await api.patch(`/instance/reports/${reportId}/status`, {
        status: newStatus,
        notes: statusNotes.trim(),
        evidenceUrls,
      });
      setStatusSuccess(true);
      setStatusNotes("");
      setEvidenceUrls([]);
      await fetchReport();
      setTimeout(() => setStatusSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui status laporan");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleOfficialResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officialContent.trim()) {
      alert("Isi tanggapan resmi tidak boleh kosong.");
      return;
    }

    setIsPublishingResponse(true);
    setError("");
    try {
      await api.post(`/instance/reports/${reportId}/response`, {
        content: officialContent.trim(),
        attachmentUrls: officialAttachments,
      });
      setResponseSuccess(true);
      setOfficialContent("");
      setOfficialAttachments([]);
      await fetchReport();
      setTimeout(() => setResponseSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Gagal mempublikasikan tanggapan resmi");
    } finally {
      setIsPublishingResponse(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout showRightSidebar={false}>
        <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!report) {
    return (
      <AppLayout showRightSidebar={false}>
        <div className="p-8 text-center text-red-600 font-semibold">
          Laporan tidak ditemukan.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showRightSidebar={false}>
      <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-surface-200">
          <Link href="/instance/reports">
            <Button variant="ghost" size="sm" className="p-1.5 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-surface-900 truncate">
                Tindak Lanjut Laporan: {report.title}
              </h1>
              <StatusBadge status={report.status} />
            </div>
            <p className="text-xs text-surface-500">
              Pelapor: @{report.author?.username} ({report.author?.name})
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-xl border border-surface-200 p-5 space-y-4">
          <h2 className="text-base font-bold text-surface-900">{report.title}</h2>
          <p className="text-xs text-surface-700 leading-relaxed whitespace-pre-line bg-surface-50 p-3.5 rounded-lg border border-surface-200">
            {report.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div>
              <span className="font-semibold text-surface-500 block mb-1">Lokasi Laporan:</span>
              <p className="text-surface-800">{report.address}</p>
            </div>
            <div>
              <span className="font-semibold text-surface-500 block mb-1">Kategori:</span>
              <span
                style={{ backgroundColor: `${report.category.color}15`, color: report.category.color }}
                className="px-2 py-0.5 rounded text-xs font-bold inline-block"
              >
                {report.category.name}
              </span>
            </div>
          </div>

          <ReportMap
            latitude={report.latitude}
            longitude={report.longitude}
            address={report.address}
            height="180px"
          />
        </div>

        <div className="bg-white rounded-xl border border-blue-200 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-100">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-bold text-surface-900">
                Perbarui Status Penanganan Resmi
              </h2>
              <p className="text-xs text-surface-500">
                Pembaruan status akan masuk ke riwayat publik dan mengirim notifikasi ke pelapor
              </p>
            </div>
          </div>

          {statusSuccess && (
            <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              Status laporan berhasil diperbarui dan dipublikasikan ke linimasa!
            </div>
          )}

          <form onSubmit={handleStatusSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Pilih Status Baru"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                options={[
                  { value: ReportStatus.UNDER_REVIEW, label: "UNDER REVIEW (Sedang Ditinjau)" },
                  { value: ReportStatus.VERIFIED, label: "VERIFIED (Dinyatakan Valid)" },
                  { value: ReportStatus.IN_PROGRESS, label: "IN PROGRESS (Sedang Ditangani Lapangan)" },
                  { value: ReportStatus.RESOLVED, label: "RESOLVED (Masalah Telah Selesai)" },
                  { value: ReportStatus.REJECTED, label: "REJECTED (Ditolak / Luar Kewenangan)" },
                ]}
              />
            </div>

            <Textarea
              label="Catatan Perkembangan Penanganan (Wajib)"
              placeholder="Jelaskan tindakan apa yang sudah diambil, regu teknis yang diterjunkan, kendala lapangan, atau estimasi penyelesaian..."
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              rows={3}
              required
            />

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-surface-700">
                Foto Bukti Penanganan di Lapangan
              </label>
              <div className="flex flex-wrap gap-2">
                {evidenceUrls.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded border border-surface-200 overflow-hidden">
                    <Image src={url} alt="Bukti" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setEvidenceUrls((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 rounded border-2 border-dashed border-surface-300 hover:border-blue-600 flex flex-col items-center justify-center cursor-pointer text-surface-500 hover:text-blue-600 transition-colors">
                  <UploadCloud className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-semibold">
                    {uploadingEvidence ? "..." : "Upload Foto"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEvidenceUpload}
                    disabled={uploadingEvidence}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isUpdatingStatus} className="bg-blue-600 hover:bg-blue-700">
                Simpan & Perbarui Status
              </Button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-100">
            <Building2 className="w-5 h-5 text-surface-700" />
            <div>
              <h2 className="text-sm font-bold text-surface-900">
                Rilis Tanggapan Resmi Instansi
              </h2>
              <p className="text-xs text-surface-500">
                Pernyataan resmi instansi akan disematkan dengan badge resmi di bagian atas laporan
              </p>
            </div>
          </div>

          {responseSuccess && (
            <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              Tanggapan resmi instansi berhasil dirilis ke publik!
            </div>
          )}

          <form onSubmit={handleOfficialResponseSubmit} className="space-y-4">
            <Textarea
              label="Isi Tanggapan Resmi"
              placeholder="Tuliskan keterangan resmi dari pimpinan/humas instansi..."
              value={officialContent}
              onChange={(e) => setOfficialContent(e.target.value)}
              rows={4}
              required
            />

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-surface-700">
                Lampiran Dokumentasi (Foto)
              </label>
              <div className="flex flex-wrap gap-2">
                {officialAttachments.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded border border-surface-200 overflow-hidden">
                    <Image src={url} alt="Lampiran" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setOfficialAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 rounded border-2 border-dashed border-surface-300 hover:border-surface-600 flex flex-col items-center justify-center cursor-pointer text-surface-500 hover:text-surface-700 transition-colors">
                  <UploadCloud className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-semibold">
                    {uploadingAttachment ? "..." : "Lampiran"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAttachmentUpload}
                    disabled={uploadingAttachment}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isPublishingResponse}>
                Publikasikan Tanggapan Resmi
              </Button>
            </div>
          </form>
        </div>

        {report.officialResponses && report.officialResponses.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500">
              Tanggapan Resmi yang Telah Dirilis:
            </h3>
            {report.officialResponses.map((res: any) => (
              <OfficialResponseCard key={res.id} response={res} />
            ))}
          </div>
        )}

        {report.statusHistory && report.statusHistory.length > 0 && (
          <StatusTimeline history={report.statusHistory} currentStatus={report.status} />
        )}
      </div>
    </AppLayout>
  );
}
