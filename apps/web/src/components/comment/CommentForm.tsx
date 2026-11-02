"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";

interface CommentFormProps {
  reportId: string;
  onCommentCreated: (newComment: any) => void;
}

export function CommentForm({ reportId, onCommentCreated }: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="p-4 rounded-lg bg-surface-50 border border-surface-200 text-center space-y-2">
        <p className="text-xs text-surface-600">
          Masuk ke akun Anda untuk bergabung dalam diskusi warga.
        </p>
        <Link href="/login">
          <Button size="sm" variant="outline">
            Masuk / Buat Akun
          </Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post(`/reports/${reportId}/comments`, {
        content: content.trim(),
      });
      onCommentCreated(res);
      setContent("");
    } catch {
      alert("Gagal menambahkan komentar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-start">
      <Avatar src={user.avatarUrl} name={user.name} size="sm" />
      <div className="flex-1 space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tuliskan tanggapan atau informasi tambahan terkait laporan ini..."
          className="w-full text-xs rounded-md border border-surface-300 p-2.5 focus:border-crimson-600 focus:outline-none focus:ring-1 focus:ring-crimson-600 resize-none min-h-[64px]"
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            type="submit"
            disabled={!content.trim()}
            isLoading={isSubmitting}
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            <span>Kirim Komentar</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
