import { NotificationType } from "@prisma/client";
import { prisma } from "../config/database";
import { calculateReportHotScore } from "./trending.service";
import { createNotification } from "./notification.service";
import { emitToReport } from "../config/socket";

export async function toggleLike(userId: string, reportId: string) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true, authorId: true, title: true },
  });

  if (!report) {
    throw new Error("Laporan tidak ditemukan");
  }

  const existing = await prisma.like.findUnique({
    where: { userId_reportId: { userId, reportId } },
  });

  let hasLiked = false;

  await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.like.delete({
        where: { id: existing.id },
      });
      await tx.report.update({
        where: { id: reportId },
        data: { likesCount: { decrement: 1 } },
      });
      hasLiked = false;
    } else {
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

  const updatedReport = await prisma.report.findUnique({
    where: { id: reportId },
    select: { likesCount: true },
  });

  await calculateReportHotScore(reportId);

  emitToReport(reportId, "report_interaction_updated", {
    reportId,
    likesCount: updatedReport?.likesCount || 0,
  });

  if (hasLiked && report.authorId !== userId) {
    const actor = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    await createNotification({
      userId: report.authorId,
      actorId: userId,
      type: NotificationType.LIKE,
      reportId,
      title: "Menyukai Laporan Anda",
      message: `${actor?.name || "Seseorang"} menyukai laporan: "${report.title.substring(0, 50)}..."`,
    });
  }

  return { hasLiked, likesCount: updatedReport?.likesCount || 0 };
}

export async function toggleUpvote(userId: string, reportId: string) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true, authorId: true, title: true },
  });

  if (!report) {
    throw new Error("Laporan tidak ditemukan");
  }

  const existing = await prisma.upvote.findUnique({
    where: { userId_reportId: { userId, reportId } },
  });

  let hasUpvoted = false;

  await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.upvote.delete({
        where: { id: existing.id },
      });
      await tx.report.update({
        where: { id: reportId },
        data: { upsCount: { decrement: 1 } },
      });
      hasUpvoted = false;
    } else {
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

  const updatedReport = await prisma.report.findUnique({
    where: { id: reportId },
    select: { upsCount: true },
  });

  await calculateReportHotScore(reportId);

  emitToReport(reportId, "report_interaction_updated", {
    reportId,
    upsCount: updatedReport?.upsCount || 0,
  });

  if (hasUpvoted && report.authorId !== userId) {
    const actor = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    await createNotification({
      userId: report.authorId,
      actorId: userId,
      type: NotificationType.UP,
      reportId,
      title: "Dukungan UP pada Laporan Anda",
      message: `${actor?.name || "Seseorang"} memberikan dukungan UP untuk mendorong laporan Anda agar segera ditangani!`,
    });
  }

  return { hasUpvoted, upsCount: updatedReport?.upsCount || 0 };
}

export async function toggleRepost(userId: string, reportId: string) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true, authorId: true, title: true },
  });

  if (!report) {
    throw new Error("Laporan tidak ditemukan");
  }

  const existing = await prisma.repost.findUnique({
    where: { userId_reportId: { userId, reportId } },
  });

  let hasReposted = false;

  await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.repost.delete({
        where: { id: existing.id },
      });
      await tx.report.update({
        where: { id: reportId },
        data: { repostsCount: { decrement: 1 } },
      });
      hasReposted = false;
    } else {
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

  const updatedReport = await prisma.report.findUnique({
    where: { id: reportId },
    select: { repostsCount: true },
  });

  await calculateReportHotScore(reportId);

  emitToReport(reportId, "report_interaction_updated", {
    reportId,
    repostsCount: updatedReport?.repostsCount || 0,
  });

  if (hasReposted && report.authorId !== userId) {
    const actor = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    await createNotification({
      userId: report.authorId,
      actorId: userId,
      type: NotificationType.REPOST,
      reportId,
      title: "Mempublikasikan Ulang Laporan Anda",
      message: `${actor?.name || "Seseorang"} me-repost laporan Anda ke pengikutnya.`,
    });
  }

  return { hasReposted, repostsCount: updatedReport?.repostsCount || 0 };
}

export async function recordShare(reportId: string, userId?: string, platform = "DIRECT") {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    throw new Error("Laporan tidak ditemukan");
  }

  const result = await prisma.$transaction(async (tx) => {
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

  await calculateReportHotScore(reportId);

  emitToReport(reportId, "report_interaction_updated", {
    reportId,
    sharesCount: result.sharesCount,
  });

  return { sharesCount: result.sharesCount };
}

export async function toggleBookmark(userId: string, reportId: string) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    throw new Error("Laporan tidak ditemukan");
  }

  const existing = await prisma.bookmark.findUnique({
    where: { userId_reportId: { userId, reportId } },
  });

  let hasBookmarked = false;

  if (existing) {
    await prisma.bookmark.delete({
      where: { id: existing.id },
    });
    hasBookmarked = false;
  } else {
    await prisma.bookmark.create({
      data: { userId, reportId },
    });
    hasBookmarked = true;
  }

  return { hasBookmarked };
}

export async function getUserBookmarks(userId: string, page = 1, limit = 15) {
  const skip = (page - 1) * limit;

  const [bookmarks, total] = await Promise.all([
    prisma.bookmark.findMany({
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
    prisma.bookmark.count({ where: { userId } }),
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
