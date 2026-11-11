import { z } from "zod";

export const Role = {
  USER: "USER",
  INSTANCE: "INSTANCE",
  ADMIN: "ADMIN",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const ReportStatus = {
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  VERIFIED: "VERIFIED",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

export const NotificationType = {
  LIKE: "LIKE",
  COMMENT: "COMMENT",
  REPLY: "REPLY",
  REPOST: "REPOST",
  UP: "UP",
  STATUS_CHANGE: "STATUS_CHANGE",
  OFFICIAL_RESPONSE: "OFFICIAL_RESPONSE",
  HOT_ALERT: "HOT_ALERT",
  INSTANCE_VERIFIED: "INSTANCE_VERIFIED",
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const ReportCategoryEnum = {
  INFRASTRUKTUR: "Infrastruktur",
  LINGKUNGAN: "Lingkungan",
  TRANSPORTASI: "Transportasi",
  PENDIDIKAN: "Pendidikan",
  KESEHATAN: "Kesehatan",
  KEAMANAN: "Keamanan",
  PELAYANAN_PUBLIK: "Pelayanan Publik",
  FASILITAS_UMUM: "Fasilitas Umum",
  LAINNYA: "Lainnya",
} as const;
export type ReportCategoryEnum = (typeof ReportCategoryEnum)[keyof typeof ReportCategoryEnum];

export const FlagReason = {
  SPAM: "SPAM",
  MISINFORMATION: "MISINFORMATION",
  HATE_SPEECH: "HATE_SPEECH",
  HARASSMENT: "HARASSMENT",
  INAPPROPRIATE: "INAPPROPRIATE",
  OTHER: "OTHER",
} as const;
export type FlagReason = (typeof FlagReason)[keyof typeof FlagReason];

export const RegisterSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore"),
  name: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  role: z.enum([Role.USER, Role.INSTANCE]).default(Role.USER),
  instanceName: z.string().optional(),
  instanceJurisdiction: z.string().optional(),
  instanceCategory: z.string().optional(),
  contactPhone: z.string().optional(),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const CreateReportSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter").max(150, "Judul maksimal 150 karakter"),
  description: z.string().min(20, "Deskripsi minimal 20 karakter"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  address: z.string().min(3, "Alamat wajib diisi"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  targetInstanceId: z.string().optional().nullable(),
  mediaUrls: z.array(z.string().url()).optional().default([]),
});
export type CreateReportInput = z.infer<typeof CreateReportSchema>;

export const UpdateReportSchema = z.object({
  title: z.string().min(5).max(150).optional(),
  description: z.string().min(20).optional(),
  categoryId: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  mediaUrls: z.array(z.string().url()).optional(),
});
export type UpdateReportInput = z.infer<typeof UpdateReportSchema>;

export const UpdateReportStatusSchema = z.object({
  status: z.enum([
    ReportStatus.SUBMITTED,
    ReportStatus.UNDER_REVIEW,
    ReportStatus.VERIFIED,
    ReportStatus.IN_PROGRESS,
    ReportStatus.RESOLVED,
    ReportStatus.REJECTED,
  ]),
  notes: z.string().min(5, "Catatan penanganan minimal 5 karakter"),
  evidenceUrls: z.array(z.string().url()).optional().default([]),
});
export type UpdateReportStatusInput = z.infer<typeof UpdateReportStatusSchema>;

export const CreateOfficialResponseSchema = z.object({
  content: z.string().min(10, "Isi tanggapan resmi minimal 10 karakter"),
  attachmentUrls: z.array(z.string().url()).optional().default([]),
});
export type CreateOfficialResponseInput = z.infer<typeof CreateOfficialResponseSchema>;

export const CreateCommentSchema = z.object({
  content: z.string().min(1, "Komentar tidak boleh kosong").max(1000, "Komentar maksimal 1000 karakter"),
  parentId: z.string().optional().nullable(),
});
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;

export const FlagContentSchema = z.object({
  reportId: z.string().optional(),
  commentId: z.string().optional(),
  reason: z.enum([
    FlagReason.SPAM,
    FlagReason.MISINFORMATION,
    FlagReason.HATE_SPEECH,
    FlagReason.HARASSMENT,
    FlagReason.INAPPROPRIATE,
    FlagReason.OTHER,
  ]),
  description: z.string().max(500).optional(),
});
export type FlagContentInput = z.infer<typeof FlagContentSchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(300).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
  jurisdiction: z.string().optional(),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export const TrendingConfigSchema = z.object({
  likeWeight: z.number().min(0).default(1),
  commentWeight: z.number().min(0).default(2),
  repostWeight: z.number().min(0).default(3),
  upWeight: z.number().min(0).default(4),
  shareWeight: z.number().min(0).default(2),
  hotThreshold: z.number().min(1).default(50),
  decayHalfLifeHours: z.number().min(1).default(24),
});
export type TrendingConfigInput = z.infer<typeof TrendingConfigSchema>;

export interface UserSummary {
  id: string;
  name: string;
  username: string;
  email?: string;
  bio?: string | null;
  role: Role;
  avatarUrl?: string | null;
  isVerified?: boolean;
  instanceName?: string | null;
  jurisdiction?: string | null;
  instanceProfile?: {
    instanceName?: string | null;
    jurisdiction?: string | null;
    websiteUrl?: string | null;
  } | null;
  createdAt?: string;
}

export interface ReportSummary {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  author: UserSummary;
  targetInstance?: UserSummary | null;
  address: string;
  latitude: number;
  longitude: number;
  status: ReportStatus;
  mediaUrls: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  repostsCount: number;
  upsCount: number;
  hotScore: number;
  isHot: boolean;
  hasLiked?: boolean;
  hasUpvoted?: boolean;
  hasReposted?: boolean;
  hasBookmarked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentItem {
  id: string;
  reportId: string;
  author: UserSummary;
  content: string;
  parentId: string | null;
  replies?: CommentItem[];
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistoryItem {
  id: string;
  reportId: string;
  status: ReportStatus;
  notes: string;
  evidenceUrls: string[];
  changedBy: UserSummary;
  createdAt: string;
}

export interface OfficialResponseItem {
  id: string;
  reportId: string;
  instance: UserSummary;
  content: string;
  attachmentUrls: string[];
  createdAt: string;
}
