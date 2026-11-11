"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FolderTree, Plus, Edit2, Trash2 } from "lucide-react";
import { AdminNav } from "@/components/layout/AdminNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#DC2626");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<any[]>("/admin/categories");
      setCategories(data);
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
    fetchCategories();
  }, [user, router]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setColor("#DC2626");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setColor(cat.color || "#DC2626");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        description: description.trim(),
        color,
      };

      if (editingId) {
        await api.patch(`/admin/categories/${editingId}`, payload);
      } else {
        await api.post("/admin/categories", payload);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch {
      alert("Gagal menyimpan kategori");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Hapus kategori "${catName}"?`)) return;

    try {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    } catch {
      alert("Gagal menghapus kategori");
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900">
      <AdminNav />

      <main className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-surface-900">Manajemen Kategori Isu</h1>
            <p className="text-xs text-surface-500">
              Klasifikasi bidang masalah publik yang dapat dipilih oleh masyarakat
            </p>
          </div>

          <Button size="sm" onClick={handleOpenCreate} className="gap-1.5 text-xs">
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isLoading ? (
            <>
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-xl border border-surface-200 bg-white space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                      className="px-2.5 py-0.5 rounded text-xs font-bold"
                    >
                      {cat.name}
                    </span>
                    <span className="text-[11px] font-semibold text-surface-500">
                      {cat._count?.reports || 0} laporan
                    </span>
                  </div>
                  <p className="text-xs text-surface-600 leading-relaxed line-clamp-2">
                    {cat.description || "Tidak ada deskripsi"}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-100">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1 rounded text-surface-500 hover:text-purple-600 hover:bg-purple-50 text-xs flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Ubah</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1 rounded text-surface-500 hover:text-red-600 hover:bg-red-50 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Ubah Kategori" : "Tambah Kategori Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Kategori"
            placeholder="Contoh: Infrastruktur"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!editingId) {
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
              }
            }}
            required
          />

          <Input
            label="Slug URL"
            placeholder="infrastruktur"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />

          <Textarea
            label="Deskripsi Kategori"
            placeholder="Jelaskan jenis laporan apa saja yang tergolong dalam kategori ini..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1">
              Warna Tag Identitas
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-8 rounded border border-surface-300 cursor-pointer"
              />
              <span className="text-xs font-mono text-surface-700">{color}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-100">
            <Button size="sm" variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button size="sm" type="submit" isLoading={isSubmitting}>
              Simpan Kategori
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
