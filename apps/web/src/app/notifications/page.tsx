"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Heart,
  MessageSquare,
  Repeat2,
  ArrowBigUp,
  ShieldAlert,
  Building2,
  CheckCircle,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/lib/auth-context";
import { useSocket } from "@/lib/socket-context";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/utils";

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { setUnreadCount } = useSocket();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    api.get<any>("/notifications")
      .then((data) => {
        setNotifications(data.items || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user, router, setUnreadCount]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      alert("Gagal memperbarui notifikasi");
    }
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      api.patch(`/notifications/${notif.id}/read`).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    if (notif.reportId) {
      router.push(`/reports/${notif.reportId}`);
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "LIKE":
        return <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />;
      case "UP":
        return <ArrowBigUp className="w-4 h-4 fill-crimson-600 text-crimson-600" />;
      case "COMMENT":
      case "REPLY":
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "REPOST":
        return <Repeat2 className="w-4 h-4 text-emerald-500" />;
      case "STATUS_CHANGE":
        return <ShieldAlert className="w-4 h-4 text-orange-500" />;
      case "OFFICIAL_RESPONSE":
        return <Building2 className="w-4 h-4 text-blue-500" />;
      case "INSTANCE_VERIFIED":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return <Bell className="w-4 h-4 text-surface-500" />;
    }
  };

  return (
    <AppLayout>
      <div className="border-b border-surface-200 dark:border-surface-800 bg-white/85 dark:bg-black/85 backdrop-blur-md sticky top-[53px] z-20 p-4 flex items-center justify-between select-none transition-colors">
        <div>
          <h1 className="text-base font-black text-surface-900 dark:text-white tracking-tight">
            Notifikasi
          </h1>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Pemberitahuan aktivitas, dukungan warga, dan pembaruan dari pemerintah
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          className="rounded-full gap-1.5 text-xs font-semibold"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Tandai Semua Dibaca</span>
        </Button>
      </div>

      <div className="divide-y divide-surface-200 dark:divide-surface-800 bg-white dark:bg-black transition-colors">
        {isLoading ? (
          <div className="p-4 space-y-3">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Bell className="w-6 h-6" />}
              title="Belum Ada Notifikasi"
              description="Ketika warga memberikan dukungan UP, komentar, atau instansi merespons laporan Anda, pemberitahuan akan muncul di sini."
            />
          </div>
        ) : (
          <div>
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 flex items-start gap-3 hover:bg-surface-50/80 dark:hover:bg-surface-900/40 transition-colors cursor-pointer border-b border-surface-100 dark:border-surface-800/60 ${
                  !notif.isRead ? "bg-crimson-50/20 dark:bg-crimson-950/20" : ""
                }`}
              >
                <div className="pt-0.5">{getNotifIcon(notif.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-surface-900 dark:text-white">
                      {notif.title}
                    </p>
                    <span className="text-[11px] text-surface-400 dark:text-surface-500 whitespace-nowrap">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-surface-600 dark:text-surface-300 mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-crimson-600 shrink-0 self-center" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
