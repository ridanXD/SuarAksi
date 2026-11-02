"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.getCurrentUser = getCurrentUser;
exports.updateUserProfile = updateUserProfile;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const database_1 = require("../config/database");
const env_1 = require("../config/env");
async function registerUser(input) {
    const existingEmail = await database_1.prisma.user.findUnique({
        where: { email: input.email },
    });
    if (existingEmail) {
        throw new Error("Email sudah terdaftar dalam sistem");
    }
    const existingUsername = await database_1.prisma.user.findUnique({
        where: { username: input.username },
    });
    if (existingUsername) {
        throw new Error("Username sudah digunakan, silakan pilih yang lain");
    }
    const passwordHash = await bcrypt_1.default.hash(input.password, 10);
    const isInstanceRole = input.role === client_1.Role.INSTANCE;
    const user = await database_1.prisma.user.create({
        data: {
            email: input.email,
            username: input.username,
            name: input.name,
            passwordHash,
            role: input.role,
            phone: input.contactPhone,
            isVerified: false,
            instanceProfile: isInstanceRole
                ? {
                    create: {
                        instanceName: input.instanceName || input.name,
                        jurisdiction: input.instanceJurisdiction || "Nasional",
                        categoryFocus: input.instanceCategory,
                    },
                }
                : undefined,
        },
        include: {
            instanceProfile: true,
        },
    });
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
    }, env_1.ENV.JWT_SECRET, { expiresIn: "7d" });
    return {
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            role: user.role,
            avatarUrl: user.avatarUrl,
            isVerified: user.isVerified,
            instanceProfile: user.instanceProfile,
            createdAt: user.createdAt,
        },
        token,
    };
}
async function loginUser(input) {
    const user = await database_1.prisma.user.findUnique({
        where: { email: input.email },
        include: {
            instanceProfile: true,
        },
    });
    if (!user) {
        throw new Error("Email atau kata sandi tidak sesuai");
    }
    if (!user.isActive) {
        throw new Error("Akun Anda telah dinonaktifkan oleh administrator");
    }
    const isMatch = await bcrypt_1.default.compare(input.password, user.passwordHash);
    if (!isMatch) {
        throw new Error("Email atau kata sandi tidak sesuai");
    }
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
    }, env_1.ENV.JWT_SECRET, { expiresIn: "7d" });
    return {
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            role: user.role,
            avatarUrl: user.avatarUrl,
            isVerified: user.isVerified,
            instanceProfile: user.instanceProfile,
            createdAt: user.createdAt,
        },
        token,
    };
}
async function getCurrentUser(userId) {
    const user = await database_1.prisma.user.findUnique({
        where: { id: userId },
        include: {
            instanceProfile: true,
            _count: {
                select: {
                    reports: true,
                    bookmarks: true,
                    followers: true,
                    following: true,
                    upvotes: true,
                },
            },
        },
    });
    if (!user) {
        throw new Error("Pengguna tidak ditemukan");
    }
    return {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        phone: user.phone,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        instanceProfile: user.instanceProfile,
        stats: {
            reportsCount: user._count.reports,
            bookmarksCount: user._count.bookmarks,
            followersCount: user._count.followers,
            followingCount: user._count.following,
            upvotesCount: user._count.upvotes,
        },
    };
}
async function updateUserProfile(userId, input) {
    const user = await database_1.prisma.user.update({
        where: { id: userId },
        data: {
            name: input.name,
            bio: input.bio,
            avatarUrl: input.avatarUrl !== "" ? input.avatarUrl : null,
            phone: input.phone,
            instanceProfile: input.jurisdiction
                ? {
                    update: {
                        jurisdiction: input.jurisdiction,
                    },
                }
                : undefined,
        },
        include: {
            instanceProfile: true,
        },
    });
    return user;
}
