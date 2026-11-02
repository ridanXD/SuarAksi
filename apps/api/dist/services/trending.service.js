"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrendingConfig = getTrendingConfig;
exports.calculateReportHotScore = calculateReportHotScore;
exports.recalculateAllHotScores = recalculateAllHotScores;
const database_1 = require("../config/database");
const socket_1 = require("../config/socket");
const DEFAULT_WEIGHTS = {
    likeWeight: 1,
    commentWeight: 2,
    repostWeight: 3,
    upWeight: 4,
    shareWeight: 2,
    hotThreshold: 30,
    decayHalfLifeHours: 24,
};
async function getTrendingConfig() {
    const settings = await database_1.prisma.systemSetting.findMany({
        where: {
            key: {
                in: [
                    "LIKE_WEIGHT",
                    "COMMENT_WEIGHT",
                    "REPOST_WEIGHT",
                    "UP_WEIGHT",
                    "SHARE_WEIGHT",
                    "HOT_THRESHOLD",
                    "DECAY_HALF_LIFE_HOURS",
                ],
            },
        },
    });
    const config = { ...DEFAULT_WEIGHTS };
    for (const s of settings) {
        const val = parseFloat(s.value);
        if (!isNaN(val)) {
            if (s.key === "LIKE_WEIGHT")
                config.likeWeight = val;
            if (s.key === "COMMENT_WEIGHT")
                config.commentWeight = val;
            if (s.key === "REPOST_WEIGHT")
                config.repostWeight = val;
            if (s.key === "UP_WEIGHT")
                config.upWeight = val;
            if (s.key === "SHARE_WEIGHT")
                config.shareWeight = val;
            if (s.key === "HOT_THRESHOLD")
                config.hotThreshold = val;
            if (s.key === "DECAY_HALF_LIFE_HOURS")
                config.decayHalfLifeHours = val;
        }
    }
    return config;
}
async function calculateReportHotScore(reportId) {
    const report = await database_1.prisma.report.findUnique({
        where: { id: reportId },
        select: {
            id: true,
            createdAt: true,
            likesCount: true,
            commentsCount: true,
            repostsCount: true,
            upsCount: true,
            sharesCount: true,
            isHot: true,
        },
    });
    if (!report)
        return 0;
    const config = await getTrendingConfig();
    const baseScore = report.likesCount * config.likeWeight +
        report.commentsCount * config.commentWeight +
        report.repostsCount * config.repostWeight +
        report.upsCount * config.upWeight +
        report.sharesCount * config.shareWeight;
    const ageInHours = Math.max(0.1, (Date.now() - report.createdAt.getTime()) / (1000 * 60 * 60));
    const decayFactor = Math.pow(0.5, ageInHours / config.decayHalfLifeHours);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentInteractions = await database_1.prisma.upvote.count({
        where: {
            reportId,
            createdAt: { gte: oneDayAgo },
        },
    });
    const growthBonus = recentInteractions * 2.5;
    const hotScore = Math.max(0, (baseScore + growthBonus) * decayFactor);
    const isHot = hotScore >= config.hotThreshold;
    const updatedReport = await database_1.prisma.report.update({
        where: { id: reportId },
        data: {
            hotScore,
            isHot,
            hotAt: isHot ? (report.isHot ? undefined : new Date()) : null,
        },
    });
    (0, socket_1.emitToReport)(reportId, "report_score_updated", {
        reportId,
        hotScore,
        isHot,
    });
    if (isHot && !report.isHot) {
        (0, socket_1.emitBroadcast)("report_became_hot", {
            reportId: report.id,
            title: reportId,
        });
    }
    return hotScore;
}
async function recalculateAllHotScores() {
    const activeReports = await database_1.prisma.report.findMany({
        select: { id: true },
        take: 100,
        orderBy: { createdAt: "desc" },
    });
    for (const r of activeReports) {
        await calculateReportHotScore(r.id);
    }
}
