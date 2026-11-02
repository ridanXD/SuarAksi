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
exports.getAssignedReports = getAssignedReports;
exports.updateReportStatus = updateReportStatus;
exports.addOfficialResponse = addOfficialResponse;
exports.getAnalytics = getAnalytics;
const instanceService = __importStar(require("../services/instance.service"));
async function getAssignedReports(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Tidak terautentikasi" });
            return;
        }
        const { status, page, limit } = req.query;
        const result = await instanceService.getInstanceReports(req.user.id, status, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 15);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
async function updateReportStatus(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Tidak terautentikasi" });
            return;
        }
        const { id } = req.params;
        const result = await instanceService.updateReportStatus(id, req.user.id, req.body);
        res.status(200).json({
            success: true,
            message: "Status laporan berhasil diperbarui",
            data: result,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
async function addOfficialResponse(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Tidak terautentikasi" });
            return;
        }
        const { id } = req.params;
        const result = await instanceService.addOfficialResponse(id, req.user.id, req.body);
        res.status(201).json({
            success: true,
            message: "Tanggapan resmi berhasil dipublikasikan",
            data: result,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
async function getAnalytics(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Tidak terautentikasi" });
            return;
        }
        const analytics = await instanceService.getInstanceAnalytics(req.user.id);
        res.status(200).json({ success: true, data: analytics });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
