import { Prisma, ReportStatus, NotificationType, Role } from "@prisma/client";
import { CreateReportInput, UpdateReportInput } from "@suaraksi/shared";
import { prisma } from "../config/database";
import { calculateReportHotScore } from "./trending.service";
import { createNotification } from "./notification.service";
import { emitBroadcast } from "../config/socket";

interface ReportFilterParams {
  tab?: "for-you" | "following" | "latest" | "trending" | "most-supported";
  categoryId?: string;
  status?: ReportStatus;
  search?: string;
  location?: string;
  authorId?: string;
  targetInstanceId?: string;
  page?: number;
  limit?: number;
  currentUserId?: string;
}

export async function getReports(params: ReportFilterParams) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 15));
  const skip = (page - 1) * limit;

  const where: Prisma.ReportWhereInput = {};

  if (params.categoryId) {
    where.categoryId = params.categoryId;
  }

  if (params.status) {
    where.status = params.status;
  }

  if (params.authorId) {
    where.authorId = params.authorId;
  }

  if (params.targetInstanceId) {
    where.targetInstanceId = params.targetInstanceId;
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
      { address: { contains: params.search, mode: "insensitive" } },
    ];
  }

  if (params.location) {
    where.address = { contains: params.location, mode: "insensitive" };
  }

  if (params.tab === "following" && params.currentUserId) {
    const following = await prisma.follow.findMany({
      where: { followerId: params.currentUserId },
      select: { followingId: true },
    });
    const followingIds = following.map((f) => f.followingId);
    where.authorId = { in: followingIds };
  }

  let orderBy: Prisma.ReportOrderByWithRelationInput = { createdAt: "desc" };
  if (params.tab === "trending") {
    orderBy = { hotScore: "desc" };
  } else if (params.tab === "most-supported") {
    orderBy = { upsCount: "desc" };
  } else if (params.tab === "for-you") {
    orderBy = { hotScore: "desc" };
  }

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      skip,
      take: limit,
      orderBy,
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
            instanceProfile: {
              select: {
                instanceName: true,
                jurisdiction: true,
              },
            },
          },
        },
        targetInstance: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            role: true,
            isVerified: true,
            instanceProfile: {
              select: {
                instanceName: true,
                jurisdiction: true,
              },
            },
          },
        },
        media: true,
        officialResponses: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: {
            instance: {
              select: {
                id: true,
                name: true,
                username: true,
                avatarUrl: true,
                isVerified: true,
                instanceProfile: {
                  select: { instanceName: true },
                },
              },
            },
          },
        },
      },
    }),
    prisma.report.count({ where }),
  ]);

  let userInteractions: {
    likedReportIds: Set<string>;
    upvotedReportIds: Set<string>;
    repostedReportIds: Set<string>;
    bookmarkedReportIds: Set<string>;
  } = {
    likedReportIds: new Set(),
    upvotedReportIds: new Set(),
    repostedReportIds: new Set(),
    bookmarkedReportIds: new Set(),
  };

  if (params.currentUserId && reports.length > 0) {
    const reportIds = reports.map((r) => r.id);
    const [likes, upvotes, reposts, bookmarks] = await Promise.all([
      prisma.like.findMany({
        where: { userId: params.currentUserId, reportId: { in: reportIds } },
        select: { reportId: true },
      }),
      prisma.upvote.findMany({
        where: { userId: params.currentUserId, reportId: { in: reportIds } },
        select: { reportId: true },
      }),
      prisma.repost.findMany({
        where: { userId: params.currentUserId, reportId: { in: reportIds } },
        select: { reportId: true },
      }),
      prisma.bookmark.findMany({
        where: { userId: params.currentUserId, reportId: { in: reportIds } },
        select: { reportId: true },
      }),
    ]);

    userInteractions = {
      likedReportIds: new Set(likes.map((l) => l.reportId)),
      upvotedReportIds: new Set(upvotes.map((u) => u.reportId)),
      repostedReportIds: new Set(reposts.map((r) => r.reportId)),
      bookmarkedReportIds: new Set(bookmarks.map((b) => b.reportId)),
    };
  }

  const items = reports.map((r) => ({
    ...r,
    hasLiked: userInteractions.likedReportIds.has(r.id),
    hasUpvoted: userInteractions.upvotedReportIds.has(r.id),
    hasReposted: userInteractions.repostedReportIds.has(r.id),
    hasBookmarked: userInteractions.bookmarkedReportIds.has(r.id),
  }));

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getReportById(reportId: string, currentUserId?: string) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
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
          bio: true,
          instanceProfile: {
            select: {
              instanceName: true,
              jurisdiction: true,
            },
          },
        },
      },
      targetInstance: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
          role: true,
          isVerified: true,
          instanceProfile: {
            select: {
              instanceName: true,
              jurisdiction: true,
            },
          },
        },
      },
      media: true,
      statusHistory: {
        orderBy: { createdAt: "desc" },
        include: {
          changedBy: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true,
              avatarUrl: true,
              isVerified: true,
              instanceProfile: {
                select: { instanceName: true },
              },
            },
          },
        },
      },
      officialResponses: {
        orderBy: { createdAt: "desc" },
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
                  websiteUrl: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!report) {
    throw new Error("Laporan tidak ditemukan");
  }

  let hasLiked = false;
  let hasUpvoted = false;
  let hasReposted = false;
  let hasBookmarked = false;

  if (currentUserId) {
    const [like, upvote, repost, bookmark] = await Promise.all([
      prisma.like.findUnique({
        where: { userId_reportId: { userId: currentUserId, reportId } },
      }),
      prisma.upvote.findUnique({
        where: { userId_reportId: { userId: currentUserId, reportId } },
      }),
      prisma.repost.findUnique({
        where: { userId_reportId: { userId: currentUserId, reportId } },
      }),
      prisma.bookmark.findUnique({
        where: { userId_reportId: { userId: currentUserId, reportId } },
      }),
    ]);

    hasLiked = !!like;
    hasUpvoted = !!upvote;
    hasReposted = !!repost;
    hasBookmarked = !!bookmark;
  }

  return {
    ...report,
    hasLiked,
    hasUpvoted,
    hasReposted,
    hasBookmarked,
  };
}

