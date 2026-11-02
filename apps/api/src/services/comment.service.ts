import { Role, NotificationType, FlagReason } from "@prisma/client";
import { CreateCommentInput, FlagContentInput } from "@suaraksi/shared";
import { prisma } from "../config/database";
import { calculateReportHotScore } from "./trending.service";
import { createNotification } from "./notification.service";
import { emitToReport } from "../config/socket";

export async function getCommentsByReportId(reportId: string) {
  const comments = await prisma.comment.findMany({
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

export async function createComment(
  authorId: string,
  reportId: string,
  input: CreateCommentInput
) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true, authorId: true, title: true },
  });

  if (!report) {
    throw new Error("Laporan tidak ditemukan");
  }

  let parentComment = null;
  if (input.parentId) {
    parentComment = await prisma.comment.findUnique({
      where: { id: input.parentId },
      select: { id: true, authorId: true },
    });
    if (!parentComment) {
      throw new Error("Komentar yang dibalas tidak ditemukan");
    }
  }

  const comment = await prisma.$transaction(async (tx) => {
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

  await calculateReportHotScore(reportId);

  emitToReport(reportId, "new_comment_added", comment);

  const actor = await prisma.user.findUnique({
    where: { id: authorId },
    select: { name: true },
  });

  if (parentComment && parentComment.authorId !== authorId) {
    await createNotification({
      userId: parentComment.authorId,
      actorId: authorId,
      type: NotificationType.REPLY,
      reportId,
      title: "Membalas Komentar Anda",
      message: `${actor?.name || "Seseorang"} membalas komentar Anda pada laporan: "${report.title.substring(0, 40)}..."`,
    });
  } else if (report.authorId !== authorId) {
    await createNotification({
      userId: report.authorId,
      actorId: authorId,
      type: NotificationType.COMMENT,
      reportId,
      title: "Komentar Baru pada Laporan Anda",
      message: `${actor?.name || "Seseorang"} mengomentari laporan Anda: "${report.title.substring(0, 40)}..."`,
    });
  }

  return comment;
}

export async function updateComment(
  commentId: string,
  userId: string,
  content: string
) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error("Komentar tidak ditemukan");
  }

  if (comment.authorId !== userId) {
    throw new Error("Anda tidak memiliki hak untuk mengubah komentar ini");
  }

  const updated = await prisma.comment.update({
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

export async function deleteComment(
  commentId: string,
  userId: string,
  userRole: Role
) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, authorId: true, reportId: true },
  });

  if (!comment) {
    throw new Error("Komentar tidak ditemukan");
  }

  if (comment.authorId !== userId && userRole !== Role.ADMIN) {
    throw new Error("Anda tidak memiliki hak untuk menghapus komentar ini");
  }

  await prisma.$transaction(async (tx) => {
    await tx.comment.delete({ where: { id: commentId } });
    await tx.report.update({
      where: { id: comment.reportId },
      data: { commentsCount: { decrement: 1 } },
    });
  });

  await calculateReportHotScore(comment.reportId);

  return { success: true };
}

export async function flagContent(reporterId: string, input: FlagContentInput) {
  const flag = await prisma.contentReport.create({
    data: {
      reporterId,
      reportId: input.reportId || null,
      commentId: input.commentId || null,
      reason: input.reason as FlagReason,
      description: input.description,
    },
  });

  return flag;
}
