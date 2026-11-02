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
const express_1 = require("express");
const shared_1 = require("@suaraksi/shared");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const reportController = __importStar(require("../controllers/report.controller"));
const interactionController = __importStar(require("../controllers/interaction.controller"));
const commentController = __importStar(require("../controllers/comment.controller"));
const router = (0, express_1.Router)();
router.get("/", auth_1.optionalAuth, reportController.getReports);
router.post("/", auth_1.authenticateToken, (0, validate_1.validateBody)(shared_1.CreateReportSchema), reportController.createReport);
router.get("/:id", auth_1.optionalAuth, reportController.getReportById);
router.patch("/:id", auth_1.authenticateToken, (0, validate_1.validateBody)(shared_1.UpdateReportSchema), reportController.updateReport);
router.delete("/:id", auth_1.authenticateToken, reportController.deleteReport);
router.post("/:id/like", auth_1.authenticateToken, interactionController.toggleLike);
router.delete("/:id/like", auth_1.authenticateToken, interactionController.toggleLike);
router.post("/:id/up", auth_1.authenticateToken, interactionController.toggleUpvote);
router.delete("/:id/up", auth_1.authenticateToken, interactionController.toggleUpvote);
router.post("/:id/repost", auth_1.authenticateToken, interactionController.toggleRepost);
router.delete("/:id/repost", auth_1.authenticateToken, interactionController.toggleRepost);
router.post("/:id/share", auth_1.optionalAuth, interactionController.recordShare);
router.post("/:id/bookmark", auth_1.authenticateToken, interactionController.toggleBookmark);
router.delete("/:id/bookmark", auth_1.authenticateToken, interactionController.toggleBookmark);
router.get("/:id/comments", auth_1.optionalAuth, commentController.getComments);
router.post("/:id/comments", auth_1.authenticateToken, (0, validate_1.validateBody)(shared_1.CreateCommentSchema), commentController.createComment);
exports.default = router;
