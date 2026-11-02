"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Flame, TrendingUp, Building2, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { HotBadge } from "../ui/HotBadge";
import { VerifiedBadge } from "../ui/VerifiedBadge";
import { StatusBadge } from "../ui/StatusBadge";
import { Avatar } from "../ui/Avatar";

export function RightSidebar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [hotReports, setHotReports] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get<any[]>("/trending/hot?limit=3").then(setHotReports).catch(() => {});
    api.get<any[]>("/trending/popular-categories").then(setCategories).catch(() => {});
    api.get<any>("/trending/stats").then(setStats).catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <aside className="sticky top-0 h-screen w-80 p-4 border-l border-surface-200 bg-white space-y-5 overflow-y-auto hidden xl:block select-none shrink-0">
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <Search className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari isu, lokasi, warga, instansi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-full bg-surface-100 border border-transparent focus:border-crimson-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-crimson-600 transition-all text-surface-900 placeholder:text-surface-400"
          />
        </div>
      </form>

      {hotReports.length > 0 && (
        <div className="rounded-xl border border-crimson-200 bg-crimson-50/30 p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-crimson-800">
            <Flame className="w-4 h-4 fill-crimson-600 text-crimson-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Laporan HOT Saat Ini
            </h3>
          </div>
          <div className="space-y-2.5">
            {hotReports.map((report) => (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                className="block p-2 rounded-lg hover:bg-white/80 transition-colors border border-transparent hover:border-crimson-200"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-semibold text-crimson-700">
                    {report.category?.name}
                  </span>
                  <StatusBadge status={report.status} />
                </div>
                <p className="text-xs font-bold text-surface-900 line-clamp-2 leading-snug">
                  {report.title}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-surface-500">
                  <span>{report.upsCount} UP</span>
                  <span>·</span>
                  <span>{report.commentsCount} Komentar</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {categories.length > 0 && (
        <div className="rounded-xl border border-surface-200 bg-surface-50/50 p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-surface-600 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-surface-500" />
            <span>Kategori Populer</span>
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/explore?category=${cat.id}`}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-white hover:bg-surface-100 border border-surface-200 text-surface-700 transition-colors"
              >
                {cat.name}
                <span className="text-[10px] text-surface-400 ml-1.5">
                  ({cat._count?.reports || 0})
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {stats && (
        <div className="rounded-xl border border-surface-200 bg-white p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-surface-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dampak Akuntabilitas Publik</span>
          </h3>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-surface-50 border border-surface-200">
              <span className="text-base font-black text-surface-900 block">
                {stats.totalReports}
              </span>
              <span className="text-[10px] text-surface-500">Laporan Masuk</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-base font-black text-emerald-700 block">
                {stats.resolvedReports}
              </span>
              <span className="text-[10px] text-emerald-600">Terselesaikan</span>
            </div>
          </div>
        </div>
      )}

      <footer className="text-[11px] text-surface-400 space-y-1 pt-2">
        <p>SuarAksi © 2026 — Platform Akuntabilitas Sosial & Civic Reporting.</p>
        <p>Transparansi untuk Pelayanan Publik yang Lebih Baik.</p>
      </footer>
    </aside>
  );
}
