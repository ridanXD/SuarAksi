"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Settings, LogOut, Sun, Moon } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  if (!user) {
    return (
      <AppLayout>
        <div className="p-8 text-center space-y-3">
          <p className="text-xs text-surface-500 dark:text-surface-400">Silakan masuk untuk mengakses pengaturan.</p>
          <Button size="sm" className="rounded-full" onClick={() => router.push("/login")}>
            Masuk
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showRightSidebar={false}>
      <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-surface-200 dark:border-surface-800">
          <Settings className="w-5 h-5 text-crimson-600" />
          <h1 className="text-base font-bold text-surface-900 dark:text-white">Pengaturan Akun & Tampilan</h1>
        </div>

        <div className="bg-white dark:bg-black rounded-2xl border border-surface-200 dark:border-surface-800 divide-y divide-surface-100 dark:divide-surface-800 transition-colors">
          <div className="p-4 sm:p-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-bold text-surface-900 dark:text-white">Tema Tampilan (Dark & Light Mode)</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                Pilih tampilan tema antarmuka sesuai kenyamanan Anda
              </p>
            </div>
            <div className="flex items-center gap-2 bg-surface-100 dark:bg-surface-900 p-1 rounded-full border border-surface-200 dark:border-surface-800">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                  theme === "light"
                    ? "bg-white text-surface-900 shadow-xs"
                    : "text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"
                )}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Terang</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                  theme === "dark"
                    ? "bg-surface-800 text-white shadow-xs"
                    : "text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"
                )}
              >
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span>Gelap</span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-surface-900 dark:text-white">Email Terdaftar</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">{user.email}</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
              Terverifikasi
            </span>
          </div>

          <div className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-surface-900 dark:text-white">Tipe Hak Akses (Role)</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                {user.role === "ADMIN"
                  ? "Administrator Platform"
                  : user.role === "INSTANCE"
                  ? "Instansi Pemerintah Terdaftar"
                  : "Masyarakat Umum"}
              </p>
            </div>
            {user.isVerified && (
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full">
                Verified
              </span>
            )}
          </div>

          <div className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-surface-900 dark:text-white">Notifikasi Real-time</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                Pemberitahuan aktif melalui koneksi socket langsung
              </p>
            </div>
            <span className="text-[11px] font-semibold text-surface-700 dark:text-surface-300 bg-surface-100 dark:bg-surface-800 px-2.5 py-0.5 rounded-full">
              Aktif
            </span>
          </div>

          <div className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-red-600 dark:text-red-400">Sesi Akun</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Keluar dari akun Anda di perangkat ini</p>
            </div>
            <Button variant="danger" size="sm" onClick={logout} className="rounded-full gap-1.5">
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
