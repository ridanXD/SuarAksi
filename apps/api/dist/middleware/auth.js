"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.optionalAuth = optionalAuth;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const database_1 = require("../config/database");
async function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ success: false, message: "Token autentikasi tidak ditemukan" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_SECRET);
        const user = await database_1.prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                name: true,
                isActive: true,
            },
        });
        if (!user || !user.isActive) {
            res.status(401).json({ success: false, message: "Pengguna tidak valid atau dinonaktifkan" });
            return;
        }
        req.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            name: user.name,
        };
        next();
    }
    catch {
        res.status(401).json({ success: false, message: "Sesi telah berakhir atau token tidak valid" });
    }
}
async function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        next();
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_SECRET);
        const user = await database_1.prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                name: true,
                isActive: true,
            },
        });
        if (user && user.isActive) {
            req.user = {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                name: user.name,
            };
        }
        next();
    }
    catch {
        next();
    }
}
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Autentikasi diperlukan" });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: "Anda tidak memiliki hak akses untuk tindakan ini",
            });
            return;
        }
        next();
    };
}