export async function createReport(authorId: string, input: CreateReportInput) {
  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
  });
  if (!category) {
    throw new Error("Kategori laporan tidak valid");
  }

  const report = await prisma.$transaction(async (tx) => {
    const newReport = await tx.report.create({
      data: {
        title: input.title,
        description: input.description,
        categoryId: input.categoryId,
        address: input.address,
        latitude: input.latitude,
        longitude: input.longitude,
        authorId,
        targetInstanceId: input.targetInstanceId || null,
        status: ReportStatus.SUBMITTED,
        media: {
          create: input.mediaUrls?.map((url) => ({ url, type: "IMAGE" })) || [],
        },
      },
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
    });

    await tx.reportStatusHistory.create({
      data: {
        reportId: newReport.id,
        status: ReportStatus.SUBMITTED,
        notes: "Laporan berhasil dipublikasikan oleh masyarakat ke platform SuarAksi.",
        changedById: authorId,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: authorId,
        action: "CREATE_REPORT",
        resource: "Report",
        targetId: newReport.id,
        details: { title: input.title, category: category.name },
      },
    });

    return newReport;
  });

  if (input.targetInstanceId) {
    await createNotification({
      userId: input.targetInstanceId,
      actorId: authorId,
      type: NotificationType.STATUS_CHANGE,
      reportId: report.id,
      title: "Laporan Baru Ditujukan ke Instansi Anda",
      message: `Terdapat laporan warga baru: "${report.title.substring(0, 60)}..."`,
    });
  }

  await calculateReportHotScore(report.id);
  emitBroadcast("new_report_created", report);

  return report;
}

export async function updateReport(
  reportId: string,
  userId: string,
  userRole: Role,
  input: UpdateReportInput
) {
  const existing = await prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!existing) {
    throw new Error("Laporan tidak ditemukan");
  }

  if (existing.authorId !== userId && userRole !== Role.ADMIN) {
    throw new Error("Anda tidak memiliki hak untuk mengubah laporan ini");
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (input.mediaUrls) {
      await tx.reportMedia.deleteMany({ where: { reportId } });
      await tx.reportMedia.createMany({
        data: input.mediaUrls.map((url) => ({ reportId, url, type: "IMAGE" })),
      });
    }

    return tx.report.update({
      where: { id: reportId },
      data: {
        title: input.title,
        description: input.description,
        categoryId: input.categoryId,
        address: input.address,
        latitude: input.latitude,
        longitude: input.longitude,
      },
      include: {
        category: true,
        media: true,
        author: {
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
  });

  return updated;
}

export async function deleteReport(reportId: string, userId: string, userRole: Role) {
  const existing = await prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!existing) {
    throw new Error("Laporan tidak ditemukan");
  }

  if (existing.authorId !== userId && userRole !== Role.ADMIN) {
    throw new Error("Anda tidak memiliki izin untuk menghapus laporan ini");
  }

  await prisma.$transaction(async (tx) => {
    await tx.auditLog.create({
      data: {
        actorId: userId,
        action: "DELETE_REPORT",
        resource: "Report",
        targetId: reportId,
        details: { title: existing.title },
      },
    });

    await tx.report.delete({ where: { id: reportId } });
  });

  return { success: true };
}
