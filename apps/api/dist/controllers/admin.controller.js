"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOverview = getOverview;
exports.getUsers = getUsers;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.getInstances = getInstances;
exports.getAuditLogs = getAuditLogs;
exports.getContentFlags = getContentFlags;
exports.processFlag = processFlag;
exports.getTrendingConfig = getTrendingConfig;
exports.updateTrendingConfig = updateTrendingConfig;
exports.getCategories = getCategories;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
const adminService = __importStar(require("../services/admin.service"));
const database_1 = require("../config/database");
async function getOverview(req, res, next) {
    try {
        const data = await adminService.getAdminOverview();
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function getUsers(req, res, next) {
    try {
        const { role, isActive, search, page, limit } = req.query;
        const result = await adminService.getAdminUsers({
            role: role,
            isActive: isActive !== undefined ? isActive === "true" : undefined,
            search: search,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        });
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function updateUser(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Tidak terautentikasi" });
            return;
        }
        const { id } = req.params;
        const updated = await adminService.updateAdminUser(req.user.id, id, req.body);
        res.status(200).json({
            success: true,
            message: "Data pengguna berhasil diperbarui",
            data: updated,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
async function deleteUser(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Tidak terautentikasi" });
            return;
        }
        const { id } = req.params;
        await adminService.deleteAdminUser(req.user.id, id);
        res.status(200).json({
            success: true,
            message: "Pengguna berhasil dihapus",
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
async function getInstances(req, res, next) {
    try {
        const { isVerified, search, page, limit } = req.query;
        const result = await adminService.getAdminInstances({
            isVerified: isVerified !== undefined ? isVerified === "true" : undefined,
            search: search,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        });
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function getAuditLogs(req, res, next) {
    try {
        const page = req.query.page ? parseInt(req.query.page, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 25;
        const result = await adminService.getAdminAuditLogs(page, limit);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function getContentFlags(req, res, next) {
    try {
        const { status, page, limit } = req.query;
        const result = await adminService.getAdminContentFlags(status, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function processFlag(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Tidak terautentikasi" });
            return;
        }
        const { id } = req.params;
        const { action, notes } = req.body;
        await adminService.processContentFlag(req.user.id, id, action, notes || "");
        res.status(200).json({
            success: true,
            message: "Tindakan moderasi berhasil diterapkan",
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
async function getTrendingConfig(req, res, next) {
    try {
        const config = await database_1.prisma.systemSetting.findMany();
        res.status(200).json({ success: true, data: config });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function updateTrendingConfig(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Tidak terautentikasi" });
            return;
        }
        const result = await adminService.updateAdminTrendingConfig(req.user.id, req.body);
        res.status(200).json({
            success: true,
            message: "Konfigurasi algoritma trending berhasil diperbarui",
            data: result,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
async function getCategories(req, res, next) {
    try {
        const categories = await database_1.prisma.category.findMany({
            include: {
                _count: {
                    select: { reports: true },
                },
            },
            orderBy: { name: "asc" },
        });
        res.status(200).json({ success: true, data: categories });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function createCategory(req, res, next) {
    try {
        const { name, slug, description, color, icon } = req.body;
        const cat = await database_1.prisma.category.create({
            data: { name, slug, description, color, icon: icon || "FolderAlert" },
        });
        res.status(201).json({ success: true, data: cat });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
async function updateCategory(req, res, next) {
    try {
        const { id } = req.params;
        const cat = await database_1.prisma.category.update({
            where: { id },
            data: req.body,
        });
        res.status(200).json({ success: true, data: cat });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
async function deleteCategory(req, res, next) {
    try {
        const { id } = req.params;
        await database_1.prisma.category.delete({ where: { id } });
        res.status(200).json({ success: true, message: "Kategori berhasil dihapus" });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
