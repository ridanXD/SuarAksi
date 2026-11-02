"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Settings, Shield, Bell, LogOut, User } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <AppLayout>
        <div className="p-8 text-center space-y-3">
          <p className="text-xs text-surface-500">Silakan masuk untuk mengakses pengaturan.</p>
          <Button size="sm" onClick={() => router.push("/login")}>
            Masuk
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showRightSidebar={false}>
      <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-surface-200">
          <Settings className="w-5 h-5 text-crimson-600" />
          <h1 className="text-base font-bold text-surface-900">Pengaturan Akun</h1>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 divide-y divide-surface-100">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-surface-900">Email Terdaftar</p>
              <p className="text-xs text-surface-500">{user.email}</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Terverifikasi
            </span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-surface-900">Tipe Hak Akses (Role)</p>
              <p className="text-xs text-surface-500">
                {user.role === "ADMIN"
                  ? "Administrator Platform"
                  : user.role === "INSTANCE"
                  ? "Instansi Pemerintah Terdaftar"
                  : "Masyarakat Umum"}
              </p>
            </div>
            {user.isVerified && (
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Verified
              </span>
            )}
          </div>

          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-surface-900">Notifikasi Real-time</p>
              <p className="text-xs text-surface-500">
                Pemberitahuan aktif melalui koneksi socket langsung
              </p>
            </div>
            <span className="text-[11px] font-semibold text-surface-700 bg-surface-100 px-2 py-0.5 rounded">
              Aktif
            </span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-red-600">Sesi Akun</p>
              <p className="text-xs text-surface-500">Keluar dari akun Anda di perangkat ini</p>
            </div>
            <Button variant="danger" size="sm" onClick={logout} className="gap-1.5">
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
