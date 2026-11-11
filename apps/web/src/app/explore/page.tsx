"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, MapPin, Building2, User, FileText, SlidersHorizontal } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ReportCard } from "@/components/report/ReportCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { ReportSummary, UserSummary } from "@suaraksi/shared";
import { cn } from "@/lib/utils";

type ExploreTab = "reports" | "instances" | "users";

function ExploreContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";

  const [activeTab, setActiveTab] = useState<ExploreTab>("reports");
  const [search, setSearch] = useState(queryParam);
  const [categoryId, setCategoryId] = useState(categoryParam);
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [instances, setInstances] = useState<UserSummary[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.get<any[]>("/admin/categories")
      .then(setCategories)
      .catch(() => {});
  }, []);

  const executeSearch = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "reports") {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (categoryId) params.set("categoryId", categoryId);
        if (status) params.set("status", status);
        if (location) params.set("location", location);

        const res = await api.get<{ items: ReportSummary[] }>(
          `/reports?${params.toString()}`
        );
        setReports(res.items || []);
      } else if (activeTab === "instances") {
        const res = await api.get<UserSummary[]>(
          `/users/instances${search ? `?q=${encodeURIComponent(search)}` : ""}`
        );
        setInstances(res || []);
      } else {
        const res = await api.get<UserSummary[]>(
          `/users/search${search ? `?q=${encodeURIComponent(search)}` : ""}`
        );
        setUsers(res || []);
      }
    } catch {
      if (activeTab === "reports") setReports([]);
      if (activeTab === "instances") setInstances([]);
      if (activeTab === "users") setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, [activeTab, categoryId, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const tabs: { key: ExploreTab; label: string; icon: React.ElementType }[] = [
    { key: "reports", label: "Laporan Warga", icon: FileText },
    { key: "instances", label: "Instansi", icon: Building2 },
    { key: "users", label: "Pengguna", icon: User },
  ];

  return (
    <>
      <div className="border-b border-surface-200 dark:border-surface-800 bg-white/85 dark:bg-black/85 backdrop-blur-md sticky top-[53px] z-20 select-none transition-colors">
        <div className="p-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-surface-400 dark:text-surface-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari kata kunci laporan, alamat, instansi, atau warga..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 text-xs rounded-full bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 focus:border-crimson-600 focus:bg-white dark:focus:bg-black focus:outline-none focus:ring-1 focus:ring-crimson-600 transition-colors text-surface-900 dark:text-white placeholder:text-surface-400 dark:placeholder:text-surface-500"
            />
            <Button
              size="sm"
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-4 text-xs rounded-full font-bold"
            >
              Cari
            </Button>
          </form>
        </div>

        <div className="flex border-b border-surface-200 dark:border-surface-800">
          {tabs.map((t) => {
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  "flex-1 py-3.5 text-xs sm:text-sm text-center transition-colors relative flex items-center justify-center gap-1.5 cursor-pointer",
                  isActive
                    ? "text-surface-900 dark:text-white font-bold"
                    : "text-surface-500 dark:text-surface-400 font-medium hover:bg-surface-50 dark:hover:bg-surface-900/50"
                )}
              >
                <span>{t.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 h-1 w-14 bg-crimson-600 rounded-full inset-x-0 mx-auto" />
                )}
              </button>
            );
          })}
        </div>

        {activeTab === "reports" && (
          <div className="p-2.5 bg-surface-50/70 dark:bg-surface-900/40 border-b border-surface-200 dark:border-surface-800 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-surface-500 dark:text-surface-400 font-medium flex items-center gap-1 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </span>

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="text-xs bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-full px-3 py-1 text-surface-700 dark:text-surface-200 focus:outline-none focus:border-crimson-600"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-xs bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-full px-3 py-1 text-surface-700 dark:text-surface-200 focus:outline-none focus:border-crimson-600"
            >
              <option value="">Semua Status</option>
              <option value="SUBMITTED">Terkirim</option>
              <option value="UNDER_REVIEW">Sedang Ditinjau</option>
              <option value="VERIFIED">Terverifikasi</option>
              <option value="IN_PROGRESS">Sedang Ditangani</option>
              <option value="RESOLVED">Selesai Ditangani</option>
            </select>

            <input
              type="text"
              placeholder="Cari nama jalan/wilayah..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && executeSearch()}
              className="text-xs bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-full px-3 py-1 text-surface-700 dark:text-surface-200 focus:outline-none focus:border-crimson-600 min-w-[150px]"
            />
          </div>
        )}
      </div>

      <div className="divide-y divide-surface-200 dark:divide-surface-800 bg-white dark:bg-black transition-colors">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        ) : activeTab === "reports" ? (
          reports.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="Laporan Tidak Ditemukan"
                description="Coba ubah kata kunci pencarian atau sesuaikan filter kategori dan wilayah Anda."
              />
            </div>
          ) : (
            <div>
              {reports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )
        ) : activeTab === "instances" ? (
          instances.length === 0 ? (
            <div className="p-8">
              <EmptyState title="Instansi Tidak Ditemukan" />
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {instances.map((inst) => (
                <Link
                  key={inst.id}
                  href={`/profile/${inst.username}`}
                  className="flex items-center justify-between p-4 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:bg-surface-50 dark:hover:bg-surface-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={inst.avatarUrl}
                      name={inst.instanceProfile?.instanceName || inst.name}
                      size="md"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-surface-900 dark:text-white">
                          {inst.instanceProfile?.instanceName || inst.name}
                        </span>
                        {inst.isVerified && <VerifiedBadge size={16} />}
                      </div>
                      <p className="text-xs text-surface-500 dark:text-surface-400">@{inst.username}</p>
                      <p className="text-xs text-surface-600 dark:text-surface-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-crimson-600" />
                        <span>{inst.instanceProfile?.jurisdiction || "Nasional"}</span>
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-full text-xs font-semibold">
                    Lihat Profil
                  </Button>
                </Link>
              ))}
            </div>
          )
        ) : users.length === 0 ? (
          <div className="p-8">
            <EmptyState title="Pengguna Tidak Ditemukan" />
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {users.map((u) => (
              <Link
                key={u.id}
                href={`/profile/${u.username}`}
                className="flex items-center justify-between p-4 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:bg-surface-50 dark:hover:bg-surface-800/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={u.avatarUrl} name={u.name} size="md" />
                  <div>
                    <span className="font-bold text-sm text-surface-900 dark:text-white block">
                      {u.name}
                    </span>
                    <span className="text-xs text-surface-500 dark:text-surface-400">@{u.username}</span>
                    {u.bio && (
                      <p className="text-xs text-surface-600 dark:text-surface-400 mt-1 line-clamp-1">
                        {u.bio}
                      </p>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="outline" className="rounded-full text-xs font-semibold">
                  Lihat Profil
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function ExplorePage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-6"><Skeleton className="h-24 w-full" /></div>}>
        <ExploreContent />
      </Suspense>
    </AppLayout>
  );
}
