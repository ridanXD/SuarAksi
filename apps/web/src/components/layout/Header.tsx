"use client";

import React from "react";
import Link from "next/link";
import { Megaphone, Search, Bell } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useSocket } from "@/lib/socket-context";
import { Avatar } from "../ui/Avatar";

export function Header() {
  const { user } = useAuth();
  const { unreadCount } = useSocket();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-surface-200 px-4 py-2.5 flex items-center justify-between lg:hidden">
      <Link href="/feed" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-crimson-600 flex items-center justify-center text-white">
          <Megaphone className="w-4 h-4" />
        </div>
        <span className="text-base font-black text-surface-900">
          Suar<span className="text-crimson-600">Aksi</span>
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/explore"
          className="p-2 rounded-full text-surface-600 hover:bg-surface-100"
        >
          <Search className="w-5 h-5" />
        </Link>
        <Link
          href="/notifications"
          className="p-2 rounded-full text-surface-600 hover:bg-surface-100 relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-crimson-600" />
          )}
        </Link>
        {user ? (
          <Link href={`/profile/${user.username}`}>
            <Avatar src={user.avatarUrl} name={user.name} size="sm" />
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-xs font-semibold px-2.5 py-1 rounded bg-crimson-600 text-white"
          >
            Masuk
          </Link>
        )}
      </div>
    </header>
  );
}
