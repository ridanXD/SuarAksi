import { Role, ReportStatus, FlagStatus, NotificationType } from "@prisma/client";
import { TrendingConfigInput } from "@suaraksi/shared";
import { prisma } from "../config/database";
import { createNotification } from "./notification.service";
import { recalculateAllHotScores } from "./trending.service";

export async function getAdminOverview() {
  const [
    totalUsers,
    totalInstances,
    totalReports,
    pendingReports,
    inProgressReports,
    resolvedReports,
    hotReports,
    totalLikes,
    totalComments,
    totalUpvotes,
    recentAuditLogs,
    pendingFlags,
  ] = await Promise.all([
    prisma.user.count({ where: { role: Role.USER } }),
    prisma.user.count({ where: { role: Role.INSTANCE } }),
    prisma.report.count(),
    prisma.report.count({ where: { status: { in: [ReportStatus.SUBMITTED, ReportStatus.UNDER_REVIEW] } } }),
    prisma.report.count({ where: { status: ReportStatus.IN_PROGRESS } }),
    prisma.report.count({ where: { status: ReportStatus.RESOLVED } }),
    prisma.report.count({ where: { isHot: true } }),
    prisma.like.count(),
    prisma.comment.count(),
    prisma.upvote.count(),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        actor: {
          select: { id: true, name: true, username: true, role: true },
        },
      },
    }),
    prisma.contentReport.count({ where: { status: FlagStatus.PENDING } }),
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

export async function getAdminUsers(params: {
  role?: Role;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.role) where.role = params.role;
  if (params.isActive !== undefined) where.isActive = params.isActive;
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { username: { contains: params.search, mode: "insensitive" } },
      { email: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
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
    prisma.user.count({ where }),
  ]);

  return {
    items: users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateAdminUser(
  adminId: string,
  targetUserId: string,
  data: {
    role?: Role;
    isActive?: boolean;
    isVerified?: boolean;
  }
) {
  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) throw new Error("Pengguna tidak ditemukan");

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.user.update({
      where: { id: targetUserId },
      data: {
        role: data.role,
        isActive: data.isActive,
        isVerified: data.isVerified,
      },
      include: { instanceProfile: true },
    });

    if (data.isVerified && u.role === Role.INSTANCE && u.instanceProfile) {
      await tx.instanceProfile.update({
        where: { userId: targetUserId },
        data: { verifiedAt: new Date() },
      });

      await createNotification({
        userId: targetUserId,
        actorId: adminId,
        type: NotificationType.INSTANCE_VERIFIED,
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

export async function deleteAdminUser(adminId: string, targetUserId: string) {
  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) throw new Error("Pengguna tidak ditemukan");

  await prisma.$transaction(async (tx) => {
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

export async function getAdminInstances(params: {
  isVerified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  const where: any = { role: Role.INSTANCE };
  if (params.isVerified !== undefined) where.isVerified = params.isVerified;
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { username: { contains: params.search, mode: "insensitive" } },
      { instanceProfile: { instanceName: { contains: params.search, mode: "insensitive" } } },
      { instanceProfile: { jurisdiction: { contains: params.search, mode: "insensitive" } } },
    ];
  }

  const [instances, total] = await Promise.all([
    prisma.user.findMany({
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
    prisma.user.count({ where }),
  ]);

  return {
    items: instances,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAdminAuditLogs(page = 1, limit = 25) {
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
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
    prisma.auditLog.count(),
  ]);

  return {
    items: logs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAdminContentFlags(status?: FlagStatus, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const where: any = {};
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    prisma.contentReport.findMany({
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
    prisma.contentReport.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function processContentFlag(
  adminId: string,
  flagId: string,
  action: "DISMISS" | "DELETE_CONTENT" | "BAN_USER",
  actionTakenNotes: string
) {
  const flag = await prisma.contentReport.findUnique({
    where: { id: flagId },
    include: { report: true, comment: true },
  });

  if (!flag) throw new Error("Laporan pelanggaran tidak ditemukan");

  await prisma.$transaction(async (tx) => {
    if (action === "DELETE_CONTENT") {
      if (flag.reportId) {
        await tx.report.delete({ where: { id: flag.reportId } });
      } else if (flag.commentId) {
        await tx.comment.delete({ where: { id: flag.commentId } });
      }
    }

    await tx.contentReport.update({
      where: { id: flagId },
      data: {
        status: action === "DISMISS" ? FlagStatus.DISMISSED : FlagStatus.RESOLVED,
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

export async function updateAdminTrendingConfig(adminId: string, input: TrendingConfigInput) {
  const updates = [
    { key: "LIKE_WEIGHT", value: input.likeWeight.toString() },
    { key: "COMMENT_WEIGHT", value: input.commentWeight.toString() },
    { key: "REPOST_WEIGHT", value: input.repostWeight.toString() },
    { key: "UP_WEIGHT", value: input.upWeight.toString() },
    { key: "SHARE_WEIGHT", value: input.shareWeight.toString() },
    { key: "HOT_THRESHOLD", value: input.hotThreshold.toString() },
    { key: "DECAY_HALF_LIFE_HOURS", value: input.decayHalfLifeHours.toString() },
  ];

  await prisma.$transaction(async (tx) => {
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

  await recalculateAllHotScores();

  return input;
}
