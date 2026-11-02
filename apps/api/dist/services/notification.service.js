"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
exports.getUserNotifications = getUserNotifications;
exports.markNotificationAsRead = markNotificationAsRead;
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
const database_1 = require("../config/database");
const socket_1 = require("../config/socket");
async function createNotification(params) {
    if (params.actorId && params.actorId === params.userId) {
        return null;
    }
    const notification = await database_1.prisma.notification.create({
        data: {
            userId: params.userId,
            actorId: params.actorId,
            type: params.type,
            reportId: params.reportId,
            title: params.title,
            message: params.message,
        },
        include: {
            actor: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    avatarUrl: true,
                    role: true,
                },
            },
        },
    });
    (0, socket_1.emitToUser)(params.userId, "new_notification", notification);
    return notification;
}
async function getUserNotifications(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total, unreadCount] = await Promise.all([
        database_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            include: {
                actor: {
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
        }),
        database_1.prisma.notification.count({ where: { userId } }),
        database_1.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return {
        items,
        total,
        unreadCount,
        page,
        totalPages: Math.ceil(total / limit),
    };
}
async function markNotificationAsRead(id, userId) {
    return database_1.prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true },
    });
}
async function markAllNotificationsAsRead(userId) {
    return database_1.prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
    });
}
