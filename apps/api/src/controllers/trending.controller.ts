import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../config/database";

export async function getHotReports(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    const reports = await prisma.report.findMany({
      where: { isHot: true },
      orderBy: { hotScore: "desc" },
      take: limit,
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        media: true,
      },
    });

    res.status(200).json({ success: true, data: reports });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getTrendingReports(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const reports = await prisma.report.findMany({
      orderBy: { hotScore: "desc" },
      take: limit,
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        media: true,
      },
    });

    res.status(200).json({ success: true, data: reports });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMostSupported(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const reports = await prisma.report.findMany({
      orderBy: { upsCount: "desc" },
      take: limit,
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        media: true,
      },
    });

    res.status(200).json({ success: true, data: reports });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMostDiscussed(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const reports = await prisma.report.findMany({
      orderBy: { commentsCount: "desc" },
      take: limit,
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        media: true,
      },
    });

    res.status(200).json({ success: true, data: reports });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getPopularCategories(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { reports: true },
        },
      },
      orderBy: {
        reports: {
          _count: "desc",
        },
      },
      take: 6,
    });

    res.status(200).json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getPublicStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const [totalReports, resolvedReports, totalUsers, verifiedInstances] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { status: "RESOLVED" } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: "INSTANCE", isVerified: true } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalReports,
        resolvedReports,
        totalUsers,
        verifiedInstances,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
