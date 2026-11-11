"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Plus, Bell, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useSocket } from "@/lib/socket-context";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { unreadCount } = useSocket();

  const navItems = [
    { label: "Beranda", href: "/feed", icon: Home },
    { label: "Jelajahi", href: "/explore", icon: Compass },
    { label: "Lapor", href: "/reports/create", icon: Plus, isCta: true },
    {
      label: "Notifikasi",
      href: "/notifications",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      label: "Profil",
      href: user ? `/profile/${user.username}` : "/login",
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-black/90 backdrop-blur-md border-t border-surface-200 dark:border-surface-800 lg:hidden px-4 py-2 flex items-center justify-around transition-colors">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        if (item.isCta) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="w-11 h-11 rounded-full bg-crimson-600 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform -mt-5"
            >
              <Icon className="w-6 h-6" />
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-3 relative transition-colors",
              isActive ? "text-crimson-600 dark:text-crimson-400 font-bold" : "text-surface-500 dark:text-surface-400"
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
            {item.badge && (
              <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-crimson-600" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
