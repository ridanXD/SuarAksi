"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, MoreHorizontal, Flag, Trash2, Edit3, ShieldAlert } from "lucide-react";
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
        className="p-4 sm:p-5 bg-white border-b border-surface-200 hover:bg-surface-50/50 transition-colors cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
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
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={`/profile/${report.author.username}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-bold text-sm text-surface-900 hover:underline truncate"
                >
                  {report.author.name}
                </Link>
                {report.author.isVerified && <VerifiedBadge size={15} />}
                <span className="text-xs text-surface-500">
                  @{report.author.username}
                </span>
                <span className="text-surface-300 text-xs">·</span>
                <span className="text-xs text-surface-500 whitespace-nowrap">
                  {timeAgo(report.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  style={{ backgroundColor: `${report.category.color}15`, color: report.category.color }}
                  className="px-2 py-0.5 rounded text-[11px] font-semibold"
                >
                  {report.category.name}
                </span>
                {report.targetInstance && (
                  <span className="text-[11px] text-surface-500 flex items-center gap-1 truncate">
                    tujuan: <span className="font-medium text-surface-700">{report.targetInstance.name}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {report.isHot && <HotBadge score={report.hotScore} />}
            <StatusBadge status={report.status} />

            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="p-1 rounded text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1 w-44 rounded-lg bg-white shadow-lg border border-surface-200 py-1 z-20"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsFlagModalOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-surface-700 hover:bg-surface-100 flex items-center gap-2"
                  >
                    <Flag className="w-3.5 h-3.5 text-surface-500" />
                    <span>Laporkan Konten</span>
                  </button>
                  {canManage && (
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={handleDelete}
                      className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
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

        <div className="space-y-2 mb-3">
          <h2 className="text-base font-bold text-surface-900 leading-snug">
            {report.title}
          </h2>
          <p className="text-sm text-surface-700 whitespace-pre-line leading-relaxed line-clamp-3">
            {report.description}
          </p>
        </div>

        {report.mediaUrls && report.mediaUrls.length > 0 && (
          <div className="mb-3 rounded-lg overflow-hidden border border-surface-200 bg-surface-100">
            <div
              className={`grid gap-1 ${
                report.mediaUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {report.mediaUrls.slice(0, 4).map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-video w-full overflow-hidden bg-surface-200"
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

        <div className="flex items-center gap-1.5 text-xs text-surface-500 mb-3">
          <MapPin className="w-3.5 h-3.5 text-crimson-600 shrink-0" />
          <span className="truncate">{report.address}</span>
        </div>

        {report.status === "RESOLVED" && (
          <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0" />
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
      </article>

      <FlagModal
        isOpen={isFlagModalOpen}
        onClose={() => setIsFlagModalOpen(false)}
        reportId={report.id}
      />
    </>
  );
}
