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
exports.getComments = getComments;
exports.createComment = createComment;
exports.updateComment = updateComment;
exports.deleteComment = deleteComment;
exports.flagContent = flagContent;
const commentService = __importStar(require("../services/comment.service"));
async function getComments(req, res, next) {
    try {
        const { id } = req.params;
        const comments = await commentService.getCommentsByReportId(id);
        res.status(200).json({ success: true, data: comments });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function createComment(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Tidak terautentikasi" });
            return;
        }
        const { id } = req.params;
        const comment = await commentService.createComment(req.user.id, id, req.body);
        res.status(201).json({
            success: true,
            message: "Komentar berhasil ditambahkan",
            data: comment,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
async function updateComment(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Tidak terautentikasi" });
            return;
        }
        const { commentId } = req.params;
        const updated = await commentService.updateComment(commentId, req.user.id, req.body.content);
        res.status(200).json({
            success: true,
            message: "Komentar berhasil diubah",
            data: updated,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
async function deleteComment(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Tidak terautentikasi" });
            return;
        }
        const { commentId } = req.params;
        await commentService.deleteComment(commentId, req.user.id, req.user.role);
        res.status(200).json({
            success: true,
            message: "Komentar berhasil dihapus",
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
async function flagContent(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Tidak terautentikasi" });
            return;
        }
        const flag = await commentService.flagContent(req.user.id, req.body);
        res.status(201).json({
            success: true,
            message: "Laporan pelanggaran konten telah diterima untuk dimoderasi",
            data: flag,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
