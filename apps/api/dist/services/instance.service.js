"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstanceReports = getInstanceReports;
exports.updateReportStatus = updateReportStatus;
exports.addOfficialResponse = addOfficialResponse;
exports.getInstanceAnalytics = getInstanceAnalytics;
const client_1 = require("@prisma/client");
const database_1 = require("../config/database");
const notification_service_1 = require("./notification.service");
const socket_1 = require("../config/socket");
async function getInstanceReports(instanceUserId, status, page = 1, limit = 15) {
    const instance = await database_1.prisma.user.findUnique({
        where: { id: instanceUserId },
        include: { instanceProfile: true },
    });
    if (!instance) {
        throw new Error("Instansi tidak ditemukan");
    }
    const skip = (page - 1) * limit;
    const where = {
        OR: [
            { targetInstanceId: instanceUserId },
            ...(instance.instanceProfile?.categoryFocus
                ? [{ category: { name: instance.instanceProfile.categoryFocus } }]
                : []),
        ],
    };
    if (status) {
        where.status = status;
    }
    const [items, total] = await Promise.all([
        database_1.prisma.report.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
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
                statusHistory: {
                    take: 1,
                    orderBy: { createdAt: "desc" },
                },
            },
        }),
        database_1.prisma.report.count({ where }),
    ]);
    return {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}
async function updateReportStatus(reportId, instanceUserId, input) {
    const instanceUser = await database_1.prisma.user.findUnique({
        where: { id: instanceUserId },
        include: { instanceProfile: true },
    });
    if (!instanceUser || (instanceUser.role !== client_1.Role.INSTANCE && instanceUser.role !== client_1.Role.ADMIN)) {
        throw new Error("Hanya instansi berwenang atau administrator yang dapat memperbarui status laporan");
    }
    const report = await database_1.prisma.report.findUnique({
        where: { id: reportId },
        select: { id: true, authorId: true, title: true, status: true },
    });
    if (!report) {
        throw new Error("Laporan tidak ditemukan");
    }
    const previousStatus = report.status;
    const updatedReport = await database_1.prisma.$transaction(async (tx) => {
        const rep = await tx.report.update({
            where: { id: reportId },
            data: {
                status: input.status,
                targetInstanceId: instanceUser.role === client_1.Role.INSTANCE ? instanceUserId : undefined,
            },
            include: {
                category: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
            },
        });
        await tx.reportStatusHistory.create({
            data: {
                reportId,
                status: input.status,
                notes: input.notes,
                evidenceUrls: input.evidenceUrls || [],
                changedById: instanceUserId,
            },
        });
        await tx.auditLog.create({
            data: {
                actorId: instanceUserId,
                action: "UPDATE_REPORT_STATUS",
                resource: "Report",
                targetId: reportId,
                details: {
                    previousStatus,
                    newStatus: input.status,
                    notes: input.notes,
                },
            },
        });
        return rep;
    });
    const statusLabels = {
        SUBMITTED: "Terkirim",
        UNDER_REVIEW: "Sedang Ditinjau",
        VERIFIED: "Terverifikasi",
        IN_PROGRESS: "Sedang Ditangani",
        RESOLVED: "Selesai Ditangani",
        REJECTED: "Ditolak",
    };
    await (0, notification_service_1.createNotification)({
        userId: report.authorId,
        actorId: instanceUserId,
        type: client_1.NotificationType.STATUS_CHANGE,
        reportId,
        title: `Status Laporan: ${statusLabels[input.status]}`,
        message: `${instanceUser.instanceProfile?.instanceName || instanceUser.name} memperbarui status laporan: "${report.title.substring(0, 45)}..." menjadi ${statusLabels[input.status]}.`,
    });
    (0, socket_1.emitToReport)(reportId, "report_status_changed", {
        reportId,
        status: input.status,
        notes: input.notes,
        changedBy: {
            id: instanceUser.id,
            name: instanceUser.instanceProfile?.instanceName || instanceUser.name,
            avatarUrl: instanceUser.avatarUrl,
        },
    });
    (0, socket_1.emitBroadcast)("report_updated", {
        reportId,
        status: input.status,
    });
    return updatedReport;
}
async function addOfficialResponse(reportId, instanceUserId, input) {
    const instanceUser = await database_1.prisma.user.findUnique({
        where: { id: instanceUserId },
        include: { instanceProfile: true },
    });
    if (!instanceUser || (instanceUser.role !== client_1.Role.INSTANCE && instanceUser.role !== client_1.Role.ADMIN)) {
        throw new Error("Hanya instansi berwenang atau administrator yang dapat memberikan tanggapan resmi");
    }
    const report = await database_1.prisma.report.findUnique({
        where: { id: reportId },
        select: { id: true, authorId: true, title: true },
    });
    if (!report) {
        throw new Error("Laporan tidak ditemukan");
    }
    const response = await database_1.prisma.$transaction(async (tx) => {
        const res = await tx.officialResponse.create({
            data: {
                reportId,
                instanceId: instanceUserId,
                content: input.content,
                attachmentUrls: input.attachmentUrls || [],
            },
            include: {
                instance: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatarUrl: true,
                        isVerified: true,
                        instanceProfile: {
                            select: {
                                instanceName: true,
                                jurisdiction: true,
                            },
                        },
                    },
                },
            },
        });
        await tx.auditLog.create({
            data: {
                actorId: instanceUserId,
                action: "ADD_OFFICIAL_RESPONSE",
                resource: "Report",
                targetId: reportId,
                details: { responseId: res.id },
            },
        });
        return res;
    });
    await (0, notification_service_1.createNotification)({
        userId: report.authorId,
        actorId: instanceUserId,
        type: client_1.NotificationType.OFFICIAL_RESPONSE,
        reportId,
        title: "Tanggapan Resmi Pemerintah",
        message: `${instanceUser.instanceProfile?.instanceName || instanceUser.name} telah merilis tanggapan resmi pada laporan Anda.`,
    });
    (0, socket_1.emitToReport)(reportId, "new_official_response", response);
    return response;
}
async function getInstanceAnalytics(instanceUserId) {
    const instance = await database_1.prisma.user.findUnique({
        where: { id: instanceUserId },
        include: { instanceProfile: true },
    });
    if (!instance) {
        throw new Error("Instansi tidak ditemukan");
    }
    const where = {
        OR: [
            { targetInstanceId: instanceUserId },
            ...(instance.instanceProfile?.categoryFocus
                ? [{ category: { name: instance.instanceProfile.categoryFocus } }]
                : []),
        ],
    };
    const [totalReports, submittedCount, underReviewCount, inProgressCount, resolvedCount, rejectedCount, officialResponsesCount,] = await Promise.all([
        database_1.prisma.report.count({ where }),
        database_1.prisma.report.count({ where: { ...where, status: client_1.ReportStatus.SUBMITTED } }),
        database_1.prisma.report.count({ where: { ...where, status: client_1.ReportStatus.UNDER_REVIEW } }),
        database_1.prisma.report.count({ where: { ...where, status: client_1.ReportStatus.IN_PROGRESS } }),
        database_1.prisma.report.count({ where: { ...where, status: client_1.ReportStatus.RESOLVED } }),
        database_1.prisma.report.count({ where: { ...where, status: client_1.ReportStatus.REJECTED } }),
        database_1.prisma.officialResponse.count({ where: { instanceId: instanceUserId } }),
    ]);
    const resolutionRate = totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0;
    return {
        totalReports,
        submittedCount,
        underReviewCount,
        inProgressCount,
        resolvedCount,
        rejectedCount,
        officialResponsesCount,
        resolutionRate,
    };
}
