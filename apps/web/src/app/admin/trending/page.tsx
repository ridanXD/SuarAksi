"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Flame, Save, RefreshCw, Sparkles, Sliders } from "lucide-react";
import { AdminNav } from "@/components/layout/AdminNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function AdminTrendingConfigPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [likeWeight, setLikeWeight] = useState(1);
  const [commentWeight, setCommentWeight] = useState(2);
  const [repostWeight, setRepostWeight] = useState(3);
  const [upWeight, setUpWeight] = useState(4);
  const [shareWeight, setShareWeight] = useState(2);
  const [hotThreshold, setHotThreshold] = useState(30);
  const [decayHalfLifeHours, setDecayHalfLifeHours] = useState(24);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "ADMIN") {
      router.push("/feed");
      return;
    }

    api.get<any[]>("/admin/trending/config")
      .then((settings) => {
        for (const s of settings) {
          const val = parseFloat(s.value);
          if (!isNaN(val)) {
            if (s.key === "LIKE_WEIGHT") setLikeWeight(val);
            if (s.key === "COMMENT_WEIGHT") setCommentWeight(val);
            if (s.key === "REPOST_WEIGHT") setRepostWeight(val);
            if (s.key === "UP_WEIGHT") setUpWeight(val);
            if (s.key === "SHARE_WEIGHT") setShareWeight(val);
            if (s.key === "HOT_THRESHOLD") setHotThreshold(val);
            if (s.key === "DECAY_HALF_LIFE_HOURS") setDecayHalfLifeHours(val);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);

    try {
      await api.patch("/admin/trending/config", {
        likeWeight: Number(likeWeight),
        commentWeight: Number(commentWeight),
        repostWeight: Number(repostWeight),
        upWeight: Number(upWeight),
        shareWeight: Number(shareWeight),
        hotThreshold: Number(hotThreshold),
        decayHalfLifeHours: Number(decayHalfLifeHours),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      alert("Gagal memperbarui konfigurasi algoritma trending");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900">
      <AdminNav />

      <main className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-base font-bold text-surface-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-crimson-600 fill-crimson-600" />
            <span>Konfigurasi Algoritma Trending & HOT Score</span>
          </h1>
          <p className="text-xs text-surface-500">
            Atur bobot sinyal keterlibatan masyarakat dan peluruhan waktu (time decay)
          </p>
        </div>

        {success && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            Konfigurasi algoritma berhasil diperbarui dan skor seluruh laporan telah dihitung ulang secara otomatis!
          </div>
        )}

        <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-6">
          <div className="p-4 rounded-lg bg-surface-50 border border-surface-200 text-xs space-y-2">
            <span className="font-bold text-surface-900 block">Formula Perhitungan HOT Score:</span>
            <code className="block bg-white p-2.5 rounded border border-surface-200 font-mono text-crimson-700">
              Hot Score = (Like × {likeWeight}) + (Komentar × {commentWeight}) + (Repost × {repostWeight}) + (UP × {upWeight}) + (Share × {shareWeight}) + Growth Bonus - Time Decay
            </code>
            <p className="text-surface-500 text-[11px]">
              Laporan akan secara otomatis mendapatkan badge HOT apabila skor mencapai atau melampaui nilai ambang batas (threshold).
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Bobot UP (Dukungan Prioritas)"
                type="number"
                step="0.5"
                min="0"
                value={upWeight}
                onChange={(e) => setUpWeight(parseFloat(e.target.value) || 0)}
                required
              />

              <Input
                label="Bobot Repost (Penyebaran Luas)"
                type="number"
                step="0.5"
                min="0"
                value={repostWeight}
                onChange={(e) => setRepostWeight(parseFloat(e.target.value) || 0)}
                required
              />

              <Input
                label="Bobot Komentar (Tingkat Diskusi)"
                type="number"
                step="0.5"
                min="0"
                value={commentWeight}
                onChange={(e) => setCommentWeight(parseFloat(e.target.value) || 0)}
                required
              />

              <Input
                label="Bobot Share (Tautan Keluar)"
                type="number"
                step="0.5"
                min="0"
                value={shareWeight}
                onChange={(e) => setShareWeight(parseFloat(e.target.value) || 0)}
                required
              />

              <Input
                label="Bobot Like (Apresiasi Standar)"
                type="number"
                step="0.5"
                min="0"
                value={likeWeight}
                onChange={(e) => setLikeWeight(parseFloat(e.target.value) || 0)}
                required
              />

              <Input
                label="Ambang Batas HOT (Threshold)"
                type="number"
                min="1"
                value={hotThreshold}
                onChange={(e) => setHotThreshold(parseFloat(e.target.value) || 1)}
                required
              />

              <Input
                label="Waktu Paruh Peluruhan (Half-life dalam Jam)"
                type="number"
                min="1"
                value={decayHalfLifeHours}
                onChange={(e) => setDecayHalfLifeHours(parseFloat(e.target.value) || 1)}
                required
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-surface-100">
              <Button type="submit" isLoading={isSaving} className="gap-2">
                <Save className="w-4 h-4" />
                <span>Simpan & Terapkan Formula</span>
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
