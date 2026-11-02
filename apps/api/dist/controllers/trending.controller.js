"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHotReports = getHotReports;
exports.getTrendingReports = getTrendingReports;
exports.getMostSupported = getMostSupported;
exports.getMostDiscussed = getMostDiscussed;
exports.getPopularCategories = getPopularCategories;
exports.getPublicStats = getPublicStats;
const database_1 = require("../config/database");
async function getHotReports(req, res, next) {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
        const reports = await database_1.prisma.report.findMany({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function getTrendingReports(req, res, next) {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const reports = await database_1.prisma.report.findMany({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function getMostSupported(req, res, next) {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const reports = await database_1.prisma.report.findMany({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function getMostDiscussed(req, res, next) {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const reports = await database_1.prisma.report.findMany({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function getPopularCategories(req, res, next) {
    try {
        const categories = await database_1.prisma.category.findMany({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function getPublicStats(req, res, next) {
    try {
        const [totalReports, resolvedReports, totalUsers, verifiedInstances] = await Promise.all([
            database_1.prisma.report.count(),
            database_1.prisma.report.count({ where: { status: "RESOLVED" } }),
            database_1.prisma.user.count(),
            database_1.prisma.user.count({ where: { role: "INSTANCE", isVerified: true } }),
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
