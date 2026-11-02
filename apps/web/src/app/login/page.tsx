"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Megaphone, Lock, Mail, ArrowRight, UserCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email dan kata sandi wajib diisi");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const user = await login({ email, password });
      if (user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (user.role === "INSTANCE") {
        router.push("/instance/dashboard");
      } else {
        router.push("/feed");
      }
    } catch (err: any) {
      setError(err.message || "Gagal masuk ke akun");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-surface-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-crimson-600 flex items-center justify-center text-white shadow-sm">
              <Megaphone className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-surface-900">
              Suar<span className="text-crimson-600">Aksi</span>
            </span>
          </Link>
          <h1 className="text-lg font-bold text-surface-900 pt-2">Masuk ke SuarAksi</h1>
          <p className="text-xs text-surface-500">
            Satu akun untuk mengawal permasalahan publik dan akuntabilitas instansi
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Kata Sandi"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button type="submit" className="w-full h-11" isLoading={isLoading}>
            <span>Masuk ke Akun</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="pt-2 border-t border-surface-100 space-y-2.5">
          <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider block text-center">
            Pilihan Akun Demo:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("budi.santoso@gmail.com")}
              className="p-2 text-center rounded border border-surface-200 hover:bg-surface-50 text-[11px] font-medium text-surface-700"
            >
              Warga
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("binamarga@jakarta.go.id")}
              className="p-2 text-center rounded border border-surface-200 hover:bg-blue-50 text-[11px] font-medium text-blue-700"
            >
              Instansi
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@suaraksi.id")}
              className="p-2 text-center rounded border border-surface-200 hover:bg-purple-50 text-[11px] font-medium text-purple-700"
            >
              Admin
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-surface-500">
          Belum memiliki akun?{" "}
          <Link href="/register" className="font-semibold text-crimson-600 hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
