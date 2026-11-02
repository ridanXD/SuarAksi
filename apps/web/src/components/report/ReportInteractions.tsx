"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageSquare, ArrowBigUp, Repeat2, Share2, Bookmark } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { formatCompactNumber, cn } from "@/lib/utils";
import { ShareModal } from "./ShareModal";

interface ReportInteractionsProps {
  reportId: string;
  title: string;
  likesCount: number;
  commentsCount: number;
  upsCount: number;
  repostsCount: number;
  sharesCount: number;
  hasLiked?: boolean;
  hasUpvoted?: boolean;
  hasReposted?: boolean;
  hasBookmarked?: boolean;
  onCommentClick?: () => void;
  className?: string;
}

export function ReportInteractions({
  reportId,
  title,
  likesCount: initialLikes,
  commentsCount,
  upsCount: initialUps,
  repostsCount: initialReposts,
  sharesCount: initialShares,
  hasLiked: initialHasLiked = false,
  hasUpvoted: initialHasUpvoted = false,
  hasReposted: initialHasReposted = false,
  hasBookmarked: initialHasBookmarked = false,
  onCommentClick,
  className,
}: ReportInteractionsProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);

  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);
  const [upsCount, setUpsCount] = useState(initialUps);

  const [hasReposted, setHasReposted] = useState(initialHasReposted);
  const [repostsCount, setRepostsCount] = useState(initialReposts);

  const [hasBookmarked, setHasBookmarked] = useState(initialHasBookmarked);
  const [sharesCount, setSharesCount] = useState(initialShares);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const requireLogin = () => {
    if (!user) {
      router.push("/login");
      return false;
    }
    return true;
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireLogin()) return;

    const nextState = !hasLiked;
    setHasLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (nextState) {
        await api.post(`/reports/${reportId}/like`);
      } else {
        await api.delete(`/reports/${reportId}/like`);
      }
    } catch {
      setHasLiked(!nextState);
      setLikesCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireLogin()) return;

    const nextState = !hasUpvoted;
    setHasUpvoted(nextState);
    setUpsCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (nextState) {
        await api.post(`/reports/${reportId}/up`);
      } else {
        await api.delete(`/reports/${reportId}/up`);
      }
    } catch {
      setHasUpvoted(!nextState);
      setUpsCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireLogin()) return;

    const nextState = !hasReposted;
    setHasReposted(nextState);
    setRepostsCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (nextState) {
        await api.post(`/reports/${reportId}/repost`);
      } else {
        await api.delete(`/reports/${reportId}/repost`);
      }
    } catch {
      setHasReposted(!nextState);
      setRepostsCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireLogin()) return;

    const nextState = !hasBookmarked;
    setHasBookmarked(nextState);

    try {
      if (nextState) {
        await api.post(`/reports/${reportId}/bookmark`);
      } else {
        await api.delete(`/reports/${reportId}/bookmark`);
      }
    } catch {
      setHasBookmarked(!nextState);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareModalOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center justify-between text-surface-500 pt-2 border-t border-surface-100",
          className
        )}
      >
        <button
          type="button"
          onClick={handleUpvote}
          title="Berikan UP untuk mendorong prioritas penanganan"
          className={cn(
            "group flex items-center gap-1.5 py-1 px-2 rounded hover:bg-crimson-50 transition-colors text-xs font-semibold",
            hasUpvoted ? "text-crimson-600 bg-crimson-50/80" : "hover:text-crimson-600"
          )}
        >
          <ArrowBigUp
            className={cn(
              "w-5 h-5 transition-transform group-hover:-translate-y-0.5",
              hasUpvoted && "fill-crimson-600 text-crimson-600"
            )}
          />
          <span>{formatCompactNumber(upsCount)} UP</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onCommentClick) {
              onCommentClick();
            } else {
              router.push(`/reports/${reportId}`);
            }
          }}
          className="group flex items-center gap-1.5 py-1 px-2 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors text-xs"
        >
          <MessageSquare className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span>{formatCompactNumber(commentsCount)}</span>
        </button>

        <button
          type="button"
          onClick={handleRepost}
          className={cn(
            "group flex items-center gap-1.5 py-1 px-2 rounded hover:bg-emerald-50 transition-colors text-xs",
            hasReposted ? "text-emerald-600" : "hover:text-emerald-600"
          )}
        >
          <Repeat2 className="w-4 h-4 transition-transform group-hover:rotate-180 duration-300" />
          <span>{formatCompactNumber(repostsCount)}</span>
        </button>

        <button
          type="button"
          onClick={handleLike}
          className={cn(
            "group flex items-center gap-1.5 py-1 px-2 rounded hover:bg-rose-50 transition-colors text-xs",
            hasLiked ? "text-rose-600" : "hover:text-rose-600"
          )}
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-transform group-hover:scale-110",
              hasLiked && "fill-rose-600 text-rose-600"
            )}
          />
          <span>{formatCompactNumber(likesCount)}</span>
        </button>

        <button
          type="button"
          onClick={handleShareClick}
          className="group flex items-center gap-1.5 py-1 px-2 rounded hover:bg-surface-100 hover:text-surface-800 transition-colors text-xs"
        >
          <Share2 className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span>{formatCompactNumber(sharesCount)}</span>
        </button>

        <button
          type="button"
          onClick={handleBookmark}
          className={cn(
            "p-1.5 rounded hover:bg-surface-100 transition-colors",
            hasBookmarked ? "text-blue-600" : "hover:text-surface-800"
          )}
        >
          <Bookmark
            className={cn("w-4 h-4", hasBookmarked && "fill-blue-600 text-blue-600")}
          />
        </button>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        reportId={reportId}
        title={title}
      />
    </>
  );
}
