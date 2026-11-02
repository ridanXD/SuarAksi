# SuarAksi — Civic Reporting & Social Accountability Platform

**SuarAksi** adalah platform civic reporting modern yang menggabungkan kemudahan dan keterlibatan media sosial (seperti X / Twitter) dengan akuntabilitas penanganan masalah publik oleh instansi pemerintah secara transparan dan terverifikasi.

---

## Arsitektur & Monorepo

```
suaraksi/
├── apps/
│   ├── web/               # Frontend: Next.js 15 (App Router), React, Tailwind CSS, Leaflet
│   └── api/               # Backend: Node.js, Express.js, Socket.IO, JWT, bcrypt, Vitest
├── packages/
│   └── shared/            # Shared Types, DTOs, Enums, dan Zod Schemas
├── prisma/
│   ├── schema.prisma      # Schema Database PostgreSQL
│   └── seed.ts            # Seeding data realistis (warga, instansi, laporan, interaksi)
├── uploads/               # Direktori penyimpanan bukti & foto
├── docker-compose.yml     # Konfigurasi container PostgreSQL
└── README.md
```

---

## Teknologi yang Digunakan

### Frontend (`apps/web`)
- **Next.js 15** (App Router)
- **TypeScript**
- **React**
- **Tailwind CSS**
- **Lucide React**
- **React Hook Form** & **Zod**
- **TanStack Query**
- **Leaflet & OpenStreetMap**
- **Socket.IO Client**

### Backend (`apps/api`)
- **Node.js** & **Express.js**
- **TypeScript**
- **PostgreSQL** & **Prisma ORM**
- **Socket.IO** (Real-time notifications & feed updates)
- **JWT & bcrypt**
- **Multer** (File image upload handler)
- **Vitest & Supertest**

---

## Tiga Role Utama & Hak Akses

1. **USER (Masyarakat Umum)**
   - Registrasi, login, dan manajemen profil.
   - Membuat laporan dengan foto, kategori, dan penandaan lokasi interaktif Leaflet.
   - Memberikan **Like**, **Komentar & Nested Replies**, **Repost**, **Share**, **Bookmark**.
   - Memberikan **UP**: Mekanisme dukungan publik khusus untuk mendongkrak prioritas laporan ke algoritma trending.
   - Mengikuti (follow) pengguna lain atau instansi resmi.
   - Melaporkan konten bermasalah untuk dimoderasi.

2. **INSTANCE (Instansi Pemerintah)**
   - Mendapatkan badge resmi **Terverifikasi** (setelah disetujui Admin).
   - Dashboard pengelolaan laporan masuk berdasarkan kewenangan wilayah dan kategori.
   - Mengubah status penanganan resmi:
     - `SUBMITTED` (Terkirim)
     - `UNDER_REVIEW` (Sedang Ditinjau)
     - `VERIFIED` (Terverifikasi Valid)
     - `IN_PROGRESS` (Sedang Ditangani di Lapangan)
     - `RESOLVED` (Selesai Ditangani)
     - `REJECTED` (Ditolak / Di Luar Kewenangan)
   - Setiap perubahan status wajib menyertakan catatan resmi, foto bukti lapangan, dan otomatis masuk ke riwayat linimasa publik.
   - Merilis **Tanggapan Resmi (Official Response)** dengan lampiran dokumentasi penyelesaian.
   - Mengakses analitik tingkat penyelesaian (*resolution rate*).

3. **ADMIN (Platform Administrator)**
   - Dashboard statistik menyeluruh platform.
   - Manajemen akun pengguna (ubah role, aktifkan/nonaktifkan, hapus).
   - Verifikasi dan persetujuan legalitas akun instansi pemerintah.
   - Manajemen seluruh laporan publik.
   - Manajemen kategori isu (tambah, edit, hapus, warna tag).
   - Pusat moderasi konten (tinjau aduan spam, hoaks, ujaran kebencian, hapus konten).
   - Konfigurasi bobot algoritma trending & nilai ambang batas HOT.
   - Audit logs permanen atas seluruh tindakan sensitif.

---

## Algoritma HOT & Trending

Perhitungan **HOT Score** dihitung secara real-time dengan rumus pembobotan dan peluruhan waktu (*time decay*):

$$\text{Hot Score} = [(\text{Like} \times 1) + (\text{Comment} \times 2) + (\text{Repost} \times 3) + (\text{UP} \times 4) + (\text{Share} \times 2) + \text{Growth Bonus}] \times (0.5)^{\frac{\text{Age}}{\text{HalfLife}}}$$

Laporan yang mencapai ambang batas (*threshold*) otomatis mendapatkan label **HOT** dan ditampilkan di widget serta tab Trending. Seluruh bobot dan batas threshold dapat diatur dinamis oleh Admin melalui menu Algoritma Trending.

---

## Akun Demo Siap Pakai

Semua akun demo menggunakan kata sandi: `Password123!`

| Role | Email | Username | Keterangan |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@suaraksi.id` | `@admin_suaraksi` | Akses penuh dashboard administrator |
| **Instance** | `binamarga@jakarta.go.id` | `@dbm_jakarta` | Dinas Bina Marga DKI Jakarta (Terverifikasi) |
| **Instance** | `dishub@jakarta.go.id` | `@dishub_jakarta` | Dinas Perhubungan DKI Jakarta (Terverifikasi) |
| **Instance** | `dlh@jakarta.go.id` | `@dlh_jakarta` | Dinas Lingkungan Hidup DKI Jakarta (Terverifikasi) |
| **User** | `budi.santoso@gmail.com` | `@budisantoso` | Akun warga pelapor |
| **User** | `siti.rahmawati@gmail.com` | `@sitirahma` | Akun warga pelapor |
| **User** | `rian.permana@gmail.com` | `@rianpermana` | Akun warga pelapor |

*(Tersedia tombol satu-klik login cepat pada halaman Login).*

---

## Panduan Instalasi & Menjalankan Aplikasi

### 1. Prasyarat
- Node.js v18+ atau v20+
- PostgreSQL lokal atau melalui Docker

### 2. Konfigurasi Database & Environment
Pastikan file `.env` di root telah terisi (sudah disediakan default):
```env
DATABASE_URL="postgresql://postgres@localhost:5432/suaraksi_db"
JWT_SECRET="suaraksi_super_secret_jwt_key_2026_secure"
PORT=5000
CORS_ORIGIN="http://localhost:3000"
UPLOAD_DIR="./uploads"
```

Jika menggunakan Docker untuk PostgreSQL:
```bash
docker-compose up -d
```

### 3. Migrasi & Seeding Database
```bash
# Generate client Prisma & sinkronisasi schema
npm run prisma:generate
npx prisma db push --schema=prisma/schema.prisma

# Eksekusi seeding data awal realistis
npm run prisma:seed
```

### 4. Build Monorepo
```bash
npm run build
```

### 5. Jalankan Pengujian Otomatis (Testing)
```bash
npm test
```

### 6. Menjalankan Server Development
```bash
# Menjalankan Backend API (port 5000) dan Frontend Web (port 3000) sekaligus:
npm run dev
```

Akses web di browser: **[http://localhost:3000](http://localhost:3000)**  
Backend API diakses di: **[http://localhost:5000/api](http://localhost:5000/api)**
