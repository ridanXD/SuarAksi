"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Save, ShieldCheck } from "lucide-react";
import { AdminNav } from "@/components/layout/AdminNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth-context";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [platformName, setPlatformName] = useState("SuarAksi");
  const [supportEmail, setSupportEmail] = useState("bantuan@suaraksi.id");
  const [maxImageSizeMb, setMaxImageSizeMb] = useState("10");
  const [allowPublicRegistration, setAllowPublicRegistration] = useState(true);
  const [success, setSuccess] = useState(false);

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900">
      <AdminNav />

      <main className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-base font-bold text-surface-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600" />
            <span>Pengaturan Konfigurasi Sistem</span>
          </h1>
          <p className="text-xs text-surface-500">
            Kelola parameter operasional umum platform SuarAksi
          </p>
        </div>

        {success && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            Konfigurasi sistem berhasil disimpan!
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Platform"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              required
            />

            <Input
              label="Email Bantuan Resmi"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              required
            />

            <Input
              label="Batas Maksimal Ukuran File Foto (MB)"
              type="number"
              value={maxImageSizeMb}
              onChange={(e) => setMaxImageSizeMb(e.target.value)}
              required
            />
          </div>

          <div className="pt-2 border-t border-surface-100">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowRegCheck"
                checked={allowPublicRegistration}
                onChange={(e) => setAllowPublicRegistration(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <label htmlFor="allowRegCheck" className="text-xs font-semibold text-surface-700">
                Izinkan Pendaftaran Akun Warga & Instansi Baru
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-surface-100">
            <Button size="sm" type="submit" className="gap-1.5">
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
