import { Router } from "express";
import { CreateReportSchema, UpdateReportSchema, CreateCommentSchema } from "@suaraksi/shared";
import { authenticateToken, optionalAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import * as reportController from "../controllers/report.controller";
import * as interactionController from "../controllers/interaction.controller";
import * as commentController from "../controllers/comment.controller";

const router = Router();

router.get("/", optionalAuth, reportController.getReports);
router.post("/", authenticateToken, validateBody(CreateReportSchema), reportController.createReport);
router.get("/:id", optionalAuth, reportController.getReportById);
router.patch("/:id", authenticateToken, validateBody(UpdateReportSchema), reportController.updateReport);
router.delete("/:id", authenticateToken, reportController.deleteReport);

router.post("/:id/like", authenticateToken, interactionController.toggleLike);
router.delete("/:id/like", authenticateToken, interactionController.toggleLike);

router.post("/:id/up", authenticateToken, interactionController.toggleUpvote);
router.delete("/:id/up", authenticateToken, interactionController.toggleUpvote);

router.post("/:id/repost", authenticateToken, interactionController.toggleRepost);
router.delete("/:id/repost", authenticateToken, interactionController.toggleRepost);

router.post("/:id/share", optionalAuth, interactionController.recordShare);

router.post("/:id/bookmark", authenticateToken, interactionController.toggleBookmark);
router.delete("/:id/bookmark", authenticateToken, interactionController.toggleBookmark);

router.get("/:id/comments", optionalAuth, commentController.getComments);
router.post("/:id/comments", authenticateToken, validateBody(CreateCommentSchema), commentController.createComment);

export default router;
