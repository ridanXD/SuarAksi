"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrendingConfigSchema = exports.UpdateProfileSchema = exports.FlagContentSchema = exports.CreateCommentSchema = exports.CreateOfficialResponseSchema = exports.UpdateReportStatusSchema = exports.UpdateReportSchema = exports.CreateReportSchema = exports.LoginSchema = exports.RegisterSchema = exports.FlagReason = exports.ReportCategoryEnum = exports.NotificationType = exports.ReportStatus = exports.Role = void 0;
const zod_1 = require("zod");
exports.Role = {
    USER: "USER",
    INSTANCE: "INSTANCE",
    ADMIN: "ADMIN",
};
exports.ReportStatus = {
    SUBMITTED: "SUBMITTED",
    UNDER_REVIEW: "UNDER_REVIEW",
    VERIFIED: "VERIFIED",
    IN_PROGRESS: "IN_PROGRESS",
    RESOLVED: "RESOLVED",
    REJECTED: "REJECTED",
};
exports.NotificationType = {
    LIKE: "LIKE",
    COMMENT: "COMMENT",
    REPLY: "REPLY",
    REPOST: "REPOST",
    UP: "UP",
    STATUS_CHANGE: "STATUS_CHANGE",
    OFFICIAL_RESPONSE: "OFFICIAL_RESPONSE",
    HOT_ALERT: "HOT_ALERT",
    INSTANCE_VERIFIED: "INSTANCE_VERIFIED",
};
exports.ReportCategoryEnum = {
    INFRASTRUKTUR: "Infrastruktur",
    LINGKUNGAN: "Lingkungan",
    TRANSPORTASI: "Transportasi",
    PENDIDIKAN: "Pendidikan",
    KESEHATAN: "Kesehatan",
    KEAMANAN: "Keamanan",
    PELAYANAN_PUBLIK: "Pelayanan Publik",
    FASILITAS_UMUM: "Fasilitas Umum",
    LAINNYA: "Lainnya",
};
exports.FlagReason = {
    SPAM: "SPAM",
    MISINFORMATION: "MISINFORMATION",
    HATE_SPEECH: "HATE_SPEECH",
    HARASSMENT: "HARASSMENT",
    INAPPROPRIATE: "INAPPROPRIATE",
    OTHER: "OTHER",
};
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email("Format email tidak valid"),
    password: zod_1.z.string().min(8, "Password minimal 8 karakter"),
    username: zod_1.z
        .string()
        .min(3, "Username minimal 3 karakter")
        .max(30, "Username maksimal 30 karakter")
        .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore"),
    name: zod_1.z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
    role: zod_1.z.enum([exports.Role.USER, exports.Role.INSTANCE]).default(exports.Role.USER),
    instanceName: zod_1.z.string().optional(),
    instanceJurisdiction: zod_1.z.string().optional(),
    instanceCategory: zod_1.z.string().optional(),
    contactPhone: zod_1.z.string().optional(),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Format email tidak valid"),
    password: zod_1.z.string().min(1, "Password wajib diisi"),
});
exports.CreateReportSchema = zod_1.z.object({
    title: zod_1.z.string().min(5, "Judul minimal 5 karakter").max(150, "Judul maksimal 150 karakter"),
    description: zod_1.z.string().min(20, "Deskripsi minimal 20 karakter"),
    categoryId: zod_1.z.string().min(1, "Kategori wajib dipilih"),
    address: zod_1.z.string().min(3, "Alamat wajib diisi"),
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    targetInstanceId: zod_1.z.string().optional().nullable(),
    mediaUrls: zod_1.z.array(zod_1.z.string().url()).optional().default([]),
});
exports.UpdateReportSchema = zod_1.z.object({
    title: zod_1.z.string().min(5).max(150).optional(),
    description: zod_1.z.string().min(20).optional(),
    categoryId: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    latitude: zod_1.z.number().min(-90).max(90).optional(),
    longitude: zod_1.z.number().min(-180).max(180).optional(),
    mediaUrls: zod_1.z.array(zod_1.z.string().url()).optional(),
});
exports.UpdateReportStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        exports.ReportStatus.SUBMITTED,
        exports.ReportStatus.UNDER_REVIEW,
        exports.ReportStatus.VERIFIED,
        exports.ReportStatus.IN_PROGRESS,
        exports.ReportStatus.RESOLVED,
        exports.ReportStatus.REJECTED,
    ]),
    notes: zod_1.z.string().min(5, "Catatan penanganan minimal 5 karakter"),
    evidenceUrls: zod_1.z.array(zod_1.z.string().url()).optional().default([]),
});
exports.CreateOfficialResponseSchema = zod_1.z.object({
    content: zod_1.z.string().min(10, "Isi tanggapan resmi minimal 10 karakter"),
    attachmentUrls: zod_1.z.array(zod_1.z.string().url()).optional().default([]),
});
exports.CreateCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, "Komentar tidak boleh kosong").max(1000, "Komentar maksimal 1000 karakter"),
    parentId: zod_1.z.string().optional().nullable(),
});
exports.FlagContentSchema = zod_1.z.object({
    reportId: zod_1.z.string().optional(),
    commentId: zod_1.z.string().optional(),
    reason: zod_1.z.enum([
        exports.FlagReason.SPAM,
        exports.FlagReason.MISINFORMATION,
        exports.FlagReason.HATE_SPEECH,
        exports.FlagReason.HARASSMENT,
        exports.FlagReason.INAPPROPRIATE,
        exports.FlagReason.OTHER,
    ]),
    description: zod_1.z.string().max(500).optional(),
});
exports.UpdateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    bio: zod_1.z.string().max(300).optional(),
    avatarUrl: zod_1.z.string().url().optional().or(zod_1.z.literal("")),
    phone: zod_1.z.string().optional(),
    jurisdiction: zod_1.z.string().optional(),
});
exports.TrendingConfigSchema = zod_1.z.object({
    likeWeight: zod_1.z.number().min(0).default(1),
    commentWeight: zod_1.z.number().min(0).default(2),
    repostWeight: zod_1.z.number().min(0).default(3),
    upWeight: zod_1.z.number().min(0).default(4),
    shareWeight: zod_1.z.number().min(0).default(2),
    hotThreshold: zod_1.z.number().min(1).default(50),
    decayHalfLifeHours: zod_1.z.number().min(1).default(24),
});
