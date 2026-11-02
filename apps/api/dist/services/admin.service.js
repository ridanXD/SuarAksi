"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminOverview = getAdminOverview;
exports.getAdminUsers = getAdminUsers;
exports.updateAdminUser = updateAdminUser;
exports.deleteAdminUser = deleteAdminUser;
exports.getAdminInstances = getAdminInstances;
exports.getAdminAuditLogs = getAdminAuditLogs;
exports.getAdminContentFlags = getAdminContentFlags;
exports.processContentFlag = processContentFlag;
exports.updateAdminTrendingConfig = updateAdminTrendingConfig;
const client_1 = require("@prisma/client");
const database_1 = require("../config/database");
const notification_service_1 = require("./notification.service");
const trending_service_1 = require("./trending.service");
async function getAdminOverview() {
    const [totalUsers, totalInstances, totalReports, pendingReports, inProgressReports, resolvedReports, hotReports, totalLikes, totalComments, totalUpvotes, recentAuditLogs, pendingFlags,] = await Promise.all([
        database_1.prisma.user.count({ where: { role: client_1.Role.USER } }),
        database_1.prisma.user.count({ where: { role: client_1.Role.INSTANCE } }),
        database_1.prisma.report.count(),
        database_1.prisma.report.count({ where: { status: { in: [client_1.ReportStatus.SUBMITTED, client_1.ReportStatus.UNDER_REVIEW] } } }),
        database_1.prisma.report.count({ where: { status: client_1.ReportStatus.IN_PROGRESS } }),
        database_1.prisma.report.count({ where: { status: client_1.ReportStatus.RESOLVED } }),
        database_1.prisma.report.count({ where: { isHot: true } }),
        database_1.prisma.like.count(),
        database_1.prisma.comment.count(),
        database_1.prisma.upvote.count(),
        database_1.prisma.auditLog.findMany({
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
                actor: {
                    select: { id: true, name: true, username: true, role: true },
                },
            },
        }),
        database_1.prisma.contentReport.count({ where: { status: client_1.FlagStatus.PENDING } }),
    ]);
    return {
        totalUsers,
        totalInstances,
        totalReports,
        pendingReports,
        inProgressReports,
        resolvedReports,
        hotReports,
        totalEngagements: totalLikes + totalComments + totalUpvotes,
        pendingFlags,
        recentAuditLogs,
    };
}
async function getAdminUsers(params) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;
    const where = {};
    if (params.role)
        where.role = params.role;
    if (params.isActive !== undefined)
        where.isActive = params.isActive;
    if (params.search) {
        where.OR = [
            { name: { contains: params.search, mode: "insensitive" } },
            { username: { contains: params.search, mode: "insensitive" } },
            { email: { contains: params.search, mode: "insensitive" } },
        ];
    }
    const [users, total] = await Promise.all([
        database_1.prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                instanceProfile: true,
                _count: {
                    select: { reports: true, comments: true },
                },
            },
        }),
        database_1.prisma.user.count({ where }),
    ]);
    return {
        items: users,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}
async function updateAdminUser(adminId, targetUserId, data) {
    const user = await database_1.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user)
        throw new Error("Pengguna tidak ditemukan");
    const updated = await database_1.prisma.$transaction(async (tx) => {
        const u = await tx.user.update({
            where: { id: targetUserId },
            data: {
                role: data.role,
                isActive: data.isActive,
                isVerified: data.isVerified,
            },
            include: { instanceProfile: true },
        });
        if (data.isVerified && u.role === client_1.Role.INSTANCE && u.instanceProfile) {
            await tx.instanceProfile.update({
                where: { userId: targetUserId },
                data: { verifiedAt: new Date() },
            });
            await (0, notification_service_1.createNotification)({
                userId: targetUserId,
                actorId: adminId,
                type: client_1.NotificationType.INSTANCE_VERIFIED,
                title: "Akun Instansi Terverifikasi",
                message: "Akun instansi Anda telah diverifikasi oleh Administrator SuarAksi.",
            });
        }
        await tx.auditLog.create({
            data: {
                actorId: adminId,
                action: "UPDATE_USER",
                resource: "User",
                targetId: targetUserId,
                details: { previous: { role: user.role, isActive: user.isActive }, updated: data },
            },
        });
        return u;
    });
    return updated;
}
async function deleteAdminUser(adminId, targetUserId) {
    const user = await database_1.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user)
        throw new Error("Pengguna tidak ditemukan");
    await database_1.prisma.$transaction(async (tx) => {
        await tx.auditLog.create({
            data: {
                actorId: adminId,
                action: "DELETE_USER",
                resource: "User",
                targetId: targetUserId,
                details: { email: user.email, username: user.username },
            },
        });
        await tx.user.delete({ where: { id: targetUserId } });
    });
    return { success: true };
}
async function getAdminInstances(params) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;
    const where = { role: client_1.Role.INSTANCE };
    if (params.isVerified !== undefined)
        where.isVerified = params.isVerified;
    if (params.search) {
        where.OR = [
            { name: { contains: params.search, mode: "insensitive" } },
            { username: { contains: params.search, mode: "insensitive" } },
            { instanceProfile: { instanceName: { contains: params.search, mode: "insensitive" } } },
            { instanceProfile: { jurisdiction: { contains: params.search, mode: "insensitive" } } },
        ];
    }
    const [instances, total] = await Promise.all([
        database_1.prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                instanceProfile: true,
                _count: {
                    select: { assignedReports: true, officialResponses: true },
                },
            },
        }),
        database_1.prisma.user.count({ where }),
    ]);
    return {
        items: instances,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}
