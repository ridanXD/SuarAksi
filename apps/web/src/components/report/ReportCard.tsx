"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, MoreHorizontal, Flag, Trash2, CheckCircle2 } from "lucide-react";
import { ReportSummary, Role } from "@suaraksi/shared";
import { timeAgo } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Avatar } from "../ui/Avatar";
import { VerifiedBadge } from "../ui/VerifiedBadge";
import { HotBadge } from "../ui/HotBadge";
import { StatusBadge } from "../ui/StatusBadge";
import { ReportInteractions } from "./ReportInteractions";
import { FlagModal } from "./FlagModal";

interface ReportCardProps {
  report: ReportSummary;
  onDeleted?: (id: string) => void;
}

export function ReportCard({ report, onDeleted }: ReportCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor = user?.id === report.author.id;
  const isAdmin = user?.role === Role.ADMIN;
  const canManage = isAuthor || isAdmin;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Apakah Anda yakin ingin menghapus laporan ini?")) return;

    setIsDeleting(true);
    try {
      await api.delete(`/reports/${report.id}`);
      if (onDeleted) onDeleted(report.id);
    } catch {
      alert("Gagal menghapus laporan");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("input")) {
      return;
    }
    router.push(`/reports/${report.id}`);
  };

  return (
    <>
      <article
        onClick={handleCardClick}
        className="p-4 sm:p-5 bg-white dark:bg-black border-b border-surface-200 dark:border-surface-800 hover:bg-surface-50/70 dark:hover:bg-surface-950/40 transition-colors cursor-pointer select-none"
      >
        <div className="flex gap-3 sm:gap-3.5">
          <Link
            href={`/profile/${report.author.username}`}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0"
          >
            <Avatar
              src={report.author.avatarUrl}
              name={report.author.name}
              size="md"
            />
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <Link
                  href={`/profile/${report.author.username}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-bold text-sm text-surface-900 dark:text-white hover:underline truncate"
                >
                  {report.author.name}
                </Link>
                {report.author.isVerified && <VerifiedBadge size={15} />}
                <span className="text-xs text-surface-500 dark:text-surface-400">
                  @{report.author.username}
                </span>
                <span className="text-surface-300 dark:text-surface-600 text-xs">·</span>
                <span className="text-xs text-surface-500 dark:text-surface-400 whitespace-nowrap">
                  {timeAgo(report.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {report.isHot && <HotBadge score={report.hotScore} />}
                <StatusBadge status={report.status} />

                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(!isMenuOpen);
                    }}
                    className="p-1.5 rounded-full text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-700 dark:hover:text-surface-200 transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {isMenuOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-white dark:bg-surface-900 shadow-xl border border-surface-200 dark:border-surface-800 py-1 z-30"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsFlagModalOpen(true);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 flex items-center gap-2"
                      >
                        <Flag className="w-3.5 h-3.5 text-surface-500" />
                        <span>Laporkan Konten</span>
                      </button>
                      {canManage && (
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={handleDelete}
                          className="w-full px-3.5 py-2 text-left text-xs text-crimson-600 dark:text-crimson-400 hover:bg-crimson-50 dark:hover:bg-crimson-950/40 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Laporan</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                style={{ backgroundColor: `${report.category.color}15`, color: report.category.color }}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              >
                {report.category.name}
              </span>
              {report.targetInstance && (
                <span className="text-[11px] text-surface-500 dark:text-surface-400 truncate">
                  ke <span className="font-semibold text-surface-700 dark:text-surface-300">{report.targetInstance.name}</span>
                </span>
              )}
            </div>

            <div className="space-y-1 mb-2.5">
              <h2 className="text-sm sm:text-base font-bold text-surface-900 dark:text-white leading-snug">
                {report.title}
              </h2>
              <p className="text-xs sm:text-sm text-surface-700 dark:text-surface-300 whitespace-pre-line leading-relaxed line-clamp-3">
                {report.description}
              </p>
            </div>

            {report.mediaUrls && report.mediaUrls.length > 0 && (
              <div className="mb-2.5 rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800 bg-surface-100 dark:bg-surface-900">
                <div
                  className={`grid gap-1 ${
                    report.mediaUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"
                  }`}
                >
                  {report.mediaUrls.slice(0, 4).map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-video w-full overflow-hidden bg-surface-200 dark:bg-surface-800"
                    >
                      <Image
                        src={url}
                        alt={`Foto ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 600px"
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400 mb-2.5">
              <MapPin className="w-3.5 h-3.5 text-crimson-600 dark:text-crimson-400 shrink-0" />
              <span className="truncate">{report.address}</span>
            </div>

            {report.status === "RESOLVED" && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 mb-2.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Permasalahan ini telah diselesaikan secara resmi oleh pihak instansi terkait.</span>
              </div>
            )}

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
          </div>
        </div>
      </article>

      <FlagModal
        isOpen={isFlagModalOpen}
        onClose={() => setIsFlagModalOpen(false)}
        reportId={report.id}
      />
    </>
  );
}
