"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Flame, TrendingUp, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { StatusBadge } from "../ui/StatusBadge";

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
    <aside className="sticky top-[53px] h-[calc(100vh-53px)] w-80 2xl:w-96 p-4 border-l border-surface-200 dark:border-surface-800 bg-white dark:bg-black space-y-4 overflow-y-auto hidden xl:block select-none shrink-0 transition-colors">
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <Search className="w-4 h-4 text-surface-400 dark:text-surface-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari isu, lokasi, warga..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-full bg-surface-100 dark:bg-surface-900 border border-transparent dark:border-surface-800 focus:border-crimson-600 dark:focus:border-crimson-600 focus:bg-white dark:focus:bg-black focus:outline-none focus:ring-1 focus:ring-crimson-600 transition-all text-surface-900 dark:text-surface-100 placeholder:text-surface-400 dark:placeholder:text-surface-500"
          />
        </div>
      </form>

      {hotReports.length > 0 && (
        <div className="rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-50/70 dark:bg-surface-900/40 p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-crimson-600 dark:text-crimson-400">
            <Flame className="w-4 h-4 fill-crimson-600 text-crimson-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-900 dark:text-white">
              Tren untuk Anda
            </h3>
          </div>
          <div className="space-y-1">
            {hotReports.map((report) => (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                className="block p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800/60 transition-colors"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-semibold text-crimson-600 dark:text-crimson-400">
                    {report.category?.name}
                  </span>
                  <StatusBadge status={report.status} />
                </div>
                <p className="text-xs font-bold text-surface-900 dark:text-white line-clamp-2 leading-snug">
                  {report.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-surface-500 dark:text-surface-400">
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
        <div className="rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-50/70 dark:bg-surface-900/40 p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-surface-900 dark:text-white flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-surface-500" />
            <span>Kategori Populer</span>
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/explore?category=${cat.id}`}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-200 transition-colors"
              >
                {cat.name}
                <span className="text-[10px] text-surface-400 dark:text-surface-400 ml-1.5">
                  ({cat._count?.reports || 0})
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {stats && (
        <div className="rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-50/70 dark:bg-surface-900/40 p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-surface-900 dark:text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Dampak Akuntabilitas Publik</span>
          </h3>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
              <span className="text-base font-black text-surface-900 dark:text-white block">
                {stats.totalReports}
              </span>
              <span className="text-[10px] text-surface-500 dark:text-surface-400">Laporan Masuk</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block">
                {stats.resolvedReports}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Terselesaikan</span>
            </div>
          </div>
        </div>
      )}

      <footer className="text-[11px] text-surface-400 dark:text-surface-500 space-y-1 pt-2 px-2">
        <p>SuarAksi © 2026 — Platform Akuntabilitas Sosial & Civic Reporting.</p>
        <p>Transparansi untuk Pelayanan Publik yang Lebih Baik.</p>
      </footer>
    </aside>
  );
}
