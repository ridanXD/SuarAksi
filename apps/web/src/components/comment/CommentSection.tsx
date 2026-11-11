"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { api } from "@/lib/api";
import { CommentItem, CommentData } from "./CommentItem";
import { CommentForm } from "./CommentForm";
import { Skeleton } from "../ui/Skeleton";

interface CommentSectionProps {
  reportId: string;
}

export function CommentSection({ reportId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const data = await api.get<CommentData[]>(`/reports/${reportId}/comments`);
      setComments(data);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [reportId]);

  const handleCommentCreated = (newComment: CommentData) => {
    setComments((prev) => [...prev, newComment]);
  };

  const handleReplyAdded = () => {
    fetchComments();
  };

  const handleCommentDeleted = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="bg-white dark:bg-black rounded-2xl border border-surface-200 dark:border-surface-800 p-5 space-y-6 transition-colors">
      <div className="flex items-center gap-2 pb-3 border-b border-surface-100 dark:border-surface-800">
        <MessageSquare className="w-4 h-4 text-crimson-600" />
        <h3 className="text-sm font-bold text-surface-900 dark:text-white">
          Diskusi Masyarakat ({comments.length})
        </h3>
      </div>

      <CommentForm reportId={reportId} onCommentCreated={handleCommentCreated} />

      {isLoading ? (
        <div className="space-y-4 pt-2">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center text-xs text-surface-400 dark:text-surface-500">
          Belum ada komentar. Jadilah yang pertama memberikan tanggapan!
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              reportId={reportId}
              onCommentDeleted={handleCommentDeleted}
              onReplyAdded={handleReplyAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
}
