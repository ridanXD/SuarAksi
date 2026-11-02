"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  UploadCloud,
  X,
  MapPin,
  Eye,
  Send,
  Building2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { ReportMap } from "@/components/report/ReportMap";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function CreateReportPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(-6.2088);
  const [longitude, setLongitude] = useState(106.8456);
  const [targetInstanceId, setTargetInstanceId] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [instances, setInstances] = useState<any[]>([]);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    api.get<any[]>("/admin/categories").then((data) => {
      setCategories(data);
      if (data.length > 0) setCategoryId(data[0].id);
    }).catch(() => {});

    api.get<any>("/admin/instances").then((data) => {
      setInstances(data.items || []);
    }).catch(() => {});
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setError("");

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await api.upload(file);
        setMediaUrls((prev) => [...prev, url]);
      }
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah foto");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setMediaUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    if (!address) {
      setAddress(`Titik Koordinat: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !categoryId || !address.trim()) {
      setError("Mohon lengkapi judul, kategori, alamat, dan deskripsi laporan");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const report = await api.post<any>("/reports", {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        address: address.trim(),
        latitude,
        longitude,
        targetInstanceId: targetInstanceId || null,
        mediaUrls,
      });

      router.push(`/reports/${report.id}`);
    } catch (err: any) {
      setError(err.message || "Gagal mempublikasikan laporan");
      setIsSubmitting(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  return (
    <AppLayout showRightSidebar={false}>
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-surface-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1.5 rounded-full hover:bg-surface-100 text-surface-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-surface-900">Buat Laporan Warga</h1>
            <p className="text-xs text-surface-500">
              Sampaikan fakta kejadian dengan bukti yang jelas untuk percepatan tindak lanjut
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border border-surface-200 p-5 sm:p-6">
          <div className="space-y-4">
            <Input
              label="Judul Laporan"
              placeholder="Contoh: Jalan Ambles Parah di Depan Stasiun Manggarai..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Kategori Isu"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
              />

              <Select
                label="Tujukan ke Instansi (Opsional)"
                value={targetInstanceId}
                onChange={(e) => setTargetInstanceId(e.target.value)}
                options={[
                  { value: "", label: "-- Teruskan ke Instansi Terkait Otomatis --" },
                  ...instances.map((inst) => ({
                    value: inst.id,
                    label: inst.instanceProfile?.instanceName || inst.name,
                  })),
                ]}
              />
            </div>

            <Textarea
              label="Deskripsi Kejadian / Masalah"
              placeholder="Jelaskan secara rinci kondisi masalah, sudah berapa lama terjadi, dampak yang ditimbulkan terhadap warga sekitar, dan harapan penanganannya..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-surface-100">
            <label className="block text-xs font-semibold text-surface-700">
              Foto Bukti Kejadian (Maksimal 4 foto)
            </label>
            <div className="flex flex-wrap gap-3">
              {mediaUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative w-24 h-24 rounded-lg overflow-hidden border border-surface-200 bg-surface-100 group"
                >
                  <Image src={url} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {mediaUrls.length < 4 && (
                <label className="w-24 h-24 rounded-lg border-2 border-dashed border-surface-300 hover:border-crimson-600 bg-surface-50 hover:bg-crimson-50/20 flex flex-col items-center justify-center cursor-pointer transition-colors text-surface-500 hover:text-crimson-600">
                  <UploadCloud className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-semibold">
                    {uploadingImage ? "Unggah..." : "Tambah Foto"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-surface-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-surface-700">
                Pilih Lokasi Kejadian pada Peta
              </label>
              <span className="text-[11px] text-surface-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-crimson-600" />
                <span>Klik atau geser pin pada peta</span>
              </span>
            </div>

            <ReportMap
              latitude={latitude}
              longitude={longitude}
              isInteractive={true}
              onLocationChange={handleLocationChange}
              height="260px"
            />

            <Input
              label="Alamat Lengkap / Patokan Lokasi"
              placeholder="Contoh: Jl. Manggarai Utara I No.12, dekat pintu barat stasiun..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPreviewOpen(true)}
              disabled={!title.trim() || !description.trim()}
              className="gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>Pratinjau Laporan</span>
            </Button>

            <Button type="submit" isLoading={isSubmitting} className="gap-1.5">
              <Send className="w-4 h-4" />
              <span>Publikasikan Laporan</span>
            </Button>
          </div>
        </form>
      </div>

      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Pratinjau Laporan Publik"
      >
        <div className="space-y-4">
          <div>
            <span className="text-xs font-semibold text-crimson-600 block mb-1">
              {selectedCategoryObj?.name || "Kategori"}
            </span>
            <h2 className="text-base font-bold text-surface-900 leading-snug">
              {title || "Judul Laporan"}
            </h2>
            <p className="text-xs text-surface-500 mt-0.5">{address || "Alamat belum diisi"}</p>
          </div>

          <p className="text-xs text-surface-700 whitespace-pre-line leading-relaxed">
            {description || "Deskripsi laporan belum diisi."}
          </p>

          {mediaUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {mediaUrls.map((url, i) => (
                <div key={i} className="relative aspect-video rounded overflow-hidden">
                  <Image src={url} alt="Pratinjau foto" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-100">
            <Button variant="secondary" size="sm" onClick={() => setIsPreviewOpen(false)}>
              Kembali Mengedit
            </Button>
            <Button size="sm" onClick={handleSubmit} isLoading={isSubmitting}>
              Konfirmasi & Publikasikan
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
