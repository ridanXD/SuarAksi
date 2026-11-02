"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Flame,
  PlusCircle,
  Bell,
  Bookmark,
  User,
  Settings,
  LogOut,
  Building2,
  ShieldCheck,
  Megaphone,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useSocket } from "@/lib/socket-context";
import { cn } from "@/lib/utils";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";

export function LeftSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();

  const navItems = [
    { label: "Beranda", href: "/feed", icon: Home },
    { label: "Jelajahi", href: "/explore", icon: Compass },
    { label: "Trending", href: "/trending", icon: Flame },
    {
      label: "Notifikasi",
      href: "/notifications",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { label: "Tersimpan", href: "/bookmarks", icon: Bookmark, requiresAuth: true },
    {
      label: "Profil Saya",
      href: user ? `/profile/${user.username}` : "/login",
      icon: User,
    },
    { label: "Pengaturan", href: "/settings", icon: Settings, requiresAuth: true },
  ];

  return (
    <aside className="sticky top-0 h-screen w-64 border-r border-surface-200 bg-white flex flex-col justify-between p-4 select-none shrink-0 hidden lg:flex">
      <div className="space-y-6">
        <Link href="/feed" className="flex items-center gap-2.5 px-3 py-1">
          <div className="w-9 h-9 rounded-lg bg-crimson-600 flex items-center justify-center text-white shadow-sm">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-surface-900 block leading-tight">
              Suar<span className="text-crimson-600">Aksi</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-surface-400 block">
              Civic Accountability
            </span>
          </div>
        </Link>

        <nav className="space-y-1">
          {navItems.map((item) => {
            if (item.requiresAuth && !user) return null;
            const isActive = pathname === item.href || (item.href !== "/feed" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-crimson-50 text-crimson-700 font-semibold"
                    : "text-surface-700 hover:bg-surface-100 hover:text-surface-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-5 h-5", isActive ? "text-crimson-600" : "text-surface-500")} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-crimson-600 text-white">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {user && (user.role === "INSTANCE" || user.role === "ADMIN") && (
            <div className="pt-3 border-t border-surface-100 mt-2 space-y-1">
              <span className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-surface-400 block mb-1">
                Portal Khusus
              </span>
              <Link
                href="/instance/dashboard"
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname.startsWith("/instance")
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-surface-700 hover:bg-surface-100 hover:text-surface-900"
                )}
              >
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Portal Instansi</span>
              </Link>
            </div>
          )}

          {user && user.role === "ADMIN" && (
            <Link
              href="/admin/dashboard"
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-purple-50 text-purple-700 font-semibold"
                  : "text-surface-700 hover:bg-surface-100 hover:text-surface-900"
              )}
            >
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        <div className="pt-2">
          <Link href="/reports/create">
            <Button className="w-full gap-2 shadow-sm font-semibold h-11">
              <PlusCircle className="w-5 h-5" />
              <span>Buat Laporan Baru</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="pt-4 border-t border-surface-200">
        {user ? (
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-100 transition-colors">
            <Link href={`/profile/${user.username}`} className="flex items-center gap-2.5 min-w-0">
              <Avatar src={user.avatarUrl} name={user.name} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-surface-900 truncate">{user.name}</p>
                <p className="text-[11px] text-surface-500 truncate">@{user.username}</p>
              </div>
            </Link>
            <button
              type="button"
              onClick={logout}
              title="Keluar dari akun"
              className="p-1.5 rounded-md text-surface-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link href="/login" className="block w-full">
              <Button variant="secondary" className="w-full text-xs h-9">
                Masuk
              </Button>
            </Link>
            <Link href="/register" className="block w-full">
              <Button className="w-full text-xs h-9">Daftar Akun</Button>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
