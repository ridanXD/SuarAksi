"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  FolderTree,
  ShieldAlert,
  Flame,
  History,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../ui/ThemeToggle";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { label: "Ringkasan", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Pengguna", href: "/admin/users", icon: Users },
    { label: "Verifikasi Instansi", href: "/admin/instances", icon: Building2 },
    { label: "Kelola Laporan", href: "/admin/reports", icon: FileText },
    { label: "Kategori", href: "/admin/categories", icon: FolderTree },
    { label: "Moderasi Konten", href: "/admin/moderation", icon: ShieldAlert },
    { label: "Algoritma Trending", href: "/admin/trending", icon: Flame },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
    { label: "Pengaturan Sistem", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="bg-white dark:bg-black border-b border-surface-200 dark:border-surface-800 sticky top-0 z-20 transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/feed">
            <button className="p-1.5 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-300 transition-colors cursor-pointer" title="Kembali ke feed">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-base font-black text-purple-900 dark:text-purple-300 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-600" />
              <span>Administrator Portal SuarAksi</span>
            </h1>
            <p className="text-[11px] text-surface-500 dark:text-surface-400">
              Pengelolaan akun, verifikasi instansi, moderasi, dan audit platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto text-xs font-semibold pb-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-t-lg shrink-0 border-b-2 transition-colors",
                isActive
                  ? "border-purple-600 text-purple-800 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-950/30"
                  : "border-transparent text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-50 dark:hover:bg-surface-900"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
