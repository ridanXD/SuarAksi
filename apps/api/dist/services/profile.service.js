"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfileByUsername = getProfileByUsername;
exports.toggleFollow = toggleFollow;
exports.getUserActivity = getUserActivity;
const database_1 = require("../config/database");
async function getProfileByUsername(username, currentUserId) {
    const user = await database_1.prisma.user.findUnique({
        where: { username },
        include: {
            instanceProfile: true,
            _count: {
                select: {
                    reports: true,
                    followers: true,
                    following: true,
                },
            },
        },
    });
    if (!user) {
        throw new Error("Pengguna tidak ditemukan");
    }
    const reports = await database_1.prisma.report.findMany({
        where: { authorId: user.id },
        select: { upsCount: true },
    });
    const totalUpsReceived = reports.reduce((acc, r) => acc + r.upsCount, 0);
    let isFollowing = false;
    if (currentUserId && currentUserId !== user.id) {
        const follow = await database_1.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: user.id,
                },
            },
        });
        isFollowing = !!follow;
    }
    return {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        phone: user.phone,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        instanceProfile: user.instanceProfile,
        stats: {
            reportsCount: user._count.reports,
            followersCount: user._count.followers,
            followingCount: user._count.following,
            totalUpsReceived,
        },
        isFollowing,
    };
}
async function toggleFollow(followerId, targetUserId) {
    if (followerId === targetUserId) {
        throw new Error("Anda tidak dapat mengikuti akun sendiri");
    }
    const targetUser = await database_1.prisma.user.findUnique({
        where: { id: targetUserId },
    });
    if (!targetUser) {
        throw new Error("Pengguna tidak ditemukan");
    }
    const existing = await database_1.prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId,
                followingId: targetUserId,
            },
        },
    });
    let isFollowing = false;
    if (existing) {
        await database_1.prisma.follow.delete({ where: { id: existing.id } });
        isFollowing = false;
    }
    else {
        await database_1.prisma.follow.create({
            data: { followerId, followingId: targetUserId },
        });
        isFollowing = true;
    }
    const followersCount = await database_1.prisma.follow.count({
        where: { followingId: targetUserId },
    });
    return { isFollowing, followersCount };
}
async function getUserActivity(username, tab, page = 1, limit = 15) {
    const user = await database_1.prisma.user.findUnique({
        where: { username },
        select: { id: true },
    });
    if (!user) {
        throw new Error("Pengguna tidak ditemukan");
    }
    const skip = (page - 1) * limit;
    if (tab === "posts") {
        const [items, total] = await Promise.all([
            database_1.prisma.report.findMany({
                where: { authorId: user.id },
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
                },
            }),
            database_1.prisma.report.count({ where: { authorId: user.id } }),
        ]);
        return { items, total, page, totalPages: Math.ceil(total / limit) };
    }
    if (tab === "reposts") {
        const [reposts, total] = await Promise.all([
            database_1.prisma.repost.findMany({
                where: { userId: user.id },
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
            database_1.prisma.repost.count({ where: { userId: user.id } }),
        ]);
        return {
            items: reposts.map((r) => r.report),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    if (tab === "media") {
        const [items, total] = await Promise.all([
            database_1.prisma.report.findMany({
                where: {
                    authorId: user.id,
                    media: { some: {} },
                },
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
                },
            }),
            database_1.prisma.report.count({
                where: { authorId: user.id, media: { some: {} } },
            }),
        ]);
        return { items, total, page, totalPages: Math.ceil(total / limit) };
    }
    const [comments, total] = await Promise.all([
        database_1.prisma.comment.findMany({
            where: { authorId: user.id },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                report: {
                    select: { id: true, title: true, status: true },
                },
            },
        }),
        database_1.prisma.comment.count({ where: { authorId: user.id } }),
    ]);
    return { items: comments, total, page, totalPages: Math.ceil(total / limit) };
}
