import { PrismaClient, Role, ReportStatus, NotificationType, FlagReason, FlagStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.contentReport.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.share.deleteMany();
  await prisma.repost.deleteMany();
  await prisma.upvote.deleteMany();
  await prisma.like.deleteMany();
  await prisma.officialResponse.deleteMany();
  await prisma.reportStatusHistory.deleteMany();
  await prisma.reportMedia.deleteMany();
  await prisma.report.deleteMany();
  await prisma.category.deleteMany();
  await prisma.instanceProfile.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSetting.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Infrastruktur",
        slug: "infrastruktur",
        description: "Jalan rusak, jembatan, trotoar, dan fasilitas fisik publik",
        color: "#DC2626",
        icon: "Hammer",
      },
    }),
    prisma.category.create({
      data: {
        name: "Lingkungan",
        slug: "lingkungan",
        description: "Sampah menumpuk, polusi udara, banjir, dan kebersihan",
        color: "#16A34A",
        icon: "Trees",
      },
    }),
    prisma.category.create({
      data: {
        name: "Transportasi",
        slug: "transportasi",
        description: "Lalu lintas macet, halte rusak, rambu, dan angkutan umum",
        color: "#EA580C",
        icon: "Bus",
      },
    }),
    prisma.category.create({
      data: {
        name: "Pelayanan Publik",
        slug: "pelayanan-publik",
        description: "Birokrasi, administrasi kependudukan, dan layanan perizinan",
        color: "#2563EB",
        icon: "FileText",
      },
    }),
    prisma.category.create({
      data: {
        name: "Keamanan",
        slug: "keamanan",
        description: "Penerangan jalan minim, kerawanan, dan ketertiban umum",
        color: "#9333EA",
        icon: "ShieldAlert",
      },
    }),
    prisma.category.create({
      data: {
        name: "Kesehatan",
        slug: "kesehatan",
        description: "Puskesmas, limbah medis, dan fasilitas layanan kesehatan",
        color: "#0891B2",
        icon: "Activity",
      },
    }),
    prisma.category.create({
      data: {
        name: "Fasilitas Umum",
        slug: "fasilitas-umum",
        description: "Taman kota, penerangan, saluran drainase, dan MCK",
        color: "#4F46E5",
        icon: "Building2",
      },
    }),
    prisma.category.create({
      data: {
        name: "Pendidikan",
        slug: "pendidikan",
        description: "Gedung sekolah, akses pendidikan, dan fasilitas belajar",
        color: "#CA8A04",
        icon: "GraduationCap",
      },
    }),
    prisma.category.create({
      data: {
        name: "Lainnya",
        slug: "lainnya",
        description: "Laporan permasalahan publik umum lainnya",
        color: "#4B5563",
        icon: "HelpCircle",
      },
    }),
  ]);

  const catMap = new Map(categories.map((c) => [c.slug, c.id]));

  const admin = await prisma.user.create({
    data: {
      email: "admin@suaraksi.id",
      username: "admin_suaraksi",
      name: "Administrator SuarAksi",
      passwordHash,
      role: Role.ADMIN,
      isVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: "Akun resmi administrator platform pengaduan & akuntabilitas sosial SuarAksi.",
    },
  });

  const instBinaMarga = await prisma.user.create({
    data: {
      email: "binamarga@jakarta.go.id",
      username: "dbm_jakarta",
      name: "Dinas Bina Marga DKI Jakarta",
      passwordHash,
      role: Role.INSTANCE,
      isVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=150&auto=format&fit=crop&q=80",
      bio: "Kanal resmi Dinas Bina Marga DKI Jakarta untuk penanganan infrastruktur jalan, jembatan, dan trotoar.",
      instanceProfile: {
        create: {
          instanceName: "Dinas Bina Marga Provinsi DKI Jakarta",
          jurisdiction: "Provinsi DKI Jakarta",
          categoryFocus: "Infrastruktur",
          officialAddress: "Jl. Taman Jatibaru No. 1, Gambir, Jakarta Pusat",
          websiteUrl: "https://binamarga.jakarta.go.id",
          verifiedAt: new Date(),
        },
      },
    },
  });

  const instDishub = await prisma.user.create({
    data: {
      email: "dishub@jakarta.go.id",
      username: "dishub_jakarta",
      name: "Dinas Perhubungan DKI Jakarta",
      passwordHash,
      role: Role.INSTANCE,
      isVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1570126128898-4b9d4e08e1a2?w=150&auto=format&fit=crop&q=80",
      bio: "Akun terverifikasi Dinas Perhubungan DKI Jakarta untuk pengelolaan mobilitas, rambu, dan angkutan umum.",
      instanceProfile: {
        create: {
          instanceName: "Dinas Perhubungan DKI Jakarta",
          jurisdiction: "Provinsi DKI Jakarta",
          categoryFocus: "Transportasi",
          officialAddress: "Jl. Taman Jatibaru No.1, Cideng, Gambir, Jakarta Pusat",
          websiteUrl: "https://dishub.jakarta.go.id",
          verifiedAt: new Date(),
        },
      },
    },
  });

  const instDlh = await prisma.user.create({
    data: {
      email: "dlh@jakarta.go.id",
      username: "dlh_jakarta",
      name: "Dinas Lingkungan Hidup DKI Jakarta",
      passwordHash,
      role: Role.INSTANCE,
      isVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=150&auto=format&fit=crop&q=80",
      bio: "Akun resmi Dinas Lingkungan Hidup DKI Jakarta melayani penanganan sampah, drainase kotor, dan kebersihan kota.",
      instanceProfile: {
        create: {
          instanceName: "Dinas Lingkungan Hidup DKI Jakarta",
          jurisdiction: "Provinsi DKI Jakarta",
          categoryFocus: "Lingkungan",
          officialAddress: "Jl. Mandala V No.67, Cililitan, Kramat Jati, Jakarta Timur",
          websiteUrl: "https://lingkunganhidup.jakarta.go.id",
          verifiedAt: new Date(),
        },
      },
    },
  });

  const userBudi = await prisma.user.create({
    data: {
      email: "budi.santoso@gmail.com",
      username: "budisantoso",
      name: "Budi Santoso",
      passwordHash,
      role: Role.USER,
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      bio: "Warga Jakarta Selatan yang peduli keselamatan jalan dan fasilitas umum ramah disabilitas.",
    },
  });

  const userSiti = await prisma.user.create({
    data: {
      email: "siti.rahmawati@gmail.com",
      username: "sitirahma",
      name: "Siti Rahmawati",
      passwordHash,
      role: Role.USER,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      bio: "Pencinta kota bersih dan pejalan kaki aktif di koridor Jakarta Timur.",
    },
  });

  const userRian = await prisma.user.create({
    data: {
      email: "rian.permana@gmail.com",
      username: "rianpermana",
      name: "Rian Permana",
      passwordHash,
      role: Role.USER,
      avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
      bio: "Komuter harian KRL & TransJakarta. Mengawal transparansi penanganan infrastruktur publik.",
    },
  });

  await prisma.follow.createMany({
    data: [
      { followerId: userBudi.id, followingId: instBinaMarga.id },
      { followerId: userSiti.id, followingId: instDlh.id },
      { followerId: userRian.id, followingId: instDishub.id },
      { followerId: userBudi.id, followingId: userSiti.id },
      { followerId: userSiti.id, followingId: userBudi.id },
    ],
  });

  const report1 = await prisma.report.create({
    data: {
      title: "Jalan Ambles Parah di Depan Stasiun Manggarai Menimbulkan Korban Terjatuh",
      description:
        "Terdapat lubang berdiameter 1.5 meter dengan kedalaman sekitar 25 cm tepat di jalur keluar angkutan umum Stasiun Manggarai sisi barat. Kondisi ini sudah berlangsung selama 4 hari dan telah menyebabkan setidaknya dua pengendara motor tergelincir saat hujan deras malam hari. Mohon segera dilakukan perbaikan demi keselamatan ribuan komuter setiap hari.",
      status: ReportStatus.IN_PROGRESS,
      authorId: userBudi.id,
      categoryId: catMap.get("infrastruktur")!,
      targetInstanceId: instBinaMarga.id,
      address: "Jl. Manggarai Utara I No.12, Tebet, Jakarta Selatan",
      latitude: -6.2098,
      longitude: 106.8502,
      likesCount: 38,
      upsCount: 65,
      commentsCount: 14,
      repostsCount: 12,
      sharesCount: 9,
      hotScore: 420.5,
      isHot: true,
      hotAt: new Date(),
      media: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1541888946425-d0fbb1861564?w=800&auto=format&fit=crop&q=80",
          },
        ],
      },
    },
  });

  await prisma.reportStatusHistory.createMany({
    data: [
      {
        reportId: report1.id,
        status: ReportStatus.SUBMITTED,
        notes: "Laporan dibuat dan diteruskan ke Dinas Bina Marga DKI Jakarta.",
        changedById: userBudi.id,
        createdAt: new Date(Date.now() - 3600000 * 48),
      },
      {
        reportId: report1.id,
        status: ReportStatus.UNDER_REVIEW,
        notes: "Tim teknis sedang melakukan survei lapangan untuk mengevaluasi kontur amblesan.",
        changedById: instBinaMarga.id,
        createdAt: new Date(Date.now() - 3600000 * 36),
      },
      {
        reportId: report1.id,
        status: ReportStatus.VERIFIED,
        notes: "Lokasi telah terverifikasi sebagai ruas kewenangan Provinsi DKI Jakarta.",
        changedById: instBinaMarga.id,
        createdAt: new Date(Date.now() - 3600000 * 24),
      },
      {
        reportId: report1.id,
        status: ReportStatus.IN_PROGRESS,
        notes: "Alat berat dan tim patching aspal telah dikerahkan ke lokasi untuk penambalan darurat.",
        evidenceUrls: [
          "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&auto=format&fit=crop&q=80",
        ],
        changedById: instBinaMarga.id,
        createdAt: new Date(Date.now() - 3600000 * 6),
      },
    ],
  });

  await prisma.officialResponse.create({
    data: {
      reportId: report1.id,
      instanceId: instBinaMarga.id,
      content:
        "Terima kasih atas laporan saudara Budi. Regu Reaksi Cepat Dinas Bina Marga Jakarta Selatan saat ini sudah berada di titik Manggarai untuk melakukan pemadatan dasar dan pengaspalan hotmix. Kami targetkan jalur dapat dibuka kembali secara normal sebelum jam sibuk esok pagi.",
      attachmentUrls: [
        "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&auto=format&fit=crop&q=80",
      ],
    },
  });

  const report2 = await prisma.report.create({
    data: {
      title: "Tumpukan Sampah Ilegal Menutup Saluran Air dan Menyebabkan Bau Menyengat di Rawamangun",
      description:
        "Saluran air di Jalan Pemuda Rawamangun tersumbat oleh tumpukan sampah plastik dan kasur bekas yang dibuang liar. Ketika hujan lebat kemarin, air meluap hingga setinggi betis orang dewasa ke badan jalan. Bau yang ditimbulkan juga sangat mengganggu warga sekitar dan pedagang kaki lima.",
      status: ReportStatus.RESOLVED,
      authorId: userSiti.id,
      categoryId: catMap.get("lingkungan")!,
      targetInstanceId: instDlh.id,
      address: "Jl. Pemuda No.45, Rawamangun, Pulo Gadung, Jakarta Timur",
      latitude: -6.1944,
      longitude: 106.8833,
      likesCount: 52,
      upsCount: 88,
      commentsCount: 22,
      repostsCount: 19,
      sharesCount: 15,
      hotScore: 560.0,
      isHot: true,
      hotAt: new Date(),
      media: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=80",
          },
        ],
      },
    },
  });

  await prisma.reportStatusHistory.createMany({
    data: [
      {
        reportId: report2.id,
        status: ReportStatus.SUBMITTED,
        notes: "Laporan diajukan masyarakat terkait penumpukan sampah liar.",
        changedById: userSiti.id,
        createdAt: new Date(Date.now() - 3600000 * 72),
      },
      {
        reportId: report2.id,
        status: ReportStatus.IN_PROGRESS,
        notes: "Pasukan Oranye DLH Jakarta Timur diterjunkan mengangkut 4 truk sampah dari saluran.",
        evidenceUrls: [
          "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80",
        ],
        changedById: instDlh.id,
        createdAt: new Date(Date.now() - 3600000 * 20),
      },
      {
        reportId: report2.id,
        status: ReportStatus.RESOLVED,
        notes: "Saluran air telah bersih tuntas dan dipasang spanduk larangan membuang sampah di lokasi.",
        evidenceUrls: [
          "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80",
        ],
        changedById: instDlh.id,
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
    ],
  });

  await prisma.officialResponse.create({
    data: {
      reportId: report2.id,
      instanceId: instDlh.id,
      content:
        "Laporan telah selesai ditindaklanjuti secara menyeluruh oleh UPK Badan Air Dinas Lingkungan Hidup. Sebanyak 8 ton sampah dan endapan lumpur telah diangkut ke TPST Bantargebang. Aliran air kini telah lancar kembali. Kami mengimbau warga sekitar untuk turut menjaga ketertiban lingkungan.",
      attachmentUrls: [
        "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80",
      ],
    },
  });

  const report3 = await prisma.report.create({
    data: {
      title: "Lampu Penerangan Jalan Umum (PJU) Mati Sepanjang 500 Meter di Jalan Casablanca",
      description:
        "Penerangan jalan di flyover Casablanca arah barat mati total selama sepekan terakhir. Ruas jalan sangat gelap dan membahayakan pengendara, terutama saat hujan atau malam hari. Mohon ditindaklanjuti untuk perbaikan bohlam dan instalasi kabel.",
      status: ReportStatus.SUBMITTED,
      authorId: userRian.id,
      categoryId: catMap.get("keamanan")!,
      targetInstanceId: instBinaMarga.id,
      address: "Flyover Casablanca, Jl. Prof. DR. Satrio, Setiabudi, Jakarta Selatan",
      latitude: -6.2238,
      longitude: 106.8291,
      likesCount: 16,
      upsCount: 29,
      commentsCount: 5,
      repostsCount: 4,
      sharesCount: 3,
      hotScore: 180.0,
      isHot: false,
      media: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80",
          },
        ],
      },
    },
  });

  const report4 = await prisma.report.create({
    data: {
      title: "Halte Bus TransJakarta Rusak dan Kaca Pecah di Koridor Pramuka",
      description:
        "Fasilitas halte non-BRT di seberang Pasar Pramuka mengalami kerusakan parah. Kaca pembatas pecah berhamburan ke trotoar dan atap bocor besar sehingga membahayakan calon penumpang saat menunggu bus.",
      status: ReportStatus.UNDER_REVIEW,
      authorId: userBudi.id,
      categoryId: catMap.get("transportasi")!,
      targetInstanceId: instDishub.id,
      address: "Jl. Pramuka No.14, Matraman, Jakarta Timur",
      latitude: -6.1965,
      longitude: 106.8621,
      likesCount: 24,
      upsCount: 41,
      commentsCount: 9,
      repostsCount: 6,
      sharesCount: 5,
      hotScore: 260.0,
      isHot: true,
      hotAt: new Date(),
      media: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80",
          },
        ],
      },
    },
  });

  await prisma.like.createMany({
    data: [
      { userId: userBudi.id, reportId: report2.id },
      { userId: userSiti.id, reportId: report1.id },
      { userId: userRian.id, reportId: report1.id },
      { userId: userRian.id, reportId: report2.id },
      { userId: userSiti.id, reportId: report4.id },
    ],
  });

  await prisma.upvote.createMany({
    data: [
      { userId: userBudi.id, reportId: report2.id },
      { userId: userSiti.id, reportId: report1.id },
      { userId: userRian.id, reportId: report1.id },
      { userId: userBudi.id, reportId: report4.id },
      { userId: userRian.id, reportId: report4.id },
    ],
  });

  await prisma.bookmark.createMany({
    data: [
      { userId: userBudi.id, reportId: report1.id },
      { userId: userBudi.id, reportId: report2.id },
      { userId: userSiti.id, reportId: report1.id },
    ],
  });

  await prisma.repost.createMany({
    data: [
      { userId: userSiti.id, reportId: report1.id },
      { userId: userRian.id, reportId: report2.id },
    ],
  });

  const comment1 = await prisma.comment.create({
    data: {
      reportId: report1.id,
      authorId: userSiti.id,
      content: "Kemarin malam saya lewat sini dan hampir jatuh juga! Syukurlah sudah mulai dikerjakan Bina Marga.",
    },
  });

  await prisma.comment.create({
    data: {
      reportId: report1.id,
      authorId: userBudi.id,
      content: "Betul Bu, semoga penambalannya pakai aspal berkualitas agar tidak cepat tergerus air hujan.",
      parentId: comment1.id,
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      reportId: report2.id,
      authorId: userRian.id,
      content: "Terima kasih respon cepat Pasukan Oranye DLH! Sangat transparan dengan foto dokumentasi.",
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: userBudi.id,
        actorId: instBinaMarga.id,
        type: NotificationType.STATUS_CHANGE,
        reportId: report1.id,
        title: "Status Laporan Berubah",
        message: "Laporan Anda di Stasiun Manggarai sedang ditangani (IN PROGRESS) oleh Dinas Bina Marga.",
        isRead: false,
      },
      {
        userId: userBudi.id,
        actorId: instBinaMarga.id,
        type: NotificationType.OFFICIAL_RESPONSE,
        reportId: report1.id,
        title: "Tanggapan Resmi Baru",
        message: "Dinas Bina Marga memberikan tanggapan resmi pada laporan Anda.",
        isRead: false,
      },
      {
        userId: userBudi.id,
        actorId: userSiti.id,
        type: NotificationType.UP,
        reportId: report1.id,
        title: "Laporan Anda Mendapat Dukungan UP",
        message: "Siti Rahmawati memberikan UP pada laporan Anda.",
        isRead: true,
      },
      {
        userId: userSiti.id,
        actorId: instDlh.id,
        type: NotificationType.STATUS_CHANGE,
        reportId: report2.id,
        title: "Laporan Selesai Ditangani",
        message: "Dinas Lingkungan Hidup telah menyelesaikan (RESOLVED) laporan tumpukan sampah Rawamangun.",
        isRead: false,
      },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actorId: admin.id,
        action: "VERIFY_INSTANCE",
        resource: "User",
        targetId: instBinaMarga.id,
        details: { instanceName: "Dinas Bina Marga Provinsi DKI Jakarta" },
        ipAddress: "127.0.0.1",
      },
      {
        actorId: instBinaMarga.id,
        action: "UPDATE_REPORT_STATUS",
        resource: "Report",
        targetId: report1.id,
        details: { previousStatus: "VERIFIED", newStatus: "IN_PROGRESS" },
        ipAddress: "127.0.0.1",
      },
    ],
  });

  await prisma.systemSetting.createMany({
    data: [
      { key: "HOT_THRESHOLD", value: "30" },
      { key: "LIKE_WEIGHT", value: "1" },
      { key: "COMMENT_WEIGHT", value: "2" },
      { key: "REPOST_WEIGHT", value: "3" },
      { key: "UP_WEIGHT", value: "4" },
      { key: "SHARE_WEIGHT", value: "2" },
      { key: "DECAY_HALF_LIFE_HOURS", value: "24" },
    ],
  });
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
