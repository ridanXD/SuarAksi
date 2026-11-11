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
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useSocket } from "@/lib/socket-context";
import { cn } from "@/lib/utils";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { ThemeToggle } from "../ui/ThemeToggle";

interface LeftSidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isDesktopCollapsed?: boolean;
}

export function LeftSidebar({
  isMobileOpen = false,
  onCloseMobile,
  isDesktopCollapsed = false,
}: LeftSidebarProps) {
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

  const handleLinkClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      <div
        onClick={onCloseMobile}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300",
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-black border-r border-surface-200 dark:border-surface-800 flex flex-col justify-between p-3 select-none shrink-0 transition-all duration-300 ease-in-out lg:sticky lg:top-[53px] lg:h-[calc(100vh-53px)] lg:z-10",
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
          isDesktopCollapsed
            ? "lg:translate-x-0 lg:w-0 lg:p-0 lg:opacity-0 lg:overflow-hidden lg:pointer-events-none lg:border-r-0"
            : "lg:translate-x-0 lg:shadow-none lg:w-64 lg:opacity-100 lg:p-3 lg:pointer-events-auto"
        )}
      >
        <div className="space-y-4 overflow-y-auto min-w-[220px]">
          <div className="flex items-center justify-between px-2 py-1 lg:hidden">
            <Link href="/feed" onClick={handleLinkClick} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-crimson-600 flex items-center justify-center text-white shadow-sm">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-surface-900 dark:text-white block leading-tight">
                  Suar<span className="text-crimson-600">Aksi</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-surface-400 dark:text-surface-500 block">
                  Civic Accountability
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Tutup menu sidebar"
              className="p-1.5 rounded-full text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              if (item.requiresAuth && !user) return null;
              const isActive =
                pathname === item.href || (item.href !== "/feed" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm transition-colors",
                    isActive
                      ? "bg-crimson-50 dark:bg-crimson-950/40 text-crimson-600 dark:text-crimson-400 font-bold"
                      : "text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-900 hover:text-surface-900 dark:hover:text-white font-medium"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("w-5 h-5", isActive ? "text-crimson-600 dark:text-crimson-400" : "text-surface-500 dark:text-surface-400")} />
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

            <div className="pt-1">
              <ThemeToggle showLabel className="text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-900 rounded-full" />
            </div>

            {user && (user.role === "INSTANCE" || user.role === "ADMIN") && (
              <div className="pt-2 border-t border-surface-100 dark:border-surface-800 mt-2 space-y-1">
                <span className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500 block mb-1">
                  Portal Khusus
                </span>
                <Link
                  href="/instance/dashboard"
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2 rounded-full text-sm transition-colors",
                    pathname.startsWith("/instance")
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold"
                      : "text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-900 hover:text-surface-900 dark:hover:text-white font-medium"
                  )}
                >
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Portal Instansi</span>
                </Link>
              </div>
            )}

            {user && user.role === "ADMIN" && (
              <Link
                href="/admin/dashboard"
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2 rounded-full text-sm transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-bold"
                    : "text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-900 hover:text-surface-900 dark:hover:text-white font-medium"
                )}
              >
                <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          <div className="pt-2">
            <Link href="/reports/create" onClick={handleLinkClick}>
              <Button className="w-full rounded-full gap-2 shadow-sm font-bold h-11 bg-crimson-600 hover:bg-crimson-700 text-white">
                <PlusCircle className="w-5 h-5" />
                <span>Buat Laporan</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="pt-3 border-t border-surface-200 dark:border-surface-800 min-w-[220px]">
          {user ? (
            <div className="flex items-center justify-between p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors">
              <Link
                href={`/profile/${user.username}`}
                onClick={handleLinkClick}
                className="flex items-center gap-2.5 min-w-0 flex-1"
              >
                <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-surface-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-surface-500 dark:text-surface-400 truncate">@{user.username}</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={logout}
                title="Keluar dari akun"
                className="p-1.5 rounded-full text-surface-400 hover:text-crimson-600 hover:bg-crimson-50 dark:hover:bg-crimson-950/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link href="/login" onClick={handleLinkClick} className="block w-full">
                <Button variant="secondary" className="w-full rounded-full text-xs h-9 font-semibold">
                  Masuk
                </Button>
              </Link>
              <Link href="/register" onClick={handleLinkClick} className="block w-full">
                <Button className="w-full rounded-full text-xs h-9 font-semibold">Daftar Akun</Button>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
