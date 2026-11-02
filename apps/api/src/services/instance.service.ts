import { ReportStatus, NotificationType, Role } from "@prisma/client";
import { UpdateReportStatusInput, CreateOfficialResponseInput } from "@suaraksi/shared";
import { prisma } from "../config/database";
import { createNotification } from "./notification.service";
import { emitToReport, emitBroadcast } from "../config/socket";

export async function getInstanceReports(instanceUserId: string, status?: ReportStatus, page = 1, limit = 15) {
  const instance = await prisma.user.findUnique({
    where: { id: instanceUserId },
    include: { instanceProfile: true },
  });

  if (!instance) {
    throw new Error("Instansi tidak ditemukan");
  }

  const skip = (page - 1) * limit;

  const where: any = {
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
    prisma.report.findMany({
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
    prisma.report.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateReportStatus(
  reportId: string,
  instanceUserId: string,
  input: UpdateReportStatusInput
) {
  const instanceUser = await prisma.user.findUnique({
    where: { id: instanceUserId },
    include: { instanceProfile: true },
  });

  if (!instanceUser || (instanceUser.role !== Role.INSTANCE && instanceUser.role !== Role.ADMIN)) {
    throw new Error("Hanya instansi berwenang atau administrator yang dapat memperbarui status laporan");
  }

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true, authorId: true, title: true, status: true },
  });

  if (!report) {
    throw new Error("Laporan tidak ditemukan");
  }

  const previousStatus = report.status;

  const updatedReport = await prisma.$transaction(async (tx) => {
    const rep = await tx.report.update({
      where: { id: reportId },
      data: {
        status: input.status,
        targetInstanceId: instanceUser.role === Role.INSTANCE ? instanceUserId : undefined,
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

  const statusLabels: Record<ReportStatus, string> = {
    SUBMITTED: "Terkirim",
    UNDER_REVIEW: "Sedang Ditinjau",
    VERIFIED: "Terverifikasi",
    IN_PROGRESS: "Sedang Ditangani",
    RESOLVED: "Selesai Ditangani",
    REJECTED: "Ditolak",
  };

  await createNotification({
    userId: report.authorId,
    actorId: instanceUserId,
    type: NotificationType.STATUS_CHANGE,
    reportId,
    title: `Status Laporan: ${statusLabels[input.status]}`,
    message: `${instanceUser.instanceProfile?.instanceName || instanceUser.name} memperbarui status laporan: "${report.title.substring(0, 45)}..." menjadi ${statusLabels[input.status]}.`,
  });

  emitToReport(reportId, "report_status_changed", {
    reportId,
    status: input.status,
    notes: input.notes,
    changedBy: {
      id: instanceUser.id,
      name: instanceUser.instanceProfile?.instanceName || instanceUser.name,
      avatarUrl: instanceUser.avatarUrl,
    },
  });

  emitBroadcast("report_updated", {
    reportId,
    status: input.status,
  });

  return updatedReport;
}

export async function addOfficialResponse(
  reportId: string,
  instanceUserId: string,
  input: CreateOfficialResponseInput
) {
  const instanceUser = await prisma.user.findUnique({
    where: { id: instanceUserId },
    include: { instanceProfile: true },
  });

  if (!instanceUser || (instanceUser.role !== Role.INSTANCE && instanceUser.role !== Role.ADMIN)) {
    throw new Error("Hanya instansi berwenang atau administrator yang dapat memberikan tanggapan resmi");
  }

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true, authorId: true, title: true },
  });

  if (!report) {
    throw new Error("Laporan tidak ditemukan");
  }

  const response = await prisma.$transaction(async (tx) => {
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

  await createNotification({
    userId: report.authorId,
    actorId: instanceUserId,
    type: NotificationType.OFFICIAL_RESPONSE,
    reportId,
    title: "Tanggapan Resmi Pemerintah",
    message: `${instanceUser.instanceProfile?.instanceName || instanceUser.name} telah merilis tanggapan resmi pada laporan Anda.`,
  });

  emitToReport(reportId, "new_official_response", response);

  return response;
}

export async function getInstanceAnalytics(instanceUserId: string) {
  const instance = await prisma.user.findUnique({
    where: { id: instanceUserId },
    include: { instanceProfile: true },
  });

  if (!instance) {
    throw new Error("Instansi tidak ditemukan");
  }

  const where: any = {
    OR: [
      { targetInstanceId: instanceUserId },
      ...(instance.instanceProfile?.categoryFocus
        ? [{ category: { name: instance.instanceProfile.categoryFocus } }]
        : []),
    ],
  };

  const [
    totalReports,
    submittedCount,
    underReviewCount,
    inProgressCount,
    resolvedCount,
    rejectedCount,
    officialResponsesCount,
  ] = await Promise.all([
    prisma.report.count({ where }),
    prisma.report.count({ where: { ...where, status: ReportStatus.SUBMITTED } }),
    prisma.report.count({ where: { ...where, status: ReportStatus.UNDER_REVIEW } }),
    prisma.report.count({ where: { ...where, status: ReportStatus.IN_PROGRESS } }),
    prisma.report.count({ where: { ...where, status: ReportStatus.RESOLVED } }),
    prisma.report.count({ where: { ...where, status: ReportStatus.REJECTED } }),
    prisma.officialResponse.count({ where: { instanceId: instanceUserId } }),
  ]);

  const resolutionRate =
    totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0;

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
