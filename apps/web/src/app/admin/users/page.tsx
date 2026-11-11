"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, UserCheck, UserX, Shield, Trash2, Edit2 } from "lucide-react";
import { AdminNav } from "@/components/layout/AdminNav";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Role } from "@suaraksi/shared";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<Role>(Role.USER);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (roleFilter) params.append("role", roleFilter);

      const res = await api.get<any>(`/admin/users?${params.toString()}`);
      setUsers(res.items || []);
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
    fetchUsers();
  }, [user, router, roleFilter]);

  const handleEditClick = (u: any) => {
    setSelectedUser(u);
    setNewRole(u.role);
    setIsActive(u.isActive);
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      await api.patch(`/admin/users/${selectedUser.id}`, {
        role: newRole,
        isActive,
      });
      setIsEditModalOpen(false);
      fetchUsers();
    } catch {
      alert("Gagal memperbarui data pengguna");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (targetId: string, email: string) => {
    if (!confirm(`Hapus pengguna ${email} secara permanen?`)) return;

    try {
      await api.delete(`/admin/users/${targetId}`);
      fetchUsers();
    } catch {
      alert("Gagal menghapus pengguna");
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900">
      <AdminNav />

      <main className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-surface-900">Manajemen Pengguna</h1>
            <p className="text-xs text-surface-500">Kelola akun pengguna, hak akses role, dan status keaktifan</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari email / username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                className="text-xs pl-8 pr-3 py-1.5 rounded-md border border-surface-300 bg-white"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs border border-surface-300 rounded-md px-2.5 py-1.5 bg-white"
            >
              <option value="">Semua Role</option>
              <option value="USER">User (Masyarakat)</option>
              <option value="INSTANCE">Instance (Instansi)</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Pengguna</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Laporan</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-50/60">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar src={u.avatarUrl} name={u.name} size="sm" />
                          <div>
                            <span className="font-bold text-surface-900 block">{u.name}</span>
                            <span className="text-surface-400">@{u.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-surface-600">{u.email}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : u.role === "INSTANCE"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-surface-100 text-surface-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {u.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="p-3.5 text-surface-700 font-semibold">
                        {u._count?.reports || 0}
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleEditClick(u)}
                          className="p-1 rounded text-surface-500 hover:text-purple-600 hover:bg-purple-50"
                          title="Edit Role & Status"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {u.role !== "ADMIN" && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className="p-1 rounded text-surface-500 hover:text-red-600 hover:bg-red-50"
                            title="Hapus Akun"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Ubah Role & Status Pengguna"
      >
        {selectedUser && (
          <form onSubmit={handleSaveUser} className="space-y-4">
            <div>
              <p className="text-xs text-surface-500">Pengguna:</p>
              <p className="font-bold text-sm text-surface-900">{selectedUser.name}</p>
              <p className="text-xs text-surface-400">{selectedUser.email}</p>
            </div>

            <Select
              label="Role Akun"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}
              options={[
                { value: Role.USER, label: "USER (Masyarakat Umum)" },
                { value: Role.INSTANCE, label: "INSTANCE (Instansi Pemerintah)" },
                { value: Role.ADMIN, label: "ADMIN (Administrator Platform)" },
              ]}
            />

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActiveCheck"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <label htmlFor="isActiveCheck" className="text-xs font-semibold text-surface-700">
                Akun Aktif (Bisa Login)
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-surface-100">
              <Button size="sm" variant="ghost" type="button" onClick={() => setIsEditModalOpen(false)}>
                Batal
              </Button>
              <Button size="sm" type="submit" isLoading={isSubmitting}>
                Simpan
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
