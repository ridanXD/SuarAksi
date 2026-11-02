"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleLike = toggleLike;
exports.toggleUpvote = toggleUpvote;
exports.toggleRepost = toggleRepost;
exports.recordShare = recordShare;
exports.toggleBookmark = toggleBookmark;
exports.getUserBookmarks = getUserBookmarks;
const client_1 = require("@prisma/client");
const database_1 = require("../config/database");
const trending_service_1 = require("./trending.service");
const notification_service_1 = require("./notification.service");
const socket_1 = require("../config/socket");
async function toggleLike(userId, reportId) {
    const report = await database_1.prisma.report.findUnique({
        where: { id: reportId },
        select: { id: true, authorId: true, title: true },
    });
    if (!report) {
        throw new Error("Laporan tidak ditemukan");
    }
    const existing = await database_1.prisma.like.findUnique({
        where: { userId_reportId: { userId, reportId } },
    });
    let hasLiked = false;
    await database_1.prisma.$transaction(async (tx) => {
        if (existing) {
            await tx.like.delete({
                where: { id: existing.id },
            });
            await tx.report.update({
                where: { id: reportId },
                data: { likesCount: { decrement: 1 } },
            });
            hasLiked = false;
        }
        else {
            await tx.like.create({
                data: { userId, reportId },
            });
            await tx.report.update({
                where: { id: reportId },
                data: { likesCount: { increment: 1 } },
            });
            hasLiked = true;
        }
    });
    const updatedReport = await database_1.prisma.report.findUnique({
        where: { id: reportId },
        select: { likesCount: true },
    });
    await (0, trending_service_1.calculateReportHotScore)(reportId);
    (0, socket_1.emitToReport)(reportId, "report_interaction_updated", {
        reportId,
        likesCount: updatedReport?.likesCount || 0,
    });
    if (hasLiked && report.authorId !== userId) {
        const actor = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { name: true },
        });
        await (0, notification_service_1.createNotification)({
            userId: report.authorId,
            actorId: userId,
            type: client_1.NotificationType.LIKE,
            reportId,
            title: "Menyukai Laporan Anda",
            message: `${actor?.name || "Seseorang"} menyukai laporan: "${report.title.substring(0, 50)}..."`,
        });
    }
    return { hasLiked, likesCount: updatedReport?.likesCount || 0 };
}
async function toggleUpvote(userId, reportId) {
    const report = await database_1.prisma.report.findUnique({
        where: { id: reportId },
        select: { id: true, authorId: true, title: true },
    });
    if (!report) {
        throw new Error("Laporan tidak ditemukan");
    }
    const existing = await database_1.prisma.upvote.findUnique({
        where: { userId_reportId: { userId, reportId } },
    });
    let hasUpvoted = false;
    await database_1.prisma.$transaction(async (tx) => {
        if (existing) {
            await tx.upvote.delete({
                where: { id: existing.id },
            });
            await tx.report.update({
                where: { id: reportId },
                data: { upsCount: { decrement: 1 } },
            });
            hasUpvoted = false;
        }
        else {
            await tx.upvote.create({
                data: { userId, reportId },
            });
            await tx.report.update({
                where: { id: reportId },
                data: { upsCount: { increment: 1 } },
            });
            hasUpvoted = true;
        }
    });
    const updatedReport = await database_1.prisma.report.findUnique({
        where: { id: reportId },
        select: { upsCount: true },
    });
    await (0, trending_service_1.calculateReportHotScore)(reportId);
    (0, socket_1.emitToReport)(reportId, "report_interaction_updated", {
        reportId,
        upsCount: updatedReport?.upsCount || 0,
    });
    if (hasUpvoted && report.authorId !== userId) {
        const actor = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { name: true },
        });
        await (0, notification_service_1.createNotification)({
            userId: report.authorId,
            actorId: userId,
            type: client_1.NotificationType.UP,
            reportId,
            title: "Dukungan UP pada Laporan Anda",
            message: `${actor?.name || "Seseorang"} memberikan dukungan UP untuk mendorong laporan Anda agar segera ditangani!`,
        });
    }
    return { hasUpvoted, upsCount: updatedReport?.upsCount || 0 };
}
async function toggleRepost(userId, reportId) {
    const report = await database_1.prisma.report.findUnique({
        where: { id: reportId },
        select: { id: true, authorId: true, title: true },
    });
    if (!report) {
        throw new Error("Laporan tidak ditemukan");
    }
    const existing = await database_1.prisma.repost.findUnique({
        where: { userId_reportId: { userId, reportId } },
    });
    let hasReposted = false;
    await database_1.prisma.$transaction(async (tx) => {
        if (existing) {
            await tx.repost.delete({
                where: { id: existing.id },
            });
            await tx.report.update({
                where: { id: reportId },
                data: { repostsCount: { decrement: 1 } },
            });
            hasReposted = false;
        }
        else {
            await tx.repost.create({
                data: { userId, reportId },
            });
            await tx.report.update({
                where: { id: reportId },
                data: { repostsCount: { increment: 1 } },
            });
            hasReposted = true;
        }
    });
    const updatedReport = await database_1.prisma.report.findUnique({
        where: { id: reportId },
        select: { repostsCount: true },
    });
    await (0, trending_service_1.calculateReportHotScore)(reportId);
    (0, socket_1.emitToReport)(reportId, "report_interaction_updated", {
        reportId,
        repostsCount: updatedReport?.repostsCount || 0,
    });
    if (hasReposted && report.authorId !== userId) {
        const actor = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { name: true },
        });
        await (0, notification_service_1.createNotification)({
            userId: report.authorId,
            actorId: userId,
            type: client_1.NotificationType.REPOST,
            reportId,
            title: "Mempublikasikan Ulang Laporan Anda",
            message: `${actor?.name || "Seseorang"} me-repost laporan Anda ke pengikutnya.`,
        });
    }
    return { hasReposted, repostsCount: updatedReport?.repostsCount || 0 };
}
async function recordShare(reportId, userId, platform = "DIRECT") {
    const report = await database_1.prisma.report.findUnique({
        where: { id: reportId },
    });
    if (!report) {
        throw new Error("Laporan tidak ditemukan");
    }
    const result = await database_1.prisma.$transaction(async (tx) => {
        await tx.share.create({
            data: {
                reportId,
                userId: userId || null,
                platform,
            },
        });
        return tx.report.update({
            where: { id: reportId },
            data: { sharesCount: { increment: 1 } },
            select: { sharesCount: true },
        });
    });
    await (0, trending_service_1.calculateReportHotScore)(reportId);
    (0, socket_1.emitToReport)(reportId, "report_interaction_updated", {
        reportId,
        sharesCount: result.sharesCount,
    });
    return { sharesCount: result.sharesCount };
}
async function toggleBookmark(userId, reportId) {
    const report = await database_1.prisma.report.findUnique({
        where: { id: reportId },
    });
    if (!report) {
        throw new Error("Laporan tidak ditemukan");
    }
    const existing = await database_1.prisma.bookmark.findUnique({
        where: { userId_reportId: { userId, reportId } },
    });
    let hasBookmarked = false;
    if (existing) {
        await database_1.prisma.bookmark.delete({
            where: { id: existing.id },
        });
        hasBookmarked = false;
    }
    else {
        await database_1.prisma.bookmark.create({
            data: { userId, reportId },
        });
        hasBookmarked = true;
    }
    return { hasBookmarked };
}
async function getUserBookmarks(userId, page = 1, limit = 15) {
    const skip = (page - 1) * limit;
    const [bookmarks, total] = await Promise.all([
        database_1.prisma.bookmark.findMany({
            where: { userId },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                report: {
                    include: {
                        category: true,
                        author: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                avatarUrl: true,
                                role: true,
                                isVerified: true,
                            },
                        },
                        media: true,
                    },
                },
            },
        }),
        database_1.prisma.bookmark.count({ where: { userId } }),
    ]);
    const items = bookmarks.map((b) => ({
        ...b.report,
        hasBookmarked: true,
    }));
    return {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}
