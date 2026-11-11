"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Megaphone, ArrowRight, Flame, Compass } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { ReportCard } from "@/components/report/ReportCard";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ReportSummary } from "@suaraksi/shared";

export default function LandingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user && !isLoading) {
      router.push("/feed");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    api.get<any>("/reports?tab=trending&limit=4")
      .then((data) => setReports(data.items || []))
      .catch(() => {});

    api.get<any>("/trending/stats")
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-surface-900 dark:text-white flex flex-col transition-colors">
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-black/85 backdrop-blur-md border-b border-surface-200 dark:border-surface-800">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-crimson-600 flex items-center justify-center text-white shadow-sm">
              <Megaphone className="w-4 h-4" />
            </div>
            <span className="text-lg font-black tracking-tight text-surface-900 dark:text-white">
              Suar<span className="text-crimson-600">Aksi</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link href="/explore">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex rounded-full">
                Jelajahi Isu
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="sm" className="rounded-full">
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="rounded-full font-bold">
                Daftar Akun
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-white dark:bg-black border-b border-surface-200 dark:border-surface-800 py-16 sm:py-24 px-4 sm:px-6 text-center transition-colors">
        <div className="w-full max-w-5xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-crimson-50 dark:bg-crimson-950/40 text-crimson-700 dark:text-crimson-400 text-xs font-semibold border border-crimson-100 dark:border-crimson-900">
            <Flame className="w-3.5 h-3.5 fill-crimson-600 text-crimson-600" />
            <span>Civic Reporting Berkonsep Social Media Modern</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-surface-900 dark:text-white tracking-tight leading-tight">
            Suarakan Permasalahan Publik.{" "}
            <span className="text-crimson-600">Kawal Sampai Selesai.</span>
          </h1>

          <p className="text-base sm:text-lg text-surface-600 dark:text-surface-300 leading-relaxed max-w-2xl mx-auto">
            Platform pengaduan warga yang transparan dan akuntabel. Berikan dukungan UP, bagikan isu, dan pantau respons resmi instansi pemerintah secara real-time.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            <Link href="/register">
              <Button size="lg" className="gap-2 shadow-sm rounded-full font-bold px-6">
                <span>Mulai Bersuara Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/feed">
              <Button variant="secondary" size="lg" className="gap-2 rounded-full font-semibold px-6">
                <Compass className="w-4 h-4" />
                <span>Lihat Feed Warga</span>
              </Button>
            </Link>
          </div>

          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-surface-100 dark:border-surface-800 text-center">
              <div className="p-3">
                <span className="text-2xl font-black text-surface-900 dark:text-white block">{stats.totalReports}</span>
                <span className="text-xs text-surface-500 dark:text-surface-400 font-medium">Laporan Masuk</span>
              </div>
              <div className="p-3">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">{stats.resolvedReports}</span>
                <span className="text-xs text-surface-500 dark:text-surface-400 font-medium">Isu Selesai Ditangani</span>
              </div>
              <div className="p-3">
                <span className="text-2xl font-black text-crimson-600 dark:text-crimson-400 block">{stats.totalUsers}</span>
                <span className="text-xs text-surface-500 dark:text-surface-400 font-medium">Masyarakat Terdaftar</span>
              </div>
              <div className="p-3">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">{stats.verifiedInstances}</span>
                <span className="text-xs text-surface-500 dark:text-surface-400 font-medium">Instansi Terverifikasi</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="w-full px-4 sm:px-8 lg:px-12 py-12 flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white">Isu & Laporan Warga Terbaru</h2>
            <p className="text-xs text-surface-500 dark:text-surface-400">Mendapatkan perhatian dan dukungan aktif dari masyarakat</p>
          </div>
          <Link href="/feed" className="text-xs font-semibold text-crimson-600 dark:text-crimson-400 hover:underline flex items-center gap-1">
            <span>Buka Feed Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-black overflow-hidden shadow-sm divide-y divide-surface-200 dark:divide-surface-800 transition-colors">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      </section>

      <footer className="bg-white dark:bg-black border-t border-surface-200 dark:border-surface-800 py-6 text-center text-xs text-surface-500 dark:text-surface-400 transition-colors">
        <p>SuarAksi © 2026 — Platform Akuntabilitas Sosial & Civic Reporting Publik Indonesia.</p>
      </footer>
    </div>
  );
}
