import { NotificationType } from "@prisma/client";
import { prisma } from "../config/database";
import { emitToUser } from "../config/socket";

interface CreateNotificationParams {
  userId: string;
  actorId?: string;
  type: NotificationType;
  reportId?: string;
  title: string;
  message: string;
}

export async function createNotification(params: CreateNotificationParams) {
  if (params.actorId && params.actorId === params.userId) {
    return null;
  }

  const notification = await prisma.notification.create({
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

  emitToUser(params.userId, "new_notification", notification);
  return notification;
}

export async function getUserNotifications(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
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
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    items,
    total,
    unreadCount,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function markNotificationAsRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
