"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommentsByReportId = getCommentsByReportId;
exports.createComment = createComment;
exports.updateComment = updateComment;
exports.deleteComment = deleteComment;
exports.flagContent = flagContent;
const client_1 = require("@prisma/client");
const database_1 = require("../config/database");
const trending_service_1 = require("./trending.service");
const notification_service_1 = require("./notification.service");
const socket_1 = require("../config/socket");
async function getCommentsByReportId(reportId) {
    const comments = await database_1.prisma.comment.findMany({
        where: { reportId, parentId: null },
        orderBy: { createdAt: "asc" },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    avatarUrl: true,
                    role: true,
                    isVerified: true,
                    instanceProfile: {
                        select: { instanceName: true },
                    },
                },
            },
            replies: {
                orderBy: { createdAt: "asc" },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            avatarUrl: true,
                            role: true,
                            isVerified: true,
                            instanceProfile: {
                                select: { instanceName: true },
                            },
                        },
                    },
                },
            },
        },
    });
    return comments;
}
async function createComment(authorId, reportId, input) {
    const report = await database_1.prisma.report.findUnique({
        where: { id: reportId },
        select: { id: true, authorId: true, title: true },
    });
    if (!report) {
        throw new Error("Laporan tidak ditemukan");
    }
    let parentComment = null;
    if (input.parentId) {
        parentComment = await database_1.prisma.comment.findUnique({
            where: { id: input.parentId },
            select: { id: true, authorId: true },
        });
        if (!parentComment) {
            throw new Error("Komentar yang dibalas tidak ditemukan");
        }
    }
    const comment = await database_1.prisma.$transaction(async (tx) => {
        const newComment = await tx.comment.create({
            data: {
                reportId,
                authorId,
                content: input.content,
                parentId: input.parentId || null,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatarUrl: true,
                        role: true,
                        isVerified: true,
                        instanceProfile: {
                            select: { instanceName: true },
                        },
                    },
                },
            },
        });
        await tx.report.update({
            where: { id: reportId },
            data: { commentsCount: { increment: 1 } },
        });
        return newComment;
    });
    await (0, trending_service_1.calculateReportHotScore)(reportId);
    (0, socket_1.emitToReport)(reportId, "new_comment_added", comment);
    const actor = await database_1.prisma.user.findUnique({
        where: { id: authorId },
        select: { name: true },
    });
    if (parentComment && parentComment.authorId !== authorId) {
        await (0, notification_service_1.createNotification)({
            userId: parentComment.authorId,
            actorId: authorId,
            type: client_1.NotificationType.REPLY,
            reportId,
            title: "Membalas Komentar Anda",
            message: `${actor?.name || "Seseorang"} membalas komentar Anda pada laporan: "${report.title.substring(0, 40)}..."`,
        });
    }
    else if (report.authorId !== authorId) {
        await (0, notification_service_1.createNotification)({
            userId: report.authorId,
            actorId: authorId,
            type: client_1.NotificationType.COMMENT,
            reportId,
            title: "Komentar Baru pada Laporan Anda",
            message: `${actor?.name || "Seseorang"} mengomentari laporan Anda: "${report.title.substring(0, 40)}..."`,
        });
    }
    return comment;
}
async function updateComment(commentId, userId, content) {
    const comment = await database_1.prisma.comment.findUnique({
        where: { id: commentId },
    });
    if (!comment) {
        throw new Error("Komentar tidak ditemukan");
    }
    if (comment.authorId !== userId) {
        throw new Error("Anda tidak memiliki hak untuk mengubah komentar ini");
    }
    const updated = await database_1.prisma.comment.update({
        where: { id: commentId },
        data: { content },
        include: {
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
        },
    });
    return updated;
}
async function deleteComment(commentId, userId, userRole) {
    const comment = await database_1.prisma.comment.findUnique({
        where: { id: commentId },
        select: { id: true, authorId: true, reportId: true },
    });
    if (!comment) {
        throw new Error("Komentar tidak ditemukan");
    }
    if (comment.authorId !== userId && userRole !== client_1.Role.ADMIN) {
        throw new Error("Anda tidak memiliki hak untuk menghapus komentar ini");
    }
    await database_1.prisma.$transaction(async (tx) => {
        await tx.comment.delete({ where: { id: commentId } });
        await tx.report.update({
            where: { id: comment.reportId },
            data: { commentsCount: { decrement: 1 } },
        });
    });
    await (0, trending_service_1.calculateReportHotScore)(comment.reportId);
    return { success: true };
}
async function flagContent(reporterId, input) {
    const flag = await database_1.prisma.contentReport.create({
        data: {
            reporterId,
            reportId: input.reportId || null,
            commentId: input.commentId || null,
            reason: input.reason,
            description: input.description,
        },
    });
    return flag;
}
