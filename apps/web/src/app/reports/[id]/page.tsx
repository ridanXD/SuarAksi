"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Calendar, Building2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { HotBadge } from "@/components/ui/HotBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ReportInteractions } from "@/components/report/ReportInteractions";
import { ReportMap } from "@/components/report/ReportMap";
import { StatusTimeline } from "@/components/report/StatusTimeline";
import { OfficialResponseCard } from "@/components/report/OfficialResponseCard";
import { CommentSection } from "@/components/comment/CommentSection";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api";

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const data = await api.get(`/reports/${reportId}`);
      setReport(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat detail laporan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  if (error || !report) {
    return (
      <AppLayout>
        <div className="p-8 text-center space-y-4">
          <p className="text-sm text-red-600 font-semibold">{error || "Laporan tidak ditemukan"}</p>
          <Button size="sm" className="rounded-full" onClick={() => router.push("/feed")}>
            Kembali ke Beranda
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-surface-200 dark:border-surface-800">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-surface-900 dark:text-white truncate">
              Detail Laporan Warga
            </h1>
            <p className="text-xs text-surface-500 dark:text-surface-400">ID: {report.id}</p>
          </div>
        </div>

        <article className="bg-white dark:bg-black rounded-2xl border border-surface-200 dark:border-surface-800 p-5 sm:p-6 space-y-5 transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href={`/profile/${report.author.username}`}>
                <Avatar
                  src={report.author.avatarUrl}
                  name={report.author.name}
                  size="lg"
                />
              </Link>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Link
                    href={`/profile/${report.author.username}`}
                    className="font-bold text-sm text-surface-900 dark:text-white hover:underline"
                  >
                    {report.author.name}
                  </Link>
                  {report.author.isVerified && <VerifiedBadge size={16} />}
                  <span className="text-xs text-surface-500 dark:text-surface-400">
                    @{report.author.username}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-surface-500 dark:text-surface-400">
                  <Calendar className="w-3.5 h-3.5 text-surface-400" />
                  <span>{formatDate(report.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {report.isHot && <HotBadge score={report.hotScore} />}
              <StatusBadge status={report.status} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                style={{ backgroundColor: `${report.category.color}15`, color: report.category.color }}
                className="px-3 py-1 rounded-full text-xs font-bold"
              >
                {report.category.name}
              </span>
              {report.targetInstance && (
                <span className="text-xs text-surface-600 dark:text-surface-400 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-surface-400" />
                  <span>
                    Ditujukan ke: <span className="font-semibold text-surface-800 dark:text-surface-200">{report.targetInstance.name}</span>
                  </span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-surface-900 dark:text-white leading-tight">
              {report.title}
            </h2>

            <p className="text-sm sm:text-base text-surface-800 dark:text-surface-200 whitespace-pre-line leading-relaxed">
              {report.description}
            </p>
          </div>

          {report.media && report.media.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">
                Dokumentasi Foto Laporan:
              </span>
              <div
                className={`grid gap-2 ${
                  report.media.length === 1 ? "grid-cols-1" : "grid-cols-2"
                }`}
              >
                {report.media.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="relative aspect-video rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800 bg-surface-100 dark:bg-surface-900"
                  >
                    <Image
                      src={item.url}
                      alt={`Dokumentasi ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 pt-2 border-t border-surface-100 dark:border-surface-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-surface-700 dark:text-surface-300">
              <MapPin className="w-4 h-4 text-crimson-600 shrink-0" />
              <span>{report.address}</span>
            </div>
            <ReportMap
              latitude={report.latitude}
              longitude={report.longitude}
              address={report.address}
              height="220px"
            />
          </div>

          <ReportInteractions
            reportId={report.id}
            title={report.title}
            likesCount={report.likesCount}
            commentsCount={report.commentsCount}
            upsCount={report.upsCount}
            repostsCount={report.repostsCount}
            sharesCount={report.sharesCount}
            hasLiked={report.hasLiked}
            hasUpvoted={report.hasUpvoted}
            hasReposted={report.hasReposted}
            hasBookmarked={report.hasBookmarked}
          />
        </article>

        {report.officialResponses && report.officialResponses.length > 0 && (
          <div className="space-y-3">
            {report.officialResponses.map((res: any) => (
              <OfficialResponseCard key={res.id} response={res} />
            ))}
          </div>
        )}

        {report.statusHistory && report.statusHistory.length > 0 && (
          <StatusTimeline
            history={report.statusHistory}
            currentStatus={report.status}
          />
        )}

        <CommentSection reportId={report.id} />
      </div>
    </AppLayout>
  );
}
