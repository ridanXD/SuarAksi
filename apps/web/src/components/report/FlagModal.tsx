"use client";

import React, { useState } from "react";
import { FlagReason } from "@suaraksi/shared";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { api } from "@/lib/api";

interface FlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId?: string;
  commentId?: string;
}

export function FlagModal({ isOpen, onClose, reportId, commentId }: FlagModalProps) {
  const [reason, setReason] = useState<FlagReason>(FlagReason.SPAM);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const reasonOptions = [
    { value: FlagReason.SPAM, label: "Spam atau Iklan Tidak Relevan" },
    { value: FlagReason.MISINFORMATION, label: "Informasi Palsu / Hoaks" },
    { value: FlagReason.HATE_SPEECH, label: "Ujaran Kebencian atau SARA" },
    { value: FlagReason.HARASSMENT, label: "Pelecehan atau Ancaman" },
    { value: FlagReason.INAPPROPRIATE, label: "Konten Asusila / Tidak Pantas" },
    { value: FlagReason.OTHER, label: "Pelanggaran Lainnya" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await api.post("/comments/flag", {
        reportId,
        commentId,
        reason,
        description,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Gagal mengirimkan laporan pelanggaran");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Laporkan Konten">
      {success ? (
        <div className="py-6 text-center space-y-2">
          <p className="font-semibold text-surface-900">Terima kasih atas laporan Anda</p>
          <p className="text-xs text-surface-500">
            Tim administrator akan meninjau dan memproses konten ini sesuai pedoman komunitas SuarAksi.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-surface-500">
            Bantu kami menjaga SuarAksi sebagai platform civic yang aman, bersih, dan berintegritas.
          </p>

          <Select
            label="Alasan Pelanggaran"
            value={reason}
            onChange={(e) => setReason(e.target.value as FlagReason)}
            options={reasonOptions}
          />

          <Textarea
            label="Keterangan Tambahan (Opsional)"
            placeholder="Jelaskan alasan mengapa konten ini melanggar pedoman..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button variant="danger" type="submit" isLoading={isSubmitting}>
              Kirim Laporan
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
