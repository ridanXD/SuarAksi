"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Megaphone, Search, Bell, Menu, PlusCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useSocket } from "@/lib/socket-context";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { ThemeToggle } from "../ui/ThemeToggle";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { unreadCount } = useSocket();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/85 dark:bg-black/85 backdrop-blur-md border-b border-surface-200 dark:border-surface-800 px-2 sm:px-4 py-2 select-none transition-colors">
      <div className="w-full flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Menu navigasi sidebar"
            title="Menu Sidebar (Garis Tiga)"
            className="p-2 -ml-1 rounded-full text-surface-700 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors flex items-center justify-center cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/feed" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-crimson-600 flex items-center justify-center text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black text-surface-900 dark:text-white tracking-tight leading-none block">
                Suar<span className="text-crimson-600">Aksi</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-surface-400 dark:text-surface-500 hidden sm:block leading-none mt-0.5">
                Civic Accountability
              </span>
            </div>
          </Link>
        </div>

        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl mx-4 lg:mx-8">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-surface-400 dark:text-surface-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari isu, lokasi, warga, instansi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-surface-100 dark:bg-surface-900 border border-transparent dark:border-surface-800 focus:border-crimson-600 dark:focus:border-crimson-600 focus:bg-white dark:focus:bg-black focus:outline-none focus:ring-1 focus:ring-crimson-600 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 dark:placeholder:text-surface-500 transition-all"
            />
          </div>
        </form>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />

          <Link
            href="/explore"
            aria-label="Cari dan jelajahi"
            className="p-2 rounded-full text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-900 md:hidden"
          >
            <Search className="w-4 h-4" />
          </Link>

          <Link
            href="/notifications"
            aria-label="Notifikasi"
            className="p-2 rounded-full text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-900 relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-crimson-600 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          <Link href="/reports/create" className="hidden sm:inline-flex">
            <Button size="sm" className="rounded-full gap-1.5 h-8 text-xs font-semibold px-3.5 shadow-sm">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Buat Laporan</span>
            </Button>
          </Link>

          {user ? (
            <Link href={`/profile/${user.username}`} className="flex items-center gap-2 pl-1">
              <Avatar src={user.avatarUrl} name={user.name} size="sm" />
              <span className="text-xs font-bold text-surface-800 dark:text-surface-200 hidden lg:inline max-w-[130px] truncate">
                {user.name}
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link href="/login">
                <Button variant="secondary" size="sm" className="rounded-full text-xs h-8 px-3.5">
                  Masuk
                </Button>
              </Link>
              <Link href="/register" className="hidden sm:inline-flex">
                <Button size="sm" className="rounded-full text-xs h-8 px-3.5">
                  Daftar
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
