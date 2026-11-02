"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, Share2, Send, MessageCircle } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { api } from "@/lib/api";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  title: string;
}

export function ShareModal({ isOpen, onClose, reportId, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && Boolean(navigator.share)) {
      setCanShare(true);
    }
  }, []);

  const reportUrl = typeof window !== "undefined" ? `${window.location.origin}/reports/${reportId}` : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportUrl);
      setCopied(true);
      await api.post(`/reports/${reportId}/share`, { platform: "COPY_LINK" }).catch(() => {});
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `SuarAksi: ${title}`,
          text: `Dukung dan pantau laporan warga ini di SuarAksi: "${title}"`,
          url: reportUrl,
        });
        await api.post(`/reports/${reportId}/share`, { platform: "NATIVE" }).catch(() => {});
        onClose();
      } catch {}
    }
  };

  const handleSocialShare = async (platform: string, shareUrl: string) => {
    await api.post(`/reports/${reportId}/share`, { platform }).catch(() => {});
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const encodedUrl = encodeURIComponent(reportUrl);
  const encodedText = encodeURIComponent(`Dukung dan kawal laporan warga di SuarAksi: "${title}"\n`);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bagikan Laporan">
      <div className="space-y-4">
        <p className="text-sm text-surface-600">
          Sebarkan laporan ini ke media sosial agar mendapat perhatian lebih banyak dari publik dan instansi berwenang.
        </p>

        {canShare && (
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleNativeShare}
          >
            <Share2 className="w-4 h-4 text-crimson-600" />
            <span>Bagikan lewat aplikasi perangkat</span>
          </Button>
        )}

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() =>
              handleSocialShare(
                "TWITTER",
                `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
              )
            }
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors"
          >
            <span className="text-sm font-bold text-black mb-1">𝕏</span>
            <span className="text-xs text-surface-600">X (Twitter)</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleSocialShare(
                "WHATSAPP",
                `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`
              )
            }
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-emerald-600 mb-1" />
            <span className="text-xs text-surface-600">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleSocialShare(
                "TELEGRAM",
                `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
              )
            }
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors"
          >
            <Send className="w-5 h-5 text-sky-500 mb-1" />
            <span className="text-xs text-surface-600">Telegram</span>
          </button>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-semibold text-surface-700 mb-1.5">
            Tautan Langsung
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={reportUrl}
              className="w-full text-xs bg-surface-50 border border-surface-300 rounded px-3 py-2 text-surface-700 select-all"
            />
            <Button
              variant={copied ? "secondary" : "primary"}
              size="sm"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