async function getAdminAuditLogs(page = 1, limit = 25) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
        database_1.prisma.auditLog.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                actor: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        role: true,
                    },
                },
            },
        }),
        database_1.prisma.auditLog.count(),
    ]);
    return {
        items: logs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}
async function getAdminContentFlags(status, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = {};
    if (status)
        where.status = status;
    const [items, total] = await Promise.all([
        database_1.prisma.contentReport.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                reporter: {
                    select: { id: true, name: true, username: true },
                },
                report: {
                    select: { id: true, title: true, authorId: true },
                },
                comment: {
                    select: { id: true, content: true, authorId: true },
                },
            },
        }),
        database_1.prisma.contentReport.count({ where }),
    ]);
    return {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}
async function processContentFlag(adminId, flagId, action, actionTakenNotes) {
    const flag = await database_1.prisma.contentReport.findUnique({
        where: { id: flagId },
        include: { report: true, comment: true },
    });
    if (!flag)
        throw new Error("Laporan pelanggaran tidak ditemukan");
    await database_1.prisma.$transaction(async (tx) => {
        if (action === "DELETE_CONTENT") {
            if (flag.reportId) {
                await tx.report.delete({ where: { id: flag.reportId } });
            }
            else if (flag.commentId) {
                await tx.comment.delete({ where: { id: flag.commentId } });
            }
        }
        await tx.contentReport.update({
            where: { id: flagId },
            data: {
                status: action === "DISMISS" ? client_1.FlagStatus.DISMISSED : client_1.FlagStatus.RESOLVED,
                actionTaken: `${action}: ${actionTakenNotes}`,
            },
        });
        await tx.auditLog.create({
            data: {
                actorId: adminId,
                action: "MODERATE_CONTENT",
                resource: "ContentReport",
                targetId: flagId,
                details: { action, actionTakenNotes },
            },
        });
    });
    return { success: true };
}
async function updateAdminTrendingConfig(adminId, input) {
    const updates = [
        { key: "LIKE_WEIGHT", value: input.likeWeight.toString() },
        { key: "COMMENT_WEIGHT", value: input.commentWeight.toString() },
        { key: "REPOST_WEIGHT", value: input.repostWeight.toString() },
        { key: "UP_WEIGHT", value: input.upWeight.toString() },
        { key: "SHARE_WEIGHT", value: input.shareWeight.toString() },
        { key: "HOT_THRESHOLD", value: input.hotThreshold.toString() },
        { key: "DECAY_HALF_LIFE_HOURS", value: input.decayHalfLifeHours.toString() },
    ];
    await database_1.prisma.$transaction(async (tx) => {
        for (const u of updates) {
            await tx.systemSetting.upsert({
                where: { key: u.key },
                create: { key: u.key, value: u.value },
                update: { value: u.value },
            });
        }
        await tx.auditLog.create({
            data: {
                actorId: adminId,
                action: "UPDATE_TRENDING_CONFIG",
                resource: "SystemSetting",
                details: input,
            },
        });
    });
    await (0, trending_service_1.recalculateAllHotScores)();
    return input;
}
