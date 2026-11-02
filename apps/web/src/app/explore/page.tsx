"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, MapPin, Building2, User, FileText } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ReportCard } from "@/components/report/ReportCard";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";

  const [search, setSearch] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<"reports" | "users" | "instances">("reports");
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");

  const [reports, setReports] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [instances, setInstances] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);

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
        if (search) params.append("search", search);
        if (categoryId) params.append("categoryId", categoryId);
        if (status) params.append("status", status);
        if (location) params.append("location", location);

        const data = await api.get<any>(`/reports?${params.toString()}`);
        setReports(data.items || []);
      } else if (activeTab === "instances") {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        const data = await api.get<any>(`/admin/instances?${params.toString()}`);
        setInstances(data.items || []);
      } else {
        const params = new URLSearchParams({ role: "USER" });
        if (search) params.append("search", search);
        const data = await api.get<any>(`/admin/users?${params.toString()}`);
        setUsers(data.items || []);
      }
    } catch {
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

  return (
    <>
      <div className="border-b border-surface-200 bg-white sticky top-0 z-20">
        <div className="p-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari kata kunci laporan, alamat, instansi, atau warga..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 text-xs rounded-full bg-surface-100 border border-surface-200 focus:border-crimson-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-crimson-600 transition-colors text-surface-900"
            />
            <Button
              size="sm"
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-3 text-xs rounded-full"
            >
              Cari
            </Button>
          </form>
        </div>

        <div className="flex border-b border-surface-200">
          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === "reports"
                ? "border-crimson-600 text-surface-900"
                : "border-transparent text-surface-500 hover:text-surface-700"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Laporan Warga</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("instances")}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === "instances"
                ? "border-crimson-600 text-surface-900"
                : "border-transparent text-surface-500 hover:text-surface-700"
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Instansi Terverifikasi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === "users"
                ? "border-crimson-600 text-surface-900"
                : "border-transparent text-surface-500 hover:text-surface-700"
            }`}
          >
            <User className="w-4 h-4 text-surface-600" />
            <span>Pengguna</span>
          </button>
        </div>

        {activeTab === "reports" && (
          <div className="p-2.5 bg-surface-50 border-b border-surface-200 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-surface-500 font-medium flex items-center gap-1 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </span>

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="text-xs bg-white border border-surface-300 rounded px-2.5 py-1 text-surface-700 focus:outline-none focus:border-crimson-600"
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
              className="text-xs bg-white border border-surface-300 rounded px-2.5 py-1 text-surface-700 focus:outline-none focus:border-crimson-600"
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
              className="text-xs bg-white border border-surface-300 rounded px-2.5 py-1 text-surface-700 focus:outline-none focus:border-crimson-600 min-w-[150px]"
            />
          </div>
        )}
      </div>

      <div>
        {isLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
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
                  className="flex items-center justify-between p-4 rounded-xl border border-surface-200 bg-white hover:bg-surface-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={inst.avatarUrl}
                      name={inst.instanceProfile?.instanceName || inst.name}
                      size="md"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-surface-900">
                          {inst.instanceProfile?.instanceName || inst.name}
                        </span>
                        {inst.isVerified && <VerifiedBadge size={16} />}
                      </div>
                      <p className="text-xs text-surface-500">@{inst.username}</p>
                      <p className="text-xs text-surface-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-crimson-600" />
                        <span>{inst.instanceProfile?.jurisdiction || "Nasional"}</span>
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
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
                className="flex items-center justify-between p-4 rounded-xl border border-surface-200 bg-white hover:bg-surface-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={u.avatarUrl} name={u.name} size="md" />
                  <div>
                    <span className="font-bold text-sm text-surface-900 block">
                      {u.name}
                    </span>
                    <span className="text-xs text-surface-500">@{u.username}</span>
                    {u.bio && (
                      <p className="text-xs text-surface-600 mt-1 line-clamp-1">
                        {u.bio}
                      </p>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="outline">
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
