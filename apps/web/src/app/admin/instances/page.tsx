"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Search, Building2, MapPin } from "lucide-react";
import { AdminNav } from "@/components/layout/AdminNav";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function AdminInstancesPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [instances, setInstances] = useState<any[]>([]);
  const [filterVerified, setFilterVerified] = useState<string>("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchInstances = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filterVerified !== "") params.append("isVerified", filterVerified);

      const res = await api.get<any>(`/admin/instances?${params.toString()}`);
      setInstances(res.items || []);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "ADMIN") {
      router.push("/feed");
      return;
    }
    fetchInstances();
  }, [user, router, filterVerified]);

  const handleToggleVerification = async (targetUserId: string, currentVerified: boolean) => {
    const nextState = !currentVerified;
    const confirmMsg = nextState
      ? "Verifikasi akun instansi ini dan berikan badge resmi?"
      : "Cabut status verifikasi instansi ini?";
    if (!confirm(confirmMsg)) return;

    try {
      await api.patch(`/admin/users/${targetUserId}`, { isVerified: nextState });
      fetchInstances();
    } catch {
      alert("Gagal memperbarui status verifikasi");
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900">
      <AdminNav />

      <main className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-surface-900">
              Verifikasi & Manajemen Instansi Pemerintah
            </h1>
            <p className="text-xs text-surface-500">
              Pemeriksaan legalitas akun resmi instansi untuk penerbitan badge terverifikasi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value)}
              className="text-xs border border-surface-300 rounded-md px-2.5 py-1.5 bg-white"
            >
              <option value="">Semua Status Verifikasi</option>
              <option value="false">Menunggu Verifikasi (Pending)</option>
              <option value="true">Sudah Terverifikasi</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Nama Instansi</th>
                    <th className="p-3.5">Username / Email</th>
                    <th className="p-3.5">Wilayah Kewenangan</th>
                    <th className="p-3.5">Fokus Isu</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Aksi Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {instances.map((inst) => (
                    <tr key={inst.id} className="hover:bg-surface-50/60">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            src={inst.avatarUrl}
                            name={inst.instanceProfile?.instanceName || inst.name}
                            size="sm"
                          />
                          <div>
                            <span className="font-bold text-surface-900 flex items-center gap-1">
                              {inst.instanceProfile?.instanceName || inst.name}
                              {inst.isVerified && <VerifiedBadge size={14} />}
                            </span>
                            <span className="text-surface-400">Kontak: {inst.phone || "-"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-medium text-surface-900 block">@{inst.username}</span>
                        <span className="text-surface-500">{inst.email}</span>
                      </td>
                      <td className="p-3.5 text-surface-700">
                        {inst.instanceProfile?.jurisdiction || "Nasional"}
                      </td>
                      <td className="p-3.5 text-surface-700">
                        {inst.instanceProfile?.categoryFocus || "Umum"}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inst.isVerified
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {inst.isVerified ? "Terverifikasi" : "Menunggu Review"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          size="sm"
                          variant={inst.isVerified ? "outline" : "primary"}
                          onClick={() => handleToggleVerification(inst.id, inst.isVerified)}
                          className="text-xs h-7 px-3"
                        >
                          {inst.isVerified ? "Cabut Badge" : "Verifikasi Instansi"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
