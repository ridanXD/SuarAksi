"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Flag, Trash2, Edit2, CornerDownRight } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Avatar } from "../ui/Avatar";
import { VerifiedBadge } from "../ui/VerifiedBadge";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Textarea";
import { FlagModal } from "../report/FlagModal";

interface CommentAuthor {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  role: string;
  isVerified?: boolean;
}

export interface CommentData {
  id: string;
  reportId: string;
  content: string;
  createdAt: string;
  author: CommentAuthor;
  replies?: CommentData[];
}

interface CommentItemProps {
  comment: CommentData;
  reportId: string;
  onCommentDeleted: (id: string) => void;
  onReplyAdded: (reply: CommentData) => void;
}

export function CommentItem({
  comment,
  reportId,
  onCommentDeleted,
  onReplyAdded,
}: CommentItemProps) {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);

  const isAuthor = user?.id === comment.author.id;
  const isAdmin = user?.role === "ADMIN";

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmittingReply(true);
    try {
      const res = await api.post(`/reports/${reportId}/comments`, {
        content: replyContent.trim(),
        parentId: comment.id,
      });
      onReplyAdded(res);
      setReplyContent("");
      setIsReplying(false);
    } catch {
      alert("Gagal membalas komentar");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    setIsSubmittingEdit(true);
    try {
      await api.patch(`/comments/${comment.id}`, { content: editContent.trim() });
      comment.content = editContent.trim();
      setIsEditing(false);
    } catch {
      alert("Gagal mengubah komentar");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Hapus komentar ini?")) return;
    try {
      await api.delete(`/comments/${comment.id}`);
      onCommentDeleted(comment.id);
    } catch {
      alert("Gagal menghapus komentar");
    }
  };

  return (
    <>
      <div className="space-y-3 pt-3 border-t border-surface-100 dark:border-surface-800 first:border-0 first:pt-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <Link href={`/profile/${comment.author.username}`}>
              <Avatar
                src={comment.author.avatarUrl}
                name={comment.author.name}
                size="sm"
              />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={`/profile/${comment.author.username}`}
                  className="font-bold text-xs text-surface-900 dark:text-white hover:underline"
                >
                  {comment.author.name}
                </Link>
                {comment.author.isVerified && <VerifiedBadge size={13} />}
                <span className="text-[11px] text-surface-500 dark:text-surface-400">
                  @{comment.author.username}
                </span>
                <span className="text-surface-300 dark:text-surface-600 text-xs">·</span>
                <span className="text-[11px] text-surface-400 dark:text-surface-500">
                  {timeAgo(comment.createdAt)}
                </span>
              </div>

              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="mt-2 space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={2}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      type="button"
                      className="rounded-full"
                      onClick={() => setIsEditing(false)}
                    >
                      Batal
                    </Button>
                    <Button size="sm" type="submit" className="rounded-full font-bold" isLoading={isSubmittingEdit}>
                      Simpan
                    </Button>
                  </div>
                </form>
              ) : (
                <p className="text-xs text-surface-800 dark:text-surface-200 mt-1 whitespace-pre-line leading-relaxed">
                  {comment.content}
                </p>
              )}

              <div className="flex items-center gap-3 mt-2">
                {user && (
                  <button
                    type="button"
                    onClick={() => setIsReplying(!isReplying)}
                    className="text-[11px] font-semibold text-surface-500 hover:text-crimson-600 dark:hover:text-crimson-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <CornerDownRight className="w-3 h-3" />
                    <span>Balas</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-full text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white dark:bg-surface-900 shadow-xl border border-surface-200 dark:border-surface-800 py-1 z-20">
                {isAuthor && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsEditing(true);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center gap-2"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
                {(isAuthor || isAdmin) && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleDelete();
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-crimson-600 dark:text-crimson-400 hover:bg-crimson-50 dark:hover:bg-crimson-950/40 flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsFlagModalOpen(true);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center gap-2"
                >
                  <Flag className="w-3 h-3" />
                  <span>Laporkan</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {isReplying && (
          <form onSubmit={handleReplySubmit} className="pl-8 pt-2 space-y-2">
            <Textarea
              placeholder={`Balas komentar @${comment.author.username}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                type="button"
                className="rounded-full"
                onClick={() => setIsReplying(false)}
              >
                Batal
              </Button>
              <Button size="sm" type="submit" className="rounded-full font-bold" isLoading={isSubmittingReply}>
                Kirim Balasan
              </Button>
            </div>
          </form>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="pl-8 space-y-3 border-l-2 border-surface-200 dark:border-surface-800 ml-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                reportId={reportId}
                onCommentDeleted={onCommentDeleted}
                onReplyAdded={onReplyAdded}
              />
            ))}
          </div>
        )}
      </div>

      <FlagModal
        isOpen={isFlagModalOpen}
        onClose={() => setIsFlagModalOpen(false)}
        commentId={comment.id}
      />
    </>
  );
}
