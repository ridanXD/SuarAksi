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
          "flex items-center justify-between text-surface-500 dark:text-surface-400 pt-1 -ml-2 max-w-md",
          className
        )}
      >
        <button
          type="button"
          onClick={handleUpvote}
          title="Berikan UP untuk prioritas penanganan"
          className={cn(
            "group flex items-center gap-1 text-xs transition-colors cursor-pointer",
            hasUpvoted ? "text-crimson-600 dark:text-crimson-400 font-bold" : "hover:text-crimson-600 dark:hover:text-crimson-400"
          )}
        >
          <div className="p-1.5 rounded-full group-hover:bg-crimson-500/10 transition-colors">
            <ArrowBigUp
              className={cn(
                "w-4 h-4 transition-transform group-hover:-translate-y-0.5",
                hasUpvoted && "fill-crimson-600 dark:fill-crimson-400 text-crimson-600 dark:text-crimson-400"
              )}
            />
          </div>
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
          className="group flex items-center gap-1 text-xs hover:text-blue-500 transition-colors cursor-pointer"
        >
          <div className="p-1.5 rounded-full group-hover:bg-blue-500/10 transition-colors">
            <MessageSquare className="w-4 h-4 transition-transform group-hover:scale-110" />
          </div>
          <span>{formatCompactNumber(commentsCount)}</span>
        </button>

        <button
          type="button"
          onClick={handleRepost}
          className={cn(
            "group flex items-center gap-1 text-xs transition-colors cursor-pointer",
            hasReposted ? "text-emerald-500 font-bold" : "hover:text-emerald-500"
          )}
        >
          <div className="p-1.5 rounded-full group-hover:bg-emerald-500/10 transition-colors">
            <Repeat2 className="w-4 h-4 transition-transform group-hover:rotate-180 duration-300" />
          </div>
          <span>{formatCompactNumber(repostsCount)}</span>
        </button>

        <button
          type="button"
          onClick={handleLike}
          className={cn(
            "group flex items-center gap-1 text-xs transition-colors cursor-pointer",
            hasLiked ? "text-rose-500 font-bold" : "hover:text-rose-500"
          )}
        >
          <div className="p-1.5 rounded-full group-hover:bg-rose-500/10 transition-colors">
            <Heart
              className={cn(
                "w-4 h-4 transition-transform group-hover:scale-110",
                hasLiked && "fill-rose-500 text-rose-500"
              )}
            />
          </div>
          <span>{formatCompactNumber(likesCount)}</span>
        </button>

        <button
          type="button"
          onClick={handleBookmark}
          className={cn(
            "group p-1.5 rounded-full hover:bg-blue-500/10 transition-colors cursor-pointer",
            hasBookmarked ? "text-blue-500" : "hover:text-blue-500"
          )}
        >
          <Bookmark
            className={cn("w-4 h-4", hasBookmarked && "fill-blue-500 text-blue-500")}
          />
        </button>

        <button
          type="button"
          onClick={handleShareClick}
          className="group p-1.5 rounded-full hover:text-blue-500 hover:bg-blue-500/10 transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4 transition-transform group-hover:scale-110" />
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
