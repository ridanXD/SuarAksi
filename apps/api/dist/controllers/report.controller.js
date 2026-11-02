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
exports.getReports = getReports;
exports.getReportById = getReportById;
exports.createReport = createReport;
exports.updateReport = updateReport;
exports.deleteReport = deleteReport;
const reportService = __importStar(require("../services/report.service"));
async function getReports(req, res, next) {
    try {
        const { tab, categoryId, status, search, location, authorId, targetInstanceId, page, limit, } = req.query;
        const result = await reportService.getReports({
            tab: tab,
            categoryId: categoryId,
            status: status,
            search: search,
            location: location,
            authorId: authorId,
            targetInstanceId: targetInstanceId,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 15,
            currentUserId: req.user?.id,
        });
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function getReportById(req, res, next) {
    try {
        const { id } = req.params;
        const report = await reportService.getReportById(id, req.user?.id);
        res.status(200).json({ success: true, data: report });
    }
    catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
}
async function createReport(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Tidak terautentikasi" });
            return;
        }
        const report = await reportService.createReport(req.user.id, req.body);
        res.status(201).json({
            success: true,
            message: "Laporan berhasil dipublikasikan",
            data: report,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
async function updateReport(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Tidak terautentikasi" });
            return;
        }
        const { id } = req.params;
        const updated = await reportService.updateReport(id, req.user.id, req.user.role, req.body);
        res.status(200).json({
            success: true,
            message: "Laporan berhasil diperbarui",
            data: updated,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
async function deleteReport(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Tidak terautentikasi" });
            return;
        }
        const { id } = req.params;
        await reportService.deleteReport(id, req.user.id, req.user.role);
        res.status(200).json({
            success: true,
            message: "Laporan berhasil dihapus",
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
