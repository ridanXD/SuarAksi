"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UploadCloud, Save } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [jurisdiction, setJurisdiction] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    setName(user.name || "");
    setBio(user.bio || "");
    setPhone(user.phone || "");
    setAvatarUrl(user.avatarUrl || null);
    if (user.instanceProfile) {
      setJurisdiction(user.instanceProfile.jurisdiction || "");
    }
  }, [user, router]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const url = await api.upload(file);
      setAvatarUrl(url);
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah foto profil");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama tidak boleh kosong");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const updated = await api.patch<any>("/users/me", {
        name: name.trim(),
        bio: bio.trim(),
        phone: phone.trim(),
        avatarUrl,
        jurisdiction: user?.role === "INSTANCE" ? jurisdiction.trim() : undefined,
      });

      setUser(updated);
      setSuccess(true);
      setTimeout(() => {
        router.push(`/profile/${user?.username}`);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan perubahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout showRightSidebar={false}>
      <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-surface-200 dark:border-surface-800">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-surface-900 dark:text-white">Edit Profil</h1>
            <p className="text-xs text-surface-500 dark:text-surface-400">Perbarui informasi identitas publik Anda</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
            Profil berhasil disimpan! Mengalihkan ke profil Anda...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-black p-6 rounded-2xl border border-surface-200 dark:border-surface-800 transition-colors">
          <div className="flex items-center gap-4">
            <Avatar src={avatarUrl} name={name || "User"} size="xl" />
            <div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-surface-300 dark:border-surface-700 text-xs font-semibold hover:bg-surface-50 dark:hover:bg-surface-900 text-surface-700 dark:text-surface-200">
                <UploadCloud className="w-4 h-4 text-crimson-600" />
                <span>{isUploading ? "Mengunggah..." : "Ubah Foto Profil"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-surface-400 dark:text-surface-500 mt-1">
                Disarankan foto berukuran persegi, maksimal 5MB.
              </p>
            </div>
          </div>

          <Input
            label="Nama Lengkap / Instansi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Textarea
            label="Bio Singkat"
            placeholder="Tuliskan deskripsi singkat tentang diri atau instansi Anda..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
          />

          <Input
            label="Nomor Telepon / WhatsApp"
            placeholder="0812xxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {user?.role === "INSTANCE" && (
            <Input
              label="Wilayah Cakupan Kewenangan"
              placeholder="Contoh: Provinsi DKI Jakarta"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
            />
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-100 dark:border-surface-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="rounded-full"
            >
              Batal
            </Button>
            <Button size="sm" type="submit" isLoading={isSubmitting} className="rounded-full font-bold gap-1.5 px-5">
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
