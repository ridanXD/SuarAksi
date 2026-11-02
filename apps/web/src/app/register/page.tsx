"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Megaphone, Lock, Mail, User, Building2, Phone, MapPin, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Role } from "@suaraksi/shared";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [role, setRole] = useState<Role>(Role.USER);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [instanceName, setInstanceName] = useState("");
  const [instanceJurisdiction, setInstanceJurisdiction] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await register({
        role,
        name,
        username,
        email,
        password,
        instanceName: role === Role.INSTANCE ? instanceName : undefined,
        instanceJurisdiction: role === Role.INSTANCE ? instanceJurisdiction : undefined,
        contactPhone: role === Role.INSTANCE ? contactPhone : undefined,
      });

      if (role === Role.INSTANCE) {
        router.push("/instance/dashboard");
      } else {
        router.push("/feed");
      }
    } catch (err: any) {
      setError(err.message || "Gagal melakukan registrasi akun");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-surface-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-crimson-600 flex items-center justify-center text-white shadow-sm">
              <Megaphone className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-surface-900">
              Suar<span className="text-crimson-600">Aksi</span>
            </span>
          </Link>
          <h1 className="text-lg font-bold text-surface-900 pt-2">Buat Akun SuarAksi</h1>
          <p className="text-xs text-surface-500">
            Bergabunglah dalam gerakan keterbukaan informasi dan perbaikan fasilitas publik
          </p>
        </div>

        <div className="grid grid-cols-2 p-1 bg-surface-100 rounded-lg">
          <button
            type="button"
            onClick={() => setRole(Role.USER)}
            className={`py-2 text-xs font-semibold rounded-md transition-all ${
              role === Role.USER
                ? "bg-white text-surface-900 shadow-sm"
                : "text-surface-600 hover:text-surface-900"
            }`}
          >
            Masyarakat Umum
          </button>
          <button
            type="button"
            onClick={() => setRole(Role.INSTANCE)}
            className={`py-2 text-xs font-semibold rounded-md transition-all ${
              role === Role.INSTANCE
                ? "bg-white text-surface-900 shadow-sm"
                : "text-surface-600 hover:text-surface-900"
            }`}
          >
            Instansi Pemerintah
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={role === Role.INSTANCE ? "Nama Perwakilan / Akun" : "Nama Lengkap"}
              placeholder={role === Role.INSTANCE ? "Admin Humas Bina Marga" : "Budi Santoso"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Username"
              placeholder="nama_pengguna"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              leftIcon={<span className="text-xs font-bold text-surface-400">@</span>}
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            placeholder={role === Role.INSTANCE ? "humas@instansi.go.id" : "nama@email.com"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Kata Sandi (min. 8 karakter)"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          {role === Role.INSTANCE && (
            <div className="space-y-4 pt-2 border-t border-surface-100">
              <span className="text-[11px] font-bold text-surface-500 uppercase tracking-wider block">
                Data Legalitas Instansi:
              </span>

              <Input
                label="Nama Resmi Instansi"
                placeholder="Dinas Sumber Daya Air Provinsi DKI Jakarta"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                leftIcon={<Building2 className="w-4 h-4" />}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Wilayah Kewenangan"
                  placeholder="Provinsi DKI Jakarta"
                  value={instanceJurisdiction}
                  onChange={(e) => setInstanceJurisdiction(e.target.value)}
                  leftIcon={<MapPin className="w-4 h-4" />}
                  required
                />
                <Input
                  label="Nomor Kontak Resmi"
                  placeholder="021-xxxxxxx"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </div>

              <p className="text-[11px] text-surface-500 leading-normal bg-blue-50 p-2.5 rounded border border-blue-100">
                Pendaftaran akun instansi akan diverifikasi oleh tim Administrator SuarAksi untuk mendapatkan badge resmi terverifikasi.
              </p>
            </div>
          )}

          <Button type="submit" className="w-full h-11" isLoading={isLoading}>
            <span>Daftar Akun Sekarang</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <p className="text-center text-xs text-surface-500">
          Sudah memiliki akun?{" "}
          <Link href="/login" className="font-semibold text-crimson-600 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
