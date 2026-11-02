import { z } from "zod";
export declare const Role: {
    readonly USER: "USER";
    readonly INSTANCE: "INSTANCE";
    readonly ADMIN: "ADMIN";
};
export type Role = (typeof Role)[keyof typeof Role];
export declare const ReportStatus: {
    readonly SUBMITTED: "SUBMITTED";
    readonly UNDER_REVIEW: "UNDER_REVIEW";
    readonly VERIFIED: "VERIFIED";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly RESOLVED: "RESOLVED";
    readonly REJECTED: "REJECTED";
};
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];
export declare const NotificationType: {
    readonly LIKE: "LIKE";
    readonly COMMENT: "COMMENT";
    readonly REPLY: "REPLY";
    readonly REPOST: "REPOST";
    readonly UP: "UP";
    readonly STATUS_CHANGE: "STATUS_CHANGE";
    readonly OFFICIAL_RESPONSE: "OFFICIAL_RESPONSE";
    readonly HOT_ALERT: "HOT_ALERT";
    readonly INSTANCE_VERIFIED: "INSTANCE_VERIFIED";
};
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
export declare const ReportCategoryEnum: {
    readonly INFRASTRUKTUR: "Infrastruktur";
    readonly LINGKUNGAN: "Lingkungan";
    readonly TRANSPORTASI: "Transportasi";
    readonly PENDIDIKAN: "Pendidikan";
    readonly KESEHATAN: "Kesehatan";
    readonly KEAMANAN: "Keamanan";
    readonly PELAYANAN_PUBLIK: "Pelayanan Publik";
    readonly FASILITAS_UMUM: "Fasilitas Umum";
    readonly LAINNYA: "Lainnya";
};
export type ReportCategoryEnum = (typeof ReportCategoryEnum)[keyof typeof ReportCategoryEnum];
export declare const FlagReason: {
    readonly SPAM: "SPAM";
    readonly MISINFORMATION: "MISINFORMATION";
    readonly HATE_SPEECH: "HATE_SPEECH";
    readonly HARASSMENT: "HARASSMENT";
    readonly INAPPROPRIATE: "INAPPROPRIATE";
    readonly OTHER: "OTHER";
};
export type FlagReason = (typeof FlagReason)[keyof typeof FlagReason];
export declare const RegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    username: z.ZodString;
    name: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["USER", "INSTANCE"]>>;
    instanceName: z.ZodOptional<z.ZodString>;
    instanceJurisdiction: z.ZodOptional<z.ZodString>;
    instanceCategory: z.ZodOptional<z.ZodString>;
    contactPhone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    username: string;
    name: string;
    role: "USER" | "INSTANCE";
    instanceName?: string | undefined;
    instanceJurisdiction?: string | undefined;
    instanceCategory?: string | undefined;
    contactPhone?: string | undefined;
}, {
    email: string;
    password: string;
    username: string;
    name: string;
    role?: "USER" | "INSTANCE" | undefined;
    instanceName?: string | undefined;
    instanceJurisdiction?: string | undefined;
    instanceCategory?: string | undefined;
    contactPhone?: string | undefined;
}>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginInput = z.infer<typeof LoginSchema>;
export declare const CreateReportSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    categoryId: z.ZodString;
    address: z.ZodString;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    targetInstanceId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    mediaUrls: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    categoryId: string;
    address: string;
    latitude: number;
    longitude: number;
    mediaUrls: string[];
    targetInstanceId?: string | null | undefined;
}, {
    title: string;
    description: string;
    categoryId: string;
    address: string;
    latitude: number;
    longitude: number;
    targetInstanceId?: string | null | undefined;
    mediaUrls?: string[] | undefined;
}>;
export type CreateReportInput = z.infer<typeof CreateReportSchema>;
export declare const UpdateReportSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    mediaUrls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    description?: string | undefined;
    categoryId?: string | undefined;
    address?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    mediaUrls?: string[] | undefined;
}, {
    title?: string | undefined;
    description?: string | undefined;
    categoryId?: string | undefined;
    address?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    mediaUrls?: string[] | undefined;
}>;
export type UpdateReportInput = z.infer<typeof UpdateReportSchema>;
export declare const UpdateReportStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["SUBMITTED", "UNDER_REVIEW", "VERIFIED", "IN_PROGRESS", "RESOLVED", "REJECTED"]>;
    notes: z.ZodString;
    evidenceUrls: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    status: "SUBMITTED" | "UNDER_REVIEW" | "VERIFIED" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
    notes: string;
    evidenceUrls: string[];
}, {
    status: "SUBMITTED" | "UNDER_REVIEW" | "VERIFIED" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
    notes: string;
    evidenceUrls?: string[] | undefined;
}>;
export type UpdateReportStatusInput = z.infer<typeof UpdateReportStatusSchema>;
export declare const CreateOfficialResponseSchema: z.ZodObject<{
    content: z.ZodString;
    attachmentUrls: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    content: string;
    attachmentUrls: string[];
}, {
    content: string;
    attachmentUrls?: string[] | undefined;
}>;
export type CreateOfficialResponseInput = z.infer<typeof CreateOfficialResponseSchema>;
export declare const CreateCommentSchema: z.ZodObject<{
    content: z.ZodString;
    parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    content: string;
    parentId?: string | null | undefined;
}, {
    content: string;
    parentId?: string | null | undefined;
}>;
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export declare const FlagContentSchema: z.ZodObject<{
    reportId: z.ZodOptional<z.ZodString>;
    commentId: z.ZodOptional<z.ZodString>;
    reason: z.ZodEnum<["SPAM", "MISINFORMATION", "HATE_SPEECH", "HARASSMENT", "INAPPROPRIATE", "OTHER"]>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason: "SPAM" | "MISINFORMATION" | "HATE_SPEECH" | "HARASSMENT" | "INAPPROPRIATE" | "OTHER";
    description?: string | undefined;
    reportId?: string | undefined;
    commentId?: string | undefined;
}, {
    reason: "SPAM" | "MISINFORMATION" | "HATE_SPEECH" | "HARASSMENT" | "INAPPROPRIATE" | "OTHER";
    description?: string | undefined;
    reportId?: string | undefined;
    commentId?: string | undefined;
}>;
export type FlagContentInput = z.infer<typeof FlagContentSchema>;
export declare const UpdateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    phone: z.ZodOptional<z.ZodString>;
    jurisdiction: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    bio?: string | undefined;
    avatarUrl?: string | undefined;
    phone?: string | undefined;
    jurisdiction?: string | undefined;
}, {
    name?: string | undefined;
    bio?: string | undefined;
    avatarUrl?: string | undefined;
    phone?: string | undefined;
    jurisdiction?: string | undefined;
}>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export declare const TrendingConfigSchema: z.ZodObject<{
    likeWeight: z.ZodDefault<z.ZodNumber>;
    commentWeight: z.ZodDefault<z.ZodNumber>;
    repostWeight: z.ZodDefault<z.ZodNumber>;
    upWeight: z.ZodDefault<z.ZodNumber>;
    shareWeight: z.ZodDefault<z.ZodNumber>;
    hotThreshold: z.ZodDefault<z.ZodNumber>;
    decayHalfLifeHours: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    likeWeight: number;
    commentWeight: number;
    repostWeight: number;
    upWeight: number;
    shareWeight: number;
    hotThreshold: number;
    decayHalfLifeHours: number;
}, {
    likeWeight?: number | undefined;
    commentWeight?: number | undefined;
    repostWeight?: number | undefined;
    upWeight?: number | undefined;
    shareWeight?: number | undefined;
    hotThreshold?: number | undefined;
    decayHalfLifeHours?: number | undefined;
}>;
export type TrendingConfigInput = z.infer<typeof TrendingConfigSchema>;
export interface UserSummary {
    id: string;
    name: string;
    username: string;
    email?: string;
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
